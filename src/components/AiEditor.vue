<template>
  <div class="ai-editor">
    <!-- 编辑器工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <select class="toolbar-select" v-model="textStyle" @change="setTextStyle">
          <option value="paragraph">正文</option>
          <option value="heading1">标题1</option>
          <option value="heading2">标题2</option>
          <option value="heading3">标题3</option>
          <option value="heading4">标题4</option>
          <option value="heading5">标题5</option>
          <option value="heading6">标题6</option>
        </select>
        <select class="toolbar-select" v-model="fontSize" @change="setFontSize">
          <option value="12px">12px</option>
          <option value="13px">13px</option>
          <option value="14px">14px</option>
          <option value="15px">15px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="19px">19px</option>
          <option value="22px">22px</option>
          <option value="24px">24px</option>
          <option value="29px">29px</option>
          <option value="32px">32px</option>
          <option value="40px">40px</option>
          <option value="48px">48px</option>
        </select>
      </div>
      
      <div class="toolbar-group">
        <button class="toolbar-btn" @click="toggleFormat('bold')" title="粗体">
          <strong>B</strong>
        </button>
        <button class="toolbar-btn" @click="toggleFormat('italic')" title="斜体">
          <em>I</em>
        </button>
        <button class="toolbar-btn" @click="toggleFormat('strike')" title="删除线">
          <s>S</s>
        </button>
        <button class="toolbar-btn" @click="toggleFormat('underline')" title="下划线">
          <u>U</u>
        </button>
      </div>
      
      <div class="toolbar-group">
        <div class="color-btn-container">
          <button ref="textColorBtn" class="toolbar-btn" @click="toggleTextColorPicker" title="文本颜色">
            <span class="color-indicator" :style="{ background: textColor }"></span>
            T
          </button>
          <ColorPicker 
            :visible="showTextColorPicker"
            title="文本颜色"
            type="text"
            :trigger-element="textColorBtn"
            @close="showTextColorPicker = false"
            @select="setTextColor" />
        </div>
        <div class="color-btn-container">
          <button ref="highlightColorBtn" class="toolbar-btn" @click="toggleHighlightColorPicker" title="背景颜色">
            <span class="color-indicator" :style="{ background: highlightColor }"></span>
            A
          </button>
          <ColorPicker 
            :visible="showHighlightColorPicker"
            title="背景颜色"
            type="background"
            :trigger-element="highlightColorBtn"
            @close="showHighlightColorPicker = false"
            @select="setHighlightColor" />
        </div>
      </div>
      
      <div class="toolbar-group">
        <button class="toolbar-btn" @click="setAlignment('left')" title="左对齐">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="21" y1="10" x2="7" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="7" y1="18" x2="3" y2="18"></line>
          </svg>
        </button>
        <button class="toolbar-btn" @click="setAlignment('center')" title="居中">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="10" x2="6" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="18" y1="18" x2="6" y2="18"></line>
          </svg>
        </button>
        <button class="toolbar-btn" @click="setAlignment('right')" title="右对齐">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="17" y1="10" x2="3" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="17" y1="18" x2="3" y2="18"></line>
          </svg>
        </button>
        <button class="toolbar-btn" @click="setAlignment('justify')" title="两端对齐">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="21" y1="10" x2="3" y2="10"></line>
            <line x1="21" y1="6" x2="3" y2="6"></line>
            <line x1="21" y1="14" x2="3" y2="14"></line>
            <line x1="21" y1="18" x2="3" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="toolbar-group">
        <button class="toolbar-btn" @click="toggleList('bullet')" title="无序列表">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
        <button class="toolbar-btn" @click="toggleList('ordered')" title="有序列表">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4"></path>
            <path d="M4 10h2"></path>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
          </svg>
        </button>
      </div>
      
      <div class="toolbar-group">
        <button class="toolbar-btn" @click="insertTable" title="插入表格">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0-18h10a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"></path>
          </svg>
        </button>
        <button class="toolbar-btn" @click="insertImage" title="插入图片">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </button>
        <button class="toolbar-btn" @click="insertLink" title="插入链接">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </button>
        <button class="toolbar-btn" @click="toggleCodeBlock" title="插入代码块">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </button>
        <button class="toolbar-btn" @click="toggleBlockquote" title="插入引用">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        <button class="toolbar-btn" @click="insertHorizontalRule" title="插入分割线">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      
      <div class="toolbar-group">
        <button class="toolbar-btn" @click="undo()" title="撤销">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 7v6h6"></path>
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
          </svg>
        </button>
        <button class="toolbar-btn" @click="redo()" title="重做">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 7v6h-6"></path>
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path>
          </svg>
        </button>
        <button class="toolbar-btn" @click="zoomOut()" title="缩小">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button class="toolbar-btn" @click="zoomIn()" title="放大">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button class="toolbar-btn" @click="clearFormat" title="清除格式">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"></path>
            <line x1="9" y1="9" x2="15" y2="15"></line>
            <line x1="15" y1="9" x2="9" y2="15"></line>
          </svg>
        </button>
        <button class="toolbar-btn" title="全屏">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </button>
        <button class="toolbar-btn" title="更多">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
      </div>
    </div>

    <!-- 编辑器主体 - 右侧主区域 -->
    <div class="editor-layout">
      <!-- 右侧主区域（包含大纲、编辑区） -->
      <div class="main-area">
        <!-- 左侧：大纲面板 -->
        <div class="outline-panel">
          <div class="panel-header">
            <h3>大纲</h3>
          </div>
          <div class="outline-content">
            <div v-if="outlineItems.length === 0" class="outline-placeholder">
              暂无大纲
              <div class="placeholder-hint">添加标题以生成大纲</div>
            </div>
            <div v-else class="outline-list">
              <div 
                v-for="item in outlineItems" 
                :key="item.id"
                class="outline-item"
                :class="`outline-level-${item.level}`"
                @click="jumpToHeading(item.id)"
                :title="`跳转到 ${item.text}`"
              >
                <span class="outline-text">{{ item.text }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 编辑器内容 - 居中显示 -->
        <div class="editor-main" ref="editorElement">
          <!-- 加载状态 -->
          <div v-if="props.isLoadingDocument" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>正在加载文档...</p>
          </div>
          
           <!-- 标题栏 -->
           <div class="title-section">
             <input 
               type="text" 
               v-model="documentTitle" 
               class="title-input"
               @blur="saveDocumentTitle"
               @keydown.enter="handleTitleEnter"
               placeholder="请输入文档标题..."
             />
           </div>
           
           <!-- 编辑建议面板 -->
           <div v-if="isShowingSuggestions && editSuggestions.length > 0" class="edit-suggestions-panel">
             <div class="suggestions-header">
               <h4>AI编辑建议</h4>
               <button class="close-suggestions-btn" @click="handleRejectEditSuggestion" title="关闭建议">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                   <line x1="18" y1="6" x2="6" y2="18"></line>
                   <line x1="6" y1="6" x2="18" y2="18"></line>
                 </svg>
               </button>
             </div>
             <div class="suggestions-list">
               <div 
                 v-for="suggestion in editSuggestions" 
                 :key="suggestion.id"
                 class="suggestion-item"
               >
                 <div class="suggestion-content">
                   <div class="suggestion-type">
                     <span class="type-badge" :class="suggestion.type">
                       {{ suggestion.type === 'replace' ? '替换' : '插入' }}
                     </span>
                     <span class="confidence">置信度: {{ Math.round(suggestion.confidence * 100) }}%</span>
                   </div>
                   <div class="suggestion-text">
                     <div v-if="suggestion.type === 'replace'" class="diff-display">
                       <div class="original-text">
                         <span class="diff-label">原文:</span>
                         <span class="diff-content">{{ suggestion.originalText }}</span>
                       </div>
                       <div class="suggested-text">
                         <span class="diff-label">建议:</span>
                         <span class="diff-content">{{ suggestion.suggestedText }}</span>
                       </div>
                     </div>
                     <div v-else class="insert-text">
                       <span class="diff-label">插入内容:</span>
                       <span class="diff-content">{{ suggestion.suggestedText }}</span>
                     </div>
                   </div>
                   <div class="suggestion-reason">{{ suggestion.reason }}</div>
                 </div>
                 <div class="suggestion-actions">
                   <button 
                     class="action-btn accept-btn" 
                     @click="acceptEditSuggestion(suggestion.id)"
                     title="接受建议"
                   >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                       <polyline points="20,6 9,17 4,12"></polyline>
                     </svg>
                     接受
                   </button>
                   <button 
                     class="action-btn reject-btn" 
                     @click="rejectEditSuggestion(suggestion.id)"
                     title="拒绝建议"
                   >
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                       <line x1="18" y1="6" x2="6" y2="18"></line>
                     </svg>
                     拒绝
                   </button>
                 </div>
               </div>
             </div>
           </div>
           
           <editor-content :editor="editor" class="editor-body" />
        </div>

        <!-- 右侧拖拽手柄 -->
        <div 
          v-if="aiPanelVisible"
          class="resize-handle right-handle"
          :style="{ right: aiPanelWidth + 'px' }"
          @mousedown="startResize($event)"
          @mouseenter="showResizeCursor"
          @mouseleave="hideResizeCursor"
        >
          <div class="handle-indicator">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9"></polyline>
              <polyline points="6,15 12,9 18,15"></polyline>
            </svg>
          </div>
        </div>

        <!-- 右侧：AI对话框面板 -->
        <div v-if="aiPanelVisible" class="ai-panel" :style="{ width: aiPanelWidth + 'px' }">
          <AiChat 
            :document-content="documentContent"
            :document-id="String(props.document?.id)"
            @close="closeAiPanel"
            @insert-content="handleInsertContent"
            @apply-edit-suggestion="handleApplyEditSuggestion"
            @reject-edit-suggestion="handleRejectEditSuggestion"
            @insert-diff-node="handleInsertDiffNode"
            @save-before-agent="handleSaveBeforeAgent"
          />
        </div>

        <!-- AI面板打开按钮 -->
        <button v-if="!aiPanelVisible" class="ai-toggle-btn" @click="toggleAiPanel" title="打开AI助手">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 浮动工具栏 -->
    <FloatingToolbar
      :visible="floatingToolbarVisible"
      :position="floatingToolbarPosition"
      :selected-text="selectedText"
      @ai-chat="handleAiChatFromToolbar"
      @add-to-chat="handleAddToChat"
      @expand-text="handleExpandText"
      @continue-text="handleContinueText"
      @abbreviate-text="handleAbbreviateText"
      @correct-text="handleCorrectText"
      @summarize-text="handleSummarizeText"
      @translate-text="handleTranslateText"
      @format-text="handleFormatText"
    />
    
    <!-- 右键菜单 -->
    <ContextMenu
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      @ai-help="handleAiHelp"
    />
    
    <!-- AI帮写对话框 -->
    <AiHelpDialog
      :visible="aiHelpDialogVisible"
      :position="aiHelpDialogPosition"
      @close="handleCloseAiHelp"
      @insert-ai-help="handleInsertAiHelp"
    />
    
    <!-- AI对话对话框（用于选中文本的AI对话） -->
    <AiHelpDialog
      v-if="aiTextDialogVisible"
      :visible="aiTextDialogVisible"
      :position="aiTextDialogPosition"
      @close="handleCloseAiTextDialog"
      @insert-ai-help="handleAiTextDialogInsert"
      ref="aiTextDialog"
    />
    
    <!-- 全局批量操作按钮 -->
    <div v-if="hasPluginNodes" class="batch-actions">
      <button class="batch-btn accept-all-btn" @click="handleAcceptAll">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        全部接受
      </button>
      <button class="batch-btn reject-all-btn" @click="handleRejectAll">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        全部拒绝
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import ColorPicker from './ColorPicker.vue'
import AiChat from './AiChat.vue'
import FloatingToolbar from './FloatingToolbar.vue'
import ContextMenu from './ContextMenu.vue'
import AiHelpDialog from './AiHelpDialog.vue'
import { aiAPI, uploadAPI } from '../services/api.js'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Heading } from '@tiptap/extension-heading'
import { Color } from '@tiptap/extension-color'
import DiffNode from '../extensions/DiffNode.js'
import InsertNode from '../extensions/InsertNode.js'
import DeleteNode from '../extensions/DeleteNode.js'
import { Highlight } from '@tiptap/extension-highlight'
import { TextAlign } from '@tiptap/extension-text-align'
import { BulletList } from '@tiptap/extension-bullet-list'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { CodeBlock } from '@tiptap/extension-code-block'
import { Blockquote } from '@tiptap/extension-blockquote'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Underline } from '@tiptap/extension-underline'
import { Strike } from '@tiptap/extension-strike'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'

