<template>
  <div class="ai-chat">
    <!-- 顶部标题栏 -->
    <div class="top-header">
      <div class="session-title-bar">
        <span class="current-session-title">{{ getCurrentSessionTitle() }}</span>
      </div>
      <div class="top-actions">
        <button class="icon-btn" @click="toggleDebugPanel" title="调试面板" :class="{ 'active': showDebugPanel }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="icon-btn" @click="createNewSession" title="新建会话">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button class="icon-btn" @click="toggleSessionList" title="历史会话" :class="{ 'active': showSessionList }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1,4 1,10 7,10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
        </button>
        <button class="icon-btn" @click="closeChat" title="关闭">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- 会话列表面板 -->
    <div v-if="showSessionList" class="session-list-panel">
      <div class="session-list-header">
        <h4>历史会话</h4>
        <button class="refresh-btn" @click="loadSessions" :disabled="isLoadingSessions" title="刷新">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" :class="{ 'spin': isLoadingSessions }">
            <polyline points="23,4 23,10 17,10"></polyline>
            <polyline points="1,20 1,14 7,14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
      </div>
      <div class="session-list-content">
        <div v-if="isLoadingSessions" class="loading-indicator">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        <div v-else-if="sessions.length === 0" class="empty-sessions">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>暂无历史会话</p>
        </div>
        <div v-else class="session-list">
          <div 
            v-for="session in sessions" 
            :key="session.sessionId"
            class="session-item"
            :class="{ 'active': session.sessionId === currentSessionId }"
            @click="loadSessionMessages(session.sessionId)"
          >
            <div class="session-info">
              <div class="session-title-wrapper">
                <input 
                  v-if="editingSessionId === session.sessionId"
                  v-model="editingTitle"
                  class="session-title-input"
                  @click.stop
                  @keydown.enter="saveSessionTitle(session.sessionId)"
                  @keydown.esc="cancelEditTitle"
                  @blur="saveSessionTitle(session.sessionId)"
                  ref="titleInput"
                />
                <h5 v-else class="session-title">{{ session.title }}</h5>
              </div>
              <div class="session-meta">
                <span class="session-time">{{ formatSessionTime(session.updatedAt) }}</span>
                <span class="session-status" :class="session.status">{{ getStatusLabel(session.status) }}</span>
              </div>
            </div>
            <div class="session-actions" @click.stop>
              <button class="action-btn small" @click="startEditTitle(session)" title="重命名">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="action-btn small delete" @click="deleteSessionConfirm(session.sessionId)" title="删除">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 调试面板 -->
    <div v-if="showDebugPanel" class="debug-panel">
      <div class="debug-header">
        <h4>WebSocket 消息调试</h4>
        <button class="clear-debug-btn" @click="clearDebugMessages" title="清空">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
          </svg>
        </button>
      </div>
      <div class="debug-content">
        <div v-if="debugMessages.length === 0" class="debug-empty">
          暂无消息
        </div>
        <div v-else class="debug-messages">
          <div 
            v-for="(msg, index) in debugMessages" 
            :key="index"
            class="debug-message-item"
          >
            <div class="debug-message-header">
              <span class="debug-message-type" :class="'type-' + msg.type">{{ msg.type }}</span>
              <span class="debug-message-time">{{ formatDebugTime(msg.timestamp) }}</span>
            </div>
            <pre class="debug-message-content">{{ msg.content }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天消息区域 -->
    <div class="chat-container" ref="chatContainer">
      <div class="chat-messages" v-if="chatMessages.length > 0">
        <div 
          v-for="(message, index) in chatMessages" 
          :key="index" 
          class="message-item"
          :class="{ 
            'user-message': message.type === 'user',
            'tool-call-message': message.type === 'tool_call',
            'llm-stream-message': message.type === 'llm_stream'
          }"
        >
          <!-- 用户消息 -->
          <div v-if="message.type === 'user'" class="user-message-text">
            {{ message.content }}
          </div>
          
          <!-- 工具调用消息 -->
          <div v-if="message.type === 'tool_call'" class="tool-call-text">
            <svg class="tool-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
            {{ message.content }}
          </div>
          
          <!-- LLM流式消息 -->
          <div v-else-if="message.type === 'llm_stream'" class="llm-stream-text">
            {{ message.content }}
          </div>
        </div>
        
        <!-- 等待中状态 -->
        <div v-if="isSessionActive && !isProducingContent" class="message-item waiting-message">
          <div class="waiting-indicator">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="waiting-text">AI正在思考中...</span>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="chatMessages.length === 0" class="chat-empty">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h4>开始与AI对话</h4>
        <p>询问关于文档的问题，或请求AI帮助编辑内容</p>
        <div class="suggestion-chips">
          <button class="suggestion-chip" @click="sendQuickMessage('帮我总结这篇文档的主要内容')">
            总结文档
          </button>
          <button class="suggestion-chip" @click="sendQuickMessage('帮我改进这段文字的表述')">
            改进表述
          </button>
          <button class="suggestion-chip" @click="sendQuickMessage('帮我检查语法错误')">
            检查语法
          </button>
        </div>
      </div>
    </div>





    <!-- 引用显示区域 -->
    <div v-if="references.length > 0" class="references-area">
      <div class="references-header">
        <span class="references-title">引用文本</span>
        <button class="clear-references-btn" @click="clearReferences" title="清除所有引用">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="references-list">
        <div 
          v-for="(reference, index) in references" 
          :key="reference.id"
          class="reference-item"
        >
          <div class="reference-content">
            <div class="reference-text">{{ reference.text }}</div>
            <div class="reference-meta">
              <span class="reference-source">{{ getSourceLabel(reference.source) }}</span>
              <span class="reference-time">{{ formatTime(new Date(reference.timestamp)) }}</span>
            </div>
          </div>
          <button 
            class="remove-reference-btn" 
            @click="removeReference(index)"
            title="移除引用"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area" ref="inputArea">
      <div class="unified-input-box">
        <div class="input-first-row">
          <button class="add-context-btn" @click="handleShowDocumentSelector" title="添加文档上下文" ref="addBtn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <!-- 显示已选择的文档数量 -->
          <div v-if="selectedDocumentIds.length > 0" class="selected-documents-info">
            <span class="selected-count">已选择 {{ selectedDocumentIds.length }} 个文档</span>
            <button class="clear-selection-btn" @click="selectedDocumentIds = []" title="清除选择">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="input-main-area">
          <textarea
            ref="messageInput"
            v-model="currentMessage"
            class="message-input"
            :placeholder="currentMode === 'agent' ? '描述您想要的文档修改...' : '询问文档问题或请求修改建议...'"
            @keydown="handleInputKeydown"
            @input="handleInputChange"
            :disabled="aiStatus === 'typing'"
          ></textarea>
          <button 
            class="send-btn" 
            @click="sendMessage" 
            :disabled="!currentMessage.trim() || aiStatus === 'typing'"
            :class="{ 'can-send': currentMessage.trim() && aiStatus !== 'typing' }"
          >
            <svg v-if="aiStatus !== 'typing'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
            <div v-else class="loading-spinner small"></div>
          </button>
        </div>
        <div class="input-last-row">
          <select v-model="currentMode" class="mode-select" @change="handleModeChange">
            <option value="agent">智能体</option>
            <option value="chat">对话</option>
          </select>
          <span class="char-count">{{ currentMessage.length }}/2000</span>
        </div>
      </div>
      
      <!-- 文档选择器下拉面板 -->
      <DocumentSelector 
        v-if="showDocumentSelector"
        :show="showDocumentSelector"
        :initial-selected-ids="selectedDocumentIds"
        @close="handleCloseDocumentSelector"
        @confirm="handleConfirmDocumentSelection"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { aiAPI, agentAPI } from '../services/api.js'
