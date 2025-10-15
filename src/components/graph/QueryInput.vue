<script setup lang="js">
import { ref } from "vue";
import { ChatLineRound } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getPrediction } from "@/api/net";

const query = ref("Who was the governor of Ohio in 2011 that was in the government prior to 3-1-1983?");
const isLoading = ref(false);
const emit = defineEmits(["starting-prediction", "prediction-result"]);
const currentReasoning = ref("");

// 将问题交给/api/predict接口
const handleSubmit = async () => {
  if (!query.value.trim()) {
    ElMessage.warning("请输入问题");
    return;
  }

  ElMessage.success("提交成功");
  console.log("提交查询:", query.value);
  isLoading.value = true;
  emit("starting-prediction");

  try {
    const handleSSEData = (data) => {
      if (data.llm_prediction_for_depth !== undefined) {
        currentReasoning.value = data.llm_prediction_for_depth; // 或 += 追加（如果是流式片段）
        // 推送推理信息的更新，每个深度一次
        emit("prediction-result", {
          type: "reasoning",
          is_final: data.is_final,
          reasoning: currentReasoning.value
        });
      }
    }

    let res = await getPrediction(query.value, handleSSEData);

    emit("prediction-result", {
      type: "answer",
      answer: res.answer + res.timestamp
    });
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
