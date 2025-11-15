<template>
  <div class="document-page">
    <div class="sidebar-container" :style="{ width: sidebarWidth + 'px' }">
      <SideNav 
        :active-document="currentDocument"
        @open-document="openDocument"
        @create-document="createNewDocument"
        @close-document="closeDocument"
        @update:active-document="updateActiveDocument"
      />
      <div 
        class="resize-handle" 
        @mousedown="startResize"
        @mouseenter="showResizeCursor"
        @mouseleave="hideResizeCursor"
      ></div>
    </div>
    <div class="main-content">
      <!-- 顶部工具栏 -->
      <SearchToolbar 
        :user="currentUser"
        @search="handleSearch"
        @personal-center="handlePersonalCenter"
        @logout="handleLogout"
      />
      
      <!-- AI编辑器 -->
      <AiEditor 
        :document="currentDocument"
        :is-loading-document="isLoadingDocument"
        @save="saveDocument"
        @update:document="updateDocument"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import SideNav from '../components/SideNav.vue'
import AiEditor from '../components/AiEditor.vue'
import SearchToolbar from '../components/SearchToolbar.vue'

// Props
const props = defineProps({
  document: {
    type: Object,
    required: true
  },
  isLoadingDocument: {
    type: Boolean,
    default: false
  },
  currentUser: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'save', 'create-document', 'update:document', 'open-document', 'logout'])

const currentUser = computed(() => props.currentUser)

// 搜索工具栏事件处理
const handleSearch = (query) => {
  console.log('搜索:', query)
  // 这里可以添加搜索逻辑
}

const handlePersonalCenter = () => {
  console.log('打开个人中心')
  // 这里可以添加打开个人中心的逻辑
}

const handleLogout = () => {
  emit('logout')
}

// 响应式数据
const currentDocument = ref(props.document)
const sidebarWidth = ref(280)
const isResizing = ref(false)

// 侧边栏调整大小相关方法
const startResize = (e) => {
  isResizing.value = true
  e.preventDefault()
  
  const startX = e.clientX
  const startWidth = sidebarWidth.value
  
  const handleMouseMove = (e) => {
    const newWidth = startWidth + (e.clientX - startX)
    sidebarWidth.value = Math.max(200, Math.min(500, newWidth))
  }
  
  const handleMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const showResizeCursor = () => {
  if (!isResizing.value) {
    document.body.style.cursor = 'col-resize'
  }
}

const hideResizeCursor = () => {
  if (!isResizing.value) {
    document.body.style.cursor = ''
  }
}

// 文档操作方法
const openDocument = (document) => {
  // 统一通过AppRouter处理，确保都会请求API获取最新数据
  emit('open-document', document)
}

const createNewDocument = (parentFolder = null) => {
  // 转发创建文档事件给 AppRouter
  emit('create-document', parentFolder)
}

const closeDocument = () => {
  emit('close')
}

const saveDocument = (document) => {
  console.log('保存文档:', document)
  emit('save', document)
}

const updateDocument = (document) => {
  currentDocument.value = { ...currentDocument.value, ...document }
  
  // 同时更新全局知识库状态，实现实时绑定
  emit('update:document', document)
}

const updateActiveDocument = (document) => {
  currentDocument.value = document
}

// 监听文档变化
watch(() => props.document, (newDoc) => {
  if (newDoc) {
    currentDocument.value = newDoc
  }
}, { deep: true })

onUnmounted(() => {
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
})
</script>

<style scoped>
.document-page {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

.sidebar-container {
  position: relative;
  display: flex;
  flex-shrink: 0;
  background: white;
  border-right: 1px solid #e4e7ed;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
  z-index: 1000;
  transition: background-color 0.2s;
}

.resize-handle:hover {
  background: #5b8ff9;
}

.resize-handle:active {
  background: #409eff;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}


@media (max-width: 768px) {
  /* 响应式样式已简化 */
}
</style>
