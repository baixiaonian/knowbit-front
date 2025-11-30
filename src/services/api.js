// API服务 - 基于后端接口协议
import { ref } from 'vue'

// 后端API基础URL
const API_BASE_URL = 'https://api.knowbit.cn/api'

// API配置信息

// 获取认证token
const getAuthToken = () => {
  // 从localStorage获取token，如果没有则返回空字符串
  const token = localStorage.getItem('auth_token')
  return token || ''
}

// 获取当前用户ID（从后端登录返回的用户信息中读取）
const getCurrentUserId = () => {
  const userInfo = localStorage.getItem('user_info')
  if (!userInfo) {
    return null
  }

  try {
    const parsed = JSON.parse(userInfo)
    return parsed?.id ?? null
  } catch (error) {
    console.warn('无法解析 user_info，使用空用户ID', error)
    return null
  }
}

// 通用请求方法
const request = async (url, options = {}) => {
  const token = getAuthToken()
  
  const config = {
    method: options.method || 'GET',
    headers: {
      ...options.headers
    }
  }
  
  // 只有在有token的情况下才添加Authorization头
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  
  // 如果body是FormData，不设置Content-Type，让浏览器自动设置
  if (options.body instanceof FormData) {
    config.body = options.body
    // 删除可能的Content-Type设置
    delete config.headers['Content-Type']
  } else if (options.body) {
    // 如果是普通对象，设置Content-Type并转换为JSON
    config.headers['Content-Type'] = 'application/json'
    config.body = JSON.stringify(options.body)
  }
  
  try {
    const fullUrl = `${API_BASE_URL}${url}`
    console.log(`API Request: ${config.method} ${fullUrl}`, config)
    
    const response = await fetch(fullUrl, config)
    
    // 检查响应状态
    if (!response.ok) {
      // 如果是401未授权错误，说明token过期或无效
      if (response.status === 401) {
        console.warn('Token已过期或无效，清除认证信息并跳转到登录页')
        // 清除本地存储的认证信息
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_info')
        // 跳转到登录页
        window.location.href = '/login'
        // 抛出错误，终止后续操作
        throw new Error('登录已过期，请重新登录')
      }
      
      const errorData = await response.json().catch(() => ({
        code: response.status,
        message: response.statusText
      }))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`API Response: ${config.method} ${fullUrl}`, data)
    
    return data
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

// 用户认证相关API
export const authAPI = {
  // 微信登录验证码验证
  wechatVerify: async (code) => {
    try {
      // 登录接口需要使用不带/api前缀的路径
      const response = await fetch('https://api.knowbit.cn/auth/wechat/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      })
      
      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // 验证成功后保存token
      if (data.code === 200 && data.data && data.data.token) {
        localStorage.setItem('auth_token', data.data.token)
        localStorage.setItem('user_info', JSON.stringify(data.data.user))
      }
      
      return data
    } catch (error) {
      console.error('Wechat verify error:', error)
      throw error
    }
  },
  
  // 登出
  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
  }
}

// 知识库管理API
export const knowledgeBaseAPI = {
  // 获取知识库结构
  getKnowledgeBase: async () => {
    return await request('/knowledge-base', {
      method: 'GET'
    })
  }
}

// 文件夹管理API
export const foldersAPI = {
  // 创建文件夹
  createFolder: async (folderData) => {
    return await request('/folders', {
      method: 'POST',
      body: folderData
    })
  },
  
  // 重命名文件夹
  renameFolder: async (folderId, name) => {
    return await request(`/folders/${folderId}/rename`, {
      method: 'PUT',
      body: { name }
    })
  },
  
  // 删除文件夹
  deleteFolder: async (folderId) => {
    return await request(`/folders/${folderId}`, {
      method: 'DELETE'
    })
  },
  
  // 移动文件夹
  moveFolder: async (folderId, parentId) => {
    return await request(`/folders/${folderId}/move`, {
      method: 'PUT',
      body: { parentId }
    })
  }
}

// 文档管理API
export const documentsAPI = {
  // 创建文档
  createDocument: async (documentData) => {
    return await request('/documents', {
      method: 'POST',
      body: documentData
    })
  },
  
  // 获取文档详情
  getDocument: async (documentId) => {
    return await request(`/documents/${documentId}`, {
      method: 'GET'
    })
  },
  
  // 更新文档
  updateDocument: async (documentId, documentData) => {
    return await request(`/documents/${documentId}`, {
      method: 'PUT',
      body: documentData
    })
  },
  
  // 自动保存文档
  autosaveDocument: async (documentId, content, excerpt) => {
    return await request(`/documents/${documentId}/autosave`, {
      method: 'POST',
      body: { content, excerpt }
    })
  },
  
  // 删除文档
  deleteDocument: async (documentId) => {
    return await request(`/documents/${documentId}`, {
      method: 'DELETE'
    })
  },
  
  // 获取文档列表
  getDocuments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await request(`/documents?${queryString}`, {
      method: 'GET'
    })
  },
  
  // 获取最近编辑文档
  getRecentDocuments: async (limit = 10) => {
    const response = await request(`/documents/recent?limit=${limit}`)
    
    return {
      code: 200,
      data: [
        {
          id: 101,
          title: '最近编辑的文档',
          content: '文档内容预览...',
          updatedAt: new Date().toISOString(),
          category: '工作文档',
          viewCount: 5
        }
      ]
    }
  },
  
  // 获取AI推荐文章
  getRecommendedDocuments: async (limit = 10) => {
    const response = await request(`/documents/recommended?limit=${limit}`)
    
    return {
      code: 200,
      data: [
        {
          id: 102,
          title: 'AI推荐的文档',
          content: '推荐文档内容...',
          category: '学习笔记',
          viewCount: 10,
          reason: '基于您的阅读习惯推荐'
        }
      ]
    }
  }
}

// 分类管理API
export const categoriesAPI = {
  // 获取分类列表
  getCategories: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return await request(`/categories?${queryString}`, {
      method: 'GET'
    })
  },
  
  // 创建分类
  createCategory: async (categoryData) => {
    return await request('/categories', {
      method: 'POST',
      body: categoryData
    })
  },
  
  // 更新分类
  updateCategory: async (categoryId, categoryData) => {
    return await request(`/categories/${categoryId}`, {
      method: 'PUT',
      body: categoryData
    })
  },
  
  // 删除分类
  deleteCategory: async (categoryId) => {
    return await request(`/categories/${categoryId}`, {
      method: 'DELETE'
    })
  }
}