import { formatMarkdownToHtml } from '../utils/markdownFormatter.js'
import DocumentSelector from './DocumentSelector.vue'

// Props
const props = defineProps({
  documentContent: {
    type: String,
    default: ''
  },
  documentId: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'insert-content', 'apply-edit-suggestion', 'reject-edit-suggestion', 'insert-diff-node', 'save-before-agent'])

// AI聊天相关数据
const aiStatus = ref('online') // 'online', 'typing', 'offline'
const chatMessages = ref([])
const currentMessage = ref('')
const messageInput = ref(null)
const chatContainer = ref(null)
const conversationId = ref(null) // 会话 ID，用于多轮对话
const agentSessionId = ref(null) // 智能体会话 ID
const agentWebSocket = ref(null) // 智能体WebSocket连接
const currentSessionId = ref(null) // 当前选中的会话 ID
const isSessionActive = ref(false) // 会话是否激活（未收到session_closed）
const lastMessageTime = ref(null) // 最后一次收到消息的时间
const isProducingContent = ref(false) // 是否正在产出内容（收到token、工具调用、编辑指令时为true）
let contentDebounceTimer = null // 内容防抖定时器

// 会话管理相关数据
const showSessionList = ref(false) // 是否显示会话列表
const sessions = ref([]) // 会话列表
const isLoadingSessions = ref(false) // 是否正在加载会话
const editingSessionId = ref(null) // 正在编辑的会话 ID
const editingTitle = ref('') // 编辑中的标题
const titleInput = ref(null) // 标题输入框引用

// 模式选择相关数据
const currentMode = ref('agent') // 'agent'(智能体) 或 'chat'(对话)，默认为智能体模式
const editSuggestions = ref([]) // 编辑模式的建议列表

// 引用管理相关数据
const references = ref([]) // 引用文本列表

// 调试相关数据
const showDebugPanel = ref(false) // 是否显示调试面板
const debugMessages = ref([]) // 调试消息列表

// 文档选择器相关数据
const showDocumentSelector = ref(false) // 是否显示文档选择器
const selectedDocumentIds = ref([]) // 选中的文档ID列表
const inputArea = ref(null) // 输入区域引用
const addBtn = ref(null) // 添加按钮引用

// 获取当前会话标题
const getCurrentSessionTitle = () => {
  // 如果有当前会话ID，从会话列表中查找标题
  if (currentSessionId.value) {
    const session = sessions.value.find(s => s.sessionId === currentSessionId.value)
    if (session) {
      return session.title
    }
  }
  // 默认标题
  return 'AI助手'
}

