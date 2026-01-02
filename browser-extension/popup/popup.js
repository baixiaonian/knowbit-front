// Popup逻辑处理
let currentPageInfo = {
  title: '',
  url: ''
};

let selectedFolderId = null;
let knowledgeBase = null;

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
  // 登录按钮
  document.getElementById('login-btn').addEventListener('click', handleLogin);
  
  // 收藏按钮
  document.getElementById('collect-btn').addEventListener('click', handleCollect);
  
  // 退出登录按钮
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  
  // Token输入框回车
  document.getElementById('token-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });
}

// 处理登录
async function handleLogin() {
  const tokenInput = document.getElementById('token-input');
  const token = tokenInput.value.trim();
  
  if (!token) {
    alert('请输入Token');
    return;
  }
  
  try {
    await apiClient.setToken(token);
    
    // 测试token是否有效
    await apiClient.getKnowledgeBase();
    
    // 登录成功
    showLoggedInView();
    await loadKnowledgeBase();
  } catch (error) {
    alert('登录失败: ' + error.message);
    await apiClient.clearToken();
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
    // 构造文档内容
    const content = `# ${currentPageInfo.title}

**原文链接**: [${currentPageInfo.url}](${currentPageInfo.url})

**收藏时间**: ${new Date().toLocaleString('zh-CN')}

---

`;
    
    // 创建文档
    const documentData = {
      title: currentPageInfo.title,
      content: content,
      folderId: selectedFolderId,
      status: 1, // 草稿状态
      reservedField1: currentPageInfo.url // 保存原文链接
    };
    
    const response = await apiClient.createDocument(documentData);
    
    if (response.code === 200) {
      showStatus('收藏成功！', 'success');
      
      // 3秒后关闭弹窗
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
    document.getElementById('token-input').value = '';
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
