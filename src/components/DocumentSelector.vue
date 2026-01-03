<template>
  <div class="document-selector-dropdown">
    <div class="selector-header">
      <h3>选择文档</h3>
      <button class="close-btn" @click="handleClose" title="关闭">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="selector-body">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ error }}</p>
        <button @click="loadKnowledgeBase" class="retry-btn">重新加载</button>
      </div>
      
      <div v-else-if="knowledgeBase.length === 0" class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
        <p>暂无文档</p>
      </div>
      
      <div v-else class="tree-container">
        <div class="selected-info" v-if="selectedItems.size > 0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <span>已选择 <strong>{{ totalDocumentCount }}</strong> 个文档</span>
        </div>
        <div class="tree-list">
          <TreeNode 
            v-for="item in knowledgeBase" 
            :key="item.id"
            :node="item"
            :level="0"
            :selected-items="selectedItems"
            @toggle-select="toggleSelect"
            @toggle-expand="toggleExpand"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { knowledgeBaseAPI } from '../services/api.js'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  initialSelectedIds: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'confirm'])

// 数据
const knowledgeBase = ref([])
const isLoading = ref(false)
const error = ref(null)
const selectedItems = ref(new Map()) // Map<id, {type: 'folder'|'document', item: object}>

// 加载知识库结构
const loadKnowledgeBase = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await knowledgeBaseAPI.getKnowledgeBase()
    console.log('获取知识库结构:', response)
    
    if (response && response.code === 200 && response.data) {
      // 为每个节点初始化展开状态
      const initExpandState = (items) => {
        if (!items || !Array.isArray(items)) return items
        return items.map(item => {
          const newItem = { ...item, expanded: false }
          if (newItem.children && newItem.children.length > 0) {
            newItem.children = initExpandState(newItem.children)
          }
          return newItem
        })
      }
      
      knowledgeBase.value = initExpandState(response.data)
    } else {
      error.value = '加载失败，请重试'
    }
  } catch (err) {
    console.error('加载知识库失败:', err)
    error.value = err.message || '加载失败，请重试'
  } finally {
    isLoading.value = false
  }
}

// 切换选择状态
const toggleSelect = (node) => {
  const id = node.id
  const isCurrentlySelected = selectedItems.value.has(id)
  
  if (isCurrentlySelected) {
    // 取消选择：移除该节点
    selectedItems.value.delete(id)
    
    // 如果是文件夹，递归取消选择所有子节点
    if (node.type === 'folder' && node.children && node.children.length > 0) {
      const removeChildren = (folder) => {
        if (folder.children && folder.children.length > 0) {
          for (const child of folder.children) {
            selectedItems.value.delete(child.id)
            if (child.type === 'folder') {
              removeChildren(child)
            }
          }
        }
      }
      removeChildren(node)
    }
  } else {
    // 选中：添加该节点
    selectedItems.value.set(id, {
      type: node.type,
      item: node
    })
    
    // 如果是文件夹，不再递归添加所有子节点到selectedItems
    // 而是在收集文档ID时才递归收集
  }
  
  // 触发响应式更新
  selectedItems.value = new Map(selectedItems.value)
  
  // 立即确认选择并关闭
  const documentIds = collectDocumentIds()
  console.log('选中的文档ID列表:', documentIds)
  emit('confirm', documentIds)
}

// 切换展开/折叠
const toggleExpand = (node) => {
  node.expanded = !node.expanded
}

// 计算总文档数量
const totalDocumentCount = computed(() => {
  let count = 0
  
  // 递归计算文件夹下的文档数量
  const countDocumentsInFolder = (folder) => {
    let folderCount = 0
    if (folder.children && folder.children.length > 0) {
      for (const child of folder.children) {
        if (child.type === 'document') {
          folderCount++
        } else if (child.type === 'folder') {
          folderCount += countDocumentsInFolder(child)
        }
      }
    }
    return folderCount
  }
  
  // 遍历所有选中项
  for (const [id, data] of selectedItems.value) {
    if (data.type === 'document') {
      count++
    } else if (data.type === 'folder') {
      count += countDocumentsInFolder(data.item)
    }
  }
  
  return count
})

