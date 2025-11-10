<template>
  <div class="home-page">
    <div class="sidebar-container" :style="{ width: sidebarWidth + 'px' }">
      <SideNav 
        active-item="首页"
        :active-document="null"
        @open-document="openDocument"
        @create-document="createNewDocument"
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
        @settings="handleSettings"
        @logout="handleLogout"
      />
      
      <!-- 首页内容 -->
      <div class="content-wrapper">
        <!-- 最近编辑 -->
        <section class="recent-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
            </svg>
            <h2>最近编辑</h2>
          </div>
          <div class="article-grid">
            <ArticleCard 
              v-for="article in recentArticles" 
              :key="article.id"
              :article="article"
              @click="openDocument(article)"
            />
          </div>
        </section>

        <!-- AI 推荐 -->
        <section class="recommend-section">
          <div class="section-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <h2>AI 为你推荐</h2>
          </div>
          <div class="article-grid">
            <ArticleCard 
              v-for="article in recommendedArticles" 
              :key="article.id"
              :article="article"
              @click="openDocument(article)"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import SideNav from '../components/SideNav.vue'
import ArticleCard from '../components/ArticleCard.vue'
import SearchToolbar from '../components/SearchToolbar.vue'

const props = defineProps({
  currentUser: {
    type: Object,
    default: null
  }
})

const currentUser = computed(() => props.currentUser)

// 侧边栏宽度调整相关
const sidebarWidth = ref(280) // 默认宽度
const isResizing = ref(false)

// 页面导航相关
const emit = defineEmits(['open-document', 'create-document', 'logout'])

// 搜索工具栏事件处理
const handleSearch = (query) => {
  console.log('搜索:', query)
  // 这里可以添加搜索逻辑
}

const handlePersonalCenter = () => {
  console.log('打开个人中心')
  // 这里可以添加打开个人中心的逻辑
}

const handleSettings = () => {
  console.log('打开设置')
  // 这里可以添加打开设置的逻辑
}

const handleLogout = () => {
  emit('logout')
}

