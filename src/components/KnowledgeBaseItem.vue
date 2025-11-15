<template>
  <div>
    <div
      :class="[
        level === 0 ? 'nav-item' : ['nav-item', 'sub-item'],
        { 
          'folder-item': isFolder, 
          'document-item': !isFolder,
          expanded: item.expanded,
          'active-document': item.isActive && !isFolder,
          'menu-open': item.showEditMenu || item.showFolderAddMenu
        }
      ]"
      :style="itemStyle"
      @click="handleItemClick"
    >
      <!-- 展开图标 -->
      <svg
        v-if="isFolder"
        class="expand-icon"
        :width="expandIconSize"
        :height="expandIconSize"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :style="expandIconStyle"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>

      <!-- 文件夹或文档图标 -->
      <svg
        :class="['nav-icon', isFolder ? 'folder-icon' : '']"
        :width="iconSize"
        :height="iconSize"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :style="iconStyle"
      >
        <path
          v-if="isFolder"
          d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
        />
        <template v-else>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </template>
      </svg>

      <!-- 项目名称或编辑输入框 -->
      <span v-if="!item.isEditing" class="item-name">{{ item.name }}</span>
      <div v-else class="edit-input-container">
        <input
          class="edit-input"
          :placeholder="item.name"
          :value="editingName"
          @input="emit('update:editingName', $event.target.value)"
          @keyup.enter="onConfirmRename(item)"
          @keyup.escape="onCancelRename(item)"
          @blur="onConfirmRename(item)"
        />
      </div>

      <!-- 数量徽章 -->
      <span v-if="item.count" class="count-badge">{{ item.count }}</span>

      <!-- 操作按钮 -->
      <div v-if="!item.isEditing" class="item-actions" :style="actionsStyle">
        <!-- 编辑按钮 -->
        <button
          :class="['edit-btn', { active: item.showEditMenu }]"
          :style="buttonStyle"
          title="编辑"
          @click.stop="onToggleEditMenu(item, $event)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>

        <!-- 新建按钮（仅文件夹） -->
        <button
          v-if="isFolder"
          :class="['add-btn', 'folder-add-btn', { active: item.showFolderAddMenu }]"
          :style="buttonStyle"
          title="新建"
          @click.stop="onToggleFolderAddMenu(item, $event)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <!-- 编辑下拉菜单 -->
      <div
        v-if="item.showEditMenu"
        class="edit-dropdown"
        :style="dropdownStyle"
        @click.stop
      >
        <button class="dropdown-item" @click.stop="onRenameItem(item)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          重命名
        </button>
        <button class="dropdown-item" @click.stop="onMoveItem(item)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          移动...
        </button>
        <button class="dropdown-item" @click.stop="onExportItem(item)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          导出...
        </button>
        <button class="dropdown-item" @click.stop="onPinItem(item)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 17V3M12 17l-4 4M12 17l4 4M18 3h-6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
          </svg>
          置顶
        </button>
        <button class="dropdown-item delete-item" @click.stop="onDeleteItem(item)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          删除
        </button>
      </div>

      <!-- 新建下拉菜单（仅文件夹） -->
      <div
        v-if="isFolder && item.showFolderAddMenu"
        class="add-dropdown folder-add-dropdown"
        :style="dropdownStyle"
        @click.stop
      >
        <button class="dropdown-item" @click.stop="onCreateFileInFolder(item)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          新建文档
        </button>
        <button class="dropdown-item" @click.stop="onCreateFolderInFolder(item)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          新建文件夹
        </button>
      </div>
    </div>

    <!-- 递归渲染子项目 -->
    <ul v-if="isFolder && item.expanded && item.children" class="sub-list">
      <KnowledgeBaseItem
        v-for="child in item.children"
        :key="child.name"
        :item="child"
        :level="level + 1"
        :on-toggle-folder="onToggleFolder"
        :on-toggle-edit-menu="onToggleEditMenu"
        :on-toggle-folder-add-menu="onToggleFolderAddMenu"
        :on-rename-item="onRenameItem"
        :on-move-item="onMoveItem"
        :on-export-item="onExportItem"
        :on-pin-item="onPinItem"
        :on-delete-item="onDeleteItem"
        :on-create-file-in-folder="onCreateFileInFolder"
        :on-create-folder-in-folder="onCreateFolderInFolder"
          :editing-name="editingName"
          @update:editing-name="(value) => $emit('update:editingName', value)"
      :on-confirm-rename="onConfirmRename"
      :on-cancel-rename="onCancelRename"
      :on-open-document="onOpenDocument"
      />
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

