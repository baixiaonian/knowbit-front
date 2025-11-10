<template>
  <div class="color-picker-container" v-if="visible" @click.stop :style="{ top: pickerPosition.top + 'px', left: pickerPosition.left + 'px' }">
    <!-- 主颜色选择器 -->
    <div class="color-picker-main">
      <div class="color-picker-header">
        <span class="color-picker-title">{{ title }}</span>
        <button class="color-picker-close" @click="close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- 默认颜色 -->
      <div class="color-section">
        <div class="color-section-title">默认</div>
        <div class="color-option" @click="selectColor('#000000')">
          <div class="color-swatch" style="background: #000000;" :class="{ active: selectedColor === '#000000' }"></div>
        </div>
      </div>
      
      <!-- 预设颜色网格 -->
      <div class="color-section">
        <div class="color-section-title">预设颜色</div>
        <div class="color-grid">
          <!-- 第一行：黑白灰 -->
          <div class="color-swatch" 
               v-for="color in grayscaleColors" 
               :key="color.value"
               :style="{ backgroundColor: color.value }"
               :class="{ active: selectedColor === color.value }"
               @click="selectColor(color.value)"
               :title="color.name"></div>
          
          <!-- 彩色行 -->
          <div class="color-swatch" 
               v-for="color in presetColors" 
               :key="color.value"
               :style="{ backgroundColor: color.value }"
               :class="{ active: selectedColor === color.value }"
               @click="selectColor(color.value)"
               :title="color.name"></div>
        </div>
      </div>
      
      <!-- 渐变色 -->
      <div class="color-section">
        <div class="color-section-title">渐变色</div>
        <div class="gradient-colors">
          <div class="gradient-swatch gradient-blue-purple" @click="selectGradient('linear-gradient(90deg, #3b82f6, #8b5cf6)')"></div>
          <div class="gradient-swatch gradient-purple" @click="selectColor('#8b5cf6')"></div>
          <div class="gradient-swatch gradient-pink-orange" @click="selectGradient('linear-gradient(90deg, #ec4899, #f97316)')"></div>
          <div class="gradient-swatch gradient-orange-brown" @click="selectGradient('linear-gradient(90deg, #f97316, #92400e)')"></div>
        </div>
      </div>
      
      <!-- 最近使用的颜色 -->
      <div class="color-section" v-if="recentColors.length > 0">
        <div class="color-section-title">最近使用</div>
        <div class="recent-colors">
          <div class="color-swatch" 
               v-for="color in recentColors" 
               :key="color"
               :style="{ backgroundColor: color }"
               :class="{ active: selectedColor === color }"
               @click="selectColor(color)"
               :title="color"></div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '选择颜色'
  },
  type: {
    type: String,
    default: 'text', // 'text' 或 'background'
    validator: (value) => ['text', 'background'].includes(value)
  },
  triggerElement: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'select'])

const selectedColor = ref('#000000')
const customColor = ref('#000000')
const customColorHex = ref('#000000')
const pickerPosition = ref({ top: 100, left: 100 })

// 灰度颜色
const grayscaleColors = ref([
  { name: '黑色', value: '#000000' },
  { name: '深灰', value: '#4b5563' },
  { name: '中灰', value: '#6b7280' },
  { name: '浅灰', value: '#9ca3af' },
  { name: '白色', value: '#ffffff' }
])

// 预设颜色
const presetColors = ref([
  // 第一行：粉红色系
  { name: '浅粉', value: '#fce7f3' },
  { name: '粉色', value: '#f472b6' },
  { name: '玫红', value: '#ec4899' },
  { name: '深粉', value: '#be185d' },
  { name: '紫红', value: '#a21caf' },
  
  // 第二行：橙色系
  { name: '浅橙', value: '#fed7aa' },
  { name: '橙色', value: '#fb923c' },
  { name: '深橙', value: '#ea580c' },
  { name: '红橙', value: '#dc2626' },
  { name: '深红', value: '#991b1b' },
  
  // 第三行：黄色系
  { name: '浅黄', value: '#fef3c7' },
  { name: '黄色', value: '#facc15' },
  { name: '深黄', value: '#d97706' },
  { name: '琥珀', value: '#f59e0b' },
  { name: '棕色', value: '#92400e' },
  
  // 第四行：绿色系
  { name: '浅绿', value: '#dcfce7' },
  { name: '绿色', value: '#22c55e' },
  { name: '深绿', value: '#16a34a' },
  { name: '翠绿', value: '#059669' },
  { name: '墨绿', value: '#065f46' },
  
  // 第五行：蓝色系
  { name: '浅蓝', value: '#dbeafe' },
  { name: '蓝色', value: '#3b82f6' },
  { name: '深蓝', value: '#1d4ed8' },
  { name: '靛蓝', value: '#3730a3' },
  { name: '海军蓝', value: '#1e3a8a' },
  
  // 第六行：紫色系
  { name: '浅紫', value: '#e9d5ff' },
  { name: '紫色', value: '#8b5cf6' },
  { name: '深紫', value: '#7c3aed' },
  { name: '紫罗兰', value: '#6d28d9' },
  { name: '深紫罗兰', value: '#581c87' }
])

