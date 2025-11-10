<template>
  <div class="app-router">
    <!-- 登录页面 -->
    <LoginPage 
      v-if="!isAuthenticated"
      @login-success="handleLoginSuccess"
    />
    
    <!-- 已登录：加载状态 -->
    <div v-else-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在加载知识库...</p>
    </div>
    
    <!-- 已登录：错误提示 -->
    <div v-else-if="loadError" class="error-overlay">
      <div class="error-message">
        <h3>⚠️ 连接错误</h3>
        <p>{{ loadError }}</p>
        <div class="error-solutions">
          <h4>可能的解决方案：</h4>
          <ul>
            <li>检查后端服务是否正在运行</li>
            <li>确认后端支持HTTPS协议</li>
            <li>检查网络连接</li>
            <li>联系系统管理员</li>
          </ul>
        </div>
        <button @click="loadKnowledgeBase" class="retry-btn">重试</button>
      </div>
    </div>
    
    <!-- 已登录：正常内容 -->
    <template v-else>
      <!-- 首页 -->
      <HomePage 
        v-if="currentPage === 'home'"
        :current-user="currentUser"
        @open-document="openDocument"
        @create-document="createDocument"
        @logout="handleLogout"
      />
      
      <!-- 文档编辑页 -->
      <DocumentPage 
        v-else-if="currentPage === 'document'"
        :document="currentDocument"
        :is-loading-document="isLoadingDocument"
        :active-document="currentDocument"
        :current-user="currentUser"
        @close="closeDocument"
        @save="saveDocument"
        @create-document="createDocument"
        @update:document="updateDocument"
        @open-document="openDocument"
        @logout="handleLogout"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, computed } from 'vue'
import LoginPage from '../views/LoginPage.vue'
import HomePage from '../views/HomePage.vue'
import DocumentPage from '../views/DocumentPage.vue'
import { knowledgeBaseAPI, foldersAPI, documentsAPI, authAPI } from '../services/api.js'

// 用户认证状态
const isAuthenticated = ref(false)
const currentUser = ref(null)

// 检查是否已登录
const checkAuth = () => {
  const token = localStorage.getItem('auth_token')
  const userInfo = localStorage.getItem('user_info')
  
  if (token && userInfo) {
    isAuthenticated.value = true
    currentUser.value = JSON.parse(userInfo)
    return true
  }
  return false
}

// 登录成功处理
const handleLoginSuccess = (data) => {
  console.log('Login success, user data:', data)
  isAuthenticated.value = true
  currentUser.value = data.user
  
  // 加载知识库
  loadKnowledgeBase()
}

const handleLogout = () => {
  authAPI.logout()
  isAuthenticated.value = false
  currentUser.value = null
  currentPage.value = 'home'
  currentDocument.value = null
  knowledgeBase.value = []
  isLoading.value = false
  loadError.value = null
}

// 全局知识库数据管理 - 从后端API加载
const knowledgeBase = ref([])
const isLoading = ref(false)
const loadError = ref(null)

