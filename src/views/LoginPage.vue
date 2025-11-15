<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo和标题 -->
      <div class="login-header">
        <div class="logo">
          <img src="/knowbit_logo.png" alt="KnowBit Logo" class="logo-image" />
        </div>
        <h1>知 粒</h1>
        <p class="subtitle">www.knowbit.cn</p>
      </div>

      <!-- 登录表单 -->
      <div class="login-form">
        <!-- 公众号二维码提示 -->
        <div class="qr-code-section">
          <div class="qr-code-container">
            <img 
              src="/wechat_login.jpg" 
              alt="微信公众号二维码"
              class="qr-code-image"
            />
          </div>
          <p class="instruction">
            <strong>请关注公众号【白小年1999】</strong>
          </p>
          <p class="hint">
            在公众号内发送 <span class="code">666</span> 获取登录验证码
          </p>
        </div>

        <!-- 验证码输入框 -->
        <div class="form-group">
          <label for="code">验证码</label>
          <input
            id="code"
            v-model="verificationCode"
            type="text"
            maxlength="6"
            placeholder="请输入6位验证码"
            class="code-input"
            @keyup.enter="handleLogin"
            :disabled="isLoading"
          />
        </div>

        <!-- 登录按钮 -->
        <button
          @click="handleLogin"
          class="login-btn"
          :disabled="isLoading || verificationCode.length !== 6"
        >
          <span v-if="!isLoading">登录</span>
          <span v-else class="loading">
            <span class="spinner"></span>
            验证中...
          </span>
        </button>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {{ errorMessage }}
        </div>
      </div>

      <!-- 底部说明 -->
      <div class="footer-note">
        <p>验证码有效期为1分钟</p>
        <p class="small">未注册用户将自动创建账号</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authAPI } from '../services/api.js'

// 验证码输入
const verificationCode = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// 登录处理
const handleLogin = async () => {
  if (verificationCode.value.length !== 6) {
    errorMessage.value = '请输入6位验证码'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    console.log('Verifying code:', verificationCode.value)
    const response = await authAPI.wechatVerify(verificationCode.value)
    
    console.log('Login response:', response)
    
    if (response.code === 200) {
      // 登录成功，通知父组件
      console.log('Login successful, user info:', response.data.user)
      emit('login-success', response.data)
    } else {
      errorMessage.value = response.message || '验证失败，请重试'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.message || '验证码无效或已过期'
  } finally {
    isLoading.value = false
  }
}

// 定义事件
const emit = defineEmits(['login-success'])

// 自动聚焦输入框
onMounted(() => {
  document.getElementById('code')?.focus()
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  width: 100%;
  max-width: 450px;
  padding: 40px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #6b7280;
}

.login-form {
  margin-bottom: 24px;
}

.qr-code-section {
  margin-bottom: 32px;
  padding: 24px;
  background: #fafbfc;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #f0f1f3;
}

.qr-code-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.qr-code-image {
  width: 100%;
  max-width: 320px;
  height: auto;
  aspect-ratio: 1;
  border-radius: 8px;
  object-fit: cover;
}

.instruction {
  font-size: 16px;
  color: #1f2937;
  margin-bottom: 8px;
}

.instruction strong {
  color: #667eea;
}

.hint {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.code {
  display: inline-block;
  padding: 2px 8px;
  background: #e5e7eb;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #1f2937;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.code-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 8px;
  text-align: center;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: 'Courier New', monospace;
}

.code-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.code-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
}

.error-message svg {
  flex-shrink: 0;
}

.footer-note {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.footer-note p {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0;
}

.footer-note .small {
  font-size: 12px;
  color: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .login-container {
    padding: 32px 24px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .qr-code-section {
    padding: 20px;
  }

  .qr-code-container {
    margin-bottom: 16px;
    padding: 12px;
  }

  .qr-code-image {
    max-width: 240px;
  }

  .code-input {
    font-size: 20px;
    letter-spacing: 6px;
  }
}
</style>