const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {}
          }
          return { id: attributes.id }
        }
      }
    }
  }
})

// Props
const props = defineProps({
  document: {
    type: Object,
    default: () => ({
      id: null,
      title: '未命名文档',
      content: '',
      type: 'document',
      folderId: null,
      authorId: null,
      isPublic: false,
      status: 1, // 1=草稿，2=发布，3=归档
      tags: [],
      excerpt: '',
      createdAt: null,
      updatedAt: null
    })
  },
  activeDocument: { // New prop to listen for changes from SideNav
    type: Object,
    default: null
  },
  isLoadingDocument: { // 文档加载状态
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['save', 'update:document'])

// 响应式数据
const documentTitle = ref(props.document?.title || '未命名文档')
const documentContent = ref(props.document?.content || '')
const saveStatus = ref('saved') // saved, saving, unsaved
const lastSaved = ref(null)
const isLoadingDocument = ref(false) // 文档加载状态

// 编辑器实例
const editor = ref(null)

// 监听props.document的变化，更新documentTitle和编辑器内容
watch(() => props.document, (newDoc, oldDoc) => {
  if (newDoc) {
    documentTitle.value = newDoc.title || '未命名文档'
    
    // 检查是否是不同文档的切换
    const isDifferentDocument = !oldDoc || oldDoc.id !== newDoc.id
    
    // 获取新内容
    const newContent = newDoc.content || ''
    
    // 如果是不同文档或者内容确实不同，则更新
    if (isDifferentDocument || newContent !== documentContent.value) {
      documentContent.value = newContent
      
      // 同步更新编辑器内容
      if (editor.value) {
        editor.value.commands.setContent(newContent, false)
        // 更新大纲
        updateOutline()
        // 应用默认字体大小并设置光标位置
        nextTick(() => {
          if (editor.value) {
            editor.value.chain().focus().setFontSize(fontSize.value).run()
            // 将光标移动到文档开始位置
            editor.value.commands.setTextSelection(0)
          }
        })
      }
    }
  }
}, { immediate: true })

// 工具栏相关数据
const textStyle = ref('paragraph')
const fontSize = ref('18px')

// 颜色选择器相关数据
const showTextColorPicker = ref(false)
const showHighlightColorPicker = ref(false)
const textColor = ref('#000000')
const highlightColor = ref('#ffeb3b')

// 编辑器元素引用
const editorElement = ref(null)
const textColorBtn = ref(null)
const highlightColorBtn = ref(null)

// AI面板相关数据
const aiPanelVisible = ref(true)
const aiPanelWidth = ref(360)
const isResizing = ref(false)


// 大纲相关数据
const outlineItems = ref([])

// 插件节点检测
const hasPluginNodes = ref(false)

// 防抖函数
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 设置自动保存
const setupAutoSave = () => {
  // 每30秒自动保存一次
  setInterval(() => {
    if (saveStatus.value === 'unsaved') {
      saveDocument(true) // 静默保存
    }
  }, 30000)
}

// 初始化编辑器
onMounted(() => {
  // 构建初始内容，确保使用正确的文档内容
  const initialContent = props.document?.content || ''
  
  editor.value = new Editor({
    content: initialContent,
    extensions: [
      StarterKit.configure({
        heading: false, // 禁用默认的heading，使用自定义的
        bulletList: false, // 禁用默认的bulletList，使用自定义的
        orderedList: false, // 禁用默认的orderedList，使用自定义的
        codeBlock: false, // 禁用默认的codeBlock，使用自定义的
        blockquote: false, // 禁用默认的blockquote，使用自定义的
        horizontalRule: false, // 禁用默认的horizontalRule，使用自定义的
        link: false, // 禁用默认的link，使用自定义的
        underline: false, // 禁用默认的underline，使用自定义的
        strike: false, // 禁用默认的strike，使用自定义的
      }),
      CustomHeading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      BulletList,
      OrderedList,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
        inline: true,
        allowBase64: false,
      }),
      // 添加粘贴处理扩展
      {
        name: 'imagePasteHandler',
        addProseMirrorPlugins() {
          return [
            {
              props: {
                handlePaste: (view, event, slice) => {
                  // 检查是否有图片文件
                  const items = Array.from(event.clipboardData?.items || [])
                  for (const item of items) {
                    if (item.type.indexOf('image') === 0) {
                      event.preventDefault()
                      const file = item.getAsFile()
                      if (file) {
                        handleImageUpload(file, view)
                      }
                      return true
                    }
                  }
                  return false
                },
                handleDrop: (view, event, slice, moved) => {
                  // 检查是否有图片文件
                  const files = Array.from(event.dataTransfer?.files || [])
                  for (const file of files) {
                    if (file.type.indexOf('image') === 0) {
                      event.preventDefault()
                      handleImageUpload(file, view)
                      return true
                    }
                  }
                  return false
                }
              }
            }
          ]
        }
      },
      CodeBlock,
      Blockquote,
      HorizontalRule,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Underline,
      Strike,
      // 暂时移除Placeholder扩展，避免自动添加占位符内容
      // Placeholder.configure({
      //   placeholder: '开始编写你的文档...',
      //   showOnlyWhenEditable: true,
      //   showOnlyCurrent: false,
      // }),
      DiffNode,
      InsertNode,
      DeleteNode,
    ],
    onUpdate: ({ editor }) => {
      const content = editor.getHTML()
      handleContentChange(content)
    },
    onTransaction: ({ editor, transaction }) => {
      // 检查是否有新的文本插入，如果有则应用默认字体大小
      if (transaction.docChanged) {
        const { state } = editor
        const { selection } = state
        const { from, to } = selection
        
        // 如果是从空白位置插入文本，应用默认字体大小
        if (from === to && state.doc.nodeAt(from)?.type.name === 'paragraph') {
          // 延迟执行，确保文本已经插入
          setTimeout(() => {
            if (editor.isDestroyed) return
            const currentFontSize = getCurrentFontSize()
            // 如果没有字体大小设置或字体大小不是18px，则应用默认字体大小
            if (!currentFontSize || currentFontSize === '14px' || currentFontSize === 'inherit') {
              editor.chain().focus().setFontSize(fontSize.value).run()
            }
          }, 10)
        }
      }
    },
    onSelectionUpdate: ({ editor }) => {
      handleSelectionUpdate(editor)
      updateFontSizeSelector() // 更新字体大小选择器
    },
    onCreate: ({ editor }) => {
      // 添加右键事件监听
      editor.view.dom.addEventListener('contextmenu', handleEditorContextMenu)
    },
  })
  
  // 初始化大纲
  if (initialContent) {
    updateOutline()
  }
  
  // 应用默认字体大小并设置光标位置
  nextTick(() => {
    if (editor.value) {
      // 先选中所有文本，然后应用默认字体大小
      editor.value.commands.selectAll()
      editor.value.chain().focus().setFontSize(fontSize.value).run()
      // 将光标移动到文档开始位置
      editor.value.commands.setTextSelection(0)
    }
  })
  
  setupAutoSave()
})

// 组件卸载时保存当前内容
onUnmounted(() => {
  if (editor.value) {
    // 保存当前编辑器的内容
    const currentContent = editor.value.getHTML()
    if (currentContent && currentContent !== documentContent.value) {
      handleContentChange(currentContent)
    }
  }
  
  // 清理全局点击事件监听器
  document.removeEventListener('click', handleGlobalClick)
})

// 处理全局点击事件，关闭颜色选择器
const handleGlobalClick = (event) => {
  // 检查点击是否在颜色选择器外部
  const colorPicker = document.querySelector('.color-picker-container')
  const colorBtn = event.target.closest('.color-btn-container')
  
  // 如果点击的是颜色按钮，不关闭颜色选择器
  if (colorBtn) {
    return
  }
  
  // 如果点击在颜色选择器外部，关闭颜色选择器
  if (colorPicker && !colorPicker.contains(event.target)) {
    showTextColorPicker.value = false
    showHighlightColorPicker.value = false
  }
}

// 监听颜色选择器状态变化
watch([showTextColorPicker, showHighlightColorPicker], ([textVisible, highlightVisible]) => {
  if (textVisible || highlightVisible) {
    // 颜色选择器打开时，延迟添加全局点击监听器
    nextTick(() => {
      // 延迟100ms再添加监听器，避免立即关闭
      setTimeout(() => {
        document.addEventListener('click', handleGlobalClick)
      }, 100)
    })
  } else {
    // 颜色选择器关闭时，移除全局点击监听器
    document.removeEventListener('click', handleGlobalClick)
  }
})

