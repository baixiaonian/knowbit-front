<template>
  <div 
    v-if="visible" 
    class="ai-help-dialog"
    :style="dialogStyle"
    @click.stop
  >
    <div class="dialog-bar">
      <div class="left-section">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="ai-icon">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M8 9h8"></path>
          <path d="M8 13h6"></path>
        </svg>
        <span class="ai-label">AI帮写:</span>
        <input
          ref="promptInput"
          v-model="prompt"
          type="text"
          class="prompt-input-inline"
          placeholder="请输入内容"
          @keydown.enter.exact.prevent="handleSend"
        />
      </div>
      <div class="right-section">
        <button 
          class="send-btn-inline"
          :disabled="!prompt.trim()"
          @click="handleSend"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
          </svg>
          <span>发送</span>
        </button>
        <div class="separator"></div>
        <button class="close-btn-inline" @click="handleClose">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
})

const emit = defineEmits(['close', 'insert-ai-help'])

const prompt = ref('')
const promptInput = ref(null)

// 计算对话框位置样式
const dialogStyle = computed(() => ({
  position: 'fixed',
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  width: props.position.width ? `${props.position.width}px` : '100%',
  zIndex: 99999
}))

// 监听visible变化，当对话框显示时自动聚焦
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 延迟聚焦，确保DOM已渲染
    nextTick(() => {
      if (promptInput.value) {
        // 使用setTimeout确保编辑器选中状态恢复后再聚焦
        setTimeout(() => {
          if (promptInput.value) {
            promptInput.value.focus()
          }
        }, 250)
      }
    })
  }
})

// 处理发送
const handleSend = async () => {
  if (!prompt.value.trim()) return
  
  // 发送空内容，让后端API生成
  emit('insert-ai-help', {
    aiContent: '', // 空内容，触发后端API调用
    prompt: prompt.value
  })
}

// 处理换行
const handleNewLine = () => {
  const textarea = promptInput.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = prompt.value
  
  prompt.value = value.substring(0, start) + '\n' + value.substring(end)
  
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + 1
  })
}


// 处理关闭
const handleClose = () => {
  emit('close')
}

// 组件挂载时聚焦输入框
onMounted(() => {
  if (props.visible && promptInput.value) {
    promptInput.value.focus()
  }
})
</script>

<style scoped>
.ai-help-dialog {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  height: 48px;
  overflow: hidden;
}

.dialog-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.ai-icon {
  color: #3b82f6;
  flex-shrink: 0;
}

.ai-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  flex-shrink: 0;
}

.prompt-input-inline {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #374151;
  background: transparent;
  padding: 0;
}

.prompt-input-inline::placeholder {
  color: #9ca3af;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.send-btn-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  color: #6b7280;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn-inline:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.send-btn-inline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.separator {
  width: 1px;
  height: 20px;
  background: #e5e7eb;
}

.close-btn-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn-inline:hover {
  background: #f3f4f6;
  color: #374151;
}
</style>
