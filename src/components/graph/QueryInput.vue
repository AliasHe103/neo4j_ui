<script setup lang="js">
import { ref } from "vue";
import { ChatLineRound } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getPrediction } from "@/api/net";

const query = ref("");
const isLoading = ref(false);
const emit = defineEmits(["starting-prediction", "prediction-result"]);

// 将问题交给/api/predict接口
const handleSubmit = async () => {
  if (!query.value.trim()) {
    ElMessage.warning("请输入问题");
    return;
  }

  ElMessage.success("提交成功");
  console.log("提交查询:", query.value);
  isLoading.value = true;

  try {
    emit("starting-prediction")
    let res = await getPrediction(query.value);
    console.log("API Response:", res);

    if (res.code === 200 && res.data) {
      const { llm_prediction_with_graph, llm_prediction } = res.data;
      console.log("LLM Prediction:", llm_prediction_with_graph, llm_prediction);
      emit(
        "prediction-result",
        {
          reasoning: llm_prediction_with_graph,
          answer: llm_prediction
        }
      );
    } else {
      ElMessage.error(res.message || "请求失败");
    }
  } catch (error) {
    console.error("API Error:", error);
    ElMessage.error("请求失败:" + error);
  } finally {
    query.value = "";
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="query-input-overlay">
    <el-input v-model="query" placeholder="请输入问题..." @keyup.enter="handleSubmit" clearable class="input-with-shadow"
      :disabled="isLoading">
      <template #append>
        <el-button :icon="ChatLineRound" @click="handleSubmit" />
      </template>
    </el-input>
  </div>
</template>

<style scoped>
.query-input-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 400px;
  max-width: 90%;
}

.input-with-shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 20px;
}
</style>
