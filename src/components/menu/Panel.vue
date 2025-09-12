<script setup lang="ts">
import {Open, Setting, Folder} from '@element-plus/icons-vue'

const emit = defineEmits(['reset-position'])
</script>

<template>
  <div class="panel">
    <div class="menu-title">
      <span>知识图谱UI</span>
    </div>
    <el-menu>
      <el-sub-menu index="1">
        <template #title>
          <el-icon><Open></Open></el-icon>
          <span>控制选项</span>
        </template>
        <el-row style="display: flex; justify-content: center">
          <el-button type="primary">运行</el-button>
          <el-button type="success">停止</el-button>
          <el-button type="info" @click="emit('reset-position')">复位</el-button>
        </el-row>
      </el-sub-menu>
      <el-sub-menu index="2">
        <template #title>
          <el-icon><Setting></Setting></el-icon>
          <span>设置参数</span>
        </template>
      </el-sub-menu>
      <el-sub-menu index="3">
        <template #title>
          <el-icon><Folder></Folder></el-icon>
          <span>保存结果</span>
        </template>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<style scoped>
.panel {
  width: 100%;
  height: 100%;
}
.menu-title {
  min-height: 20px;
  text-align: center;
  padding: 5px;
}
</style>