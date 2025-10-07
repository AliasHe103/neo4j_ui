<script setup lang="js">
import {onMounted, ref, watch} from 'vue'
import {useGraphStore} from '@/stores/graph'
import cytoscape from 'cytoscape'
import spread from 'cytoscape-spread'
import fcose from 'cytoscape-fcose'
import {getNodeColor} from "@/utils/color.js";

cytoscape.use(spread)
cytoscape.use(fcose)
const props = defineProps(['resetCounter'])
const graphStore = useGraphStore()
const graph = ref({})
let cyInstance = null
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  data: {},
})
const highlightedEdges = new Set()


const cyLayout = {
  name: 'fcose',
  animate: false,
  fit: true,
  padding: 100,
  
  // 核心优化参数
  nodeRepulsion: 6500,  // 增大节点排斥力（默认3000），让节点更分散
  idealEdgeLength: 150, // 增加理想边长度（默认80），让边更舒展
  edgeElasticity: 0.2,  // 降低边弹性（默认0.45），减少边的紧绷感
  nestingFactor: 0.05,  // 减小嵌套因子（默认0.1），避免节点过度聚集
  gravity: 0.1,         // 降低重力（默认0.25），减少中心聚集趋势
  numIter: 2000,        // 增加迭代次数（默认1000），让布局更稳定
  initialEnergyOnIncremental: 0.5, // 增量布局初始能量
  
  // 分层相关参数（对树状结构特别有效）
  layerSeparation: 200, // 层间距（适用于有层次的结构）
  uniformNodeDimensions: false, // 允许节点尺寸影响布局
  tile: true,           // 启用瓦片模式，使节点排列更有序
  tilePadding: 30,      // 瓦片间距
  
  // 质量与性能平衡
  useLocalSearch: true, // 启用局部搜索优化
  localSearchIterations: 20 // 局部搜索迭代次数
}

//初始化图谱画布，样式，监听事件
const initCy = () => {

  cyInstance = cytoscape({
    container: document.getElementById('cy'),
    elements: [], // 初始为空
    style: [
      {
        // 节点的样式
        selector: 'node',
        style: {
          'label': 'data(displayLabel)',
          'background-color': function(node) {
            const labels = node.data('labels')
            return getNodeColor(labels)
          },
          // 动态字体大小：度数越高，字体越大；度数低则字体小
          'font-size': 6, 
          'text-valign': 'center',
          'text-halign': 'center',
          // 可选：加个描边提高可读性（几乎无开销）
          'text-outline-color': '#fff',
          'text-outline-width': 1
        }
      },
      {
        // 边（关系）的样式
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': 6, 
          'text-rotation': 'autorotate',
          'text-background-color': '#fff',
          'text-background-opacity': 0.8,
          'text-background-padding': '1px'
        }
      },
    ],
    // layout: {
    //   name: 'spread', // 使用spread布局
    //   animate: true,
    //   padding: 100,
    //   minDist: 80, // 最小节点间距
    //   expandingFactor: 1.5, // 扩展因子
    //   maxExpandIterations: 4, // 最大扩展迭代次数
    // }
  })

  // 绑定工具提示事件
  bindTooltipEvents()
  // 绑定缩放事件,更新节点字体大小
  cyInstance.on('zoom', updateFontSize)
}

const bindTooltipEvents = () => {
  cyInstance.on('mouseover', 'node', function(event) {
    const node = event.target
    const props = node.data('properties') || {}

    // 获取视口中的鼠标位置（相对容器）
    const containerRect = document.getElementById('cy').getBoundingClientRect()
    const x = event.originalEvent.clientX - containerRect.left + 15
    const y = event.originalEvent.clientY - containerRect.top + 15
    tooltip.value = {
      show: true,
      x: x,
      y: y,
      data: {
        elementType: 'node',
        id: node.id(),
        labels: node.data('labels'),
        properties: props
      }
    }
  })
  cyInstance.on('tap', 'edge', function(event) {
    const edge = event.target
    const props = edge.data('properties') || {}
    const containerRect = document.getElementById('cy').getBoundingClientRect()
    const x = event.originalEvent.clientX - containerRect.left + 15
    const y = event.originalEvent.clientY - containerRect.top + 15
    tooltip.value = {
      show: true,
      x: x,
      y: y,
      data: {
        elementType: 'edge',
        source: edge.data('source'),
        target: edge.data('target'),
        label: edge.data('label'),
        properties: props
      }
    }

    const edgeId = edge.id() || edge.data('id')
    const isHighlighted = highlightedEdges.has(edgeId)
    if (isHighlighted) {
      highlightedEdges.delete(edgeId)
      edge.style('line-color', '#ccc')
      edge.style('width', 2)
    }
    else {
      highlightedEdges.add(edgeId)
      edge.style('line-color', '#f00')
      edge.style('width', 4)
    }
  })
  cyInstance.on('mouseout', 'node', function() {
    tooltip.value.show = false
  })
  cyInstance.on('mouseout', 'edge', function() {
    tooltip.value.show = false
  })
}

