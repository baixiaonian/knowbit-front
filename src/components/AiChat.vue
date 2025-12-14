<template>
  <div class="ai-chat">
    <!-- 顶部标题栏 -->
    <div class="top-header">
      <div class="session-title-bar">
        <span class="current-session-title">{{ getCurrentSessionTitle() }}</span>
      </div>
      <div class="top-actions">
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

    <!-- 聊天消息区域 -->
    <div class="chat-container" ref="chatContainer">
      <div class="chat-messages" v-if="chatMessages.length > 0">
        <div 
          v-for="(message, index) in chatMessages" 
          :key="index" 
          class="message-item"
          :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
        >
          <div class="message-avatar">
            <div v-if="message.role === 'user'" class="user-avatar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div v-else class="ai-avatar-small">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            <div v-if="message.role === 'assistant'" class="message-actions">
              <button class="action-btn small" @click="insertMessageToEditor(message.content)" title="插入到编辑器">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
              </button>
              <button class="action-btn small" @click="copyMessage(message.content)" title="复制">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else class="chat-empty">
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

      <!-- 正在输入指示器 -->
      <div v-if="aiStatus === 'typing'" class="typing-indicator">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span class="typing-text">AI正在思考...</span>
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
    <div class="chat-input-area">
      <div class="unified-input-box">
        <div class="input-first-row">
          <button class="add-context-btn" @click="showDocumentSelector" title="添加文档上下文">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
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
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { aiAPI, agentAPI } from '../services/api.js'
import { formatMarkdownToHtml } from '../utils/markdownFormatter.js'

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
  
  const userMessage = {
    role: 'user',
    content: currentMessage.value.trim(),
    references: references.value.length > 0 ? references.value : undefined,
    timestamp: new Date()
  }
  
  // 添加用户消息
  chatMessages.value.push(userMessage)
  const messageText = currentMessage.value.trim()
  currentMessage.value = ''
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
  
  // 设置AI为输入状态
  aiStatus.value = 'typing'
  
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
      role: 'assistant',
      content: '抱歉，我暂时无法回复您的消息，请稍后再试。',
      timestamp: new Date(),
      isError: true
    })
  } finally {
    aiStatus.value = 'online'
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
      undefined, // selectedDocumentIds
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
        role: 'assistant',
        content: '智能体API响应中未包含sessionId，无法建立WebSocket连接',
        timestamp: new Date(),
        isError: true
      })
      aiStatus.value = 'online'
    }
    
  } catch (error) {
    console.error('调用智能体API失败:', error)
    // 添加错误消息
    chatMessages.value.push({
      role: 'assistant',
      content: `智能体API调用失败: ${error.message}`,
      timestamp: new Date(),
      isError: true
    })
    aiStatus.value = 'online'
  }
}

// 订阅智能体WebSocket事件
const subscribeAgentWebSocket = (sessionId) => {
  console.log('订阅智能体WebSocket事件, sessionId:', sessionId)
  
  // 创建WebSocket连接
  agentWebSocket.value = agentAPI.subscribeAgentEvents(
    sessionId,
    // onMessage - 收到消息
    (message) => {
      console.log('=== 收到智能体WebSocket消息 ===', message)
      console.log('消息类型:', message.type)
      
      // 处理不同类型的消息
      if (message.type === 'paragraph_edit_instruction') {
        console.log('!!! 检测到paragraph_edit_instruction消息，开始处理 !!!')
        handleParagraphEditInstruction(message)
      } else {
        console.log('其他消息类型:', message.type, '，显示在对话框中')
        // 其他消息继续显示在对话框中
        displayRawWebSocketMessage(message)
      }
    },
    // onError - 错误
    (error) => {
      console.error('智能体WebSocket错误:', error)
      chatMessages.value.push({
        role: 'assistant',
        content: `WebSocket连接错误: ${error.message || '未知错误'}`,
        timestamp: new Date(),
        isError: true
      })
      aiStatus.value = 'online'
    },
    // onClose - 关闭
    () => {
      console.log('智能体WebSocket连接已关闭')
      aiStatus.value = 'online'
    }
  )
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
  
  // 验证必须字段（注意：startOffset可能为0，所以使用 !== undefined）
  if (!metadata || metadata.startOffset === undefined || metadata.endOffset === undefined) {
    console.error('paragraph_edit_instruction消息缺少startOffset或endOffset', metadata)
    return
  }
  
  console.log('准备插入DiffNode:', {
    paragraphId,
    operation,
    startOffset: metadata.startOffset,
    endOffset: metadata.endOffset,
    originalContent,
    newContent
  })
  
  // 向父组件发送插入DiffNode的事件
  console.log('>>> 发送insert-diff-node事件给父组件 <<<')
  emit('insert-diff-node', {
    paragraphId,
    operation,
    originalContent: originalContent || '',
    newContent: newContent || '',
    reasoning,
    startOffset: metadata.startOffset,
    endOffset: metadata.endOffset,
    metadata
  })
  console.log('>>> insert-diff-node事件已发送 <<<')
  
  // 在聊天记录中显示简要信息
  chatMessages.value.push({
    role: 'assistant',
    content: `**段落编辑建议**

操作类型: ${operation}
原文: ${originalContent?.substring(0, 50)}...
新内容: ${newContent?.substring(0, 50)}...
理由: ${reasoning || '无'}`,
    timestamp: new Date(),
    isParagraphEdit: true,
    paragraphId
  })
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 在对话框中显示原始WebSocket消息
const displayRawWebSocketMessage = (message) => {
  // 格式化JSON为可读形式
  const formattedJson = JSON.stringify(message, null, 2)
  
  // 创建代码块显示
  const content = `**WebSocket事件: ${message.type || 'unknown'}**

\`\`\`json
${formattedJson}
\`\`\``
  
  // 添加到聊天消息
  chatMessages.value.push({
    role: 'assistant',
    content: content,
    timestamp: new Date(),
    isWebSocketEvent: true,
    eventType: message.type
  })
  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
  
  // 如果收到 session_closed 或 agent_complete 事件，设置状态为在线
  if (message.type === 'session_closed' || message.type === 'agent_complete') {
    aiStatus.value = 'online'
  }
}

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
    role: 'assistant',
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
        if (lastMessage.role === 'assistant') {
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
        if (lastMessage.role === 'assistant') {
          lastMessage.content = error.message || '抱歉，AI问答服务暂时不可用。'
          lastMessage.isError = true
        }
      }
    }
  )
}

