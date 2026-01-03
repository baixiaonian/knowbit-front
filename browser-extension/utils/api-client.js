// API客户端 - 与后端接口通信
const API_BASE_URL = 'https://api.knowbit.cn/api';
const AUTH_BASE_URL = 'https://api.knowbit.cn/auth';

class APIClient {
  constructor() {
    this.token = null;
    this.userInfo = null;
  }

  // 从storage中获取token
  async getToken() {
    if (this.token) return this.token;
    
    const result = await chrome.storage.local.get('auth_token');
    this.token = result.auth_token || null;
    return this.token;
  }

  // 设置token和用户信息
  async setToken(token, userInfo = null) {
    this.token = token;
    await chrome.storage.local.set({ auth_token: token });
    
    if (userInfo) {
      this.userInfo = userInfo;
      await chrome.storage.local.set({ user_info: JSON.stringify(userInfo) });
    }
  }

  // 清除token和用户信息
  async clearToken() {
    this.token = null;
    this.userInfo = null;
    await chrome.storage.local.remove(['auth_token', 'user_info']);
  }

  // 微信登录验证
  async wechatVerify(code) {
    try {
      const response = await fetch(`${AUTH_BASE_URL}/wechat/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      
      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // 验证成功后保存token和用户信息
      if (data.code === 200 && data.data && data.data.token) {
        await this.setToken(data.data.token, data.data.user);
      }
      
      return data;
    } catch (error) {
      console.error('Wechat verify error:', error);
      throw error;
    }
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

  // 抓取网页内容
  async scrapeWebPage(url, formats = ['markdown', 'html']) {
    return await this.request('/scraper/scrape', {
      method: 'POST',
      body: {
        url: url,
        formats: formats
      }
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
