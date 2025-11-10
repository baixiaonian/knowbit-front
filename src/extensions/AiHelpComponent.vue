<template>
  <NodeViewWrapper class="ai-help-node-wrapper">
    <div class="ai-help-container">
      <!-- AI生成的内容显示区域 -->
      <div class="ai-content-block">
        <div v-if="aiContent && aiContent.trim()" class="ai-content" v-html="formattedContent"></div>
        <div v-else class="ai-content-placeholder">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>AI正在生成内容...</span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="ai-help-actions">
        <button class="action-btn accept-btn" @click="handleAccept">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          接受
        </button>
        <button class="action-btn reject-btn" @click="handleReject">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          拒绝
        </button>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'
import { formatMarkdownToHtml } from '../utils/markdownFormatter.js'

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

// 从node属性中获取数据（使用computed确保响应式）
const aiContent = computed(() => {
  const content = props.node.attrs.aiContent || ''
  return content
})
const helpId = props.node.attrs.helpId || ''
const prompt = props.node.attrs.prompt || ''

// 格式化AI内容（完整的markdown处理）
const formattedContent = computed(() => {
  return formatMarkdownToHtml(aiContent.value)
})

const emit = defineEmits(['accept', 'reject'])

const handleAccept = () => {
  // 通过全局事件发送接受信号
  window.dispatchEvent(new CustomEvent('accept-ai-help', {
    detail: { helpId: helpId }
  }))
}

const handleReject = () => {
  // 通过全局事件发送拒绝信号
  window.dispatchEvent(new CustomEvent('reject-ai-help', {
    detail: { helpId: helpId }
  }))
}
</script>

<style scoped>
/* 确保AI帮写组件完全继承ProseMirror的样式 */
.ai-help-node-wrapper {
  display: inline;
  position: relative;
}

.ai-help-container {
  display: inline;
}

/* AI内容显示区域 - 浅绿色背景 */
.ai-content-block {
  display: block;
  margin: 6px 0;
  padding: 12px 16px;
  background: #f0fdf4;
  border-radius: 6px;
  border-left: 3px solid #22c55e;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.ai-content {
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #374151;
}

.ai-content h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 20px 0 16px 0;
  color: #1f2937;
  display: block;
}

.ai-content h2 {
  font-size: 20px;
  font-weight: bold;
  margin: 18px 0 14px 0;
  color: #1f2937;
  display: block;
}

.ai-content h3 {
  font-size: 18px;
  font-weight: bold;
  margin: 16px 0 12px 0;
  color: #1f2937;
  display: block;
}

.ai-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.ai-content li {
  margin: 4px 0;
  list-style-type: disc;
}

.ai-content strong {
  font-weight: bold;
  color: #1f2937;
}

.ai-content em {
  font-style: italic;
  color: #4b5563;
}

.ai-content p {
  margin: 12px 0;
  line-height: 1.6;
  display: block;
}

.ai-content-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-style: italic;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 6px;
  height: 6px;
  background: #6b7280;
  border-radius: 50%;
  animation: loading-dots 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading-dots {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.ai-help-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  border-radius: 0 0 6px 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.accept-btn {
  color: #059669;
  border-color: #059669;
}

.accept-btn:hover {
  background: #059669;
  color: white;
}

.reject-btn {
  color: #dc2626;
  border-color: #dc2626;
}

.reject-btn:hover {
  background: #dc2626;
  color: white;
}

.action-btn svg {
  flex-shrink: 0;
}
</style>