// 防抖的内容更新函数
const debouncedUpdateDocument = debounce((content) => {
  // 更新文档对象
  const updatedDocument = {
    ...props.document,
    id: props.document?.id, // 确保包含正确的ID
    content,
    title: documentTitle.value,
    updatedAt: new Date().toISOString()
  }
  
  emit('update:document', updatedDocument)
}, 300) // 300ms防抖

// 处理内容变化
const handleContentChange = (content) => {
  documentContent.value = content
  saveStatus.value = 'unsaved'
  
  // 立即更新大纲
  updateOutline()
  
  // 检测是否有插件节点
  checkPluginNodes()
  
  // 防抖更新文档
  debouncedUpdateDocument(content)
}

// 检测文档中是否有插件节点
const checkPluginNodes = () => {
  if (!editor.value) {
    hasPluginNodes.value = false
    return
  }
  
  const { doc } = editor.value.state
  let hasNodes = false
  
  doc.descendants((node) => {
    if (node.type.name === 'insertNode' || 
        node.type.name === 'deleteNode' || 
        node.type.name === 'diffNode') {
      hasNodes = true
      return false // 停止遍历
    }
  })
  
  hasPluginNodes.value = hasNodes
}

// 全部接受
const handleAcceptAll = () => {
  if (!editor.value) return
  
  const { doc } = editor.value.state
  const nodesToAccept = []
  
  // 收集所有插件节点
  doc.descendants((node) => {
    if (node.type.name === 'insertNode' && node.attrs.insertId) {
      nodesToAccept.push({ type: 'insert', id: node.attrs.insertId })
    } else if (node.type.name === 'deleteNode' && node.attrs.deleteId) {
      nodesToAccept.push({ type: 'delete', id: node.attrs.deleteId })
    } else if (node.type.name === 'diffNode' && node.attrs.diffId) {
      nodesToAccept.push({ type: 'diff', id: node.attrs.diffId })
    }
  })
  
  // 执行所有接受操作
  nodesToAccept.forEach(({ type, id }) => {
    if (type === 'insert') {
      editor.value.commands.acceptInsert(id)
    } else if (type === 'delete') {
      editor.value.commands.acceptDelete(id)
    } else if (type === 'diff') {
      editor.value.commands.acceptDiff(id)
    }
  })
  
  // 保存文档
  saveDocument()
}

// 全部拒绝
const handleRejectAll = () => {
  if (!editor.value) return
  
  const { doc } = editor.value.state
  const nodesToReject = []
  
  // 收集所有插件节点
  doc.descendants((node) => {
    if (node.type.name === 'insertNode' && node.attrs.insertId) {
      nodesToReject.push({ type: 'insert', id: node.attrs.insertId })
    } else if (node.type.name === 'deleteNode' && node.attrs.deleteId) {
      nodesToReject.push({ type: 'delete', id: node.attrs.deleteId })
    } else if (node.type.name === 'diffNode' && node.attrs.diffId) {
      nodesToReject.push({ type: 'diff', id: node.attrs.diffId })
    }
  })
  
  // 执行所有拒绝操作
  nodesToReject.forEach(({ type, id }) => {
    if (type === 'insert') {
      editor.value.commands.rejectInsert(id)
    } else if (type === 'delete') {
      editor.value.commands.rejectDelete(id)
    } else if (type === 'diff') {
      editor.value.commands.rejectDiff(id)
    }
  })
  
  // 保存文档
  saveDocument()
}

// 保存文档标题
const saveDocumentTitle = () => {
  if (documentTitle.value !== props.document?.title) {
    const updatedDocument = {
      ...props.document,
      id: props.document?.id, // 确保包含正确的ID
      title: documentTitle.value
    }
    emit('update:document', updatedDocument)
    saveStatus.value = 'unsaved'
  }
}

// 处理标题栏回车键事件
const handleTitleEnter = (event) => {
  event.preventDefault() // 阻止默认行为
  
  // 保存标题
  saveDocumentTitle()
  
  // 将光标移动到编辑器正文开始位置
  if (editor.value) {
    // 使用nextTick确保DOM更新完成
    nextTick(() => {
      // 将光标移动到编辑器开始位置
      editor.value.commands.focus('start')
      
      // 如果编辑器内容为空，插入一个段落
      const content = editor.value.getHTML()
      if (!content || content.trim() === '' || content === '<p></p>') {
        editor.value.commands.insertContent('<p>请输入正文内容...</p>')
        // 选中刚插入的文本，方便用户直接输入
        editor.value.commands.setTextSelection({ from: 0, to: 9 })
      }
    })
  }
}

// 保存文档
const saveDocument = async (silent = false) => {
  if (saveStatus.value === 'saved') return
  
  try {
    if (!silent) {
      saveStatus.value = 'saving'
    }
    
    const documentToSave = {
      ...props.document,
      title: documentTitle.value,
      content: documentContent.value || '',
      updatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    // 如果是静默保存，生成摘要
    if (silent) {
      documentToSave.excerpt = generateExcerpt(documentContent.value || '')
    }
    
    // 这里可以调用实际的保存 API
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟保存延迟
    
    emit('save', documentToSave)
    
    saveStatus.value = 'saved'
    lastSaved.value = new Date()
    
  } catch (error) {
    console.error('Failed to save document:', error)
    saveStatus.value = 'error'
  }
}

// 生成文档摘要
const generateExcerpt = (content) => {
  // 移除HTML标签，提取纯文本
  const textContent = content.replace(/<[^>]*>/g, '').trim()
  
  // 取前100个字符作为摘要
  return textContent.length > 100 
    ? textContent.substring(0, 100) + '...'
    : textContent
}

// 工具栏方法
const setTextStyle = () => {
  if (!editor.value) return
  
  switch (textStyle.value) {
    case 'paragraph':
      editor.value.chain().focus().setParagraph().run()
      break
    case 'heading1':
      editor.value.chain().focus().toggleHeading({ level: 1 }).run()
      break
    case 'heading2':
      editor.value.chain().focus().toggleHeading({ level: 2 }).run()
      break
    case 'heading3':
      editor.value.chain().focus().toggleHeading({ level: 3 }).run()
      break
    case 'heading4':
      editor.value.chain().focus().toggleHeading({ level: 4 }).run()
      break
    case 'heading5':
      editor.value.chain().focus().toggleHeading({ level: 5 }).run()
      break
    case 'heading6':
      editor.value.chain().focus().toggleHeading({ level: 6 }).run()
      break
  }
}

const setFontSize = () => {
  if (!editor.value) return
  editor.value.chain().focus().setFontSize(fontSize.value).run()
}

// 获取当前光标位置的字体大小
const getCurrentFontSize = () => {
  if (!editor.value) return '18px'
  
  const { state } = editor.value
  const { from } = state.selection
  
  // 获取光标位置的格式标记
  const marks = state.doc.resolve(from).marks()
  const textStyleMark = marks.find(mark => mark.type.name === 'textStyle')
  
  // 如果有明确的字体大小设置，返回该设置；否则返回默认的18px
  const fontSize = textStyleMark?.attrs?.fontSize
  return fontSize && fontSize !== 'inherit' ? fontSize : '18px'
}

// 监听光标位置变化，更新字体大小选择器
const updateFontSizeSelector = () => {
  if (!editor.value) return
  
  const currentFontSize = getCurrentFontSize()
  fontSize.value = currentFontSize
}

const toggleFormat = (format) => {
  if (!editor.value) return
  
  switch (format) {
    case 'bold':
      editor.value.chain().focus().toggleBold().run()
      break
    case 'italic':
      editor.value.chain().focus().toggleItalic().run()
      break
    case 'strike':
      editor.value.chain().focus().toggleStrike().run()
      break
    case 'underline':
      editor.value.chain().focus().toggleUnderline().run()
      break
  }
}

const setAlignment = (alignment) => {
  if (!editor.value) return
  
  switch (alignment) {
    case 'left':
      editor.value.chain().focus().setTextAlign('left').run()
      break
    case 'center':
      editor.value.chain().focus().setTextAlign('center').run()
      break
    case 'right':
      editor.value.chain().focus().setTextAlign('right').run()
      break
    case 'justify':
      editor.value.chain().focus().setTextAlign('justify').run()
      break
  }
}

const toggleList = (type) => {
  if (!editor.value) return
  
  switch (type) {
    case 'bullet':
      editor.value.chain().focus().toggleBulletList().run()
      break
    case 'ordered':
      editor.value.chain().focus().toggleOrderedList().run()
      break
  }
}

const undo = () => {
  if (editor.value) {
    editor.value.chain().focus().undo().run()
  }
}

const redo = () => {
  if (editor.value) {
    editor.value.chain().focus().redo().run()
  }
}

const zoomOut = () => {
  // 实现缩放功能
}

const zoomIn = () => {
  // 实现缩放功能
}

// 颜色和格式方法
const toggleTextColorPicker = () => {
  showTextColorPicker.value = !showTextColorPicker.value
  showHighlightColorPicker.value = false // 关闭其他颜色选择器
  console.log('Text color picker toggled:', showTextColorPicker.value)
}

const toggleHighlightColorPicker = () => {
  showHighlightColorPicker.value = !showHighlightColorPicker.value
  showTextColorPicker.value = false // 关闭其他颜色选择器
  console.log('Highlight color picker toggled:', showHighlightColorPicker.value)
}

const setTextColor = (color) => {
  if (!editor.value) return
  textColor.value = color
  editor.value.chain().focus().setColor(color).run()
}

const setHighlightColor = (color) => {
  if (!editor.value) return
  highlightColor.value = color
  editor.value.chain().focus().setHighlight({ color }).run()
}

const clearFormat = () => {
  if (!editor.value) return
  editor.value.chain().focus().unsetAllMarks().run()
}

// 插入内容方法
const insertTable = () => {
  if (!editor.value) return
  editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

const insertImage = () => {
  if (!editor.value) return
  
  // 创建文件选择器
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleImageUpload(file, editor.value.view)
    }
  }
  input.click()
}

// 处理图片上传
const handleImageUpload = async (file, view) => {
  try {
    // 验证文件大小（限制为5MB）
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('图片大小不能超过5MB')
      return
    }
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('只能上传图片文件')
      return
    }
    
    // 显示加载状态（可选：在光标位置插入加载提示）
    const { state } = view
    const { $from } = state.selection
    
    // 上传图片
    const response = await uploadAPI.uploadImage(file)
    
    if (response && response.url) {
      // 插入图片
      const node = state.schema.nodes.image.create({ src: response.url })
      const tr = state.tr.replaceSelectionWith(node)
      view.dispatch(tr)
    } else {
      throw new Error('上传失败：未返回图片URL')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    alert(`图片上传失败: ${error.message || '未知错误'}`)
  }
}

