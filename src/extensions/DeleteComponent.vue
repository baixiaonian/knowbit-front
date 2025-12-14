<template>
  <NodeViewWrapper class="delete-node-wrapper">
    <div class="delete-container">
      <!-- 删除内容显示区域 -->
      <div class="delete-content-block">
        <div class="delete-content" :style="originalStyles">{{ originalText }}</div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="delete-actions">
        <button class="action-btn accept-btn" @click="handleAccept">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          确认删除
        </button>
        <button class="action-btn reject-btn" @click="handleReject">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          保留内容
        </button>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

// 从node属性中获取数据
const originalText = props.node.attrs.originalText || ''
const deleteId = props.node.attrs.deleteId || ''
const originalMarks = props.node.attrs.originalMarks || []

// 构建样式对象
const originalStyles = computed(() => {
  const textStyleMark = originalMarks.find(mark => mark.type === 'textStyle')
  const boldMark = originalMarks.find(mark => mark.type === 'bold')
  const italicMark = originalMarks.find(mark => mark.type === 'italic')
  const underlineMark = originalMarks.find(mark => mark.type === 'underline')
  const strikeMark = originalMarks.find(mark => mark.type === 'strike')

  const styles = {
    fontSize: textStyleMark?.attrs?.fontSize || '18px',
    color: textStyleMark?.attrs?.color || 'inherit',
    fontWeight: boldMark ? 'bold' : 'normal',
    fontStyle: italicMark ? 'italic' : 'normal',
    textDecoration: ['line-through'] // 删除线标记
  }

  if (underlineMark) styles.textDecoration.push('underline')
  styles.textDecoration = styles.textDecoration.join(' ')

  return styles
})

const handleAccept = () => {
  window.dispatchEvent(new CustomEvent('accept-delete', {
    detail: { deleteId: deleteId }
  }))
}

const handleReject = () => {
  window.dispatchEvent(new CustomEvent('reject-delete', {
    detail: { deleteId: deleteId }
  }))
}
</script>

<style scoped>
/* 插件容器 */
.delete-node-wrapper {
  display: block;
  position: relative;
  margin: 6px 0;
}

.delete-container {
  display: block;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.delete-container:hover .delete-actions {
  opacity: 1;
  max-height: 100px;
  padding: 12px 16px;
}

/* 内容显示区域 - 红色主题（删除） */
.delete-content-block {
  display: block;
  padding: 12px 16px;
  background: #fef2f2;
  border-left: 3px solid #dc2626;
}

.delete-content {
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #991b1b;
}

/* 操作按钮区域 */
.delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: opacity 0.2s ease, max-height 0.2s ease, padding 0.2s ease;
}

/* 按钮样式 */
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
