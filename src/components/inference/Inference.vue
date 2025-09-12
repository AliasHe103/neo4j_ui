<script setup lang="js">
import {ref, onMounted, onBeforeUnmount} from "vue";
import {createAIStreamingClient} from '@/api/net'

const logs = ref("")
const isThinking = ref(false)
let sseClient = null

const startStreaming = () => {
  isThinking.value = true
  // 清空，如果需要也可以改为叠加，或者设计成多个推理块
  logs.value = ""

  sseClient = createAIStreamingClient('/api/stream', {
    onToken: (token) => {
      logs.value += token;

      // 滚动到底部
      const container = document.querySelector('.ai-inference-board');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },
    onComplete: () => {
      isThinking.value = false;
      sseClient.close()
    },
    onError: (error) => {
      console.error("AI流式请求出错:", error);
      isThinking.value = false;
    }
  })
}

onMounted(() => {
  startStreaming()
})

onBeforeUnmount(() => {
  if (sseClient) {
    sseClient.close()
    sseClient = null
  }
})
</script>

<template>
  <div class="ai-inference-container">
    <el-card class="ai-inference-box" shadow="hover">
      <template #header>
        <span>AI THINKING</span>
      </template>
      <div class="ai-inference-board">
        {{logs}}
        <span class="cursor" v-if="isThinking"></span>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.ai-inference-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
.ai-inference-box {
  width: 100%;
  height: 100%;
}
.cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background-color: #00eaff;
  animation: blink 1s infinite;
  vertical-align: middle;
}
</style>