// API客户端 - 与后端接口通信
const API_BASE_URL = 'https://api.knowbit.cn/api';

class APIClient {
  constructor() {
    this.token = null;
  }

  // 从storage中获取token
  async getToken() {
    if (this.token) return this.token;
    
    const result = await chrome.storage.local.get('auth_token');
    this.token = result.auth_token || null;
    return this.token;
  }

  // 设置token
  async setToken(token) {
    this.token = token;
    await chrome.storage.local.set({ auth_token: token });
  }

  // 清除token
  async clearToken() {
    this.token = null;
    await chrome.storage.local.remove('auth_token');
  }

  // 通用请求方法
  async request(url, options = {}) {
    const token = await this.getToken();
    
    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // 添加token到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 添加请求体
    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const fullUrl = `${API_BASE_URL}${url}`;
      console.log(`API Request: ${config.method} ${fullUrl}`, config);
      
      const response = await fetch(fullUrl, config);
      
      // 检查响应状态
      if (!response.ok) {
        if (response.status === 401) {
          // token过期，清除本地token
          await this.clearToken();
          throw new Error('登录已过期，请重新登录');
        }
        
        const errorData = await response.json().catch(() => ({
          code: response.status,
          message: response.statusText
        }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`API Response: ${config.method} ${fullUrl}`, data);
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // 获取知识库结构
  async getKnowledgeBase() {
    return await this.request('/knowledge-base', {
      method: 'GET'
    });
  }

  // 创建文档
  async createDocument(documentData) {
    return await this.request('/documents', {
      method: 'POST',
      body: documentData
    });
  }

  // 检查登录状态
  async checkAuth() {
    const token = await this.getToken();
    return !!token;
  }
}

// 导出单例
const apiClient = new APIClient();
