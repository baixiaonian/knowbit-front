// Popup逻辑处理
let currentPageInfo = {
  title: '',
  url: ''
};

let selectedFolderId = null;
let knowledgeBase = null;
let verificationCode = ''; // 验证码

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded');
  
  // 获取当前页面信息
  await getCurrentPageInfo();
  
  // 检查登录状态
  const isLoggedIn = await apiClient.checkAuth();
  
  if (isLoggedIn) {
    showLoggedInView();
    await loadKnowledgeBase();
  } else {
    showNotLoggedInView();
  }
  
  // 绑定事件
  bindEvents();
});

// 获取当前页面信息
async function getCurrentPageInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      currentPageInfo.title = tab.title || '未命名网页';
      currentPageInfo.url = tab.url || '';
      
      // 更新显示
      document.getElementById('page-title').textContent = currentPageInfo.title;
      document.getElementById('page-url').textContent = new URL(currentPageInfo.url).hostname;
    }
  } catch (error) {
    console.error('获取页面信息失败:', error);
  }
}

// 显示未登录视图
function showNotLoggedInView() {
  document.getElementById('not-logged-in').style.display = 'block';
  document.getElementById('logged-in').style.display = 'none';
}

// 显示已登录视图
function showLoggedInView() {
  document.getElementById('not-logged-in').style.display = 'none';
  document.getElementById('logged-in').style.display = 'block';
}

// 加载知识库结构
async function loadKnowledgeBase() {
  const folderTree = document.getElementById('folder-tree');
  folderTree.innerHTML = '<div class="loading">加载中...</div>';
  
  try {
    const response = await apiClient.getKnowledgeBase();
    
    if (response.code === 200 && response.data) {
      knowledgeBase = response.data;
      renderFolderTree(response.data);
    } else {
      folderTree.innerHTML = '<div class="loading">加载失败</div>';
    }
  } catch (error) {
    console.error('加载知识库失败:', error);
    folderTree.innerHTML = `<div class="loading" style="color: #f56c6c;">${error.message}</div>`;
  }
}

// 渲染文件夹树
function renderFolderTree(folders) {
  const folderTree = document.getElementById('folder-tree');
  folderTree.innerHTML = '';
  
  if (!folders || folders.length === 0) {
    folderTree.innerHTML = '<div class="loading">暂无文件夹</div>';
    return;
  }
  
  // 递归渲染文件夹
  function renderFolder(folder, level = 0) {
    if (folder.type !== 'folder') return null;
    
    const folderItem = document.createElement('div');
    folderItem.className = 'folder-item';
    if (level > 0) folderItem.classList.add('child');
    folderItem.dataset.folderId = folder.id;
    folderItem.style.paddingLeft = (level * 16 + 8) + 'px';
    
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = '📁';
    
    const name = document.createElement('span');
    name.textContent = folder.name;
    
    folderItem.appendChild(icon);
    folderItem.appendChild(name);
    
    // 点击选择文件夹
    folderItem.addEventListener('click', (e) => {
      e.stopPropagation();
      selectFolder(folder.id);
    });
    
    folderTree.appendChild(folderItem);
    
    // 递归渲染子文件夹
    if (folder.children && folder.children.length > 0) {
      folder.children.forEach(child => {
        renderFolder(child, level + 1);
      });
    }
  }
  
  folders.forEach(folder => renderFolder(folder));
}

// 选择文件夹
function selectFolder(folderId) {
  selectedFolderId = folderId;
  
  // 更新选中状态
  document.querySelectorAll('.folder-item').forEach(item => {
    if (item.dataset.folderId === folderId.toString()) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  
  // 启用收藏按钮
  document.getElementById('collect-btn').disabled = false;
}

// 绑定事件
function bindEvents() {
  // 验证码输入框
  const codeInput = document.getElementById('verification-code');
  if (codeInput) {
    codeInput.addEventListener('input', handleCodeInput);
    codeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && verificationCode.length === 6) {
        handleLogin();
      }
    });
    // 自动聚焦
    codeInput.focus();
  }
  
  // 登录按钮
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', handleLogin);
  }
  
  // 收藏按钮
  const collectBtn = document.getElementById('collect-btn');
  if (collectBtn) {
    collectBtn.addEventListener('click', handleCollect);
  }
  
  // 退出登录按钮
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
}

// 处理验证码输入
function handleCodeInput(e) {
  const input = e.target;
  verificationCode = input.value.trim();
  
  // 启用/禁用登录按钮
  const loginBtn = document.getElementById('login-btn');
  loginBtn.disabled = verificationCode.length !== 6;
  
  // 清除错误消息
  hideError();
}

// 显示错误消息
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }
}