// 最近使用的颜色
const recentColors = ref([])

const close = () => {
  emit('close')
}

const selectColor = (color) => {
  selectedColor.value = color
  addToRecentColors(color)
  emit('select', color)
  close()
}

const selectGradient = (gradient) => {
  // 渐变暂时转换为单色，取渐变的第一个颜色
  const match = gradient.match(/#[0-9a-fA-F]{6}/)
  if (match) {
    selectColor(match[0])
  }
}

const addToRecentColors = (color) => {
  // 移除已存在的相同颜色
  const index = recentColors.value.indexOf(color)
  if (index > -1) {
    recentColors.value.splice(index, 1)
  }
  
  // 添加到开头
  recentColors.value.unshift(color)
  
  // 限制最多保存8个颜色
  if (recentColors.value.length > 8) {
    recentColors.value = recentColors.value.slice(0, 8)
  }
  
  // 保存到本地存储
  localStorage.setItem('recentColors', JSON.stringify(recentColors.value))
}

const openAdvancedColorPicker = () => {
  // 创建隐藏的input元素来打开系统颜色选择器
  const input = document.createElement('input')
  input.type = 'color'
  input.value = customColor.value
  input.onchange = (e) => {
    selectColor(e.target.value)
  }
  input.click()
}

const updateCustomColor = () => {
  // 验证十六进制颜色格式
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  if (hexPattern.test(customColorHex.value)) {
    customColor.value = customColorHex.value
  }
}

// 从本地存储加载最近使用的颜色
const loadRecentColors = () => {
  const stored = localStorage.getItem('recentColors')
  if (stored) {
    try {
      recentColors.value = JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse recent colors:', e)
    }
  }
}

// 计算颜色选择器位置
const calculatePosition = () => {
  if (props.triggerElement) {
    const rect = props.triggerElement.getBoundingClientRect()
    pickerPosition.value = {
      top: rect.bottom + 4,
      left: rect.left
    }
    console.log('Color picker position calculated:', pickerPosition.value)
  } else {
    console.log('No trigger element found')
    // 如果没有触发元素，使用默认位置
    pickerPosition.value = {
      top: 100,
      left: 100
    }
  }
}

// 监听visible变化，更新位置
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    nextTick(() => {
      calculatePosition()
    })
  }
})

// 监听窗口大小变化，重新计算位置
const handleResize = () => {
  if (props.visible) {
    calculatePosition()
  }
}

// 组件挂载时加载最近使用的颜色
onMounted(() => {
  loadRecentColors()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.color-picker-container {
  position: fixed;
  z-index: 99999;
}

.color-picker-main {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 12px;
  width: 240px;
  height: 320px;
  overflow: hidden;
}

.color-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e5e7eb;
}

.color-picker-title {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.color-picker-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  color: #6b7280;
  transition: background-color 0.2s;
}

.color-picker-close:hover {
  background-color: #f3f4f6;
}

.color-section {
  margin-bottom: 8px;
}

.color-section:last-child {
  margin-bottom: 0;
}

.color-section-title {
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.color-option {
  display: flex;
  align-items: center;
  gap: 4px;
}

.color-swatch {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.color-swatch:hover {
  transform: scale(1.1);
  border-color: #3b82f6;
}

.color-swatch.active {
  border-color: #3b82f6;
  border-width: 2px;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.color-swatch.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 10px;
  font-weight: bold;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
}

.gradient-colors {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
}

.gradient-swatch {
  width: 100%;
  height: 20px;
  border-radius: 3px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.gradient-swatch:hover {
  transform: scale(1.05);
  border-color: #3b82f6;
}

.gradient-blue-purple {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.gradient-purple {
  background: #8b5cf6;
}

.gradient-pink-orange {
  background: linear-gradient(90deg, #ec4899, #f97316);
}

.gradient-orange-brown {
  background: linear-gradient(90deg, #f97316, #92400e);
}

.recent-colors {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
}

.color-more {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f9fafb;
}

.color-more:hover {
  background-color: #f3f4f6;
  border-color: #3b82f6;
}

.color-more-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.color-more span {
  flex: 1;
  font-size: 11px;
  color: #374151;
}

.color-input-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input {
  width: 40px;
  height: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.color-hex-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  outline: none;
  transition: border-color 0.2s;
}

.color-hex-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}
</style>