const updateFontSize = () => {
  if (!cyInstance) return
  const zoom = cyInstance.zoom()
  const baseFontSize = 6
  const fontSize = Math.max(2, Math.min(baseFontSize * zoom / 5, 6))
  cyInstance.nodes().style('font-size', fontSize)
  cyInstance.edges().style('font-size', fontSize)
}

// 更新图谱数据
const updateGraphData = async () => {2
  // await graphStore.loadGraph()
  await graphStore.loadEvidence()
  graph.value = graphStore.graph
}

const updateCy = () => {
  if (!cyInstance) return
  const {nodes, links} = graph.value
  // console.log('original graph nodes:', nodes, 'links:', links)
  const cyNodes = nodes.map(node => {
    const props = node.properties
    let displayLabel = ''
    if (props.name) {
      displayLabel = props.name
    }
    else {
      displayLabel = node.labels[0]
    }
    return {
      data: {
        id: node.id.toString(),
        labels: [...node.labels],
        properties: node.properties,
        displayLabel: displayLabel
      }
    }
  })
  const cyEdges = links.map((link) => ({
    data: {
      source: link.from.toString(),
      target: link.to.toString(),
      label: link.type.toString(),
      properties: link.properties
    }
  }))

  // console.log('cy nodes:', cyNodes, 'edges:', cyEdges)
  cyInstance.elements().remove()
  cyInstance.add([...cyNodes])
  cyInstance.add([...cyEdges])
  // update layout
  cyInstance.layout(cyLayout).run()
}

const renderCy = async () => {
  await updateGraphData()
  updateCy()
}

watch(() => props.resetCounter, (oldValue) => {
  if (oldValue !== undefined) {
    console.log('Reset the position of KG.')
    // cyInstance.fit()
    cyInstance.animate({
      fit: {
        elements: cyInstance.elements(),
        padding: 50
      },
      duration: 500,
    })
  }
})

onMounted(() => {

  initCy()
  renderCy()
})
</script>

<template>
  <div class="graph-container">
    <!-- Cytoscape 主容器 -->
    <div id="cy" class="cytoscape"></div>

    <!-- 使用 Teleport 将 Tooltip 移到 body 下 -->
    <Teleport to="body">
      <div
          v-if="tooltip.show"
          class="cy-tooltip"
          :style="{
          top: `${tooltip.y}px`,
          left: `${tooltip.x}px`
        }"
      >
        <div class="tooltip-header">
          {{ tooltip.data.elementType === 'node' ? '节点详情' : '关系详情' }}
        </div>
        <div class="tooltip-body">
          <div v-if="tooltip.data.labels && tooltip.data.labels.length > 0" class="prop-item">
            <strong>label:</strong> {{ tooltip.data.labels.join(', ') }}
          </div>
          <hr v-if="tooltip.data.labels && tooltip.data.labels.length > 0" style="margin: 8px 0; border:0; border-top: 1px dashed #eee" />
          <div
              v-for="(value, key) in tooltip.data.properties"
              :key="key"
              class="prop-item"
          >
            <strong>{{ key }}:</strong> {{ (value) }}
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.graph-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.cytoscape {
  width: 100%;
  height: 100%;
  background-color: #fafafa;
  z-index: 1;     /* 主图层 */
  position: relative;
}

.cy-tooltip {
  position: fixed;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  padding: 12px;
  font-size: 14px;
  max-width: 300px;
  min-width: 200px;
  word-wrap: break-word;
  pointer-events: none; /* ❗重要：不阻挡鼠标事件，否则无法点击后面的图 */
  z-index: 1000;        /* 必须高于 cytoscape 图层 */
  transform: translate(10px, 10px); /* 微调位置，避免完全覆盖鼠标指针 */
}
.tooltip-header {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}
.prop-item {
  margin: 4px 0;
  font-family: sans-serif;
  line-height: 1.4;
}
</style>