// Service Worker - 后台服务
console.log('Service Worker 已加载');

// 监听插件安装
chrome.runtime.onInstalled.addListener((details) => {
  console.log('插件已安装', details);
  
  if (details.reason === 'install') {
    // 首次安装时的初始化
    console.log('首次安装AI笔记收藏助手');
  } else if (details.reason === 'update') {
    // 更新时的处理
    console.log('插件已更新');
  }
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);
  
  if (request.action === 'getCurrentPageInfo') {
    // 获取当前页面信息
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({
          title: tabs[0].title,
          url: tabs[0].url
        });
      }
    });
    return true; // 保持消息通道打开
  }
});

// 监听标签页更新
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('页面加载完成:', tab.url);
  }
});
