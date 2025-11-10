<template>
  <div 
    v-if="visible" 
    class="context-menu"
    :style="menuStyle"
    @click.stop
  >
    <div class="context-menu-item" @click="handleAiHelp">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <path d="M8 9h8"></path>
        <path d="M8 13h6"></path>
      </svg>
      <span>AI帮写</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue'

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

const emit = defineEmits(['ai-help'])

// 计算菜单位置样式
const menuStyle = computed(() => ({
  position: 'fixed',
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  zIndex: 99999
}))

const handleAiHelp = () => {
  emit('ai-help')
}
</script>

<style scoped>
.context-menu {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 4px;
  min-width: 120px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  color: #374151;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #f3f4f6;
}

.context-menu-item svg {
  flex-shrink: 0;
  color: #6b7280;
}

.context-menu-item:hover svg {
  color: #374151;
}
</style>