const insertLink = () => {
  if (!editor.value) return
  const url = prompt('请输入链接地址：')
  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
}

const toggleCodeBlock = () => {
  if (!editor.value) return
  editor.value.chain().focus().toggleCodeBlock().run()
}

const toggleBlockquote = () => {
  if (!editor.value) return
  editor.value.chain().focus().toggleBlockquote().run()
}

const insertHorizontalRule = () => {
  if (!editor.value) return
  editor.value.chain().focus().setHorizontalRule().run()
}

// 大纲相关方法
const updateOutline = () => {
  if (!editor.value) {
    outlineItems.value = []
    return
  }
  
  const outline = []
  const transaction = editor.value.state.tr

  editor.value.state.doc.descendants((node, pos) => {
    if (node.type.name !== 'heading') {
      return
    }

    const text = node.textContent.trim()
    if (!text) {
      return
    }

    const level = node.attrs.level || 1
    let id = node.attrs.id

    if (!id) {
      id = `heading-${pos}`
      transaction.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        id
      })
    }
    
    outline.push({
      id,
      level,
      text,
      tagName: `h${level}`,
      pos
    })
  })

  if (transaction.docChanged) {
    editor.value.view.dispatch(transaction)
  }
  
  outlineItems.value = outline
}

const jumpToHeading = (headingId) => {
  if (!editor.value) return
  
  const targetHeading = outlineItems.value.find(item => item.id === headingId)
  if (!targetHeading) return

  const { pos } = targetHeading
  const resolvedPos = Math.min(pos + 1, editor.value.state.doc.content.size)

  editor.value.chain().setTextSelection(resolvedPos).focus().run()

  const headingDom = editor.value.view.nodeDOM(pos)
  if (headingDom instanceof HTMLElement) {
    headingDom.scrollIntoView({
      behavior: 'smooth', 
      block: 'center' 
    })
    
    headingDom.classList.add('outline-highlight')
    setTimeout(() => {
      headingDom.classList.remove('outline-highlight')
    }, 2000)
  }
}

// AI面板控制方法
const toggleAiPanel = () => {
  aiPanelVisible.value = !aiPanelVisible.value
}

const closeAiPanel = () => {
  aiPanelVisible.value = false
}

// 面板宽度调整方法
const startResize = (event) => {
  isResizing.value = true
  event.preventDefault()
  
  const startX = event.clientX
  const startWidth = aiPanelWidth.value
  
  const handleMouseMove = (e) => {
    if (!isResizing.value) return
    
    const deltaX = e.clientX - startX
    const newWidth = Math.max(200, Math.min(800, startWidth - deltaX))
    aiPanelWidth.value = newWidth
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

// AI聊天相关方法
const handleInsertContent = (content) => {
  if (!editor.value) return
  
  // 将AI回复插入到编辑器当前光标位置
  editor.value.chain().focus().insertContent(content).run()
  
  // 保存文档
  saveDocument()
}

// 编辑建议相关数据
const editSuggestions = ref([])
const isShowingSuggestions = ref(false)

// 浮动工具栏相关数据
const floatingToolbarVisible = ref(false)
const floatingToolbarPosition = ref({ x: 0, y: 0 })
const selectedText = ref('')
const isSelecting = ref(false)
const selectionTimeout = ref(null)
const suppressToolbar = ref(false) // 临时禁用工具栏显示

// 右键菜单相关
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })

// AI帮写对话框相关
const aiHelpDialogVisible = ref(false)
const aiHelpDialogPosition = ref({ x: 0, y: 0 })

// AI对话对话框相关（用于选中文本的AI对话）
const aiTextDialogVisible = ref(false)
const aiTextDialogPosition = ref({ x: 0, y: 0 })
const selectedTextRange = ref({ from: 0, to: 0 }) // 保存选中文本的位置

// 处理编辑建议的显示
const handleApplyEditSuggestion = (suggestions) => {
  if (!editor.value || !suggestions.length) return
  
  editSuggestions.value = suggestions
  isShowingSuggestions.value = true
  
  // 在编辑器中显示建议
  displayEditSuggestions(suggestions)
}

// 处理编辑建议的拒绝
const handleRejectEditSuggestion = () => {
  clearDiffDisplay()
  editSuggestions.value = []
  isShowingSuggestions.value = false
}

// 处理插入DiffNode（来自智能体的paragraph_edit_instruction）
const handleInsertDiffNode = (editData) => {
  if (!editor.value) {
    console.error('editor实例不存在')
    return
  }
  
  console.log('=== 开始处理插入DiffNode ===')
  console.log('接收到的数据:', editData)
  
  const {
    paragraphId,
    operation,
    originalContent: originalContentFromBackend,
    newContent,
    reasoning,
    metadata
  } = editData
  
  console.log('接收到的originalContent:', originalContentFromBackend)
  // console.log('AI生成的新内容:', newContent)
  
  // 后端已经提供原始HTML格式的originalContent，直接使用
  // 如果originalContent是HTML字符串，直接使用；如果是对象，检查是否有html字段
  let originalContentObj = null
  
  if (typeof originalContentFromBackend === 'string') {
    // 如果是HTML字符串，提取文本内容并构造对象
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = originalContentFromBackend
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    originalContentObj = {
      text: textContent,
      html: originalContentFromBackend
    }
  } else if (typeof originalContentFromBackend === 'object' && originalContentFromBackend !== null) {
    // 如果已经是对象格式，直接使用
    originalContentObj = originalContentFromBackend
  }
  
  console.log('构造的originalContentObj:', originalContentObj)
  
  // 查找包含该内容的节点位置 - 根据后端返回的originalContent确定from-to范围
  const { doc } = editor.value.state
  let insertPosition = null
  let targetNodeSize = 0
  
  // 对于insert_before和insert_after操作，如果没有originalContent，使用文档开头或末尾
  if ((operation === 'insert_before' || operation === 'insert_after') && !originalContentObj) {
    console.log('=== 插入操作且没有originalContent，使用文档开头/末尾 ===')
    
    if (operation === 'insert_before') {
      // insert_before: 在文档最前面插入
      console.log('insert_before: 在文档最前面插入')
      insertPosition = 0
      targetNodeSize = 0
    } else {
      // insert_after: 在文档最后面插入
      console.log('insert_after: 在文档最后面插入')
      insertPosition = doc.content.size - 1
      targetNodeSize = 0
    }
  } else if (originalContentObj && originalContentObj.text) {
    // 有originalContent的情况，使用内容匹配
    console.log('=== 根据originalContent确定from-to范围 ===')
    
    const searchText = originalContentObj.text.trim()
    console.log('搜索文本:', searchText.substring(0, 100))
    
    let foundFirstNode = false
    let lastNodeEndPos = null
    
    // 遍历文档节点，找到所有包含该文本的节点
    doc.descendants((node, pos) => {
      const nodeText = node.textContent
      
      // 检查是否包含搜索文本的任何部分
      if (nodeText && searchText.includes(nodeText)) {
        if (!foundFirstNode) {
          // 记录第一个匹配节点的位置
          insertPosition = pos
          foundFirstNode = true
          console.log('找到第一个匹配节点:', {
            type: node.type.name,
            pos,
            nodeText: nodeText.substring(0, 100)
          })
        }
        
        // 持续更新最后一个节点的结束位置
        lastNodeEndPos = pos + (node.nodeSize || 0)
        console.log('更新范围 to:', lastNodeEndPos)
      }
    })
    
    // 如果找到了匹配的节点，计算 targetNodeSize
    if (foundFirstNode && lastNodeEndPos !== null) {
      targetNodeSize = lastNodeEndPos - insertPosition
      console.log('最终确定范围:', {
        from: insertPosition,
        to: lastNodeEndPos,
        rangeSize: targetNodeSize
      })
    }
  }
  

  // 如果还是找不到，使用文档末尾
  if (insertPosition === null) {
    console.warn('未找到匹配位置，将在文档末尾插入')
    insertPosition = doc.content.size - 1
    targetNodeSize = 0
  }
  
  console.log('最终位置:', { from: insertPosition, to: insertPosition + targetNodeSize })
  
  // 根据operation类型决定如何插入DiffNode
  console.log('执行操作类型:', operation)
  
  try {
    if (operation === 'replace') {
      // 替换操作：在目标位置插入DiffNode，使用原始HTML
      console.log('执行replace操作')
      editor.value.chain()
        .focus()
        .setTextSelection({ from: insertPosition, to: insertPosition + targetNodeSize })
        .insertDiff({
          originalText: originalContentObj?.text || '',
          originalContent: originalContentObj,
          aiText: newContent,
          diffType: 'replace'
        })
        .run()
    } else if (operation === 'delete') {
      // 删除操作：标记为删除
      console.log('执行delete操作')
      editor.value.chain()
        .focus()
        .setTextSelection({ from: insertPosition, to: insertPosition + targetNodeSize })
        .insertDiff({
          originalText: originalContentObj?.text || '',
          originalContent: originalContentObj,
          aiText: '',
          diffType: 'delete'
        })
        .run()
    } else if (operation === 'insert_before' || operation === 'insert_after') {
      // 插入操作：使用InsertNode渲染
      console.log('执行', operation, '操作，使用InsertComponent')
      const insertPos = operation === 'insert_before' ? insertPosition : (insertPosition + targetNodeSize)
      editor.value.chain()
        .focus()
        .setTextSelection(insertPos)
        .insertAiContent({
          aiContent: newContent,
          prompt: reasoning || ''
        })
        .run()
    }
    
    console.log('=== 节点插入完成 ===')
  } catch (error) {
    console.error('节点插入失败:', error)
  }
}

// 在编辑器中显示编辑建议
const displayEditSuggestions = (suggestions) => {
  if (!editor.value) return
  
  // 在编辑器中高亮显示建议的修改
  suggestions.forEach(suggestion => {
    if (suggestion.type === 'replace') {
      // 高亮需要替换的文本
      editor.value.commands.setTextSelection({
        from: suggestion.position.start,
        to: suggestion.position.end
      })
    }
  })
}

// 清除diff显示
const clearDiffDisplay = () => {
  if (!editor.value) return
  // 清除所有选择和高亮
  editor.value.commands.blur()
}