const sendQuickMessage = (message) => {
  currentMessage.value = message
  sendMessage()
}

const simulateAiResponse = async (userMessage) => {
  // 模拟AI思考时间
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  if (currentMode.value === 'chat') {
    // Chat模式：提供markdown格式的建议
    const aiResponse = generateChatResponse(userMessage)
    chatMessages.value.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      mode: 'chat'
    })
  } else {
    // 编辑模式：生成编辑建议
    const editSuggestions = generateEditSuggestions(userMessage)
    chatMessages.value.push({
      role: 'assistant',
      content: '我已经分析了您的请求，并生成了以下编辑建议：',
      timestamp: new Date(),
      mode: 'edit',
      suggestions: editSuggestions
    })
    
    // 通知父组件显示编辑建议
    emit('apply-edit-suggestion', editSuggestions)
  }
}

const generateChatResponse = (userMessage) => {
  if (userMessage.includes('总结') || userMessage.includes('总结文档')) {
    const documentText = props.documentContent.replace(/<[^>]*>/g, '').trim()
    if (documentText) {
      return `## 文档总结

根据文档内容，我为您总结如下：

> ${documentText.substring(0, 200)}${documentText.length > 200 ? '...' : ''}

### 主要内容

这是文档的主要内容的简要概括。如需更详细的分析，请提供更多具体信息。

### 建议改进

- 可以添加更多具体例子
- 建议优化段落结构
- 考虑添加图表说明`
    } else {
      return '当前文档内容为空，无法进行总结。请先添加文档内容，然后我可以帮您分析总结。'
    }
  } else if (userMessage.includes('改进') || userMessage.includes('表述')) {
    return `## 文档改进建议

### 当前问题

根据您的描述，我发现了以下可以改进的地方：

1. **语言表达**：部分句子可以更加简洁明了
2. **逻辑结构**：建议重新组织段落顺序
3. **内容完整性**：某些部分需要补充更多细节

### 具体建议

\`\`\`markdown
# 建议的改进版本

这里是改进后的内容示例...

## 主要变化

- 优化了开头段落
- 增加了过渡语句
- 完善了结论部分
\`\`\`

您可以将这些建议复制到文档中进行修改。`
  } else if (userMessage.includes('语法') || userMessage.includes('错误')) {
    return `## 语法检查结果

### 发现的问题

1. **标点符号使用**：建议统一使用中文标点
2. **句式结构**：部分长句可以拆分
3. **用词准确性**：某些词汇可以更加精确

### 修改建议

\`\`\`diff
- 原文：这是一个很长的句子，包含了很多信息，但是可能不够清晰。
+ 修改：这是一个包含重要信息的句子。为了确保清晰度，建议将其拆分为两个部分。
\`\`\`

### 语法要点

- 注意主谓宾的一致性
- 避免过度使用被动语态
- 保持时态的一致性`
  } else {
    return `## AI助手回复

我理解您的问题："${userMessage}"

### 我可以帮助您

- 📝 **总结和分析**文档内容
- ✏️ **改进文字表述**和语言风格
- ✅ **检查语法错误**和拼写
- 💡 **提供写作建议**和灵感
- ❓ **回答关于文档内容**的问题

### 在其他模式中

- **对话模式**：提供详细的markdown格式建议
- **编辑模式**：直接在编辑器中显示修改建议

请告诉我您具体需要什么帮助，我会尽力协助您！`
  }
}