// 隐藏错误消息
function hideError() {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

// 处理登录
async function handleLogin() {
  if (verificationCode.length !== 6) {
    showError('请输入6位验证码');
    return;
  }
  
  const loginBtn = document.getElementById('login-btn');
  const btnText = loginBtn.querySelector('.btn-text');
  const btnLoading = loginBtn.querySelector('.btn-loading');
  
  // 禁用按钮，显示加载状态
  loginBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline-block';
  hideError();
  
  try {
    console.log('Verifying code:', verificationCode);
    const response = await apiClient.wechatVerify(verificationCode);
    
    console.log('Login response:', response);
    
    if (response.code === 200) {
      // 登录成功
      console.log('Login successful, user info:', response.data.user);
      showLoggedInView();
      await loadKnowledgeBase();
    } else {
      showError(response.message || '验证失败，请重试');
    }
  } catch (error) {
    console.error('Login error:', error);
    showError(error.message || '验证码无效或已过期');
  } finally {
    // 恢复按钮状态
    loginBtn.disabled = verificationCode.length !== 6;
    btnText.style.display = 'inline-block';
    btnLoading.style.display = 'none';
  }
}

// 处理收藏
async function handleCollect() {
  if (!selectedFolderId) {
    showStatus('请选择文件夹', 'error');
    return;
  }
  
  const collectBtn = document.getElementById('collect-btn');
  const btnText = collectBtn.querySelector('.btn-text');
  const btnLoading = collectBtn.querySelector('.btn-loading');
  
  // 禁用按钮，显示加载状态
  collectBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline-block';
  
  try {
    // 显示进度提示
    showStatus('正在解析网页内容...', 'info');
    
    // 调用网页解析接口获取纯净内容（使用HTML格式，适配tiptap编辑器）
    let articleContent = '';
    let metadata = null;
    
    try {
      const scrapeResponse = await apiClient.scrapeWebPage(currentPageInfo.url, ['html']);
      
      if (scrapeResponse.success && scrapeResponse.data) {
        articleContent = scrapeResponse.data.html || '';
        metadata = scrapeResponse.data.metadata || null;
        console.log('网页解析成功:', metadata);
      } else {
        console.warn('网页解析失败:', scrapeResponse.error);
        showStatus('网页解析失败，将仅保存链接', 'warning');
      }
    } catch (scrapeError) {
      console.error('网页解析异常:', scrapeError);
      showStatus('网页解析失败，将仅保存链接', 'warning');
    }
    
    // 更新进度提示
    showStatus('正在创建文档...', 'info');
    
    // 构造文档内容（使用HTML格式，适配tiptap编辑器）
    let content = '';
    
    // 如果有解析到的内容，使用解析结果
    if (articleContent) {
      // 使用解析的元数据作为文档标题（如果有）
      const docTitle = metadata?.title || currentPageInfo.title;
      
      // 构建HTML格式的文档内容
      content = `<h1>${docTitle}</h1>`;
      
      // 添加元信息
      content += `<p><strong>原文链接</strong>: <a href="${currentPageInfo.url}" target="_blank">${currentPageInfo.url}</a></p>`;
      
      if (metadata?.description) {
        content += `<p><strong>摘要</strong>: ${metadata.description}</p>`;
      }
      
      if (metadata?.keywords) {
        content += `<p><strong>关键词</strong>: ${metadata.keywords}</p>`;
      }
      
      content += `<p><strong>收藏时间</strong>: ${new Date().toLocaleString('zh-CN')}</p>`;
      content += `<hr>`;
      
      // 添加文章内容（已经是HTML格式）
      content += articleContent;
    } else {
      // 如果解析失败，使用原来的简单格式（HTML格式）
      content = `<h1>${currentPageInfo.title}</h1><p><strong>原文链接</strong>: <a href="${currentPageInfo.url}" target="_blank">${currentPageInfo.url}</a></p><p><strong>收藏时间</strong>: ${new Date().toLocaleString('zh-CN')}</p><hr>`;
    }
    
    // 创建文档
    const documentData = {
      title: metadata?.title || currentPageInfo.title,
      content: content,
      folderId: selectedFolderId,
      status: 1, // 草稿状态
      reservedField1: currentPageInfo.url // 保存原文链接
    };
    
    const response = await apiClient.createDocument(documentData);
    
    if (response.code === 200) {
      showStatus('收藏成功！', 'success');
      
      // 2秒后关闭弹窗
      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      showStatus('收藏失败: ' + (response.message || '未知错误'), 'error');
    }
  } catch (error) {
    console.error('收藏失败:', error);
    showStatus('收藏失败: ' + error.message, 'error');
  } finally {
    // 恢复按钮状态
    collectBtn.disabled = false;
    btnText.style.display = 'inline-block';
    btnLoading.style.display = 'none';
  }
}

// 处理退出登录
async function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    await apiClient.clearToken();
    selectedFolderId = null;
    knowledgeBase = null;
    verificationCode = '';
    
    // 重置验证码输入框
    const codeInput = document.getElementById('verification-code');
    if (codeInput) {
      codeInput.value = '';
    }
    
    showNotLoggedInView();
  }
}

// 显示状态消息
function showStatus(message, type = 'success') {
  const statusMessage = document.getElementById('status-message');
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';
  
  // 3秒后隐藏
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 3000);
}
