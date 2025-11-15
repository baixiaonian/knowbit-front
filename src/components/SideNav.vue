<template>
  <aside class="side-nav">
    <nav class="nav-content">
      <div class="nav-header">
        <div class="app-logo">
          <img src="/knowbit_logo.png" alt="KnowBit Logo" class="logo-image" />
        </div>
        <h1 class="app-title">知 粒</h1>
      </div>
      
      <div class="nav-section">
        <div class="nav-item" :class="{ active: activeItem === '首页' && !props.activeDocument }" @click="handleNavClick('首页')">
          <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          首页
        </div>
        <div class="nav-item" :class="{ active: activeItem === '公共文章' && !props.activeDocument }" @click="handleNavClick('公共文章')">
          <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          公共文章
        </div>
        <div class="nav-item" :class="{ active: activeItem === 'AI 搜索' && !props.activeDocument }" @click="handleNavClick('AI 搜索')">
          <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          AI 搜索
        </div>
      </div>

      <div class="nav-section">
        <div class="section-header">
          <h3 class="section-title">我的知识库</h3>
          <div class="section-actions">
            <button class="add-btn" :class="{ active: showAddMenu }" @click="toggleAddMenu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <div v-if="showAddMenu" class="add-dropdown">
              <button class="dropdown-item" @click="createFile">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                新建文档
              </button>
              <button class="dropdown-item" @click="createFolder">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                新建文件夹
              </button>
            </div>
          </div>
        </div>
        <ul class="nav-list">
          <KnowledgeBaseItem
            v-for="item in knowledgeBaseItems"
            :key="item.name"
            :item="item"
            :level="0"
            :on-toggle-folder="toggleFolder"
            :on-toggle-edit-menu="toggleEditMenu"
            :on-toggle-folder-add-menu="toggleFolderAddMenu"
            :on-rename-item="renameItem"
            :on-move-item="moveItem"
            :on-export-item="exportItem"
            :on-pin-item="pinItem"
            :on-delete-item="deleteItem"
            :on-create-file-in-folder="createFileInFolder"
            :on-create-folder-in-folder="createFolderInFolder"
            v-model:editing-name="editingName"
            :on-confirm-rename="confirmRename"
            :on-cancel-rename="cancelRename"
            :on-open-document="handleOpenDocument"
          />
        </ul>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, inject, computed } from 'vue'
import KnowledgeBaseItem from './KnowledgeBaseItem.vue'
import { foldersAPI, documentsAPI } from '../services/api.js'

// 定义 props
const props = defineProps({
  activeItem: {
    type: String,
    default: '首页'
  },
  activeDocument: {
    type: Object,
    default: null
  }
})

// 定义 emits
const emit = defineEmits(['open-document', 'create-document', 'close-document', 'update:activeDocument'])

const activeItem = ref(props.activeItem)
const showAddMenu = ref(false)
const editingItem = ref(null) // 当前正在编辑的项目
const editingName = ref('') // 编辑中的名称

// 使用注入的知识库数据
const knowledgeBase = inject('knowledgeBase')

// 创建计算属性来确保模板能正确访问数据
const knowledgeBaseItems = computed(() => {
  // console.log('SideNav computed: knowledgeBase:', knowledgeBase)
  // console.log('SideNav computed: knowledgeBase.value:', knowledgeBase?.value)
  return knowledgeBase?.value || []
})

// // 调试：监听知识库变化
// watch(knowledgeBase, (newValue) => {
//   console.log('SideNav: Knowledge base updated:', newValue)
//   console.log('SideNav: knowledgeBase.value:', knowledgeBase.value)
//   console.log('SideNav: Array.isArray(knowledgeBase.value):', Array.isArray(knowledgeBase.value))
// }, { deep: true, immediate: true })

// 切换文件夹展开/折叠
const toggleFolder = (folder) => {
  folder.expanded = !folder.expanded
}

// 切换主新建菜单
const toggleAddMenu = (event) => {
  event.stopPropagation()
  showAddMenu.value = !showAddMenu.value
  closeAllMenusExcept(null, 'mainAdd')
}