const generateEditSuggestions = (userMessage) => {
  // 模拟生成编辑建议
  const suggestions = []
  
  if (userMessage.includes('改进') || userMessage.includes('优化')) {
    suggestions.push({
      id: 'suggestion-1',
      type: 'replace',
      position: { start: 0, end: 50 },
      originalText: '这是一段需要改进的文本内容...',
      suggestedText: '这是一段经过优化改进的文本内容，表达更加清晰准确...',
      reason: '优化语言表达，提高可读性',
      confidence: 0.85
    })
  }
  
  if (userMessage.includes('语法') || userMessage.includes('错误')) {
    suggestions.push({
      id: 'suggestion-2',
      type: 'insert',
      position: { start: 100, end: 100 },
      originalText: '',
      suggestedText: '补充说明：',
      reason: '添加必要的连接词，改善句子结构',
      confidence: 0.75
    })
  }
  
  return suggestions
}

const clearChatHistory = () => {
  chatMessages.value = []
  conversationId.value = null // 清空会话 ID
  references.value = [] // 清空引用
  
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
    
    // 转换消息格式，从后端加载历史消息
    if (response.messages && Array.isArray(response.messages)) {
      chatMessages.value = response.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.createdAt)
      }))
      console.log(`加载了 ${chatMessages.value.length} 条历史消息`)
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
    // 即使加载失败，也设置当前会话ID，以便继续对话
    currentSessionId.value = sessionId
    agentSessionId.value = sessionId
    chatMessages.value = []
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
const showDocumentSelector = () => {
  console.log('打开文档选择器')
  // TODO: 实现文档选择器对话框
  alert('文档选择器功能待实现')
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
  return formatMarkdownToHtml(content)
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

// 模式切换方法
const switchMode = (mode) => {
  if (currentMode.value === mode) return
  
  currentMode.value = mode
  
  // 切换到编辑模式时，清空之前的编辑建议
  if (mode === 'edit') {
    editSuggestions.value = []
    emit('reject-edit-suggestion', []) // 清除编辑器中的建议显示
  }
  

  
  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}

// 监听文档内容变化，清空聊天历史（可选）
watch(() => props.documentContent, () => {
  // 当文档内容变化时，可以选择是否清空聊天历史
  // clearChatHistory()
})

// 监听添加引用事件
onMounted(() => {
  window.addEventListener('add-reference-to-chat', handleAddReferenceToChat)
})

// 组件卸载时关闭WebSocket连接
onUnmounted(() => {
  window.removeEventListener('add-reference-to-chat', handleAddReferenceToChat)
  
  // 关闭智能体WebSocket连接
  if (agentWebSocket.value) {
    agentWebSocket.value.close()
    agentWebSocket.value = null
  }
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
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-avatar {
  flex-shrink: 0;
  margin-top: 4px;
}

.user-avatar {
  width: 24px;
  height: 24px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.ai-avatar-small {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
}

.user-message .message-text {
  background: #409eff;
  color: white;
  margin-left: auto;
  max-width: 80%;
}

.ai-message .message-text {
  background: white;
  border: 1px solid #e4e7ed;
}

.message-time {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  text-align: right;
}

.user-message .message-time {
  text-align: right;
}

.ai-message .message-time {
  text-align: left;
}

.message-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.ai-message:hover .message-actions {
  opacity: 1;
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

/* 正在输入指示器 */
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
}

.add-context-btn:hover {
  background: #f5f7fa;
  color: #409eff;
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

/* Markdown 样式 */
.ai-message .message-text :deep(h1) {
  font-size: 20px;
  font-weight: 600;
  margin: 12px 0 8px 0;
  color: #303133;
}

.ai-message .message-text :deep(h2) {
  font-size: 18px;
  font-weight: 600;
  margin: 10px 0 6px 0;
  color: #303133;
}

.ai-message .message-text :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  margin: 8px 0 4px 0;
  color: #303133;
}

.ai-message .message-text :deep(p) {
  margin: 8px 0;
  line-height: 1.6;
}

.ai-message .message-text :deep(ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.ai-message .message-text :deep(li) {
  margin: 4px 0;
  line-height: 1.5;
}

.ai-message .message-text :deep(strong) {
  font-weight: 600;
  color: #303133;
}

.ai-message .message-text :deep(em) {
  font-style: italic;
}

.ai-message .message-text :deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #e83e8c;
}

.ai-message .message-text :deep(blockquote) {
  border-left: 3px solid #e4e7ed;
  padding-left: 12px;
  margin: 8px 0;
  color: #606266;
  font-style: italic;
}

.ai-message .message-text :deep(hr) {
  border: none;
  border-top: 1px solid #e4e7ed;
  margin: 12px 0;
}

.ai-message .message-text :deep(pre) {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.ai-message .message-text :deep(pre code) {
  background: none;
  padding: 0;
  color: #303133;
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
</style>
