<script setup lang="ts">

import Inference from "@/components/inference/Inference.vue";
import Panel from "@/components/menu/Panel.vue";
import Graph from "@/components/graph/Graph.vue";
</script>

<template>
  <el-row class="app-layout">
    <!--    左侧菜单-->
    <el-col :span="2" class="sidebar-left">
      <Panel/>
    </el-col>
    <!--    图谱-->
    <el-col :span="18" class="main-center">
      <Graph/>
    </el-col>
    <!--    右侧推理过程-->
    <el-col :span="4" class="sidebar-right">
      <Inference/>
    </el-col>
  </el-row>
</template>

<style scoped>
.app-layout {
  height: 100vh;
}
.el-col {
  border-radius: 4px;
  height: 100vh;
}
</style>