// 接受编辑建议
const acceptEditSuggestion = (suggestionId) => {
  const suggestion = editSuggestions.value.find(s => s.id === suggestionId)
  if (!suggestion || !editor.value) return
  
  if (suggestion.type === 'replace') {
    // 替换文本
    editor.value.commands.setTextSelection({
      from: suggestion.position.start,
      to: suggestion.position.end
    })
    editor.value.commands.insertContent(suggestion.suggestedText)
  } else if (suggestion.type === 'insert') {
    // 插入文本
    editor.value.commands.setTextSelection({
      from: suggestion.position.start,
      to: suggestion.position.end
    })
    editor.value.commands.insertContent(suggestion.suggestedText)
  }
  
  // 移除已接受的建议
  editSuggestions.value = editSuggestions.value.filter(s => s.id !== suggestionId)
  
  // 如果没有更多建议，清除显示
  if (editSuggestions.value.length === 0) {
    clearDiffDisplay()
    isShowingSuggestions.value = false
  }
  
  // 保存文档
  saveDocument()
}

// 拒绝编辑建议
const rejectEditSuggestion = (suggestionId) => {
  // 移除被拒绝的建议
  editSuggestions.value = editSuggestions.value.filter(s => s.id !== suggestionId)
  
  // 如果没有更多建议，清除显示
  if (editSuggestions.value.length === 0) {
    clearDiffDisplay()
    isShowingSuggestions.value = false
  }
}

// 浮动工具栏事件处理方法
const handleAiChatFromToolbar = (text) => {
  if (!editor.value) {
    return
  }
  
  // 保存当前选中文本的位置
  const { from, to } = editor.value.state.selection
  selectedTextRange.value = { from, to }
  
  // 计算对话框位置
  const coords = editor.value.view.coordsAtPos(to)
  const editorContent = document.querySelector('.ProseMirror')
  const editorRect = editorContent?.getBoundingClientRect()
  
  if (!editorRect) {
    return
  }
  
  aiTextDialogPosition.value = {
    x: editorRect.left,
    y: coords.bottom + 10,
    width: editorRect.width
  }
  
  // 隐藏浮动工具栏（先隐藏，防止后续操作重新显示）
  hideFloatingToolbar()
  
  // 临时抑制工具栏显示
  suppressToolbar.value = true
  
  // 先恢复选中状态，确保文本被选中
  if (editor.value) {
    try {
      editor.value.commands.setTextSelection({ from, to })
    } catch (error) {
      // 忽略错误
    }
  }
  
  // 延迟显示对话框，确保选中状态保持
  nextTick(() => {
    setTimeout(() => {
      aiTextDialogVisible.value = true
      
      // 再次确保选中状态
      setTimeout(() => {
        if (editor.value) {
          try {
            editor.value.commands.setTextSelection({ from, to })
          } catch (error) {
            // 忽略错误
          }
        }
        
        // 最后恢复工具栏显示功能
        suppressToolbar.value = false
      }, 300)
    }, 100)
  })
}

const handleAddToChat = (text) => {
  // 确保AI面板可见
  if (!aiPanelVisible.value) {
    aiPanelVisible.value = true
  }
  
  // 隐藏浮动工具栏
  hideFloatingToolbar()
  
  // 通知AiChat组件添加选中的文本作为引用上下文
  nextTick(() => {
    // 触发AiChat组件的添加引用事件
    window.dispatchEvent(new CustomEvent('add-reference-to-chat', { 
      detail: { 
        text: text.trim(),
        source: 'editor_selection',
        timestamp: new Date().toISOString()
      } 
    }))
  })
}

const handleExpandText = (text) => {
  if (!editor.value) return
  const { from, to } = editor.value.state.selection
  
  // 获取选区的完整内容（包括所有格式信息）
  const slice = editor.value.state.doc.slice(from, to)
  const fragment = slice.content
  const div = document.createElement('div')
  const serializer = editor.value.view.someProp('domSerializer') || 
                     editor.value.view.state.schema.cached.domSerializer || 
                     window.DOMSerializer?.fromSchema(editor.value.view.state.schema)
  
  if (serializer) {
    const domFragment = serializer.serializeFragment(fragment)
    div.appendChild(domFragment)
  }
  
  const originalContent = {
    text: text,
    html: div.innerHTML || text
  }
  
  // 先创建空的Diff节点
  editor.value.commands.insertDiff({
    originalText: text,
    originalContent: originalContent,
    aiText: '',
    diffType: 'expand'
  })
  
  // 获取diffId
  let currentDiffId = null
  editor.value.state.doc.descendants((node) => {
    if (node.type.name === 'diffNode') {
      currentDiffId = node.attrs.diffId
    }
  })
  
  if (!currentDiffId) return
  
  // 调用后端API
  const documentId = props.document?.id || null
  const context = editor.value ? editor.value.getText() : ''
  
  aiAPI.aiTextProcessStream(
    'expand',
    text,
    null, // userPrompt
    documentId,
    context,
    // onChunk
    (content) => {
      if (editor.value && currentDiffId) {
        editor.value.commands.updateDiff(currentDiffId, content)
      }
    },
    // onDone
    (usage) => {
      saveDocument()
    },
    // onError
    (error) => {
      console.error('AI扩写错误:', error)
    }
  )
  
  // 隐藏浮动工具栏
  hideFloatingToolbar()
}

const handleContinueText = (text) => {
  if (!editor.value) return
  const { from, to } = editor.value.state.selection
  
  // 获取选区的完整内容（包括所有格式信息）
  const slice = editor.value.state.doc.slice(from, to)
  const fragment = slice.content
  const div = document.createElement('div')
  const serializer = editor.value.view.someProp('domSerializer') || 
                     editor.value.view.state.schema.cached.domSerializer || 
                     window.DOMSerializer?.fromSchema(editor.value.view.state.schema)
  
  if (serializer) {
    const domFragment = serializer.serializeFragment(fragment)
    div.appendChild(domFragment)
  }
  
  const originalContent = {
    text: text,
    html: div.innerHTML || text
  }
  
  editor.value.commands.insertDiff({
    originalText: text,
    originalContent: originalContent,
    aiText: '',
    diffType: 'continue'
  })
  
  let currentDiffId = null
  editor.value.state.doc.descendants((node) => { if (node.type.name === 'diffNode') currentDiffId = node.attrs.diffId })
  if (!currentDiffId) return
  
  const documentId = props.document?.id || null
  const context = editor.value ? editor.value.getText() : ''
  
  aiAPI.aiTextProcessStream(
    'continue', text, null, documentId, context,
    (content) => { if (editor.value && currentDiffId) editor.value.commands.updateDiff(currentDiffId, content) },
    () => saveDocument(),
    (error) => console.error('AI续写错误:', error)
  )
  
  hideFloatingToolbar()
}

const handleAbbreviateText = (text) => {
  if (!editor.value) return
  const { from, to } = editor.value.state.selection
  
  // 获取选区的完整内容（包括所有格式信息）
  const slice = editor.value.state.doc.slice(from, to)
  const fragment = slice.content
  const div = document.createElement('div')
  const serializer = editor.value.view.someProp('domSerializer') || 
                     editor.value.view.state.schema.cached.domSerializer || 
                     window.DOMSerializer?.fromSchema(editor.value.view.state.schema)
  
  if (serializer) {
    const domFragment = serializer.serializeFragment(fragment)
    div.appendChild(domFragment)
  }
  
  const originalContent = {
    text: text,
    html: div.innerHTML || text
  }
  
  editor.value.commands.insertDiff({ 
    originalText: text, 
    originalContent: originalContent,
    aiText: '', 
    diffType: 'abbreviate'
  })
  
  let currentDiffId = null
  editor.value.state.doc.descendants((node) => { if (node.type.name === 'diffNode') currentDiffId = node.attrs.diffId })
  if (!currentDiffId) return
  const documentId = props.document?.id || null
  const context = editor.value ? editor.value.getText() : ''
  aiAPI.aiTextProcessStream('abbreviate', text, null, documentId, context, (content) => { if (editor.value && currentDiffId) editor.value.commands.updateDiff(currentDiffId, content) }, () => saveDocument(), (error) => console.error('AI缩写错误:', error))
  hideFloatingToolbar()
}

const handleCorrectText = (text) => {
  if (!editor.value) return
  const { from, to } = editor.value.state.selection
  
  // 获取选区的完整内容（包括所有格式信息）
  const slice = editor.value.state.doc.slice(from, to)
  // 使用 ProseMirror 的 DOMSerializer 将选区内容转换为 HTML
  const fragment = slice.content
  const div = document.createElement('div')
  const serializer = editor.value.view.someProp('domSerializer') || 
                     editor.value.view.state.schema.cached.domSerializer || 
                     window.DOMSerializer?.fromSchema(editor.value.view.state.schema)
  
  if (serializer) {
    const domFragment = serializer.serializeFragment(fragment)
    div.appendChild(domFragment)
  }
  
  const originalContent = {
    text: text,
    html: div.innerHTML || text
  }
  
  console.log('handleCorrectText - originalContent:', originalContent)
  console.log('handleCorrectText - html:', originalContent.html)
  
  editor.value.commands.insertDiff({ 
    originalText: text, 
    originalContent: originalContent,
    aiText: '', 
    diffType: 'correct'
  })
  
  let currentDiffId = null
  editor.value.state.doc.descendants((node) => { 
    if (node.type.name === 'diffNode') currentDiffId = node.attrs.diffId 
  })
  if (!currentDiffId) return
  const documentId = props.document?.id || null
  const context = editor.value ? editor.value.getText() : ''
  aiAPI.aiTextProcessStream('correct', text, null, documentId, context, (content) => { 
    if (editor.value && currentDiffId) editor.value.commands.updateDiff(currentDiffId, content) 
  }, () => saveDocument(), (error) => console.error('AI纠错错误:', error))
  hideFloatingToolbar()
}