// 收集所有文档ID
const collectDocumentIds = () => {
  const documentIds = []
  
  // 递归收集文件夹下的所有文档ID
  const collectFromFolder = (folder) => {
    if (folder.children && folder.children.length > 0) {
      for (const child of folder.children) {
        if (child.type === 'document') {
          documentIds.push(child.id)
        } else if (child.type === 'folder') {
          collectFromFolder(child)
        }
      }
    }
  }
  
  // 遍历所有选中项
  for (const [id, data] of selectedItems.value) {
    if (data.type === 'document') {
      documentIds.push(id)
    } else if (data.type === 'folder') {
      collectFromFolder(data.item)
    }
  }
  
  // 去重
  return [...new Set(documentIds)]
}

// 处理关闭
const handleClose = () => {
  // 关闭时确认当前选择
  const documentIds = collectDocumentIds()
  emit('confirm', documentIds)
  emit('close')
}

// 组件挂载时加载知识库
onMounted(() => {
  if (props.show) {
    loadKnowledgeBase()
  }
})

// 监听show变化
import { watch } from 'vue'
watch(() => props.show, (newVal) => {
  if (newVal) {
    loadKnowledgeBase()
    // 不再清空选择，而是根据initialSelectedIds初始化
    initializeSelection()
  }
})

// 初始化选择状态
const initializeSelection = () => {
  selectedItems.value.clear()
  
  if (!props.initialSelectedIds || props.initialSelectedIds.length === 0) {
    return
  }
  
  // 递归查找并添加到selectedItems
  const findAndAddNode = (items, targetId) => {
    if (!items || !Array.isArray(items)) return null
    
    for (const item of items) {
      if (item.id === targetId) {
        return item
      }
      if (item.children && item.children.length > 0) {
        const found = findAndAddNode(item.children, targetId)
        if (found) return found
      }
    }
    return null
  }
  
  // 将initialSelectedIds中的文档添加到selectedItems
  for (const docId of props.initialSelectedIds) {
    const node = findAndAddNode(knowledgeBase.value, docId)
    if (node) {
      selectedItems.value.set(docId, {
        type: node.type,
        item: node
      })
    }
  }
  
  // 触发响应式更新
  selectedItems.value = new Map(selectedItems.value)
}
</script>

<script>
// TreeNode 子组件
import { defineComponent, h } from 'vue'

const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    selectedItems: {
      type: Map,
      required: true
    },
    parentSelected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-select', 'toggle-expand'],
  setup(props, { emit }) {
    const isSelected = () => {
      // 如果父节点被选中，则子节点也显示为选中状态
      if (props.parentSelected) {
        return true
      }
      return props.selectedItems.has(props.node.id)
    }
    
    const isFolder = () => {
      return props.node.type === 'folder'
    }
    
    const hasChildren = () => {
      return props.node.children && props.node.children.length > 0
    }
    
    const toggleSelect = () => {
      emit('toggle-select', props.node)
    }
    
    const toggleExpand = () => {
      emit('toggle-expand', props.node)
    }
    
    return () => {
      const node = props.node
      const paddingLeft = 24 + props.level * 28
      
      return h('div', { class: 'tree-node' }, [
        // 节点行
        h('div', { 
          class: ['tree-node-row', { 'selected': isSelected() }],
          style: { paddingLeft: `${paddingLeft}px` },
          onClick: toggleSelect
        }, [
          // 展开/折叠图标
          isFolder() && hasChildren() ? h('span', {
            class: ['expand-icon', { 'expanded': node.expanded }],
            onClick: (e) => {
              e.stopPropagation()
              toggleExpand()
            }
          }, [
            h('svg', {
              width: 16,
              height: 16,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': 2.5
            }, [
              h('polyline', { points: '9 18 15 12 9 6' })
            ])
          ]) : h('span', { class: 'expand-icon-placeholder' }),
          
          // 复选框
          h('input', {
            type: 'checkbox',
            class: 'tree-checkbox',
            checked: isSelected(),
            onClick: (e) => {
              e.stopPropagation()
            },
            onChange: toggleSelect
          }),
          
          // 图标
          h('span', { 
            class: ['node-icon', isFolder() ? 'folder-icon' : 'document-icon'] 
          }, [
            isFolder() ? h('svg', {
              width: 20,
              height: 20,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': 2
            }, [
              h('path', { d: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' })
            ]) : h('svg', {
              width: 20,
              height: 20,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': 2
            }, [
              h('path', { d: 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z' }),
              h('polyline', { points: '13 2 13 9 20 9' })
            ])
          ]),
          
          // 名称
          h('span', { class: 'node-name' }, node.name || node.title || '未命名')
        ]),
        
        // 子节点
        isFolder() && hasChildren() && node.expanded ? h('div', { class: 'tree-node-children' },
          node.children.map(child => h(TreeNode, {
            key: child.id,
            node: child,
            level: props.level + 1,
            selectedItems: props.selectedItems,
            parentSelected: isSelected() || props.parentSelected, // 传递父节点选中状态
            'onToggle-select': (node) => emit('toggle-select', node),
            'onToggle-expand': (node) => emit('toggle-expand', node)
          }))
        ) : null
      ])
    }
  }
})

export default {
  components: {
    TreeNode
  }
}
</script>

<style scoped>
.document-selector-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 12px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
  max-height: 520px;
  display: flex;
  flex-direction: column;
  z-index: 100;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
  flex-shrink: 0;
}

.selector-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.2px;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #999;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 0;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
  transform: scale(1.05);
}