// AI聊天相关方法
const sendMessage = async () => {
  if (!currentMessage.value.trim() || aiStatus.value === 'typing') return
  
  const messageText = currentMessage.value.trim()
  
  // 添加用户消息到聊天记录
  chatMessages.value.push({
    type: 'user',
    content: messageText,
    timestamp: new Date()
  })
  
  currentMessage.value = ''
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
  
  // 设置AI为输入状态
  aiStatus.value = 'typing'
  isSessionActive.value = true // 启动会话
  lastMessageTime.value = Date.now() // 记录发送时间
  isProducingContent.value = false // 刚发送消息，还未收到内容
  
  try {
    // 根据模式调用不同API
    if (currentMode.value === 'agent') {
      // 智能体模式：调用智能体API
      await callAgentAPI(messageText)
    } else {
      // 对话模式：调用AI问答API
      await callAiChatAPI(messageText)
    }
  } catch (error) {
    console.error('AI回复失败:', error)
    // 添加错误消息
    chatMessages.value.push({
      type: 'llm_stream',
      content: '抱歉，我暂时无法回复您的消息，请稍后再试。',
      timestamp: new Date()
    })
    aiStatus.value = 'online'
    isSessionActive.value = false
    isProducingContent.value = false
  } finally {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 调用智能体API
const callAgentAPI = async (userPrompt) => {
  console.log('调用智能体API，用户请求:', userPrompt)
  console.log('当前会话ID:', agentSessionId.value, '将会复用会话历史')
  
  try {
    // 在调用智能体API之前，先触发保存文档
    console.log('智能体模式：调用API前先保存文档')
    emit('save-before-agent')
    
    // 等待一个短暂的时间，确保保存请求发送
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 构建目标选中文本信息（如果有引用）
    let targetSelection = undefined
    if (references.value.length > 0) {
      const firstRef = references.value[0]
      targetSelection = {
        text: firstRef.text,
        startOffset: 0, // 实际应用中应该从编辑器获取
        endOffset: firstRef.text.length
      }
    }
    
    // 调用智能体执行接口，传递sessionId以复用会话历史
    const response = await agentAPI.executeWriter(
      userPrompt,
      props.documentId,
      agentSessionId.value, // 复用会话 ID，后端会使用该会话的历史消息
      selectedDocumentIds.value.length > 0 ? selectedDocumentIds.value : undefined, // 选中的文档ID列表
      targetSelection
    )
    
    console.log('智能体API响应:', response)
    console.log('响应详情 - data:', response.data)
    console.log('响应详情 - sessionId:', response.data?.sessionId || response.sessionId)
    
    // 从响应中获取sessionId，支持两种格式：response.data.sessionId 或 response.sessionId
    const sessionId = response.data?.sessionId || response.sessionId
    
    if (sessionId) {
      console.log('成功获取sessionId:', sessionId)
      
      // 如果是新会话，保存sessionId
      if (!agentSessionId.value) {
        console.log('新会话创建，sessionId:', sessionId)
      }
      
      agentSessionId.value = sessionId
      currentSessionId.value = sessionId // 同步更新当前会话ID
      
      // 关闭旧的WebSocket连接（如果存在）
      if (agentWebSocket.value) {
        console.log('关闭旧的WebSocket连接')
        agentWebSocket.value.close()
      }
      
      // 订阅WebSocket事件
      subscribeAgentWebSocket(sessionId)
    } else {
      console.error('响应中未找到sessionId:', response)
      chatMessages.value.push({
        type: 'llm_stream',
        content: '智能体API响应中未包含sessionId，无法建立WebSocket连接',
        timestamp: new Date()
      })
      aiStatus.value = 'online'
    }
    
  } catch (error) {
    console.error('调用智能体API失败:', error)
    // 添加错误消息
    chatMessages.value.push({
      type: 'llm_stream',
      content: `智能体API调用失败: ${error.message}`,
      timestamp: new Date()
    })
    aiStatus.value = 'online'
  }
}

// 流式消息缓存：存储每个run_id对应的消息索引和内容
const streamMessageCache = ref(new Map())

// 工具名称映射
const toolNameMap = {
  'paragraph_editor': '文档编辑工具',
  'document_reader': '文档阅读工具',
  'search_tool': '搜索工具',
  'knowledge_base': '知识库工具'
  // 可以根据实际情况添加更多工具映射
}

// 订阅智能体WebSocket事件
const subscribeAgentWebSocket = (sessionId) => {
  console.log('订阅智能体WebSocket事件, sessionId:', sessionId)
  
  // 清空流式消息缓存
  streamMessageCache.value.clear()
  
  // 创建WebSocket连接
  agentWebSocket.value = agentAPI.subscribeAgentEvents(
    sessionId,
    // onMessage - 收到消息
    (message) => {
      console.log('=== 收到智能体WebSocket消息 ===', message)
      console.log('消息类型:', message.type)
      
      // 添加到调试面板
      debugMessages.value.push({
        type: message.type,
        content: JSON.stringify(message, null, 2),
        timestamp: new Date()
      })
      // 限制调试消息数量，最多保留50条
      if (debugMessages.value.length > 50) {
        debugMessages.value.shift()
      }
      
      // 处理不同类型的消息
      if (message.type === 'paragraph_edit_instruction') {
        console.log('!!! 检测到paragraph_edit_instruction消息，开始处理 !!!')
        lastMessageTime.value = Date.now() // 更新消息时间
        isProducingContent.value = true // 正在产出内容
        handleParagraphEditInstruction(message)
        // 处理完段落编辑后自动保存文档
        console.log('段落编辑处理完成，触发文档保存')
        emit('save-before-agent')
        // 编辑指令处理完毕，重置为等待状态
        setTimeout(() => {
          isProducingContent.value = false
        }, 100)
        // 不再显示原始消息
      } else if (message.type === 'llm_stream_token') {
        // 处理流式token
        lastMessageTime.value = Date.now() // 更新消息时间
        isProducingContent.value = true // 正在产出内容
        handleStreamToken(message)
      } else if (message.type === 'agent_action') {
        // 处理agent_action消息
        lastMessageTime.value = Date.now() // 更新消息时间
        isProducingContent.value = true // 正在产出内容
        handleAgentAction(message)
        // 工具调用显示后，短暂延迟后重置为等待状态
        setTimeout(() => {
          isProducingContent.value = false
        }, 100)
      } else if (message.type === 'session_closed' || message.type === 'agent_complete') {
        // 会话关闭或完成事件，设置状态为在线
        aiStatus.value = 'online'
        isSessionActive.value = false // 会话结束
        lastMessageTime.value = null
        isProducingContent.value = false
      }
      // 其他消息不再显示
    },
    // onError - 错误
    (error) => {
      console.error('智能体WebSocket错误:', error)
      chatMessages.value.push({
        type: 'llm_stream',
        content: `WebSocket连接错误: ${error.message || '未知错误'}`,
        timestamp: new Date()
      })
      aiStatus.value = 'online'
      isSessionActive.value = false
      isProducingContent.value = false
    },
    // onClose - 关闭
    () => {
      console.log('智能体WebSocket连接已关闭')
      aiStatus.value = 'online'
      isSessionActive.value = false
      lastMessageTime.value = null
      isProducingContent.value = false
      // 清空流式消息缓存
      streamMessageCache.value.clear()
    }
  )
}

// 处理agent_action消息
const handleAgentAction = (message) => {
  console.log('处理agent_action消息:', message)
  
  const data = message.data
  if (!data || !data.tool) {
    console.error('agent_action消息格式错误', message)
    return
  }
  
  const { tool } = data
  const toolName = toolNameMap[tool] || tool
  
  // 添加工具调用提示消息
  chatMessages.value.push({
    type: 'tool_call',
    content: `正在调用${toolName}...`,
    timestamp: new Date()
  })
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 处理流式token消息
const handleStreamToken = (message) => {
  // console.log('处理流式token:', message)
  
  const data = message.data
  if (!data || !data.run_id || data.token === undefined) {
    console.error('llm_stream_token消息格式错误', message)
    return
  }
  
  const { token, run_id } = data
  
  // 查找或创建该run_id对应的消息
  let cacheEntry = streamMessageCache.value.get(run_id)
  
  if (!cacheEntry) {
    // 第一次收到该run_id的token，创建新消息
    const newMessage = {
      type: 'llm_stream',
      content: token,
      timestamp: new Date(),
      run_id: run_id
    }
    
    chatMessages.value.push(newMessage)
    const messageIndex = chatMessages.value.length - 1
    
    // 缓存消息索引和内容
    streamMessageCache.value.set(run_id, {
      index: messageIndex,
      content: token
    })
    
    // console.log(`创建新的流式消息，run_id: ${run_id}, 初始内容: "${token}"`)
  } else {
    // 已存在该run_id的消息，追加token
    cacheEntry.content += token
    
    const messageIndex = cacheEntry.index
    if (messageIndex >= 0 && messageIndex < chatMessages.value.length) {
      chatMessages.value[messageIndex].content = cacheEntry.content
      // console.log(`追加token到消息，run_id: ${run_id}, 当前内容: "${cacheEntry.content}"`)
    }
  }
  
  // 清除之前的防抖定时器
  if (contentDebounceTimer) {
    clearTimeout(contentDebounceTimer)
  }
  
  // 设置一个防抖定时器，500ms后如果没有新token，则重置为等待状态
  contentDebounceTimer = setTimeout(() => {
    isProducingContent.value = false
  }, 500)
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 处理paragraph_edit_instruction指令
const handleParagraphEditInstruction = (message) => {
  console.log('处理paragraph_edit_instruction指令:', message)
  
  const data = message.data
  if (!data) {
    console.error('paragraph_edit_instruction消息缺少data字段')
    return
  }
  
  const {
    paragraphId,
    operation,
    newContent,
    originalContent,
    reasoning,
    metadata
  } = data
  
  // 验证必须字段：对于replace和delete操作，originalContent是必须的
  // 对于insert_before和insert_after操作，originalContent可能为空
  if ((operation === 'replace' || operation === 'delete') && !originalContent) {
    console.error(`${operation}操作缺少originalContent字段`)
    return
  }
  
  console.log('准备插入DiffNode:', {
    paragraphId,
    operation,
    originalContent,
    newContent,
    reasoning
  })
  
  // 后端现在返回的是HTML原始格式，不再需要startOffset和endOffset
  // 将originalContent传递给父组件，由父组件进行匹配定位
  emit('insert-diff-node', {
    paragraphId,
    operation,
    originalContent: originalContent || '',
    newContent: newContent || '',
    reasoning,
    metadata
  })
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 在对话框中显示原始WebSocket消息（已废弃，不再使用）
// const displayRawWebSocketMessage = (message) => {
//   // 不再显示原始消息
// }

// 调用AI问答流式API
const callAiChatAPI = (question) => {
  console.log('调用AI问答API，问题:', question)
  console.log('当前conversationId:', conversationId.value, '将会复用对话历史')
  
  // 转换引用格式
  const selectedReferences = references.value.length > 0 ? references.value.map(ref => ({
    text: ref.text,
    documentId: props.documentId || undefined,
    source: ref.source || 'editor_selection'
  })) : undefined
  
  // 创建AI回复消息（先创建，后续流式更新）
  let assistantMessage = {
    type: 'llm_stream',
    content: '',
    timestamp: new Date()
  }
  chatMessages.value.push(assistantMessage)
  
  // 调用流式API，传递conversationId以复用对话历史
  aiAPI.aiChatStream(
    question,
    conversationId.value, // conversationId - 后端会使用该ID查找历史消息
    props.documentId, // documentId
    'all', // searchScope: 'all'=所有文档，'current'=当前文档
    true, // ragEnabled
    undefined, // selectedDocumentIds (目前未实现添加整篇文档功能)
    selectedReferences, // selectedReferences
    // onChunk - 流式接收内容
    (content) => {
      console.log('收到AI回复片段:', content)
      // 更新最后一条AI消息的内容
      if (chatMessages.value.length > 0) {
        const lastMessage = chatMessages.value[chatMessages.value.length - 1]
        if (lastMessage.type === 'llm_stream') {
          lastMessage.content = content
        }
      }
      // 滚动到底部
      nextTick(() => {
        scrollToBottom()
      })
    },
    // onDone - 完成
    (usage) => {
      console.log('AI回复完成:', usage)
      // 保存会话ID，下次请求会复用
      if (usage.conversationId) {
        conversationId.value = usage.conversationId
        console.log('保存conversationId以便下次复用:', conversationId.value)
      }
    },
    // onError - 错误
    (error) => {
      console.error('AI问答错误:', error)
      // 更新错误消息
      if (chatMessages.value.length > 0) {
        const lastMessage = chatMessages.value[chatMessages.value.length - 1]
        if (lastMessage.type === 'llm_stream') {
          lastMessage.content = error.message || '抱歉，AI问答服务暂时不可用。'
        }
      }
    }
  )
}

const sendQuickMessage = (message) => {
  currentMessage.value = message
  sendMessage()
}


const clearChatHistory = () => {
  chatMessages.value = []
  conversationId.value = null // 清空会话 ID
  references.value = [] // 清空引用
  streamMessageCache.value.clear() // 清空流式消息缓存
  
  // 重置会话状态
  isSessionActive.value = false
  lastMessageTime.value = null
  aiStatus.value = 'online'
  isProducingContent.value = false
  
  // 关闭智能体WebSocket连接
  if (agentWebSocket.value) {
    agentWebSocket.value.close()
    agentWebSocket.value = null
  }
  agentSessionId.value = null
  currentSessionId.value = null // 清空当前会话 ID
}

// 会话管理方法
const toggleSessionList = () => {
  showSessionList.value = !showSessionList.value
  if (showSessionList.value) {
    loadSessions()
  }
}

const loadSessions = async () => {
  isLoadingSessions.value = true
  try {
    const response = await agentAPI.getSessions()
    console.log('加载会话列表:', response)
    sessions.value = response || []
  } catch (error) {
    console.error('加载会话列表失败:', error)
    sessions.value = []
  } finally {
    isLoadingSessions.value = false
  }
}

const loadSessionMessages = async (sessionId) => {
  try {
    const response = await agentAPI.getSessionDetail(sessionId)
    console.log('加载会话详情:', response)
    
    // 设置当前会话 ID
    currentSessionId.value = sessionId
    agentSessionId.value = sessionId
    
    // 重置会话状态（加载历史会话不启动等待状态）
    isSessionActive.value = false
    lastMessageTime.value = null
    aiStatus.value = 'online'
    isProducingContent.value = false
    
    // 转换消息格式，从后端加载历史消息
    if (response.messages && Array.isArray(response.messages)) {
      chatMessages.value = response.messages.map(msg => {
        // 判断消息类型
        if (msg.role === 'user') {
          // 用户消息
          return {
            type: 'user',
            content: msg.content,
            timestamp: new Date(msg.createdAt)
          }
        } else if (!msg.content && msg.toolName) {
          // 工具调用消息：content为空且toolName有值
          const toolName = toolNameMap[msg.toolName] || msg.toolName
          console.log(`检测到历史工具调用消息: toolName=${msg.toolName}, 显示为: ${toolName}`)
          return {
            type: 'tool_call',
            content: `正在调用${toolName}...`,
            timestamp: new Date(msg.createdAt),
            toolName: msg.toolName
          }
        } else {
          // AI回复消息
          return {
            type: 'llm_stream',
            content: msg.content || '',
            timestamp: new Date(msg.createdAt)
          }
        }
      })
      console.log(`加载了 ${chatMessages.value.length} 条历史消息`)
      
      // 输出消息类型统计
      const typeCount = chatMessages.value.reduce((acc, msg) => {
        acc[msg.type] = (acc[msg.type] || 0) + 1
        return acc
      }, {})
      console.log('历史消息类型统计:', typeCount)
    } else {
      chatMessages.value = []
    }
    
    // 关闭会话列表
    showSessionList.value = false
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('加载会话详情失败:', error)
    // 即使加载失败，也设置当前会话 ID，以便继续对话
    currentSessionId.value = sessionId
    agentSessionId.value = sessionId
    chatMessages.value = []
    isSessionActive.value = false
    lastMessageTime.value = null
    isProducingContent.value = false
  }
}

const createNewSession = () => {
  // 清空当前聊天，创建新会话
  clearChatHistory()
  showSessionList.value = false
}

const deleteSessionConfirm = async (sessionId) => {
  if (confirm('确定要删除此会话吗？此操作不可恢复。')) {
    try {
      await agentAPI.deleteSession(sessionId)
      console.log('删除会话成功:', sessionId)
      
      // 如果删除的是当前会话，清空聊天
      if (currentSessionId.value === sessionId) {
        clearChatHistory()
      }
      
      // 重新加载会话列表
      await loadSessions()
    } catch (error) {
      console.error('删除会话失败:', error)
      alert('删除会话失败，请稍后重试')
    }
  }
}

const startEditTitle = (session) => {
  editingSessionId.value = session.sessionId
  editingTitle.value = session.title
  
  // 等待 DOM 更新后聚焦输入框
  nextTick(() => {
    if (titleInput.value && titleInput.value[0]) {
      titleInput.value[0].focus()
      titleInput.value[0].select()
    }
  })
}

const saveSessionTitle = async (sessionId) => {
  if (!editingTitle.value.trim()) {
    cancelEditTitle()
    return
  }
  
  try {
    await agentAPI.updateSessionTitle(sessionId, editingTitle.value.trim())
    console.log('修改会话标题成功:', sessionId, editingTitle.value)
    
    // 更新本地会话列表
    const session = sessions.value.find(s => s.sessionId === sessionId)
    if (session) {
      session.title = editingTitle.value.trim()
    }
    
    cancelEditTitle()
  } catch (error) {
    console.error('修改会话标题失败:', error)
    alert('修改标题失败，请稍后重试')
    cancelEditTitle()
  }
}

const cancelEditTitle = () => {
  editingSessionId.value = null
  editingTitle.value = ''
}

// 模式切换处理
const handleModeChange = () => {
  console.log('模式切换为:', currentMode.value)
}

// 显示文档选择器
const handleShowDocumentSelector = () => {
  console.log('打开文档选择器')
  showDocumentSelector.value = true
  
  // 添加点击外部关闭的事件监听
  nextTick(() => {
    document.addEventListener('click', handleClickOutside)
  })
}

// 关闭文档选择器
const handleCloseDocumentSelector = () => {
  showDocumentSelector.value = false
  document.removeEventListener('click', handleClickOutside)
}

// 点击外部关闭
const handleClickOutside = (event) => {
  if (!inputArea.value) return
  
  // 如果点击的是输入区域内部，则不关闭
  if (inputArea.value.contains(event.target)) {
    return
  }
  
  // 否则关闭选择器
  handleCloseDocumentSelector()
}

// 确认选择文档（点击选择框时实时更新）
const handleConfirmDocumentSelection = (documentIds) => {
  console.log('更新选中的文档ID:', documentIds)
  selectedDocumentIds.value = documentIds
}

const formatSessionTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else if (diff < 604800000) { // 7天内
    return `${Math.floor(diff / 86400000)}天前`
  } else {
    return time.toLocaleDateString()
  }
}

const getStatusLabel = (status) => {
  const labels = {
    'active': '活跃',
    'archived': '已归档',
    'completed': '已完成'
  }
  return labels[status] || status
}

// 使用共享的Markdown格式化函数
const formatMessage = (content) => {
  // 直接返回原始内容，不做任何处理
  return content
}

const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 24小时内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return time.toLocaleDateString()
  }
}

const insertMessageToEditor = (content) => {
  // 将AI回复插入到编辑器当前光标位置
  const plainText = content.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')
  emit('insert-content', plainText)
}

const copyMessage = async (content) => {
  try {
    const plainText = content.replace(/<br>/g, '\n').replace(/<[^>]*>/g, '')
    await navigator.clipboard.writeText(plainText)
    // 这里可以添加复制成功的提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const handleInputKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const handleInputChange = () => {
  // 自动调整输入框高度
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
    messageInput.value.style.height = Math.min(messageInput.value.scrollHeight, 120) + 'px'
  }
}

const closeChat = () => {
  emit('close')
}


// 监听文档内容变化，清空聊天历史（可选）
watch(() => props.documentContent, () => {
  // 当文档内容变化时，可以选择是否清空聊天历史
  // clearChatHistory()
})

// 监听会话状态，确保在会话激活期间保持typing状态
watch([isSessionActive, lastMessageTime], ([active, _]) => {
  if (active) {
    // 会话激活中，保持typing状态
    aiStatus.value = 'typing'
  } else {
    // 会话结束，设置为online
    if (aiStatus.value === 'typing') {
      aiStatus.value = 'online'
    }
  }
})

// 监听添加引用事件
onMounted(() => {
  window.addEventListener('add-reference-to-chat', handleAddReferenceToChat)
})

// 组件卸载时关闭WebSocket连接
onUnmounted(() => {
  window.removeEventListener('add-reference-to-chat', handleAddReferenceToChat)
  
  // 清除防抖定时器
  if (contentDebounceTimer) {
    clearTimeout(contentDebounceTimer)
    contentDebounceTimer = null
  }
  
  // 关闭智能体WebSocket连接
  if (agentWebSocket.value) {
    agentWebSocket.value.close()
    agentWebSocket.value = null
  }
  
  // 移除点击外部关闭的事件监听
  document.removeEventListener('click', handleClickOutside)
})

const handleAddReferenceToChat = (event) => {
  const { text, source, timestamp } = event.detail
  if (text && text.trim()) {
    // 添加引用到引用列表
    const reference = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      source: source || 'editor_selection',
      timestamp: timestamp || new Date().toISOString()
    }
    
    references.value.push(reference)
  }
}

// 引用管理方法
const removeReference = (index) => {
  references.value.splice(index, 1)
}

const clearReferences = () => {
  references.value = []
}

const getSourceLabel = (source) => {
  const labels = {
    'editor_selection': '编辑器选中',
    'document_content': '文档内容',
    'clipboard': '剪贴板',
    'file_upload': '文件上传'
  }
  return labels[source] || '未知来源'
}

// 调试面板相关方法
const toggleDebugPanel = () => {
  showDebugPanel.value = !showDebugPanel.value
}

const clearDebugMessages = () => {
  debugMessages.value = []
}

const formatDebugTime = (timestamp) => {
  const time = new Date(timestamp)
  return time.toLocaleTimeString('zh-CN', { hour12: false })
}
</script>

<style scoped>
.ai-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
}

