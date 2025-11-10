<template>
  <div class="ai-chat">
    <!-- 面板头部 -->
    <div class="panel-header">
      <div class="header-left">
        <div class="ai-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="header-info">
          <h3>AI助手</h3>
          <span class="status-indicator" :class="{ 'online': aiStatus === 'online', 'typing': aiStatus === 'typing' }">
            {{ aiStatus === 'online' ? '在线' : aiStatus === 'typing' ? '正在输入...' : '离线' }}
          </span>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="clearChatHistory" title="清空对话" :disabled="chatMessages.length === 0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
        <button class="action-btn" @click="closeChat" title="关闭">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
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

    <!-- 模式选择器 -->
    <div class="mode-selector">
      <div class="mode-tabs">
        <button 
          class="mode-tab" 
          :class="{ active: currentMode === 'chat' }"
          @click="switchMode('chat')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          对话模式
        </button>
        <button 
          class="mode-tab" 
          :class="{ active: currentMode === 'edit' }"
          @click="switchMode('edit')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
          编辑模式
        </button>
      </div>
      <div class="mode-description">
        <span v-if="currentMode === 'chat'" class="mode-hint">
          💬 提供修改建议，不会直接修改文档内容
        </span>
        <span v-else class="mode-hint">
          ✏️ 直接在编辑器中显示修改建议，可选择接受或拒绝
        </span>
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
      <div class="input-container">
        <div class="input-wrapper">
          <textarea
            ref="messageInput"
            v-model="currentMessage"
            class="message-input"
            :placeholder="currentMode === 'chat' ? '询问文档问题或请求修改建议...' : '描述您想要的文档修改...'"
            @keydown="handleInputKeydown"
            @input="handleInputChange"
            :disabled="aiStatus === 'typing'"
          ></textarea>
          <div class="input-actions">
            <button 
              class="send-btn" 
              @click="sendMessage" 
              :disabled="!currentMessage.trim() || aiStatus === 'typing'"
              :class="{ 'can-send': currentMessage.trim() && aiStatus !== 'typing' }"
            >
              <svg v-if="aiStatus !== 'typing'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
              <div v-else class="loading-spinner small"></div>
            </button>
          </div>
        </div>
      </div>
      <div class="input-footer">
        <div class="input-info">
          <span class="char-count">{{ currentMessage.length }}/2000</span>
        </div>
        <div class="input-shortcuts">
          <span class="shortcut">Enter 发送</span>
          <span class="shortcut">Shift+Enter 换行</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { aiAPI } from '../services/api.js'
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
const emit = defineEmits(['close', 'insert-content', 'apply-edit-suggestion', 'reject-edit-suggestion'])

// AI聊天相关数据
const aiStatus = ref('online') // 'online', 'typing', 'offline'
const chatMessages = ref([])
const currentMessage = ref('')
const messageInput = ref(null)
const chatContainer = ref(null)
const conversationId = ref(null) // 会话ID，用于多轮对话

// 模式选择相关数据
const currentMode = ref('chat') // 'chat' 或 'edit'
const editSuggestions = ref([]) // 编辑模式的建议列表

// 引用管理相关数据
const references = ref([]) // 引用文本列表

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
    // 调用真实AI问答API
    await callAiChatAPI(messageText)
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

// 调用AI问答流式API
const callAiChatAPI = (question) => {
  console.log('调用AI问答API，问题:', question)
  
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
  
  // 调用流式API
  aiAPI.aiChatStream(
    question,
    conversationId.value, // conversationId
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
      // 保存会话ID
      if (usage.conversationId) {
        conversationId.value = usage.conversationId
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
      return `## 文档总结\n\n根据文档内容，我为您总结如下：\n\n> ${documentText.substring(0, 200)}${documentText.length > 200 ? '...' : ''}\n\n### 主要内容\n\n这是文档的主要内容的简要概括。如需更详细的分析，请提供更多具体信息。\n\n### 建议改进\n\n- 可以添加更多具体例子\n- 建议优化段落结构\n- 考虑添加图表说明`
    } else {
      return '当前文档内容为空，无法进行总结。请先添加文档内容，然后我可以帮您分析总结。'
    }
  } else if (userMessage.includes('改进') || userMessage.includes('表述')) {
    return `## 文档改进建议\n\n### 当前问题\n\n根据您的描述，我发现了以下可以改进的地方：\n\n1. **语言表达**：部分句子可以更加简洁明了\n2. **逻辑结构**：建议重新组织段落顺序\n3. **内容完整性**：某些部分需要补充更多细节\n\n### 具体建议\n\n\`\`\`markdown\n# 建议的改进版本\n\n这里是改进后的内容示例...\n\n## 主要变化\n\n- 优化了开头段落\n- 增加了过渡语句\n- 完善了结论部分\n\`\`\`\n\n您可以将这些建议复制到文档中进行修改。`
  } else if (userMessage.includes('语法') || userMessage.includes('错误')) {
    return `## 语法检查结果\n\n### 发现的问题\n\n1. **标点符号使用**：建议统一使用中文标点\n2. **句式结构**：部分长句可以拆分\n3. **用词准确性**：某些词汇可以更加精确\n\n### 修改建议\n\n\`\`\`diff\n- 原文：这是一个很长的句子，包含了很多信息，但是可能不够清晰。\n+ 修改：这是一个包含重要信息的句子。为了确保清晰度，建议将其拆分为两个部分。\n\`\`\`\n\n### 语法要点\n\n- 注意主谓宾的一致性\n- 避免过度使用被动语态\n- 保持时态的一致性`
  } else {
    return `## AI助手回复\n\n我理解您的问题："${userMessage}"\n\n### 我可以帮助您\n\n- 📝 **总结和分析**文档内容\n- ✏️ **改进文字表述**和语言风格\n- ✅ **检查语法错误**和拼写\n- 💡 **提供写作建议**和灵感\n- ❓ **回答关于文档内容**的问题\n\n### 在其他模式中\n\n- **对话模式**：提供详细的markdown格式建议\n- **编辑模式**：直接在编辑器中显示修改建议\n\n请告诉我您具体需要什么帮助，我会尽力协助您！`
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
  conversationId.value = null // 清空会话ID
  references.value = [] // 清空引用
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

onUnmounted(() => {
  window.removeEventListener('add-reference-to-chat', handleAddReferenceToChat)
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

/* 面板头部 */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.status-indicator {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.status-indicator.online {
  color: #67c23a;
}

.status-indicator.typing {
  color: #409eff;
}

.header-actions {
  display: flex;
  gap: 8px;
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

/* 模式选择器 */
.mode-selector {
  border-top: 1px solid #e4e7ed;
  background: #fafafa;
  flex-shrink: 0;
}

.mode-tabs {
  display: flex;
  padding: 12px 16px 8px 16px;
  gap: 8px;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: white;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tab:hover {
  background: #f5f7fa;
  border-color: #c0c4cc;
}

.mode-tab.active {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

.mode-description {
  padding: 4px 16px 12px 16px;
}

.mode-hint {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 4px;
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
  background: white;
  flex-shrink: 0;
}

.input-container {
  padding: 16px;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 8px;
  background: #fafafa;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: #409eff;
  background: white;
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
  min-height: 20px;
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

.input-actions {
  display: flex;
  align-items: center;
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

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  font-size: 11px;
  color: #909399;
  border-top: 1px solid #f0f0f0;
}

.input-info {
  display: flex;
  gap: 12px;
}

.char-count {
  color: #c0c4cc;
}

.input-shortcuts {
  display: flex;
  gap: 12px;
}

.shortcut {
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
</style>