const handleSummarizeText = (text) => {
  if (!editor.value) return
  const { from, to } = editor.value.state.selection
  
  // 获取选区的完整内容（包括所有格式信息）
  const slice = editor.value.state.doc.slice(from, to)
  const fragment = slice.content
  const div = document.createElement('div')
  const serializer = editor.value.view.someProp('domSerializer') || 
                     editor.value.view.state.schema.cached.domSerializer || 
                     window.DOMSerializer?.fromSchema(editor.value.view.state.schema)
  
  if (serializer) {
    const domFragment = serializer.serializeFragment(fragment)
    div.appendChild(domFragment)
  }
  
  const originalContent = {
    text: text,
    html: div.innerHTML || text
  }
  
  editor.value.commands.insertDiff({ 
    originalText: text, 
    originalContent: originalContent,
    aiText: '', 
    diffType: 'summarize'
  })
  
  let currentDiffId = null
  editor.value.state.doc.descendants((node) => { 
    if (node.type.name === 'diffNode') currentDiffId = node.attrs.diffId 
  })
  if (!currentDiffId) return
  const documentId = props.document?.id || null
  const context = editor.value ? editor.value.getText() : ''
  aiAPI.aiTextProcessStream('summarize', text, null, documentId, context, (content) => { 
    if (editor.value && currentDiffId) editor.value.commands.updateDiff(currentDiffId, content) 
  }, () => saveDocument(), (error) => console.error('AI摘要错误:', error))
  hideFloatingToolbar()
}

const handleTranslateText = (text) => {
  if (!editor.value) return
  const { from, to } = editor.value.state.selection
  
  // 获取选区的完整内容（包括所有格式信息）
  const slice = editor.value.state.doc.slice(from, to)
  const fragment = slice.content
  const div = document.createElement('div')
  const serializer = editor.value.view.someProp('domSerializer') || 
                     editor.value.view.state.schema.cached.domSerializer || 
                     window.DOMSerializer?.fromSchema(editor.value.view.state.schema)
  
  if (serializer) {
    const domFragment = serializer.serializeFragment(fragment)
    div.appendChild(domFragment)
  }
  
  const originalContent = {
    text: text,
    html: div.innerHTML || text
  }
  
  editor.value.commands.insertDiff({ 
    originalText: text, 
    originalContent: originalContent,
    aiText: '', 
    diffType: 'translate'
  })
  
  let currentDiffId = null
  editor.value.state.doc.descendants((node) => { 
    if (node.type.name === 'diffNode') currentDiffId = node.attrs.diffId 
  })
  if (!currentDiffId) return
  const documentId = props.document?.id || null
  const context = editor.value ? editor.value.getText() : ''
  aiAPI.aiTextProcessStream('translate', text, null, documentId, context, (content) => { 
    if (editor.value && currentDiffId) editor.value.commands.updateDiff(currentDiffId, content) 
  }, () => saveDocument(), (error) => console.error('AI翻译错误:', error))
  hideFloatingToolbar()
}

const handleFormatText = (text) => {
  if (!editor.value) return
  const { from, to } = editor.value.state.selection
  
  // 获取选区的完整内容（包括所有格式信息）
  const slice = editor.value.state.doc.slice(from, to)
  const fragment = slice.content
  const div = document.createElement('div')
  const serializer = editor.value.view.someProp('domSerializer') || 
                     editor.value.view.state.schema.cached.domSerializer || 
                     window.DOMSerializer?.fromSchema(editor.value.view.state.schema)
  
  if (serializer) {
    const domFragment = serializer.serializeFragment(fragment)
    div.appendChild(domFragment)
  }
  
  const originalContent = {
    text: text,
    html: div.innerHTML || text
  }
  
  editor.value.commands.insertDiff({ 
    originalText: text, 
    originalContent: originalContent,
    aiText: '', 
    diffType: 'format'
  })
  
  let currentDiffId = null
  editor.value.state.doc.descendants((node) => { 
    if (node.type.name === 'diffNode') currentDiffId = node.attrs.diffId 
  })
  if (!currentDiffId) return
  const documentId = props.document?.id || null
  const context = editor.value ? editor.value.getText() : ''
  aiAPI.aiTextProcessStream('format', text, null, documentId, context, (content) => { 
    if (editor.value && currentDiffId) editor.value.commands.updateDiff(currentDiffId, content) 
  }, () => saveDocument(), (error) => console.error('AI格式规整错误:', error))
  hideFloatingToolbar()
}

// 显示浮动工具栏
const showFloatingToolbar = (editorInstance, from) => {
  try {
    const coords = editorInstance.view.coordsAtPos(from)
    const editorRect = editorElement.value?.getBoundingClientRect()
    
    if (editorRect && coords) {
      floatingToolbarPosition.value = {
        x: editorRect.left + editorRect.width / 2 - 200, // 居中显示
        y: Math.max(coords.top - 60, 10)
      }
      floatingToolbarVisible.value = true
    }
  } catch (error) {
    console.error('显示浮动工具栏失败:', error)
    floatingToolbarVisible.value = false
  }
}

// 隐藏浮动工具栏
const hideFloatingToolbar = () => {
  // 清除定时器
  if (selectionTimeout.value) {
    clearTimeout(selectionTimeout.value)
    selectionTimeout.value = null
  }
  
  floatingToolbarVisible.value = false
  selectedText.value = ''
  isSelecting.value = false
}

// 处理选择更新
const handleSelectionUpdate = (editorInstance) => {
  // 如果正在抑制工具栏显示，直接返回
  if (suppressToolbar.value) {
    return
  }
  
  const { from, to } = editorInstance.state.selection
  const text = editorInstance.state.doc.textBetween(from, to)
  
  // 清除之前的定时器
  if (selectionTimeout.value) {
    clearTimeout(selectionTimeout.value)
    selectionTimeout.value = null
  }
  
  if (text.trim() && from !== to) {
    // 有选中文本，标记为正在选择
    isSelecting.value = true
    selectedText.value = text
    
    // 延迟显示浮动工具栏，等待选择完成
    selectionTimeout.value = setTimeout(() => {
      // 再次检查是否还有选中文本和是否抑制工具栏
      if (suppressToolbar.value) {
        return
      }
      
      const currentSelection = editorInstance.state.selection
      const currentText = editorInstance.state.doc.textBetween(currentSelection.from, currentSelection.to)
      
      if (currentText.trim() && currentSelection.from !== currentSelection.to && isSelecting.value) {
        showFloatingToolbar(editorInstance, currentSelection.from)
        isSelecting.value = false
      }
    }, 300) // 300ms延迟，等待选择完成
  } else {
    // 没有选中文本，立即隐藏浮动工具栏
    isSelecting.value = false
    hideFloatingToolbar()
  }
}

// 处理diff接受
const handleAcceptDiff = (diffId) => {
  if (!editor.value) return
  
  // 使用DiffNode的命令接受diff
  editor.value.commands.acceptDiff(diffId)
  
  // 保存文档
  saveDocument()
}

// 处理diff拒绝
const handleRejectDiff = (diffId) => {
  if (!editor.value) return
  
  // 使用DiffNode的命令拒绝 diff
  editor.value.commands.rejectDiff(diffId)
  
  // 保存文档
  saveDocument()
}

// 处理diff全部保留
const handleKeepAllDiff = (diffId) => {
  if (!editor.value) return
  
  // 使用DiffNode的命令全部保留
  editor.value.commands.keepAllDiff(diffId)
  
  // 保存文档
  saveDocument()
}

// 处理Insert插件 - 接受
const handleAcceptInsert = (insertId) => {
  if (!editor.value) return
  
  editor.value.commands.acceptInsert(insertId)
  saveDocument()
}

// 处理Insert插件 - 拒绝
const handleRejectInsert = (insertId) => {
  if (!editor.value) return
  
  editor.value.commands.rejectInsert(insertId)
  saveDocument()
}

// 处理Delete插件 - 接受删除
const handleAcceptDelete = (deleteId) => {
  if (!editor.value) return
  
  editor.value.commands.acceptDelete(deleteId)
  saveDocument()
}

// 处理Delete插件 - 保留内容
const handleRejectDelete = (deleteId) => {
  if (!editor.value) return
  
  editor.value.commands.rejectDelete(deleteId)
  saveDocument()
}

// 处理编辑器右键事件
const handleEditorContextMenu = (event) => {
  event.preventDefault()
  
  // 如果当前有文本选中，不显示右键菜单
  const { from, to } = editor.value.state.selection
  if (from !== to) {
    return
  }
  
  // 计算菜单位置
  const rect = editor.value.view.dom.getBoundingClientRect()
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  
  // 显示右键菜单
  contextMenuVisible.value = true
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenuVisible.value = false
}

// 智能体模式调用API前保存文档
const handleSaveBeforeAgent = () => {
  console.log('智能体模式：在调用API前保存文档')
  saveDocument(true) // 静默保存
}

// 处理AI帮写
const handleAiHelp = () => {
  hideContextMenu()
  
  // 计算对话框位置（光标下一行）
  const { from } = editor.value.state.selection
  const coords = editor.value.view.coordsAtPos(from)
  
  // 获取编辑器内容区域的宽度和位置
  const editorContent = document.querySelector('.ProseMirror')
  const editorRect = editorContent.getBoundingClientRect()
  
  aiHelpDialogPosition.value = {
    x: editorRect.left,
    y: coords.bottom + 10,
    width: editorRect.width
  }
  
  aiHelpDialogVisible.value = true
}

// 关闭AI帮写对话框
const handleCloseAiHelp = () => {
  aiHelpDialogVisible.value = false
}

// 关闭AI对话对话框
const handleCloseAiTextDialog = () => {
  aiTextDialogVisible.value = false
}

// 处理AI对话对话框的插入
const handleAiTextDialogInsert = (data) => {
  if (!editor.value) return
  
  // 使用流式API调用
  const { prompt, aiContent } = data
  
  // 如果没有预设内容，调用API
  if (!aiContent && prompt) {
    callAiTextProcessStream(prompt)
  }
  
  // 延迟关闭对话框，确保Diff节点已创建
  setTimeout(() => {
    aiTextDialogVisible.value = false
  }, 100)
}