// 开始调整大小
const startResize = (e) => {
  isResizing.value = true
  e.preventDefault()
  
  const startX = e.clientX
  const startWidth = sidebarWidth.value
  
  const handleMouseMove = (e) => {
    const newWidth = startWidth + (e.clientX - startX)
    // 限制最小和最大宽度
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

// 显示调整光标
const showResizeCursor = () => {
  if (!isResizing.value) {
    document.body.style.cursor = 'col-resize'
  }
}

// 隐藏调整光标
const hideResizeCursor = () => {
  if (!isResizing.value) {
    document.body.style.cursor = ''
  }
}

// 页面导航方法
const openDocument = (document) => {
  emit('open-document', document)
}

const createNewDocument = (parentFolder = null) => {
  emit('create-document', parentFolder)
}

// 模拟数据
const recentArticles = ref([
  {
    id: 101,
    title: '产品需求文档 PRD v2.0',
    content: '本文档旨在详细描述新功能A的用户需求及功能说明，涵盖开发流程、用户体验优化、技术选型等...',
    category: '产品设计',
    viewCount: 1405,
    updatedAt: '2024-01-15T10:30:00Z',
    excerpt: '本文档旨在详细描述新功能A的用户需求及功能说明，涵盖开发流程、用户体验优化、技术选型等...',
    tags: ['产品', '需求', 'PRD'],
    status: 2,
    isPublic: false
  },
  {
    id: 102,
    title: '技术方案：React Hooks 最佳实践',
    content: '在现代React开发中，Hooks已成为必不可少的一部分。本文深入探讨React Hooks的最佳实践...',
    category: '技术',
    viewCount: 856,
    updatedAt: '2024-01-14T15:20:00Z',
    excerpt: '在现代React开发中，Hooks已成为必不可少的一部分。本文深入探讨React Hooks的最佳实践...',
    tags: ['React', 'Hooks', '前端'],
    status: 2,
    isPublic: false
  },
  {
    id: 103,
    title: '周报 2025.01.25',
    content: '本周主要工作：1. 完成用户中心页面开发及上线；2. 优化数据查询接口；3. 参与产品需求评审...',
    category: '会议',
    viewCount: 234,
    updatedAt: '2024-01-25T09:15:00Z',
    excerpt: '本周主要工作：1. 完成用户中心页面开发及上线；2. 优化数据查询接口；3. 参与产品需求评审...',
    tags: ['周报', '工作总结'],
    status: 1,
    isPublic: false
  }
])

const recommendedArticles = ref([
  {
    id: 201,
    title: '如何构建高效的知识管理系统',
    content: '在信息爆炸的时代，如何高效管理知识成为刚需。本文分享个人知识库构建心得，包括工具选型、分类管理优化...',
    category: '公共文章',
    viewCount: 1200,
    updatedAt: '2024-01-20T14:45:00Z',
    excerpt: '在信息爆炸的时代，如何高效管理知识成为刚需。本文分享个人知识库构建心得，包括工具选型、分类管理优化...',
    tags: ['知识管理', '效率', '方法论'],
    status: 2,
    isPublic: true,
    reason: '基于您的阅读习惯推荐'
  },
  {
    id: 202,
    title: 'AI赋能写作的6个技巧',
    content: 'AI写作工具正在改变文字创作的方式。本文总结6种AI辅助写作的实用技巧，包括润色、扩写与优化...',
    category: '公共文章',
    viewCount: 853,
    updatedAt: '2024-01-18T11:20:00Z',
    excerpt: 'AI写作工具正在改变文字创作的方式。本文总结6种AI辅助写作的实用技巧，包括润色、扩写与优化...',
    tags: ['AI', '写作', '技巧'],
    status: 2,
    isPublic: true,
    reason: '热门技术文章'
  },
  {
    id: 203,
    title: '产品经验谈：需求分析方法论',
    content: '需求分析是产品设计的根基。本文系统地阐述需求分析方法，包括用户调研、需求定义等...',
    category: '公共文章',
    viewCount: 1300,
    updatedAt: '2024-01-16T16:30:00Z',
    excerpt: '需求分析是产品设计的根基。本文系统地阐述需求分析方法，包括用户调研、需求定义等...',
    tags: ['产品', '需求分析', '方法论'],
    status: 2,
    isPublic: true,
    reason: '与您的工作领域相关'
  },
  {
    id: 204,
    title: 'JavaScript 异步编程完全指南',
    content: '深入理解JavaScript的异步机制，从回调函数到Promise，再到async/await的演进历程...',
    category: '公共文章',
    viewCount: 2100,
    updatedAt: '2024-01-12T09:15:00Z',
    excerpt: '深入理解JavaScript的异步机制，从回调函数到Promise，再到async/await的演进历程...',
    tags: ['JavaScript', '异步编程', '技术'],
    status: 2,
    isPublic: true,
    reason: '技术热点文章'
  }
])
</script>

<style scoped>
.home-page {
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

/* 搜索工具栏样式已移至SearchToolbar组件 */

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 36px;
}

.recent-section,
.recommend-section {
  margin-bottom: 52px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.section-header svg {
  color: #ff6b6b;
  width: 24px;
  height: 24px;
}

.section-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

@media (max-width: 768px) {
  .top-toolbar {
    padding: 14px 18px;
  }
  
  .search-bar {
    max-width: none;
  }
  
  .search-bar input {
    font-size: 14px;
    padding: 10px 16px 10px 44px;
  }
  
  .icon-btn {
    width: 40px;
    height: 40px;
  }
  
  .icon-btn svg {
    width: 20px;
    height: 20px;
  }
  
  .article-grid {
    grid-template-columns: 1fr;
  }
  
  .content-wrapper {
    padding: 20px 18px;
  }
  
  .section-header h2 {
    font-size: 20px;
  }
}
</style> 