// Props
const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  onToggleFolder: {
    type: Function,
    required: true
  },
  onToggleEditMenu: {
    type: Function,
    required: true
  },
  onToggleFolderAddMenu: {
    type: Function,
    required: true
  },
  onRenameItem: {
    type: Function,
    required: true
  },
  onMoveItem: {
    type: Function,
    required: true
  },
  onExportItem: {
    type: Function,
    required: true
  },
  onPinItem: {
    type: Function,
    required: true
  },
  onDeleteItem: {
    type: Function,
    required: true
  },
  onCreateFileInFolder: {
    type: Function,
    required: true
  },
  onCreateFolderInFolder: {
    type: Function,
    required: true
  },
  editingName: {
    type: String,
    default: ''
  },
  onConfirmRename: {
    type: Function,
    required: true
  },
  onCancelRename: {
    type: Function,
    required: true
  },
  onOpenDocument: {
    type: Function,
    required: true
  }
})

// 定义 emits
const emit = defineEmits(['update:editingName'])

// 计算属性：判断是否为文件夹
const isFolder = computed(() => {
  // 优先使用 type 字段
  if (props.item.type !== undefined) {
    return props.item.type === 'folder'
  }
  // 兼容旧数据：如果有 children 属性（即使是空数组），则认为是文件夹
  return Array.isArray(props.item.children)
})

// 计算样式
const iconSize = 16
const expandIconSize = 12

const itemStyle = computed(() => ({
  paddingLeft: props.level === 0 ? '24px' : `${24 + props.level * 32 + (isFolder.value ? 0 : 20)}px`,
  fontSize: '15px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  color: '#606266',
  position: 'relative',
  paddingRight: '80px',
  paddingTop: '12px',
  paddingBottom: '12px',
  minHeight: '40px'
}))

const expandIconStyle = computed(() => ({
  marginRight: '8px',
  transform: props.item.expanded ? 'rotate(90deg)' : 'rotate(0deg)',
  transition: 'transform 0.2s',
  flexShrink: '0'
}))

const iconStyle = computed(() => ({
  flexShrink: '0'
}))

const actionsStyle = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  position: 'absolute',
  right: '24px',
  top: '50%',
  transform: 'translateY(-50%)',
  paddingLeft: '10px',
  height: '100%',
  zIndex: '1000',
  background: 'transparent'
}))

const buttonStyle = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  border: 'none',
  background: 'transparent',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  color: '#909399',
  flexShrink: '0'
}))

const dropdownStyle = computed(() => ({
  position: 'absolute',
  top: '100%',
  right: '0',
  background: 'white',
  border: '1px solid #e4e7ed',
  borderRadius: '6px',
  boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
  zIndex: '999999',
  minWidth: '120px',
  padding: '4px 0',
  marginTop: '4px'
}))

// 处理项目点击
const handleItemClick = () => {
  if (isFolder.value) {
    // 文件夹：切换展开/折叠
    props.onToggleFolder(props.item)
  } else {
    // 文档：打开文档
    props.onOpenDocument(props.item)
  }
}
</script>

<style scoped>
.nav-item {
  position: relative;
  transition: color 0.2s;
  z-index: 0;
  overflow: visible;
}

.nav-item.menu-open {
  z-index: 100;
}

.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: transparent;
  transition: background-color 0.2s;
  z-index: -1;
  pointer-events: none;
}

.nav-item > * {
  position: relative;
  z-index: 1;
}

.document-item:hover {
  color: #303133;
}

.document-item:hover::before {
  background-color: #f5f7fa;
}

.folder-item.expanded {
  color: #409eff;
}

.sub-item {
  position: relative;
}

.active-document::before {
  background-color: #ecf5ff;
}

.active-document {
  color: #409eff !important;
  border-left: 3px solid #409eff;
}

.active-document .nav-icon {
  color: #409eff !important;
}

.sub-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-icon {
  flex-shrink: 0;
}

.folder-icon {
  color: #f39c12;
}

.expand-icon {
  flex-shrink: 0;
  transition: transform 0.2s;
}

.item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count-badge {
  background: #f0f0f0;
  color: #909399;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
}

.edit-input-container {
  flex: 1;
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

.item-actions {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  padding-left: 10px;
  height: 100%;
  z-index: 1000;
}

.edit-btn,
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
  flex-shrink: 0;
}

.edit-btn:hover,
.add-btn:hover {
  background: transparent;
  color: #409eff;
}

.active-document .edit-btn,
.active-document .add-btn {
  background: transparent;
  color: #409eff;
}

.edit-btn.active,
.add-btn.active {
  background: #409eff;
  color: white;
}

.edit-dropdown,
.add-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 999999 !important;
  min-width: 120px;
  padding: 4px 0;
  margin-top: 4px;
}

.dropdown-item {
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

.dropdown-item:hover {
  background-color: #f5f7fa;
}

.dropdown-item.delete-item {
  color: #f56c6c;
}

.dropdown-item.delete-item:hover {
  background-color: #fef0f0;
}
</style>