/* 顶部标题栏 */
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #ffffff;
  flex-shrink: 0;
  min-height: 48px;
}

.session-title-bar {
  flex: 1;
  min-width: 0;
}

.current-session-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 12px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #606266;
  transition: all 0.2s;
  padding: 0;
}

.icon-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}

.icon-btn.active {
  background: #ecf5ff;
  color: #409eff;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f0f0f0;
  color: #606266;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.small {
  width: 24px;
  height: 24px;
}

.action-btn.active {
  background: #409eff;
  color: white;
}

.action-btn.delete:hover {
  background: #f56c6c;
  color: white;
}

/* 聊天容器 */
.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #fafafa;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-item {
  /* 消息项不需要额外间距，由gap控制 */
}

/* 用户消息样式 */
.user-message {
  padding: 8px 0;
  display: flex;
  justify-content: flex-end;
}

.user-message-text {
  display: inline-block;
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  word-wrap: break-word;
  white-space: pre-wrap;
  padding: 10px 16px;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 3px solid #2196f3;
  max-width: 80%;
  text-align: left;
}

/* 工具调用消息样式 */
.tool-call-message {
  padding: 8px 0;
}

.tool-call-text {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  font-style: italic;
  padding: 6px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.tool-icon {
  flex-shrink: 0;
  color: #409eff;
}

/* LLM流式消息样式 */
.llm-stream-message {
  padding: 4px 0;
}

.llm-stream-text {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  word-wrap: break-word;
  white-space: pre-wrap;
}

/* 空状态 */
.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #909399;
}