// 新增方法用于处理各个菜单的显示和隐藏
const toggleEditMenu = (item, event) => {
  event.stopPropagation()
  item.showEditMenu = !item.showEditMenu
  closeAllMenusExcept(item, 'edit')
}

const toggleFolderAddMenu = (folder, event) => {
  event.stopPropagation()
  folder.showFolderAddMenu = !folder.showFolderAddMenu
  closeAllMenusExcept(folder, 'folderAdd')
}

const closeAllMenusExcept = (currentItem = null, type = '') => {
  // 关闭主新建菜单（除非是当前操作）
  if (type !== 'mainAdd') {
    showAddMenu.value = false
  }
  
  // 递归关闭所有项目的菜单
  const closeItemMenus = (items) => {
    items.forEach(item => {
      if (item !== currentItem || type !== 'edit') {
        item.showEditMenu = false
      }
      if (item !== currentItem || type !== 'folderAdd') {
        item.showFolderAddMenu = false
      }
      if (item.children) {
        closeItemMenus(item.children)
      }
    })
  }
  
  closeItemMenus(knowledgeBase.value)
}

const createFile = () => {
  // 发射创建文档事件
  emit('create-document')
  showAddMenu.value = false // 关闭菜单
}

const createFolder = () => {
  createNewFolder()
  showAddMenu.value = false // 关闭菜单
}

// 文件夹操作
const createFileInFolder = (folder) => {
  // 发射创建文档事件，传递父文件夹信息
  emit('create-document', folder)
}

const createFolderInFolder = (folder) => {
  createNewFolder(folder)
}

// 编辑操作
const renameItem = (item) => {
  item.isEditing = true
  editingName.value = item.name
  editingItem.value = item
  
  // 使用 nextTick 确保 DOM 更新后再聚焦
  setTimeout(() => {
    const input = document.querySelector('.edit-input')
    if (input) {
      input.focus()
      input.select()
    }
  }, 0)
}

// 获取项目的兄弟项目（用于检查重名）
const getSiblings = (targetItem) => {
  const findSiblings = (items, parent = null) => {
    for (const item of items) {
      if (item === targetItem) {
        return parent ? parent.children || [] : items
      }
      if (item.children) {
        const found = findSiblings(item.children, item)
        if (found !== null) {
          return found
        }
      }
    }
    return null
  }
  
  return findSiblings(knowledgeBase.value) || []
}

// 生成唯一名称
const generateUniqueName = (baseName, siblings) => {
  let counter = 1
  let uniqueName = baseName
  
  while (siblings.some(sibling => sibling.name === uniqueName)) {
    uniqueName = `${baseName}${counter}`
    counter++
  }
  
  return uniqueName
}

// 确认重命名
const confirmRename = async (item) => {
  const newName = editingName.value.trim()
  
  if (newName && newName !== item.name) {
    try {
      // 检查重名
      const siblings = getSiblings(item)
      const uniqueName = generateUniqueName(newName, siblings)
      
      // 根据type字段判断是文件夹还是文档
      if (item.type === 'folder') {
        // 调用后端API重命名文件夹
        if (item.id) {
          await foldersAPI.renameFolder(item.id, uniqueName)
        }
      } else {
        // 是文档，调用文档更新API
        if (item.id) {
          await documentsAPI.updateDocument(item.id, { title: uniqueName })
        }
      }
      
      item.name = uniqueName
      
      // 如果重命名的是当前活动的文档，需要通知编辑器更新
      if (props.activeDocument && props.activeDocument.id === item.id) {
        // 更新当前文档的标题
        const updatedDocument = {
          ...props.activeDocument,
          title: uniqueName
        }
        emit('update:activeDocument', updatedDocument)
      }
    } catch (error) {
      console.error('Failed to rename item:', error)
      alert('重命名失败：' + error.message)
    }
  } else if (!newName) {
    // 如果名称为空，删除新创建的项目
    if (item.name === '未命名文档' || item.name === '未命名文件夹') {
      removeItem(item)
      return
    }
  }
  
  // 重置编辑状态
  item.isEditing = false
  editingItem.value = null
  editingName.value = ''
}