.close-btn:active {
  transform: scale(0.95);
}

.selector-body {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
  max-height: 440px;
  padding: 8px 0;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 240px;
  color: #9ca3af;
  gap: 12px;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state p,
.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.error-state svg {
  color: #f56c6c;
}

.empty-state svg {
  color: #ddd;
  opacity: 0.8;
}

.retry-btn {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  margin: 12px 16px 8px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
  font-weight: 500;
}

.selected-info svg {
  flex-shrink: 0;
}

.selected-info strong {
  font-weight: 600;
}

.tree-container {
  padding: 12px 0;
}

.tree-list {
  padding: 0 12px;
}

.tree-node {
  margin: 0;
  position: relative;
}

.tree-node + .tree-node {
  margin-top: 4px;
}

.tree-node-row {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  padding-right: 24px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  position: relative;
  min-height: 52px;
  border-radius: 12px;
  margin: 0;
  background: white;
}

.tree-node-row:hover {
  background: linear-gradient(90deg, #fafbfc 0%, #f5f7fa 100%);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tree-node-row.selected {
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.18), inset 0 0 0 1px rgba(102, 126, 234, 0.1);
  transform: translateX(0);
}

.tree-node-row.selected:hover {
  background: linear-gradient(135deg, #e8edff 0%, #dce4ff 100%);
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.22), inset 0 0 0 1px rgba(102, 126, 234, 0.15);
}

.expand-icon,
.expand-icon-placeholder {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #999;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  margin-right: 12px;
  border-radius: 8px;
}

.expand-icon:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.08) 100%);
  color: #667eea;
  transform: scale(1.1);
}

.expand-icon.expanded {
  transform: rotate(90deg);
  color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.06) 100%);
}

.expand-icon.expanded:hover {
  transform: rotate(90deg) scale(1.1);
}

.expand-icon-placeholder {
  cursor: default;
}

.tree-checkbox {
  width: 20px;
  height: 20px;
  margin: 0 14px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: #667eea;
  border-radius: 6px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.tree-checkbox:hover {
  transform: scale(1.15);
  filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
}

.tree-checkbox:checked {
  filter: drop-shadow(0 2px 6px rgba(102, 126, 234, 0.4));
}

.node-icon {
  display: flex;
  align-items: center;
  margin-right: 12px;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05));
}

.node-icon.folder-icon {
  color: #f39c12;
}

.node-icon.document-icon {
  color: #999;
}

.tree-node-row:hover .node-icon {
  transform: scale(1.08) translateY(-1px);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.tree-node-row.selected .node-icon.folder-icon {
  color: #667eea;
  filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
}

.tree-node-row.selected .node-icon.document-icon {
  color: #667eea;
  filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
}

.node-name {
  flex: 1;
  font-size: 15.5px;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  letter-spacing: -0.15px;
  line-height: 1.5;
}

.tree-node-row:hover .node-name {
  color: #1a1a1a;
  font-weight: 550;
}

.tree-node-row.selected .node-name {
  color: #667eea;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(102, 126, 234, 0.1);
}

.tree-node-children {
  /* 不需要额外margin，通过paddingLeft控制层级 */
  margin-top: 4px;
}

/* 滚动条样式 */
.selector-body::-webkit-scrollbar {
  width: 8px;
}

.selector-body::-webkit-scrollbar-track {
  background: transparent;
  margin: 8px 0;
}

.selector-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #e0e0e0 0%, #d0d0d0 100%);
  border-radius: 10px;
  border: 2px solid white;
  transition: all 0.2s;
}

.selector-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #c0c0c0 0%, #b0b0b0 100%);
  border-width: 1px;
}
</style>