.empty-icon {
  margin-bottom: 16px;
  color: #c0c4cc;
}

.chat-empty h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #606266;
}

.chat-empty p {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #909399;
}

.suggestion-chips {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 200px;
}

.suggestion-chip {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 20px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  background: #f0f0f0;
  border-color: #409eff;
  color: #409eff;
}

/* 等待中状态 */
.waiting-message {
  padding: 8px 0;
}

.waiting-indicator {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 3px solid #409eff;
}

.waiting-text {
  font-size: 13px;
  color: #909399;
  font-style: italic;
}

/* 正在输入指示器（保留用于其他地方） */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  margin-top: 16px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #409eff;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  30% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.typing-text {
  font-size: 13px;
  color: #909399;
}





/* 引用区域样式 */
.references-area {
  border-top: 1px solid #e4e7ed;
  background: #f8f9fa;
}

.references-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #ffffff;
}

.references-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.clear-references-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #909399;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-references-btn:hover {
  background: #f5f7fa;
  color: #606266;
}

.references-list {
  max-height: 200px;
  overflow-y: auto;
}

.reference-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
}

.reference-item:last-child {
  border-bottom: none;
}

.reference-content {
  flex: 1;
  min-width: 0;
}

.reference-text {
  font-size: 13px;
  line-height: 1.4;
  color: #303133;
  margin-bottom: 6px;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reference-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: #909399;
}