// 调用AI文本处理流式API
const callAiTextProcessStream = (prompt) => {
  if (!editor.value) {
    return
  }
  
  const documentId = props.document?.id || null
  
  // 从选区范围重新获取原文
  const { from, to } = selectedTextRange.value
  const originalText = editor.value.state.doc.textBetween(from, to)
  // 使用纯文本作为context，不使用HTML
  const context = editor.value ? editor.value.getText() : ''
  
  if (!originalText) {
    return
  }
  
  // 获取选区的完整内容（包括所有格式信息）
  const { from: rangeFrom, to: rangeTo } = selectedTextRange.value
  const slice = editor.value.state.doc.slice(rangeFrom, rangeTo)
  const fragment = slice.content
  const div = document.createElement('div')
  const serializer = editor.value.view.someProp('domSerializer') || 
                     editor.value.view.state.schema.cached.domSerializer || 
                     window.DOMSerializer?.fromSchema(editor.value.view.state.schema)
  
  if (serializer) {
    const domFragment = serializer.serializeFragment(fragment)
    div.appendChild(domFragment)
  }
  
  const originalContent = {
    text: originalText,
    html: div.innerHTML || originalText
  }
  
  // 创建Diff节点
  editor.value.commands.setTextSelection({ from: rangeFrom, to: rangeTo })
  editor.value.commands.insertDiff({
    originalText: originalText,
    originalContent: originalContent,
    aiText: '',
    diffType: 'custom'
  })
  
  // 获取diffId
  let currentDiffId = null
  editor.value.state.doc.descendants((node) => {
    if (node.type.name === 'diffNode') {
      currentDiffId = node.attrs.diffId
      console.log('Found diff node, diffId:', currentDiffId, 'attrs:', node.attrs)
    }
  })
  
  if (!currentDiffId) {
    console.error('No diffId found after insertDiff')
    return
  }
  
  console.log('Starting API call with diffId:', currentDiffId)
  
  // 调用局部段落AI处理流式接口
  aiAPI.aiTextProcessStream(
    'custom', // action
    originalText,
    prompt, // userPrompt
    documentId,
    context,
    // onChunk - 接收流式内容
    (content) => {
      console.log('callAiTextProcessStream onChunk called with content:', content)
      console.log('currentDiffId:', currentDiffId)
      // 更新Diff节点的aiText
      if (editor.value && currentDiffId) {
        const result = editor.value.commands.updateDiff(currentDiffId, content)
        console.log('updateDiff result:', result)
      } else {
        console.error('Cannot update diff: editor:', editor.value, 'currentDiffId:', currentDiffId)
      }
    },
    // onDone - 完成
    (usage) => {
      saveDocument()
    },
    // onError - 错误
    (error) => {
      console.error('AI文本处理错误:', error)
    }
  )
}

// 插入AI新增内容节点
const handleInsertAiHelp = (data) => {
  console.log('handleInsertAiHelp called with:', data)
  if (!editor.value) {
    console.log('Editor not ready')
    return
  }
  
  console.log('Creating Insert node...')
  // 创建 Insert 节点（初始内容为空）
  const result = editor.value.commands.insertAiContent({
    aiContent: data.aiContent || '',
    prompt: data.prompt
  })
  
  console.log('Insert node created, closing dialog')
  // 关闭对话框
  aiHelpDialogVisible.value = false
  
  // 保存文档
  saveDocument()
  
  // 如果没有内容，调用AI帮写流式API
  console.log('检查aiContent:', data.aiContent, '是否为空:', !data.aiContent)
  if (!data.aiContent) {
    console.log('准备调用AI帮写API，prompt:', data.prompt)
    setTimeout(() => {
      console.log('开始调用callAiHelpStream')
      callAiHelpStream(data.prompt)
    }, 100) // 稍微延迟一下，让节点先创建完成
  } else {
    console.log('aiContent不为空，跳过API调用')
  }
}

// 流式更新AI内容
const updateAiHelpContent = (insertId, content) => {
  console.log('updateAiHelpContent被调用，insertId:', insertId, 'content:', content)
  if (!editor.value) {
    console.log('editor.value不存在')
    return
  }
  
  console.log('调用editor.commands.updateInsertContent')
  // 使用 InsertNode 的命令更新内容
  const result = editor.value.commands.updateInsertContent(insertId, content)
  console.log('updateInsertContent命令执行结果:', result)
}

// 调用AI帮写流式API
const callAiHelpStream = (prompt) => {
  console.log('callAiHelpStream被调用，prompt:', prompt)
  
  // 获取当前文档ID
  const documentId = props.document?.id || null
  console.log('documentId:', documentId)
  
  // 获取当前文档内容作为上下文（使用纯文本）
  const context = editor.value ? editor.value.getText() : ''
  console.log('context长度:', context.length)
  
  console.log('开始调用aiAPI.aiHelpStream')
  // 调用AI帮写流式API
  aiAPI.aiHelpStream(
    prompt,
    documentId,
    context,
    // onChunk - 接收到内容片段时调用
    (content) => {
      console.log('onChunk回调被调用，内容:', content)
      // 获取最新的 insertId
      const { doc } = editor.value.state
      let latestInsertId = null
      doc.descendants((node) => {
        if (node.type.name === 'insertNode' && node.attrs.insertId) {
          latestInsertId = node.attrs.insertId
        }
      })
      
      console.log('找到的insertId:', latestInsertId)
      if (latestInsertId) {
        console.log('调用updateAiHelpContent，insertId:', latestInsertId, 'content:', content)
        updateAiHelpContent(latestInsertId, content)
      } else {
        console.log('未找到insertId，无法更新内容')
      }
    },
    // onDone - 流式完成时调用
    (usage) => {
      console.log('AI帮写完成，使用情况:', usage)
    },
    // onError - 发生错误时调用
    (error) => {
      console.error('AI帮写错误:', error)
      
      // 获取最新的 insertId，显示错误信息
      const { doc } = editor.value.state
      let latestInsertId = null
      doc.descendants((node) => {
        if (node.type.name === 'insertNode' && node.attrs.insertId) {
          latestInsertId = node.attrs.insertId
        }
      })
      
      if (latestInsertId) {
        updateAiHelpContent(latestInsertId, `**错误：** ${error.message || 'AI服务暂时不可用，请稍后重试。'}`)
      }
    }
  )
}

// 处理AI帮写接受（已废弃，使用 handleAcceptInsert 替代）
const handleAcceptAiHelp = (helpId) => {
  if (!editor.value) return
  
  // 兼容：将 helpId 视为 insertId
  editor.value.commands.acceptInsert(helpId)
  
  // 保存文档
  saveDocument()
}

// 处理AI帮写拒绝（已废弃，使用 handleRejectInsert 替代）
const handleRejectAiHelp = (helpId) => {
  if (!editor.value) return
  
  // 兼容：将 helpId 视为 insertId
  editor.value.commands.rejectInsert(helpId)
  
  // 保存文档
  saveDocument()
}

// 处理全局点击事件，隐藏浮动工具栏和右键菜单
const handleGlobalClickForFloatingToolbar = (event) => {
  // 如果正在选择中，不隐藏工具栏
  if (isSelecting.value) {
    return
  }
  
  // 检查所有对话框元素
  const aiDialogs = document.querySelectorAll('.ai-help-dialog')
  const floatingToolbar = document.querySelector('.floating-toolbar')
  
  // 如果点击在对话框上或浮动工具栏上，不关闭对话框
  let clickedOnDialog = false
  aiDialogs.forEach(dialog => {
    if (dialog && dialog.contains(event.target)) {
      clickedOnDialog = true
    }
  })
  
  // 如果点击在浮动工具栏上，也不关闭对话框
  if (floatingToolbar && floatingToolbar.contains(event.target)) {
    clickedOnDialog = true
  }
  
  // 如果点击不在对话框上，关闭所有对话框
  if (!clickedOnDialog) {
    const contextMenu = document.querySelector('.context-menu')
    const editorContent = editorElement.value
    
    if (floatingToolbar && !floatingToolbar.contains(event.target) && 
        editorContent && !editorContent.contains(event.target)) {
      hideFloatingToolbar()
    }
    
    // 检查点击是否在右键菜单外部
    if (contextMenu && !contextMenu.contains(event.target)) {
      hideContextMenu()
    }
    
    // 关闭AI帮写对话框
    if (aiHelpDialogVisible.value) {
      handleCloseAiHelp()
    }
    
    // 关闭AI对话对话框
    if (aiTextDialogVisible.value) {
      handleCloseAiTextDialog()
    }
  }
}

// 移除重复的监听器，使用上面的统一监听器

// 暂时禁用documentContent的watch，避免与props.document的watch冲突
// watch(() => documentContent.value, (newValue) => {
//   if (editor.value && newValue !== undefined) {
//     const currentContent = editor.value.getHTML()
//     // 只有当内容真正不同时才更新
//     if (currentContent !== newValue) {
//       // 直接使用新内容，不自动添加占位符
//       // 占位符应该由Placeholder扩展处理
//       editor.value.commands.setContent(newValue || '', false)
//     }
//   }
// }, { immediate: true })

// 组件卸载时清理
onUnmounted(() => {
  editor.value?.destroy()
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
})

// 键盘快捷键
const handleKeydown = (event) => {
  // Ctrl/Cmd + S 保存
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    saveDocument()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  
  // 添加全局点击事件监听器，用于隐藏浮动工具栏
  document.addEventListener('click', handleGlobalClickForFloatingToolbar)
  
  // 添加diff组件事件监听器
  window.addEventListener('accept-diff', (event) => {
    handleAcceptDiff(event.detail.diffId)
  })
  
  window.addEventListener('reject-diff', (event) => {
    handleRejectDiff(event.detail.diffId)
  })
  
  window.addEventListener('keep-all-diff', (event) => {
    handleKeepAllDiff(event.detail.diffId)
  })
  
  // AI帮写组件事件监听器（兼容旧版 - 映射到 Insert）
  window.addEventListener('accept-ai-help', (event) => {
    // 兼容旧版：将 helpId 视为 insertId
    handleAcceptInsert(event.detail.helpId)
  })
  
  window.addEventListener('reject-ai-help', (event) => {
    // 兼容旧版：将 helpId 视为 insertId
    handleRejectInsert(event.detail.helpId)
  })
  
  // 添加Insert组件事件监听器
  window.addEventListener('accept-insert', (event) => {
    handleAcceptInsert(event.detail.insertId)
  })
  
  window.addEventListener('reject-insert', (event) => {
    handleRejectInsert(event.detail.insertId)
  })
  
  // 添加Delete组件事件监听器
  window.addEventListener('accept-delete', (event) => {
    handleAcceptDelete(event.detail.deleteId)
  })
  
  window.addEventListener('reject-delete', (event) => {
    handleRejectDelete(event.detail.deleteId)
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', handleGlobalClickForFloatingToolbar)
  
  // 清理diff组件事件监听器
  window.removeEventListener('accept-diff', handleAcceptDiff)
  window.removeEventListener('reject-diff', handleRejectDiff)
  
  // 清理AI帮写组件事件监听器
  window.removeEventListener('accept-ai-help', handleAcceptAiHelp)
  window.removeEventListener('reject-ai-help', handleRejectAiHelp)
  
  // 清理选择定时器
  if (selectionTimeout.value) {
    clearTimeout(selectionTimeout.value)
    selectionTimeout.value = null
  }
})
</script>

<style scoped>
.ai-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f7fa;
}

