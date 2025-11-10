<template>
  <NodeViewWrapper class="diff-node-wrapper">
    <div class="diff-container">
      <!-- 原文显示区域 - 保持原有位置和样式 -->
      <div class="original-text-inline">
        <span class="original-content" :style="originalStyles" :data-debug-styles="JSON.stringify(originalStyles)">{{ originalText }}</span>
      </div>
      
      <!-- AI改写结果显示区域 - 显示在原文下方 -->
      <div class="ai-text-block">
        <div v-if="hasAiText" class="ai-content" :style="originalStyles" v-html="formattedAiText"></div>
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
      <div class="diff-actions">
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
import { defineProps, defineEmits, computed } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

// 从node属性中获取数据（使用computed确保响应式）
const originalText = props.node.attrs.originalText || ''
const aiText = computed(() => {
  return props.node.attrs.aiText || ''
})
const hasAiText = computed(() => {
  return aiText.value && aiText.value.trim()
})
const diffType = props.node.attrs.diffType || 'expand'
const diffId = props.node.attrs.diffId || ''
const originalMarks = props.node.attrs.originalMarks || []

// 使用计算属性构建样式对象，确保响应式更新
const originalStyles = computed(() => {
  const textStyleMark = originalMarks.find(mark => mark.type === 'textStyle')
  const boldMark = originalMarks.find(mark => mark.type === 'bold')
  const italicMark = originalMarks.find(mark => mark.type === 'italic')
  const underlineMark = originalMarks.find(mark => mark.type === 'underline')
  const strikeMark = originalMarks.find(mark => mark.type === 'strike')

  // 构建样式对象
  const styles = {
    fontSize: textStyleMark?.attrs?.fontSize || '18px',
    color: textStyleMark?.attrs?.color || 'inherit',
    fontWeight: boldMark ? 'bold' : 'normal',
    fontStyle: italicMark ? 'italic' : 'normal',
    textDecoration: []
  }

  if (underlineMark) styles.textDecoration.push('underline')
  if (strikeMark) styles.textDecoration.push('line-through')
  styles.textDecoration = styles.textDecoration.join(' ')

  // 确保文本内容正确显示
  console.log('DiffComponent - originalText:', originalText)
  console.log('DiffComponent - aiText:', aiText.value)
  console.log('DiffComponent - originalStyles:', styles)

  return styles
})

// 格式化AI内容（与AiHelpComponent保持一致）
const formattedAiText = computed(() => {
  if (!aiText.value) return ''
  
  let content = aiText.value
  
  // 如果内容没有换行符，尝试根据markdown格式添加换行
  if (!content.includes('\n')) {
    // 在标题前添加换行
    content = content.replace(/(#+ )/g, '\n$1')
    // 在列表项前添加换行
    content = content.replace(/(^| )(?=- )/g, '\n- ')
    content = content.replace(/(^| )(?=\* )/g, '\n* ')
    // 清理多余的换行
    content = content.replace(/\n+/g, '\n').trim()
  }
  
  // 先按行分割内容
  const lines = content.split('\n')
  const processedLines = []
  let inList = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 处理标题
    if (line.startsWith('### ')) {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push('<h3>' + line.substring(4) + '</h3>')
    } else if (line.startsWith('## ')) {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push('<h2>' + line.substring(3) + '</h2>')
    } else if (line.startsWith('# ')) {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push('<h1>' + line.substring(2) + '</h1>')
    }
    // 处理列表项
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        processedLines.push('<ul>')
        inList = true
      }
      processedLines.push('<li>' + line.substring(2) + '</li>')
    }
    // 处理普通段落
    else if (line) {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push('<p>' + line + '</p>')
    }
    // 处理空行
    else {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
    }
  }
  
  // 如果最后还在列表中，关闭列表
  if (inList) {
    processedLines.push('</ul>')
  }
  
  content = processedLines.join('')
  
  // 处理粗体和斜体
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  content = content.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  return content
})

const emit = defineEmits(['accept', 'reject'])

const handleAccept = () => {
  // 通过全局事件发送接受信号
  window.dispatchEvent(new CustomEvent('accept-diff', {
    detail: { diffId: diffId }
  }))
}

const handleReject = () => {
  // 通过全局事件发送拒绝信号
  window.dispatchEvent(new CustomEvent('reject-diff', {
    detail: { diffId: diffId }
  }))
}
</script>

<style scoped>
/* 确保diff组件完全继承ProseMirror的样式 */
.diff-node-wrapper {
  display: inline;
  position: relative;
}

.diff-container {
  display: inline;
}

/* 原文保持内联显示，只添加背景色 */
.original-text-inline {
  display: inline;
  margin: 0;
  padding: 0;
}

.original-content {
  background: #fef2f2;
  padding: 1px 2px;
  border-radius: 2px;
  margin: 0;
  display: inline;
  position: relative;
}

/* AI改写结果显示在原文下方 */
.ai-text-block {
  display: block;
  margin-top: 6px;
  padding: 6px 10px;
  background: #f0fdf4;
  border-radius: 3px;
  border-left: 2px solid #22c55e;
}

.ai-content {
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  display: inline;
  line-height: 1.6;
  color: #374151;
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

.diff-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
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