.reference-source {
  padding: 2px 6px;
  background: #f0f2f5;
  border-radius: 10px;
  font-weight: 500;
}

.reference-time {
  font-size: 11px;
  color: #c0c4cc;
}

.remove-reference-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #c0c4cc;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-reference-btn:hover {
  background: #f5f7fa;
  color: #f56c6c;
}

/* 输入区域 */
.chat-input-area {
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
  flex-shrink: 0;
  padding: 12px 16px;
  position: relative;
}

/* 统一输入框 */
.unified-input-box {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  transition: border-color 0.2s;
}

.unified-input-box:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

/* 第一行（+按钮） */
.input-first-row {
  display: flex;
  align-items: center;
  padding: 8px 12px 0 12px;
  min-height: 36px;
  gap: 8px;
}

.add-context-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  flex-shrink: 0;
}

.add-context-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}

.selected-documents-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #ecf5ff;
  border-radius: 12px;
  border: 1px solid #b3d8ff;
}

.selected-count {
  font-size: 12px;
  color: #409eff;
  font-weight: 500;
}

.clear-selection-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  border-radius: 50%;
  color: #909399;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  flex-shrink: 0;
}

.clear-selection-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #f56c6c;
}

/* 主输入区域 */
.input-main-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  min-height: 48px;
}