// 删除项目
const removeItem = (item) => {
  // 递归查找并删除项目
  const removeFromArray = (arr, targetItem) => {
    const index = arr.findIndex(i => i === targetItem)
    if (index !== -1) {
      arr.splice(index, 1)
      return true
    }
    
    // 在子项目中查找
    for (const child of arr) {
      if (child.children) {
        if (removeFromArray(child.children, targetItem)) {
          return true
        }
      }
    }
    return false
  }
  
  removeFromArray(knowledgeBase.value, item)
  
  // 重置编辑状态
  item.isEditing = false
  editingItem.value = null
  editingName.value = ''
}

// 取消重命名
const cancelRename = (item) => {
  item.isEditing = false
  editingItem.value = null
  editingName.value = ''
  
  // 如果是新创建的项目且名称为默认值，则删除
  if (item.name === '未命名文档' || item.name === '未命名文件夹') {
    removeItem(item)
  }
}

// 获取项目的父级（用于验证重名）
const getParentOfItem = (targetItem) => {
  const findParent = (items, parent = null) => {
    for (const item of items) {
      if (item === targetItem) {
        return parent
      }
      if (item.children) {
        const found = findParent(item.children, item)
        if (found !== null) {
          return found
        }
      }
    }
    return null
  }
  
  return findParent(knowledgeBase.value)
}

// 创建新文档
const createNewDocument = (parentFolder = null) => {
  const newDoc = {
    name: '未命名文档',
    isEditing: true,
    showEditMenu: false,
    showFolderAddMenu: false
  }
  
  if (parentFolder) {
    // 添加到指定文件夹
    if (!parentFolder.children) {
      parentFolder.children = []
    }
    const siblings = parentFolder.children
    const uniqueName = generateUniqueName('未命名文档', siblings)
    newDoc.name = uniqueName
    parentFolder.children.push(newDoc)
    parentFolder.expanded = true // 自动展开父文件夹
  } else {
    // 添加到根级别
    const uniqueName = generateUniqueName('未命名文档', knowledgeBase.value)
    newDoc.name = uniqueName
    knowledgeBase.value.push(newDoc)
  }
  
  // 开始编辑
  editingName.value = newDoc.name
  editingItem.value = newDoc
  
  // 使用 nextTick 确保 DOM 更新后再聚焦
  setTimeout(() => {
    const input = document.querySelector('.edit-input')
    if (input) {
      input.focus()
      input.select()
    }
  }, 0)
}

// 创建新文件夹
const createNewFolder = async (parentFolder = null) => {
  try {
    // 生成唯一名称
    const siblings = parentFolder ? (parentFolder.children || []) : knowledgeBase.value
    const uniqueName = generateUniqueName('未命名文件夹', siblings)
    
    // 调用后端API创建文件夹
    const response = await foldersAPI.createFolder({
      name: uniqueName,
      parentId: parentFolder ? parentFolder.id : null
    })
    
    if (response && response.code === 200 && response.data) {
      const newFolder = {
        ...response.data,
        name: response.data.name,
        type: 'folder', // 明确设置为文件夹类型
        children: [], // 确保有children数组，即使是空的
        expanded: false,
        isEditing: false,
        showEditMenu: false,
        showFolderAddMenu: false
      }
      
      console.log('Created new folder:', newFolder)
      
      if (parentFolder) {
        // 添加到指定文件夹
        if (!parentFolder.children) {
          parentFolder.children = []
        }
        parentFolder.children.push(newFolder)
        parentFolder.expanded = true // 自动展开父文件夹
      } else {
        // 添加到根级别
        knowledgeBase.value.push(newFolder)
      }
    }
  } catch (error) {
    console.error('Failed to create folder:', error)
    alert('创建文件夹失败：' + error.message)
  }
}

const moveItem = (item) => {
  console.log('移动项目:', item.name)
}

const exportItem = (item) => {
  console.log('导出项目:', item.name)
}

