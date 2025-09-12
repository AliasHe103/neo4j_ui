<script setup lang="ts">

import Inference from "@/components/inference/Inference.vue";
import Panel from "@/components/menu/Panel.vue";
import Graph from "@/components/graph/Graph.vue";
import {ref} from "vue";

const resetCounter = ref(0)
const handleResetPosition = () => {
  resetCounter.value += 1
};
</script>

<template>
  <el-row class="app-layout">
    <!--    左侧菜单-->
    <el-col :span="3" class="sidebar-left">
      <Panel
        @reset-position="handleResetPosition"
      />
    </el-col>
    <!--    图谱-->
    <el-col :span="17" class="main-center">
      <Graph
        :reset-counter="resetCounter"
      />
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

