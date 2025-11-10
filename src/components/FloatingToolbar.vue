<template>
  <div 
    v-if="visible" 
    class="floating-toolbar"
    :style="{ 
      left: position.x + 'px', 
      top: position.y + 'px' 
    }"
    @click.stop
  >
    <div class="toolbar-content">
      <!-- AI对话按钮 -->
      <button 
        class="toolbar-btn primary"
        @click.stop="handleAiChat"
        title="AI对话"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        AI对话
      </button>
      
      <div class="divider"></div>
      
      <!-- AI工具下拉按钮 -->
      <div class="dropdown-container">
        <button 
          class="toolbar-btn dropdown-btn"
          @click="toggleDropdown"
          title="AI工具"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2v20M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"></path>
          </svg>
          AI工具
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="dropdown-arrow">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>
        
        <!-- 下拉菜单 -->
        <div 
          v-if="showDropdown" 
          class="dropdown-menu"
          @click.stop
        >
          <button 
            class="dropdown-item"
            @click="handleAction('expand')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            扩写
          </button>
          
          <button 
            class="dropdown-item"
            @click="handleAction('continue')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
            续写
          </button>
          
          <button 
            class="dropdown-item"
            @click="handleAction('abbreviate')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M6 9l6 6 6-6"></path>
            </svg>
            缩写
          </button>
          
          <button 
            class="dropdown-item"
            @click="handleAction('correct')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            纠错
          </button>
          
          <button 
            class="dropdown-item"
            @click="handleAction('summarize')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            摘要
          </button>
          
          <button 
            class="dropdown-item"
            @click="handleAction('translate')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"></path>
            </svg>
            翻译
          </button>
          
          <button 
            class="dropdown-item"
            @click="handleAction('format')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 6h16"></path>
              <path d="M4 12h16"></path>
              <path d="M4 18h16"></path>
            </svg>
            格式规整
          </button>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <!-- 添加到对话框按钮 -->
      <button 
        class="toolbar-btn"
        @click="addToChat"
        title="添加到对话框"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
        添加到对话框
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  selectedText: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits([
  'ai-chat',
  'add-to-chat',
  'expand-text',
  'continue-text',
  'abbreviate-text',
  'correct-text',
  'summarize-text',
  'translate-text',
  'format-text'
])

// 下拉菜单状态
const showDropdown = ref(false)

// 切换下拉菜单
const toggleDropdown = (event) => {
  event.stopPropagation()
  showDropdown.value = !showDropdown.value
}

// 处理AI工具操作
const handleAction = (action) => {
  const actionMap = {
    'expand': 'expand-text',
    'continue': 'continue-text',
    'abbreviate': 'abbreviate-text',
    'correct': 'correct-text',
    'summarize': 'summarize-text',
    'translate': 'translate-text',
    'format': 'format-text'
  }
  
  emit(actionMap[action], props.selectedText)
  showDropdown.value = false
}

// 处理AI对话
const handleAiChat = () => {
  emit('ai-chat', props.selectedText)
}

// 添加到对话框
const addToChat = () => {
  emit('add-to-chat', props.selectedText)
  showDropdown.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  if (showDropdown.value) {
    const toolbar = event.target.closest('.floating-toolbar')
    if (!toolbar) {
      showDropdown.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.floating-toolbar {
  position: fixed;
  z-index: 10002;
  pointer-events: auto;
}

.toolbar-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}

.toolbar-btn.primary {
  background: #409eff;
  color: white;
}

.toolbar-btn.primary:hover {
  background: #66b1ff;
}

.toolbar-btn.dropdown-btn {
  padding: 6px 12px;
}

.dropdown-arrow {
  margin-left: 4px;
  transition: transform 0.2s;
}

.dropdown-container {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 140px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
  z-index: 10003;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.dropdown-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

.dropdown-item svg {
  flex-shrink: 0;
}

.divider {
  width: 1px;
  height: 20px;
  background: #e4e7ed;
  margin: 0 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar-content {
    flex-direction: column;
    gap: 6px;
    padding: 8px;
  }
  
  .toolbar-btn {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .dropdown-menu {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    min-width: 200px;
  }
}

/* 动画效果 */
.floating-toolbar {
  animation: fadeInUp 0.2s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-menu {
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
