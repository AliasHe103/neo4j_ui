<script setup lang="ts">
import { Open, Setting, Folder } from '@element-plus/icons-vue'

</script>

<template>
  <!-- 外层卡片容器 -->
  <div class="panel-card">
    <!-- 标题区 -->
    <div class="panel-header">
      <span>知识图谱UI</span>
    </div>
    <!-- 菜单区 -->
    <el-menu
      class="panel-menu"
      :default-openeds="['1']"
      background-color="#ffffff"
      text-color="#1f2329"
      active-text-color="#409eff"
    >
      <el-sub-menu index="1">
        <template #title>
          <el-icon><Open /></el-icon>
          <span>图谱推理</span>
        </template>
        <el-menu-item style="padding: 0; display: flex; justify-content: center">
          <el-row style="display: flex; justify-content: center; padding: 8px; width: 100%">
            <el-button type="primary" size="small">运行</el-button>
          </el-row>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="2">
        <template #title>
          <el-icon><Open /></el-icon>
          <span>图谱补全</span>
        </template>
        <!-- 可在此添加设置项 -->
      </el-sub-menu>

      <el-sub-menu index="3">
        <template #title>
          <el-icon><Open /></el-icon>
          <span>图谱问答</span>
        </template>
        <!-- 可在此添加保存选项 -->
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<style scoped>
/* 整体卡片样式 */
.panel-card {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止菜单溢出 */
}

/* 标题区 */
.panel-header {
  padding: 12px 0;
  text-align: center;
  font-size: 16px;
  letter-spacing: 1px;
  color: #1f2329;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
}

/* 菜单区域 */
.panel-menu {
  flex: 1;
  border: none; /* 移除 el-menu 默认边框 */
}

/* 可选：hover 时增强阴影 */
.panel-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
