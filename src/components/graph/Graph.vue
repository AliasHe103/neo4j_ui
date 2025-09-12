<!-- src/components/graph/Graph.vue -->
<script setup>
import {onMounted, ref, watch} from 'vue'
import {useGraphStore} from '@/stores/graph'
import cytoscape from 'cytoscape'
import {getNodeColor} from "@/utils/color.js";

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

//初始化图谱画布
const initCy = () => {

  cyInstance = cytoscape({
    container: document.getElementById('cy'),
    elements: [], // 初始为空
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(labels)',
          'background-color': function(node) {
              const labels = node.data('labels')
              return getNodeColor(labels)
          },
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)'
        }
      },
    ],
    layout: {
      name: 'circle',
      animate: true,
      refresh: 10,
      maxSimulationTime: 1500,
      padding: 100
    },
    // touchTapThreshold: true,
    // desktopTapThreshold: true
  })

  bindTooltipEvents()
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

const updateGraphData = async () => {2
  await graphStore.loadGraph()
  graph.value = graphStore.graph
}

const updateCy = () => {
  if (!cyInstance) return
  const {nodes, links} = graph.value
  // console.log('original graph nodes:', nodes, 'links:', links)
  const cyNodes = nodes.map(node => ({
    data: {
      id: node.id.toString(),
      labels: [...node.labels],
      properties: node.properties
    }
  }))
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
  cyInstance.layout({
    name: 'breadthfirst',
    animate: true,
  }).run()
}

const renderCy = async () => {
  await updateGraphData()
  updateCy()
}

watch(() => props.resetCounter, (oldValue, newValue) => {
  if (oldValue !== undefined) {
    console.log('Reset the positon of KG.')
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
  overflow: hidden; /* 防止滚动 */
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