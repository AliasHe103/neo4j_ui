<script setup lang="ts">
import Inference from "@/components/inference/InferenceCard.vue";
import Panel from "@/components/menu/ControlPanel.vue";
import Graph from "@/components/graph/GraphContainer.vue";
import { ref } from "vue";
import Query from "../graph/QueryInput.vue";
import { Menu } from '@element-plus/icons-vue';

const startingPredictionCounter = ref(0)
const depth = ref(0);
const reasoning = ref({
  buffer: "",
  final: false
})
const answer = ref("")
const sidebarVisible = ref(true); // 控制侧边栏显示状态

const updateInference = (context) => {
  if (context.type === 'reasoning') {
    reasoning.value = {
      buffer: context.reasoning,
      final: context.is_final
    }
    if (!context.is_final) {
      depth.value += 1
    }
  }
  else if (context.type === 'answer')
    answer.value = context.answer
};

const handleStartingPrediction = () => {
  startingPredictionCounter.value += 1
};

// 切换侧边栏显示状态
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};
</script>

<template>
  <el-row class="app-layout" type="flex" justify="start">
    <!-- 左侧菜单 - 根据状态显示/隐藏 -->
    <el-col :span="sidebarVisible ? 3 : 0" class="sidebar-left" :class="{ 'sidebar-hidden': !sidebarVisible }">
      <Panel />
    </el-col>

    <!-- 动态切换按钮 -->
    <button class="toggle-button" :class="{ 'sidebar-open': sidebarVisible }" @click="toggleSidebar"
      aria-label="Toggle sidebar">
      <el-icon>
        <Menu />
      </el-icon>
    </button>

    <!-- 图谱 - 动态调整宽度 -->
    <el-col :span="sidebarVisible ? 17 : 20" class="main-center">
      <Graph :depth="depth"/>
      <Query @starting-prediction="handleStartingPrediction" @prediction-result="updateInference" />
    </el-col>

    <!-- 右侧推理过程 - 固定宽度 -->
    <el-col :span="4" class="sidebar-right">
      <Inference :reasoning="reasoning" :answer="answer" :starting-prediction="startingPredictionCounter" />
    </el-col>
  </el-row>
</template>

<style scoped>
.app-layout {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
  /* 为按钮定位提供参考 */
}

.el-col {
  border-radius: 4px;
  height: 100vh;
  float: left;
}

.sidebar-left {
  transition: all 0.3s ease;
  z-index: 10;
}

.sidebar-hidden {
  width: 0 !important;
  padding: 0 !important;
  overflow: hidden;
}

.main-center {
  transition: all 0.3s ease;
  border-left: 1px solid #e4e7ed;
}

.sidebar-right {
  border-left: 1px solid #e4e7ed;
}

/* 确保列不会换行 */
::v-deep .el-row {
  display: flex;
  flex-wrap: nowrap;
}

/* 切换按钮基础样式：与边栏贴合 + 白色风格 */
.toggle-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 40px;
  border-radius: 0 4px 4px 0;
  /* 右侧圆弧过渡 */
  background-color: #ffffff;
  color: #409eff;
  /* 图标蓝色 */
  border: 1px solid #409eff;
  border-left: none;
  /* 左边无框，贴合边栏 */
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  /* 确保层级最高 */
  transition: all 0.3s ease;
  /* 平滑过渡所有样式 */
  padding: 0;
}

/* 侧边栏打开时：三角形（顶点朝左，贴合边栏） */
.toggle-button.sidebar-open {
  background-color: #d8d7d7;
}

/* 侧边栏关闭时：圆形悬浮在左侧中间 */
.toggle-button:not(.sidebar-open) {
  left: 1px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  /* 恢复圆形 */
  border: 1px solid #409eff;
}

/* 按钮图标位置微调（三角形内居中） */
.toggle-button el-icon {
  font-size: 16px;
}

.toggle-button.sidebar-open el-icon {
  transform: translateX(4px);
  /* 三角形内图标右移，确保视觉居中 */
}

/* 悬停交互效果 */
.toggle-button:hover {
  background-color: #f0f9ff;
  /* 浅蓝 hover 背景 */
  border-color: #66b1ff;
  transform: translateY(-50%) scale(1.05);
  /* 轻微放大 */
}

.toggle-button.sidebar-open:hover {
  background-color: #f0f9ff;
  border-color: #66b1ff;
  transform: translateY(-50%) scale(1.05);
}
</style>