.message-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  resize: none;
  min-height: 24px;
  max-height: 120px;
  font-family: inherit;
}

.message-input::placeholder {
  color: #c0c4cc;
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #e4e7ed;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn.can-send {
  background: #409eff;
  color: white;
}

.send-btn.can-send:hover {
  background: #66b1ff;
}

.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 最后一行（模式选择器和字符计数） */
.input-last-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px 8px 12px;
  min-height: 32px;
}

.mode-select {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}

.mode-select:hover {
  background: #f5f7fa;
}

.mode-select:focus {
  background: #f5f7fa;
}

.mode-select option {
  padding: 8px;
  background: white;
}

.char-count {
  font-size: 11px;
  color: #c0c4cc;
}

/* 加载动画 */
.loading-spinner.small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 会话列表面板 */
.session-list-panel {
  border-bottom: 1px solid #e4e7ed;
  background: #ffffff;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.session-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.session-list-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.refresh-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #909399;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #f5f7fa;
  color: #606266;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn svg.spin {
  animation: spin 1s linear infinite;
}

.session-list-content {
  flex: 1;
  overflow-y: auto;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  color: #909399;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e4e7ed;
  border-top: 3px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-sessions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #c0c4cc;
  text-align: center;
}

.empty-sessions svg {
  margin-bottom: 12px;
}