// 搜索API
export const searchAPI = {
  // AI智能搜索
  search: async (query, type = 'all', limit = 20) => {
    return await request('/search', {
      method: 'POST',
      body: { query, type, limit }
    })
  },
  
  // 搜索建议
  getSuggestions: async (query) => {
    return await request(`/search/suggestions?q=${encodeURIComponent(query)}`, {
      method: 'GET'
    })
  }
}

// AI助手API
export const aiAPI = {
  // AI对话
  chat: async (message, context, conversationId) => {
    return await request('/ai/chat', {
      method: 'POST',
      body: { message, context, conversationId }
    })
  },
  
  // AI写作辅助
  writingAssist: async (type, content, context) => {
    return await request('/ai/writing-assist', {
      method: 'POST',
      body: { type, content, context }
    })
  },

  // AI帮写流式生成
  aiHelpStream: async (prompt, documentId, context, onChunk, onDone, onError) => {
    console.log('aiAPI.aiHelpStream被调用')
    const token = getAuthToken()
    console.log('token:', token)
    
    const requestBody = {
      userId: getCurrentUserId() || undefined,
      prompt,
      documentId,
      context
    }
    console.log('请求体:', requestBody)
    
    try {
      console.log('发送请求到:', `${API_BASE_URL}/ai-help/stream`)
      console.log('请求头:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
      
      const response = await fetch(`${API_BASE_URL}/ai-help/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('收到响应:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('响应错误:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      console.log('开始读取SSE流')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let totalContent = '' // 累积所有内容

      while (true) {
        console.log('等待读取数据...')
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('SSE流读取完成')
          // 发送最终内容
          if (totalContent) {
            console.log('发送最终内容:', totalContent)
            onChunk && onChunk(totalContent)
            onDone && onDone({ tokens: totalContent.length, cost: 0.01 })
          }
          break
        }
        
        const chunk = decoder.decode(value, { stream: true })
        console.log('收到数据块:', chunk)
        buffer += chunk
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后一个不完整的行
        
        console.log('处理行数:', lines.length)
        for (const line of lines) {
          console.log('处理行:', line)
          if (line.startsWith('data: ')) {
            try {
              const dataStr = line.slice(6)
              console.log('收到数据:', dataStr)
              
              // 尝试解析为JSON
              try {
                const data = JSON.parse(dataStr)
                console.log('解析为JSON:', data)
                
                if (data.error) {
                  console.log('收到错误:', data.error)
                  onError && onError(data.error)
                  return
                }
                
                if (data.content) {
                  console.log('收到内容:', data.content)
                  totalContent += data.content
                  console.log('发送累积的内容:', totalContent)
                  onChunk && onChunk(totalContent)
                }
                
                if (data.done) {
                  console.log('流式完成:', data.usage)
                  onDone && onDone(data.usage)
                  return
                }
              } catch (jsonParseError) {
                // 如果不是JSON格式，累积到总内容中
                console.log('非JSON格式，累积内容:', dataStr)
                totalContent += dataStr
                
                // 实时发送累积的内容
                console.log('发送累积的内容:', totalContent)
                onChunk && onChunk(totalContent)
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', line, parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('AI Help Stream Error:', error)
      console.error('错误类型:', error.name)
      console.error('错误消息:', error.message)
      console.error('错误堆栈:', error.stack)
      onError && onError({ code: 'NETWORK_ERROR', message: error.message })
    }
  },

  // 局部段落AI处理流式接口
  aiTextProcessStream: async (action, originalText, userPrompt, documentId, context, onChunk, onDone, onError) => {
    console.log('aiAPI.aiTextProcessStream被调用')
    const token = getAuthToken()
    console.log('token:', token)
    
    const requestBody = {
      userId: getCurrentUserId() || undefined,
      action,
      originalText,
      documentId,
      context,
      userPrompt
    }
    console.log('请求体:', requestBody)
    
    try {
      console.log('发送请求到:', `${API_BASE_URL}/ai-text/process/stream`)
      console.log('请求头:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
      
      const response = await fetch(`${API_BASE_URL}/ai-text/process/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('收到响应:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('响应错误:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      console.log('开始读取SSE流')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let totalContent = '' // 累积所有内容

      while (true) {
        console.log('等待读取数据...')
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('SSE流读取完成')
          // 发送最终内容
          if (totalContent) {
            console.log('发送最终内容:', totalContent)
            onChunk && onChunk(totalContent)
            onDone && onDone({ tokens: totalContent.length, cost: 0.01 })
          }
          break
        }
        
        const chunk = decoder.decode(value, { stream: true })
        console.log('收到数据块:', chunk)
        buffer += chunk
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后一个不完整的行
        
        console.log('处理行数:', lines.length)
        for (const line of lines) {
          console.log('处理行:', line)
          if (line.startsWith('data: ')) {
            try {
              const dataStr = line.slice(6)
              console.log('收到数据:', dataStr)
              
              // 尝试解析为JSON
              try {
                const data = JSON.parse(dataStr)
                console.log('解析为JSON:', data)
                
                if (data.error) {
                  console.log('收到错误:', data.error)
                  onError && onError(data.error)
                  return
                }
                
                if (data.content) {
                  console.log('收到内容:', data.content)
                  totalContent += data.content
                  console.log('发送累积的内容:', totalContent)
                  onChunk && onChunk(totalContent)
                }
                
                if (data.done) {
                  console.log('流式完成:', data.usage)
                  onDone && onDone(data.usage)
                  return
                }
              } catch (jsonParseError) {
                // 如果不是JSON格式，累积到总内容中
                console.log('非JSON格式，累积内容:', dataStr)
                totalContent += dataStr
                
                // 实时发送累积的内容
                console.log('发送累积的内容:', totalContent)
                onChunk && onChunk(totalContent)
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', line, parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('AI Text Process Stream Error:', error)
      console.error('错误类型:', error.name)
      console.error('错误消息:', error.message)
      console.error('错误堆栈:', error.stack)
      onError && onError({ code: 'NETWORK_ERROR', message: error.message })
    }
  },

  // AI问答对话流式接口
  aiChatStream: async (question, conversationId, documentId, searchScope, ragEnabled, selectedDocumentIds, selectedReferences, onChunk, onDone, onError) => {
    console.log('aiAPI.aiChatStream被调用')
    const token = getAuthToken()
    console.log('token:', token)
    
    const requestBody = {
      userId: getCurrentUserId() || undefined,
      question,
      conversationId: conversationId || undefined,
      documentId: documentId || undefined,
      searchScope: searchScope || 'all',
      ragEnabled: ragEnabled !== undefined ? ragEnabled : true,
      selectedDocumentIds: selectedDocumentIds || undefined,
      selectedReferences: selectedReferences || undefined
    }
    console.log('请求体:', requestBody)
    
    try {
      console.log('发送请求到:', `${API_BASE_URL}/ai-chat/stream`)
      console.log('请求头:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
      
      const response = await fetch(`${API_BASE_URL}/ai-chat/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      console.log('收到响应:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('响应错误:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      console.log('开始读取SSE流')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let totalContent = ''
      let currentConversationId = null

      while (true) {
        console.log('等待读取数据...')
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('SSE流读取完成')
          // 发送最终内容
          if (totalContent) {
            console.log('发送最终内容:', totalContent)
            onChunk && onChunk(totalContent)
            onDone && onDone({ tokens: totalContent.length, cost: 0.01, conversationId: currentConversationId })
          }
          break
        }
        
        const chunk = decoder.decode(value, { stream: true })
        console.log('收到数据块:', chunk)
        buffer += chunk
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        console.log('处理行数:', lines.length)
        for (const line of lines) {
          console.log('处理行:', line)
          if (line.startsWith('data: ')) {
            try {
              const dataStr = line.slice(6)
              console.log('收到数据:', dataStr)
              
              try {
                const data = JSON.parse(dataStr)
                console.log('解析为JSON:', data)
                
                if (data.error) {
                  console.log('收到错误:', data.error)
                  onError && onError(data.error)
                  return
                }
                
                if (data.content) {
                  console.log('收到内容:', data.content)
                  totalContent += data.content
                  console.log('发送累积的内容:', totalContent)
                  onChunk && onChunk(totalContent)
                }
                
                if (data.done) {
                  console.log('流式完成:', data)
                  currentConversationId = data.conversationId
                  onDone && onDone({ tokens: data.usage?.tokens || totalContent.length, cost: data.usage?.cost || 0.01, conversationId: data.conversationId })
                  return
                }
              } catch (jsonParseError) {
                // 如果不是JSON格式，累积到总内容中
                console.log('非JSON格式，累积内容:', dataStr)
                totalContent += dataStr
                console.log('发送累积的内容:', totalContent)
                onChunk && onChunk(totalContent)
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', line, parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('AI Chat Stream Error:', error)
      console.error('错误类型:', error.name)
      console.error('错误消息:', error.message)
      console.error('错误堆栈:', error.stack)
      onError && onError({ code: 'NETWORK_ERROR', message: error.message })
    }
  }
}

// 文件上传API
export const uploadAPI = {
  // 图片上传
  uploadImage: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return await request('/upload/image', {
      method: 'POST',
      headers: {
        // 不设置Content-Type，让浏览器自动设置multipart/form-data
      },
      body: formData
    })
  },
  
  // 附件上传
  uploadAttachment: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return await request('/upload/attachment', {
      method: 'POST',
      headers: {},
      body: formData
    })
  }
}

// 智能体API
export const agentAPI = {
  // 调用写作智能体
  executeWriter: async (userPrompt, documentId, sessionId, selectedDocumentIds, targetSelection) => {
    const requestBody = {
      userPrompt,
      documentId: documentId || undefined,
      sessionId: sessionId || undefined,
      selectedDocumentIds: selectedDocumentIds || undefined,
      targetSelection: targetSelection || undefined
    }
    
    return await request('/agent/writer/execute', {
      method: 'POST',
      body: requestBody
    })
  },
  
  // 创建WebSocket连接订阅智能体事件
  subscribeAgentEvents: (sessionId, onMessage, onError, onClose) => {
    const token = getAuthToken()
    // 根据协议，WebSocket URL应该是 ws://{host}/api/agent/ws/{sessionId}
    // 从 API_BASE_URL 提取 host
    const wsHost = API_BASE_URL.replace('https://', '').replace('http://', '').replace('/api', '')
    const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws'
    const wsUrl = `${wsProtocol}://${wsHost}/api/agent/ws/${sessionId}`
    
    console.log('创建WebSocket连接:', wsUrl)
    
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('WebSocket连接已建立')
    }
    
    ws.onmessage = (event) => {
      console.log('WebSocket收到消息:', event.data)
      try {
        const message = JSON.parse(event.data)
        onMessage && onMessage(message)
      } catch (error) {
        console.error('解析WebSocket消息失败:', error)
        onError && onError(error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket错误:', error)
      onError && onError(error)
    }
    
    ws.onclose = () => {
      console.log('WebSocket连接已关闭')
      onClose && onClose()
    }
    
    return ws
  },
  
  // 获取历史会话列表
  getSessions: async () => {
    return await request('/agent/sessions', {
      method: 'GET'
    })
  },
  
  // 获取会话详情
  getSessionDetail: async (sessionId) => {
    return await request(`/agent/sessions/${sessionId}`, {
      method: 'GET'
    })
  },
  
  // 删除会话
  deleteSession: async (sessionId) => {
    return await request(`/agent/sessions/${sessionId}`, {
      method: 'DELETE'
    })
  },
  
  // 更新会话标题
  updateSessionTitle: async (sessionId, title) => {
    return await request(`/agent/sessions/${sessionId}/title`, {
      method: 'PUT',
      body: { title }
    })
  }
}

// 导出所有API
export default {
  auth: authAPI,
  knowledgeBase: knowledgeBaseAPI,
  folders: foldersAPI,
  documents: documentsAPI,
  categories: categoriesAPI,
  search: searchAPI,
  ai: aiAPI,
  upload: uploadAPI,
  agent: agentAPI
}
