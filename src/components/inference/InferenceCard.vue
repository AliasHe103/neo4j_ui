<script setup lang="js">
import { ref, onBeforeUnmount, nextTick } from "vue";
import { watch } from "vue";

const props = defineProps({
  reasoning: Object,
  answer: String,
  startingPrediction: Number
})

const displayedReasoning = ref('')
const displayedAnswer = ref('')
// idle: 等待问题, thinking: 思考中, reasoning: 推理中, fading: 推理结束等待答案输入中, answered: 答案输入完成
const status = ref('idle')
const final = ref(false)
const reasoningBuffer = ref('')
const answerBuffer = ref('')
let typingTimeout = null

const reset = () => {
  status.value = 'idle'
  final.value = false
  displayedReasoning.value = ''
  displayedAnswer.value = ''
  reasoningBuffer.value = ''
  answerBuffer.value = ''
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }
}

watch(() => props.startingPrediction, () => {
  reset()
  status.value = 'thinking'
})

watch(() => props.reasoning, (newReasoning) => {
  const newText = newReasoning.buffer;
  final.value = newReasoning.final;
  if (newText !== undefined && newText !== null) {
    reasoningBuffer.value += newText
    if (status.value === 'thinking' || status.value === 'reasoning') {
      ensureTyping();
    }
  }
});

watch(() => props.answer, (newVal) => {
  console.log('[answer received in InferenceCard.vue]:', newVal)
  answerBuffer.value = newVal || ''
  if (status.value === 'fading' && answerBuffer.value) {
    showFinalAnswer(answerBuffer.value)
  }
});

// 检查是否回答完成
watch(status, (newStatus) => {
  // 检测到状态发生变化时自动滚动到底部
  const board = document.querySelector('.ai-inference-board')
  if (board) {
    board.scrollTop = board.scrollHeight
  }
  if (newStatus === 'fading' && answerBuffer.value) {
    showFinalAnswer(answerBuffer.value)
    status.value = 'answered'
  }
})

// 确保可以输入
const ensureTyping = () => {
  if (status.value !== 'reasoning') {
    status.value = 'reasoning';
    typeNext();
  }
};
const typeNext = () => {
  const current = displayedReasoning.value;
  const target = reasoningBuffer.value;

  if (current === target) {
    // 如果已经接收完所有的推理内容，进入 fading 状态，等待 answer
    if (status.value === 'reasoning') {
      status.value = final.value? 'fading': 'thinking';
    } 
    return;
  }

  const nextIndex = current.length;
  if (nextIndex < target.length) {
    displayedReasoning.value = target.substring(0, nextIndex + 1);
    // 提高speedup缩短输出间隔
    const baseTime = 20 + Math.random() * 20
    const speedup = 3
    typingTimeout = window.setTimeout(typeNext, baseTime / speedup);
  } else {
    // 如果内容越界了直接同步
    displayedReasoning.value = target;
    typingTimeout = window.setTimeout(typeNext, 50);
  }
};

const showFinalAnswer = async (answer) => {
  status.value = 'answered'
  displayedAnswer.value = answer || ''

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
        <span v-if="displayedReasoning" class="reasoning-text"
          :class="{ 'faded': status === 'fading' || status === 'answered' }">
          {{ displayedReasoning }}
        </span>

        <div v-if="displayedAnswer" class="final-answer">
          {{ displayedAnswer }}
        </div>

        <span v-if="status === 'thinking' || status === 'reasoning'" class="typing-cursor"></span>
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
  overflow: hidden;
  /* 防止内部溢出 */
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
  background: #ffffff;
  /* 标题区保持白色 */
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
  background: #f8f9fa;
  /* 内容区浅灰色背景 */
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
  background-color: #00eaffab;
  margin-left: 4px;
  animation: blink 1s infinite;
  vertical-align: text-bottom;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}
</style>