const pinItem = (item) => {
  console.log('置顶项目:', item.name)
}

const deleteItem = async (item) => {
  console.log('删除项目:', item.name)
  
  try {
    // 确认删除
    if (!confirm(`确定要删除"${item.name}"吗？`)) {
      return
    }
    
    // 根据type字段判断是文件夹还是文档
    if (item.type === 'folder') {
      // 调用后端API删除文件夹
      if (item.id) {
        await foldersAPI.deleteFolder(item.id)
      }
    } else {
      // 是文档，调用文档删除API
      if (item.id) {
        await documentsAPI.deleteDocument(item.id)
      }
    }
    
    // 从本地数据中移除
    removeItem(item)
  } catch (error) {
    console.error('Failed to delete item:', error)
    alert('删除失败：' + error.message)
  }
}

// 处理导航点击
const handleNavClick = (navItem) => {
  activeItem.value = navItem
  // 如果有活动文档，关闭文档
  if (props.activeDocument) {
    emit('close-document')
  }
}

// 处理打开文档
const handleOpenDocument = (item) => {
  // 判断是否为文档：优先使用type字段，否则检查是否有children
  const isDocument = item.type === 'document' || (!item.type && !item.children)
  
  if (isDocument) {
    console.log('Opening document:', item.name, item)
    emit('open-document', item)
  } else {
    console.log('Item is a folder, cannot open:', item.name)
  }
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  // 检查是否点击了编辑输入框
  if (event.target.classList.contains('edit-input')) {
    return
  }
  
  // 检查是否点击了下拉菜单相关元素
  if (event.target.closest('.add-dropdown') || 
      event.target.closest('.edit-dropdown') || 
      event.target.closest('.folder-add-dropdown') ||
      event.target.closest('.add-btn') ||
      event.target.closest('.edit-btn')) {
    return
  }
  
  // 关闭所有菜单
  closeAllMenusExcept()
  
  // 如果有正在编辑的项目且点击了外部，确认重命名
  if (editingItem.value) {
    confirmRename(editingItem.value)
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 监听 props 变化
watch(() => props.activeItem, (newValue) => {
  activeItem.value = newValue
})

// 更新文档高亮状态
const updateDocumentHighlight = (targetDoc) => {
  console.log('updateDocumentHighlight called with:', targetDoc)
  
  const updateHighlight = (items) => {
    // 安全检查：确保 items 是数组
    if (!Array.isArray(items)) {
      console.warn('updateHighlight: items is not an array:', items)
      return
    }
    
    items.forEach(item => {
      // 重置所有项目的活动状态
      item.isActive = false
      
      // 判断是否为文档：优先使用type字段，否则检查是否有children
      const isDocument = item.type === 'document' || (!item.type && !item.children)
      
      // 使用文档ID进行精确匹配，避免同名文档同时高亮
      if (targetDoc && isDocument) {
        // 优先使用ID匹配，如果没有ID则使用名称匹配
        const isMatch = (item.id && targetDoc.id && item.id === targetDoc.id) || 
                       (!item.id && !targetDoc.id && item.name === targetDoc.title)
        
        if (isMatch) {
          item.isActive = true
          console.log('Highlighting document:', item.name, 'ID:', item.id, 'Type:', item.type)
        }
      }
      
      if (item.children) {
        updateHighlight(item.children)
      }
    })
  }
  
  // 确保 knowledgeBase 存在且是数组
  if (knowledgeBase && Array.isArray(knowledgeBase.value)) {
    updateHighlight(knowledgeBase.value)
  } else {
    console.warn('updateDocumentHighlight: knowledgeBase is not available or not an array:', knowledgeBase)
  }
}

watch(() => props.activeDocument, (newDoc) => {
  // console.log('SideNav: activeDocument changed:', newDoc)
  // 当有活动文档时，更新知识库中对应项目的高亮状态
  updateDocumentHighlight(newDoc)
}, { immediate: true })

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.side-nav {
  width: 100%;
  height: 100%;
  background: white;
  border-right: 1px solid #e4e7ed;
  position: relative;
  z-index: 1000; /* 建立层叠上下文，确保下拉框在侧边栏之上 */
}

.nav-content {
  height: 100%;
  padding: 20px 0;
}

.nav-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px 24px 24px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 24px;
}

.app-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
}