/* 加载状态样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e4e7ed;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #606266;
  font-size: 14px;
  margin: 0;
}

/* 编辑器工具栏 */
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  overflow-x: auto;
  width: 100%;
  position: relative;
  z-index: 10;
}

/* 标题区域 */
.title-section {
  padding: 24px 24px 16px 24px;
  background: white;
}

.title-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  background: transparent;
  padding: 0;
  line-height: 1.2;
  margin: 0;
}

.title-input::placeholder {
  color: #c0c4cc;
  font-weight: 400;
}

.title-input:focus {
  outline: none;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
  border-right: 1px solid #f0f0f0;
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: white;
  color: #606266;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: #f5f7fa;
  border-color: #c0c4cc;
}

.toolbar-btn:active {
  background: #e9ecef;
}

.toolbar-select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: white;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  outline: none;
}

.toolbar-select:hover {
  border-color: #c0c4cc;
}

.color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 4px;
  border: 1px solid #ddd;
}

.color-btn-container {
  position: relative;
  display: inline-block;
  z-index: 10000;
}

/* 编辑器主体布局 */
.editor-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 右侧主区域（包含大纲、编辑区） */
.main-area {
  position: relative;
  flex: 1;
  overflow: hidden;
  background: white;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* 左侧大纲面板 */
.outline-panel {
  width: 280px;
  background: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
}

.panel-header {
  padding: 16px 20px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.outline-content {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.outline-placeholder {
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
  padding: 40px 20px;
}

.placeholder-hint {
  font-size: 12px;
  color: #d1d5db;
  margin-top: 8px;
}

.outline-list {
  padding: 0 20px;
}

.outline-item {
  padding: 8px 12px;
  margin: 2px 0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.outline-item:hover {
  background: #f3f4f6;
  border-left-color: #3b82f6;
}

.outline-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.4;
  display: block;
  word-break: break-word;
}

/* 不同级别标题的缩进 */
.outline-level-1 {
  padding-left: 12px;
}

.outline-level-2 {
  padding-left: 24px;
}

.outline-level-3 {
  padding-left: 36px;
}

.outline-level-4 {
  padding-left: 48px;
}

.outline-level-5 {
  padding-left: 60px;
}

.outline-level-6 {
  padding-left: 72px;
}

/* 不同级别标题的样式 */
.outline-level-1 .outline-text {
  font-weight: 700;
  color: #111827;
}

.outline-level-2 .outline-text {
  font-weight: 600;
  color: #374151;
}

.outline-level-3 .outline-text {
  font-weight: 500;
  color: #4b5563;
}

/* 中间主编辑区域 - 在右侧主区域中真正居中 */
.editor-main {
  width: 900px;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
}

.editor-body {
  flex: 1;
  padding: 0 24px 24px 24px;
  overflow-y: auto;
  background: white;
}

.outline-highlight {
  background-color: #fff3cd;
  transition: background-color 0.6s ease;
}

/* 编辑器滚动条样式 */
.editor-main::-webkit-scrollbar {
  width: 6px;
  background: transparent;
}

.editor-main::-webkit-scrollbar-track {
  background: transparent;
}

.editor-main::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background 0.3s;
}

.editor-main:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
}

.editor-body::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

/* 文档标题样式 */
.document-title-editable {
  font-size: 32px;
  font-weight: 600;
  color: #c0c4cc;
  margin: 0 0 24px 0;
  line-height: 1.2;
  border: none;
  outline: none;
  background: transparent;
}

.document-title-editable:empty::before {
  content: attr(data-placeholder);
  color: #c0c4cc;
}

.document-title-editable:focus {
  color: #303133;
}

.document-title-editable:not(:empty) {
  color: #303133;
}

/* Tiptap 编辑器样式 */
:deep(.ProseMirror) {
  outline: none;
  font-size: 18px; /* 修改为18px以匹配默认字体大小 */
  line-height: 1.6;
  color: #303133;
  min-height: 100%;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

:deep(.ProseMirror h1) {
  font-size: 24px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: #1a1a1a;
}

:deep(.ProseMirror h1.document-title-editable) {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: #1a1a1a;
  border: none;
  outline: none;
  padding: 0;
  line-height: 1.2;
}

:deep(.ProseMirror h2) {
  font-size: 20px;
  font-weight: 600;
  margin: 14px 0 6px 0;
  color: #1a1a1a;
}

:deep(.ProseMirror h3) {
  font-size: 16px;
  font-weight: 600;
  margin: 12px 0 4px 0;
  color: #1a1a1a;
}

:deep(.ProseMirror strong) {
  font-weight: 600;
}

:deep(.ProseMirror em) {
  font-style: italic;
}

:deep(.ProseMirror s) {
  text-decoration: line-through;
}

:deep(.ProseMirror code) {
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
}

:deep(.ProseMirror pre) {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
}

:deep(.ProseMirror pre code) {
  background: transparent;
  padding: 0;
  font-size: 13px;
}

:deep(.ProseMirror blockquote) {
  border-left: 4px solid #e4e7ed;
  padding-left: 16px;
  margin: 12px 0;
  color: #6c757d;
  font-style: italic;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 24px;
  margin: 8px 0;
}

:deep(.ProseMirror li) {
  margin: 4px 0;
}

:deep(.ProseMirror hr) {
  border: none;
  border-top: 2px solid #e4e7ed;
  margin: 20px 0;
}

:deep(.ProseMirror a) {
  color: #409eff;
  text-decoration: none;
}

:deep(.ProseMirror a:hover) {
  text-decoration: underline;
}

/* 表格样式 */
:deep(.ProseMirror table) {
  border-collapse: collapse;
  margin: 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

:deep(.ProseMirror table td),
:deep(.ProseMirror table th) {
  border: 2px solid #ced4da;
  box-sizing: border-box;
  min-width: 1em;
  padding: 3px 5px;
  position: relative;
  vertical-align: top;
}

:deep(.ProseMirror table th) {
  background-color: #f1f3f4;
  font-weight: bold;
  text-align: left;
}

:deep(.ProseMirror table .selectedCell:after) {
  background: rgba(200, 200, 255, 0.4);
  content: "";
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
  position: absolute;
  z-index: 2;
}

:deep(.ProseMirror table .column-resize-handle) {
  background-color: #adf;
  bottom: -2px;
  position: absolute;
  right: -2px;
  pointer-events: none;
  top: 0;
  width: 4px;
}

:deep(.ProseMirror table p) {
  margin: 0;
}

/* 图片样式 */
:deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 16px auto;
  border-radius: 4px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

:deep(.ProseMirror img:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.ProseMirror img.ProseMirror-selectednode) {
  outline: 3px solid #68cef8;
  box-shadow: 0 4px 12px rgba(104, 206, 248, 0.3);
}

/* 拖拽手柄 */
.resize-handle {
  width: 6px;
  background: #f0f0f0;
  cursor: col-resize;
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  z-index: 11;
}

.resize-handle:hover {
  background: #e0e0e0;
}

.resize-handle.right-handle {
  border-left: 1px solid #e4e7ed;
}

.handle-indicator {
  opacity: 0;
  transition: opacity 0.2s;
  color: #909399;
}

.resize-handle:hover .handle-indicator {
  opacity: 1;
}

/* 右侧AI面板 - 与大纲平齐 */
.ai-panel {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background: white;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
}


/* AI面板打开按钮 */
.ai-toggle-btn {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 56px;
  height: 56px;
  border: none;
  background: #409eff;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s;
  z-index: 100;
}

.ai-toggle-btn:hover {
  background: #66b1ff;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.5);
  transform: translateY(-2px);
}

.ai-toggle-btn:active {
  transform: translateY(0);
}

/* 编辑建议面板 */
.edit-suggestions-panel {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin: 16px 24px;
  overflow: hidden;
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #409eff;
  color: white;
}

.suggestions-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.close-suggestions-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-suggestions-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.suggestions-list {
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-content {
  flex: 1;
  margin-right: 16px;
}

.suggestion-type {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.type-badge.replace {
  background: #fff3cd;
  color: #856404;
}

.type-badge.insert {
  background: #d1ecf1;
  color: #0c5460;
}

.confidence {
  font-size: 11px;
  color: #6c757d;
}

.suggestion-text {
  margin-bottom: 8px;
}

.diff-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.original-text,
.suggested-text,
.insert-text {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
}

.original-text {
  background: #f8d7da;
  border-left: 3px solid #dc3545;
}

.suggested-text {
  background: #d4edda;
  border-left: 3px solid #28a745;
}

.insert-text {
  background: #d1ecf1;
  border-left: 3px solid #17a2b8;
}

.diff-label {
  font-size: 12px;
  font-weight: 600;
  min-width: 40px;
  color: #495057;
}

.diff-content {
  flex: 1;
  font-size: 13px;
  line-height: 1.4;
  color: #212529;
}

.suggestion-reason {
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
}

.suggestion-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.accept-btn {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.accept-btn:hover {
  background: #218838;
  border-color: #1e7e34;
}

.reject-btn {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
}

.reject-btn:hover {
  background: #c82333;
  border-color: #bd2130;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .outline-panel {
    width: 240px;
  }
  
  .editor-main {
    width: 800px;
    max-width: 800px;
  }
}

@media (max-width: 1200px) {
  .outline-panel {
    width: 200px;
  }
  
  .editor-main {
    width: 700px;
    max-width: 700px;
  }
}

@media (max-width: 768px) {
  .outline-panel {
    width: 180px;
  }
  
  .editor-main {
    width: 500px;
    max-width: 500px;
  }
  
  .title-section {
    padding: 20px 20px 12px 20px;
  }
  
  .title-input {
    font-size: 24px;
  }
  
  .editor-body {
    padding: 0 20px 20px 20px;
  }
  
  .outline-content {
    padding: 12px 16px;
  }
}

@media (max-width: 600px) {
  .outline-panel {
    width: 160px;
  }
  
  .editor-main {
    width: 400px;
    max-width: 400px;
  }
  
  .title-section {
    padding: 16px 16px 12px 16px;
  }
  
  .title-input {
    font-size: 20px;
  }
  
  .editor-body {
    padding: 0 16px 16px 16px;
  }
}

/* 全局批量操作按钮 */
.batch-actions {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.batch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.batch-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.batch-btn:active {
  transform: translateY(0);
}

.accept-all-btn {
  background: #059669;
  color: white;
}

.accept-all-btn:hover {
  background: #047857;
}

.reject-all-btn {
  background: #dc2626;
  color: white;
}

.reject-all-btn:hover {
  background: #b91c1c;
}

.batch-btn svg {
  flex-shrink: 0;
}
</style>
