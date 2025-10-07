<!-- src/components/inference/Inference.vue -->
<script setup lang="js">
import { ref, onBeforeUnmount, nextTick } from "vue";
import { watch } from "vue";

const props = defineProps({
  reasoning: String,
  answer: String,
  startingPrediction: Number
})

const displayedReasoning = ref('')
const displayedAnswer = ref('')
const status = ref('idle')
let typingTimeout = null

watch(() => props.startingPrediction, () => {
  status.value = 'thinking'
  displayedAnswer.value = ''
  displayedReasoning.value = ''
})

watch(() => [props.reasoning, props.answer], () => {
  const hasReasoning = !!props.reasoning?.trim()
  const hasAnswer = !!props.answer?.trim()
  if (!hasReasoning && !hasAnswer) {
    reset()
    return
  }
  displayedReasoning.value = ''
  displayedAnswer.value = ''
  startTypingReasoning(props.reasoning)
})

const reset = () => {
  status.value = 'idle'
  displayedReasoning.value = ''
  displayedAnswer.value = ''
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }
}

const startTypingReasoning = (text = '') => {
  status.value = 'reasoning'
  let index = 0
  const type = () => {
    if (index < text.length) {
      displayedReasoning.value = text.substring(0, index + 1)
      index++
      typingTimeout = window.setTimeout(type, 20 + Math.random() * 30)
    } else {
      typingTimeout = window.setTimeout(() => {
        status.value = 'fading'
        typingTimeout = window.setTimeout(showFinalAnswer, 500)
      }, 300)
    }
  }
  type()
}

const showFinalAnswer = async () => {
  status.value = 'answered'
  displayedAnswer.value = props.answer || ''

  await nextTick()

  const board = document.querySelector('.ai-inference-board')
  if (board) {
    board.scrollTop = board.scrollHeight
  }
}

onBeforeUnmount(() => {
  if (typingTimeout) clearTimeout(typingTimeout)
})
</script>

<template>
  <!-- 外层容器：带边框的卡片 -->
  <div class="inference-card">
    <el-container class="ai-inference-container">
      <el-header class="ai-inference-header">
        <span>推理结果</span>
      </el-header>
      <!-- 分割线 -->
      <div class="header-divider"></div>
      <el-main class="ai-inference-board">
        <span 
          v-if="displayedReasoning" 
          class="reasoning-text"
          :class="{ 'faded': status === 'fading' || status === 'answered' }"
        >
          {{ displayedReasoning }}
        </span>

        <div v-if="displayedAnswer" class="final-answer">
          {{ displayedAnswer }}
        </div>

        <span 
          v-if="status === 'thinking' || status === 'reasoning'" 
          class="typing-cursor"
        ></span>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
/* 外层卡片：白色背景 + 边框 + 阴影 */
.inference-card {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden; /* 防止内部溢出 */
}

.ai-inference-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ai-inference-header {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  letter-spacing: 1px;
  color: #1f2329;
  background: #ffffff; /* 标题区保持白色 */
  height: 48px;
  padding: 0 16px;
  box-sizing: border-box;
}

/* 分割线：header 和 main 之间 */
.header-divider {
  height: 1px;
  background: #e4e7ed;
  margin: 0;
}

.ai-inference-board {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa; /* 内容区浅灰色背景 */
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  /* 确保滚动条样式美观（可选） */
  scrollbar-width: thin;
  scrollbar-color: #c1c5cd transparent;
}

.ai-inference-board::-webkit-scrollbar {
  width: 6px;
}
.ai-inference-board::-webkit-scrollbar-track {
  background: transparent;
}
.ai-inference-board::-webkit-scrollbar-thumb {
  background: #c1c5cd;
  border-radius: 3px;
}

.reasoning-text {
  transition: opacity 0.5s ease;
}
.reasoning-text.faded {
  opacity: 0.5;
  color: #666;
}

.final-answer {
  margin-top: 16px;
  font-weight: 600;
  color: #1f2329;
}

.typing-cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background-color: #00eaff;
  margin-left: 4px;
  animation: blink 1s infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>