// 测试后端连接
const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...')
    const baseUrl = 'https://api.knowbit.cn/api'
    
    console.log('Testing connection to:', baseUrl)
    
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer 1`
      }
    })
    console.log('Backend connection test:', response.status)
    return response.ok
  } catch (error) {
    console.log('Backend connection test failed:', error.message)
    console.log('Error details:', error)
    return false
  }
}

// 从后端加载知识库数据
const loadKnowledgeBase = async () => {
  isLoading.value = true
  loadError.value = null
  
  try {
    console.log('Loading knowledge base from API...')
    
    // 直接尝试加载，让API层处理协议问题
    const response = await knowledgeBaseAPI.getKnowledgeBase()
    
    if (response && response.code === 200 && response.data) {
      // 处理返回的数据，添加前端需要的字段
      const processItems = (items) => {
        if (!Array.isArray(items)) return []
        
        return items.map(item => {
          // 确保每个项目都有正确的type字段
          let itemType = item.type
          if (!itemType) {
            // 如果后端没有返回type字段，根据是否有children来判断
            itemType = Array.isArray(item.children) ? 'folder' : 'document'
          }
          
          return {
            ...item,
            type: itemType, // 确保type字段正确设置
            expanded: item.expanded !== undefined ? item.expanded : false,
            showEditMenu: false,
            showFolderAddMenu: false,
            isEditing: false,
            children: item.children ? processItems(item.children) : []
          }
        })
      }
      
      knowledgeBase.value = processItems(response.data)
      console.log('Knowledge base loaded successfully:', knowledgeBase.value)
    } else {
      throw new Error('Invalid response format from knowledge base API')
    }
  } catch (error) {
    console.error('Failed to load knowledge base:', error)
    
    // 提供更友好的错误信息
    if (error.message.includes('Mixed Content')) {
      loadError.value = 'Mixed Content错误：请配置后端HTTPS支持，或联系管理员'
    } else if (error.message.includes('Failed to fetch')) {
      loadError.value = '无法连接到后端服务，请检查网络连接或服务状态'
    } else {
      loadError.value = error.message
    }
    
    // 使用空数组作为回退
    knowledgeBase.value = []
  } finally {
    isLoading.value = false
  }
}

// 组件挂载时检查登录状态
onMounted(() => {
  if (checkAuth()) {
    // 已登录，加载知识库
    loadKnowledgeBase()
  }
  // 未登录，显示登录页面
})

// 页面状态管理
const currentPage = ref('home')
const currentDocument = ref(null)
const isLoadingDocument = ref(false) // 文档加载状态

// 提供知识库数据给子组件
provide('knowledgeBase', knowledgeBase)

// 页面切换方法
const openDocument = async (document) => {
  // 判断是否为文档：优先使用type字段，否则检查是否有children
  const isDocument = document.type === 'document' || (!document.type && !document.children)
  
  if (!isDocument) {
    return
  }
  
  try {
    isLoadingDocument.value = true // 开始加载
    console.log('API Request: GET /documents/' + document.id)
    
    // 请求后端获取完整的文档详情
    const response = await documentsAPI.getDocument(document.id)
    
    if (response && response.code === 200 && response.data) {
      
      // 使用从API获取的完整文档数据
      currentDocument.value = {
        id: response.data.id,
        title: response.data.title || '未命名文档',
        content: response.data.content || '',
        type: 'document',
        path: response.data.folder?.path || '',
        lastModified: response.data.updatedAt || new Date().toISOString(),
        // 从API响应中获取其他字段
        folderId: response.data.folderId,
        categoryId: response.data.categoryId,
        tags: response.data.tags || [],
        isPublic: response.data.isPublic || false,
        status: response.data.status || 1,
        excerpt: response.data.excerpt || '',
        // 添加作者信息
        authorId: response.data.authorId,
        author: response.data.author,
        // 添加统计信息
        stats: response.data.stats,
        // 添加时间戳
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt
      }
    } else {
      // 如果API请求失败，使用缓存的数据
      currentDocument.value = {
        id: document.id || Date.now(),
        title: document.name || '未命名文档',
        content: document.content || '',
        type: 'document',
        path: document.path || '',
        lastModified: document.lastModified || document.updatedAt || new Date().toISOString(),
        folderId: document.folderId,
        categoryId: document.categoryId,
        tags: document.tags || [],
        isPublic: document.isPublic || false,
        status: document.status || 1,
        excerpt: document.excerpt || ''
      }
    }
    
    currentPage.value = 'document'
    
  } catch (error) {
    // 出错时使用缓存的数据，确保用户仍能打开文档
    currentDocument.value = {
      id: document.id || Date.now(),
      title: document.name || '未命名文档',
      content: document.content || '',
      type: 'document',
      path: document.path || '',
      lastModified: document.lastModified || document.updatedAt || new Date().toISOString(),
      folderId: document.folderId,
      categoryId: document.categoryId,
      tags: document.tags || [],
      isPublic: document.isPublic || false,
      status: document.status || 1,
      excerpt: document.excerpt || ''
    }
    
    currentPage.value = 'document'
  } finally {
    isLoadingDocument.value = false // 结束加载
  }
}

// 生成唯一文档名称的函数
const generateUniqueDocumentName = (baseName = '未命名文档', parentFolder = null) => {
  const getSiblingDocuments = (items) => {
    const siblings = []
    const findSiblings = (items) => {
      for (const item of items) {
        // 判断是否为文档：优先使用type字段，否则检查是否有children
        const isDocument = item.type === 'document' || (!item.type && !item.children)
        if (isDocument) {
          siblings.push(item)
        }
        if (item.children) {
          findSiblings(item.children)
        }
      }
    }
    findSiblings(items)
    return siblings
  }
  
  const siblings = getSiblingDocuments(knowledgeBase.value)
  
  // 检查是否有重名
  let counter = 0
  let uniqueName = baseName
  
  while (siblings.some(doc => doc.name === uniqueName)) {
    counter++
    uniqueName = `${baseName}（${counter}）`
  }
  
  return uniqueName
}

// 添加文档到知识库的函数
const addDocumentToKnowledgeBase = (document, parentFolder = null) => {
  const newItem = {
    name: document.title,
    id: document.id,
    content: document.content,
    lastModified: document.lastModified,
    type: 'document', // 确保设置为document类型
    isEditing: false,
    showEditMenu: false,
    showFolderAddMenu: false,
    // 添加其他字段
    folderId: document.folderId,
    categoryId: document.categoryId,
    tags: document.tags || [],
    isPublic: document.isPublic || false,
    status: document.status || 1,
    excerpt: document.excerpt || ''
  }
  
  if (parentFolder && parentFolder.id) {
    // 添加到指定文件夹（通过 ID 匹配更准确）
    const findAndAddToFolder = (items) => {
      for (const item of items) {
        // 判断是否为文件夹：优先使用type字段，否则检查是否有children
        const isFolder = item.type === 'folder' || (!item.type && item.children)
        
        if (item.id === parentFolder.id && isFolder) {
          if (!item.children) {
            item.children = []
          }
          item.children.push(newItem)
          item.expanded = true // 自动展开父文件夹
          return true
        }
        if (item.children && findAndAddToFolder(item.children)) {
          return true
        }
      }
      return false
    }
    
    const added = findAndAddToFolder(knowledgeBase.value)
    if (!added) {
      // 如果找不到指定文件夹，添加到根级别
      knowledgeBase.value.push(newItem)
    }
  } else {
    // 添加到根级别
    knowledgeBase.value.push(newItem)
  }
}

const createDocument = async (parentFolder = null) => {
  try {
    // 生成唯一的文档标题
    const uniqueTitle = generateUniqueDocumentName('未命名文档', parentFolder)
    
    console.log('API Request: POST /documents')
    
    // 调用后端API创建文档
    const response = await documentsAPI.createDocument({
      title: uniqueTitle,
      content: '',
      folderId: parentFolder ? parentFolder.id : null,
      isPublic: false,
      status: 1, // 草稿状态
      tags: [],
      excerpt: ''
    })
    
    if (response && response.code === 200 && response.data) {
      const newDoc = {
        ...response.data,
        type: 'document',
        name: response.data.title,
        lastModified: response.data.updatedAt,
        parentFolder: parentFolder
      }
      
      // 添加到知识库数据中
      addDocumentToKnowledgeBase(newDoc, parentFolder)
      
      openDocument(newDoc)
    }
  } catch (error) {
    console.error('Failed to create document:', error)
    alert('创建文档失败：' + error.message)
  }
}

const closeDocument = () => {
  currentPage.value = 'home'
  currentDocument.value = null
}

// 更新知识库中文档的函数
const updateDocumentInKnowledgeBase = (document) => {
  const findAndUpdateDocument = (items) => {
    for (const item of items) {
      // 确保只更新文档，不更新文件夹
      if (item.id === document.id && (item.type === 'document' || (!item.type && !item.children))) {
        // 更新文档字段
        item.name = document.title
        item.content = document.content
        item.title = document.title
        item.lastModified = document.updatedAt || document.lastModified
        item.updatedAt = document.updatedAt || new Date().toISOString()
        
        // 更新其他可能的字段
        if (document.folderId !== undefined) item.folderId = document.folderId
        if (document.categoryId !== undefined) item.categoryId = document.categoryId
        if (document.tags !== undefined) item.tags = document.tags
        if (document.isPublic !== undefined) item.isPublic = document.isPublic
        if (document.status !== undefined) item.status = document.status
        if (document.excerpt !== undefined) item.excerpt = document.excerpt
        
        return true
      }
      
      // 递归搜索子项目
      if (item.children && findAndUpdateDocument(item.children)) {
        return true
      }
    }
    return false
  }
  
  findAndUpdateDocument(knowledgeBase.value)
}

const updateDocument = (document) => {
  // 更新当前文档状态
  currentDocument.value = { ...currentDocument.value, ...document }
  
  // 更新知识库中对应文档的数据，实现实时绑定
  updateDocumentInKnowledgeBase(document)
}

const saveDocument = async (document) => {
  try {
    console.log('API Request: PUT /documents/' + document.id)
    
    // 调用后端API保存文档
    const response = await documentsAPI.updateDocument(document.id, {
      title: document.title,
      content: document.content,
      folderId: document.folderId,
      categoryId: document.categoryId,
      tags: document.tags,
      isPublic: document.isPublic,
      status: document.status,
      excerpt: document.excerpt
    })
    
    if (response && response.code === 200) {
      // 更新知识库中对应文档的数据
      updateDocumentInKnowledgeBase({
        ...document,
        updatedAt: response.data.updatedAt
      })
    }
  } catch (error) {
    console.error('Failed to save document:', error)
    alert('保存文档失败：' + error.message)
  }
}
</script>

<style scoped>
.app-router {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f7fa;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e4e7ed;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #606266;
  font-size: 16px;
  margin: 0;
}

.error-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.error-message {
  background: white;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  text-align: center;
}

.error-message h3 {
  color: #f56c6c;
  margin: 0 0 16px 0;
  font-size: 20px;
}

.error-message p {
  color: #606266;
  margin: 0 0 24px 0;
  font-size: 16px;
  line-height: 1.5;
}

.error-solutions {
  text-align: left;
  margin: 24px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.error-solutions h4 {
  color: #303133;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.error-solutions ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  font-size: 14px;
}

.error-solutions li {
  margin-bottom: 8px;
  line-height: 1.4;
}

.retry-btn {
  background: #409eff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #66b1ff;
}

.retry-btn:active {
  background: #3a8ee6;
}
</style>
