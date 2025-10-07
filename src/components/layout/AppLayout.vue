<script setup lang="ts">

import Inference from "@/components/inference/InferenceCard.vue";
import Panel from "@/components/menu/ControlPanel.vue";
import Graph from "@/components/graph/GraphContainer.vue";
import { ref } from "vue";
import Query from "../graph/QueryInput.vue";

const startingPredictionCounter = ref(0)
const reasoning = ref("")
const answer = ref("")

const updateInference = (context) => {
  reasoning.value = context.reasoning
  answer.value = context.answer
};
const handleStartingPrediction = () => {
  startingPredictionCounter.value += 1
};
</script>

<template>
  <el-row class="app-layout">
    <!--    左侧菜单-->
    <el-col :span="3" class="sidebar-left">
      <Panel />
    </el-col>
    <!--    图谱-->
    <el-col :span="17" class="main-center">
      <Graph />
      <Query @starting-prediction="handleStartingPrediction" @prediction-result="updateInference" />
    </el-col>
    <!--    右侧推理过程-->
    <el-col :span="4" class="sidebar-right">
      <Inference :reasoning="reasoning" :answer="answer" :starting-prediction="startingPredictionCounter" />
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