.app-logo .logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.app-logo svg {
  width: 24px;
  height: 24px;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  letter-spacing: 0.5px;
}

.nav-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 16px 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #909399;
  margin: 0;
  letter-spacing: 0.8px;
}

.section-actions {
  position: relative;
  z-index: 999999; /* 确保主新建按钮的下拉框在所有其他元素之上 */
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: #909399;
}

.add-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}

.add-btn.active {
  background: #409eff;
  color: white;
}

.add-btn svg {
  width: 16px;
  height: 16px;
}

.add-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white !important; /* Force opaque white background */
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 999999 !important; /* 确保主新建下拉框在最顶层 */
  min-width: 140px;
  overflow: hidden;
  opacity: 1 !important; /* Ensure full opacity */
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
}

.dropdown-item svg {
  width: 14px;
  height: 14px;
}

.edit-btn, .folder-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: #909399;
  flex-shrink: 0;
}

.edit-btn:hover, .folder-add-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}

.edit-btn.active, .folder-add-btn.active {
  background: #409eff;
  color: white;
}

.edit-dropdown, .folder-add-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 999999 !important; /* Much higher z-index to ensure it's above everything */
  min-width: 120px;
  padding: 4px 0;
  margin-top: 4px;
}

.edit-dropdown .dropdown-item, .folder-add-dropdown .dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-dropdown .dropdown-item:hover, .folder-add-dropdown .dropdown-item:hover {
  background-color: #f5f7fa;
}

.edit-dropdown .dropdown-item svg, .folder-add-dropdown .dropdown-item svg {
  width: 14px;
  height: 14px;
}

.edit-dropdown .delete-item {
  color: #f56c6c;
}

.edit-dropdown .delete-item:hover {
  background-color: #fef0f0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  font-size: 15px;
}

.item-actions {
  position: absolute;
  right: 24px; /* Position to the right */
  top: 50%; /* Vertically center */
  transform: translateY(-50%); /* Adjust for vertical centering */
  background: white; /* Ensure it covers text if text overlaps */
  padding-left: 10px; /* Small padding to avoid text cut-off */
  height: 100%; /* Ensure background covers full height */
  z-index: 1000; /* 确保操作按钮和下拉框在侧边栏之上，但低于主新建按钮 */
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Remove duplicate nav-item rule - keeping the one above */

.nav-item:hover {
  background-color: #f5f7fa;
  color: #303133;
}

.nav-item.active {
  background-color: #ecf5ff;
  color: #409eff;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #409eff;
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.folder-item {
  color: #409eff;
}

.expand-icon {
  width: 12px;
  height: 12px;
  transition: transform 0.2s;
}

.folder-item.expanded .expand-icon {
  transform: rotate(90deg);
}

.folder-icon {
  color: #f39c12;
}

.count-badge {
  background: #f0f0f0;
  color: #909399;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
}

.sub-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sub-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: #606266;
  padding-right: 80px;
  padding-top: 12px;
  padding-bottom: 12px;
  min-height: 40px;
  font-size: 15px;
}

.sub-item.folder-item {
  color: #409eff;
}

.sub-item .expand-icon {
  margin-right: 8px;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.sub-item .folder-icon {
  color: #f39c12;
}

/* 重命名编辑样式 */
.edit-input-container {
  flex: 1;
  position: relative;
}

.edit-input-container {
  position: relative;
}

.edit-input {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #409eff;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background: white;
}

.edit-input:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.edit-input::placeholder {
  color: #c0c4cc;
}

/* Force all dropdowns to be opaque and on top */
.edit-dropdown *, .folder-add-dropdown *, .add-dropdown * {
  pointer-events: auto;
}

.edit-dropdown *, .folder-add-dropdown *, .add-dropdown * {
  opacity: 1;
}
</style>