.empty-sessions p {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.session-list {
  display: flex;
  flex-direction: column;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s;
  gap: 12px;
}

.session-item:hover {
  background: #f5f7fa;
}

.session-item.active {
  background: #ecf5ff;
  border-left: 3px solid #409eff;
  padding-left: 13px;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title-wrapper {
  margin-bottom: 4px;
}

.session-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-title-input {
  width: 100%;
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #409eff;
  border-radius: 4px;
  outline: none;
  background: white;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.session-time {
  color: #909399;
}

.session-status {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.session-status.active {
  background: #e1f3d8;
  color: #67c23a;
}

.session-status.archived {
  background: #f0f0f0;
  color: #909399;
}

.session-status.completed {
  background: #e1f3ff;
  color: #409eff;
}

.session-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.session-item:hover .session-actions {
  opacity: 1;
}

/* 调试面板 */
.debug-panel {
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.debug-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff3cd;
}

.debug-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #856404;
}

.clear-debug-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #856404;
  transition: all 0.2s;
}

.clear-debug-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.debug-content {
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
}

.debug-empty {
  padding: 40px 20px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.debug-messages {
  display: flex;
  flex-direction: column;
}

.debug-message-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.debug-message-item:last-child {
  border-bottom: none;
}

.debug-message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.debug-message-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  font-family: monospace;
}

.debug-message-type.type-paragraph_edit_instruction {
  background: #e7f3ff;
  color: #0066cc;
}

.debug-message-type.type-llm_stream_token {
  background: #f0f9ff;
  color: #0284c7;
}

.debug-message-type.type-agent_action {
  background: #fef3c7;
  color: #92400e;
}

.debug-message-type.type-session_closed,
.debug-message-type.type-agent_complete {
  background: #f3f4f6;
  color: #6b7280;
}

.debug-message-time {
  font-size: 11px;
  color: #909399;
  font-family: monospace;
}

.debug-message-content {
  margin: 0;
  padding: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.4;
  overflow-x: auto;
  max-height: 200px;
  color: #495057;
  font-family: 'Courier New', monospace;
}
</style>
