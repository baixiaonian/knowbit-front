<template>
  <div class="search-toolbar">
    <div class="search-bar">
      <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input 
        type="text" 
        placeholder="AI 搜索文档、知识库..." 
        v-model="searchQuery"
        @input="handleSearch"
        @keydown.enter="handleSearchEnter"
      />
    </div>
    
    <div class="toolbar-actions">
      <div class="user-menu" ref="userMenuRef">
        <button class="user-avatar" @click.stop="toggleUserMenu" :title="userTooltip">
          <img v-if="userAvatar" :src="userAvatar" alt="user avatar" />
          <span v-else>{{ userInitial }}</span>
        </button>
        <transition name="fade">
          <div class="user-dropdown" v-if="isUserMenuOpen">
            <div class="user-info" v-if="userName || userEmail">
              <div class="name">{{ userName || '未命名用户' }}</div>
              <div class="email" v-if="userEmail">{{ userEmail }}</div>
            </div>
            <button class="dropdown-item" @click="handlePersonalCenterClick">个人中心</button>
            <button class="dropdown-item logout" @click="handleLogoutClick">退出登录</button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
})

// 响应式数据
const searchQuery = ref('')
const isUserMenuOpen = ref(false)
const userMenuRef = ref(null)

// 事件定义
const emit = defineEmits(['search', 'personal-center', 'logout'])

// 搜索处理
const handleSearch = () => {
  emit('search', searchQuery.value)
}

const handleSearchEnter = () => {
  emit('search', searchQuery.value)
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const handleLogoutClick = () => {
  emit('logout')
  isUserMenuOpen.value = false
}

const handlePersonalCenterClick = () => {
  emit('personal-center')
  isUserMenuOpen.value = false
}

const userName = computed(() => props.user?.username || props.user?.name || '')
const userEmail = computed(() => props.user?.email || props.user?.phone || '')
const userAvatar = computed(() => props.user?.avatar || props.user?.avatarUrl || '')
const userInitial = computed(() => {
  if (props.user?.username) {
    return props.user.username.charAt(0).toUpperCase()
  }
  if (props.user?.name) {
    return props.user.name.charAt(0).toUpperCase()
  }
  if (props.user?.email) {
    return props.user.email.charAt(0).toUpperCase()
  }
  return 'U'
})
const userTooltip = computed(() => userName.value || userEmail.value || '用户菜单')

const handleClickOutside = (event) => {
  if (!userMenuRef.value) return
  if (!userMenuRef.value.contains(event.target)) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.search-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 12px 28px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;
  position: relative;
  z-index: 100;
}

.search-bar {
  position: relative;
  flex: 1;
  max-width: 650px;
}

.search-bar input {
  width: 100%;
  padding: 10px 16px 10px 44px;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  font-size: 15px;
  outline: none;
  transition: all 0.3s;
  background: #f5f7fa;
}

.search-bar input:focus {
  border-color: #5b8ff9;
  box-shadow: 0 0 0 3px rgba(91, 143, 249, 0.1);
  background: white;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #909399;
  width: 20px;
  height: 20px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-menu {
  position: relative;
  z-index: 200;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #eef2ff;
  color: #5b8ff9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar:hover {
  background: #dbe4ff;
  box-shadow: 0 4px 12px rgba(91, 143, 249, 0.25);
}

.user-dropdown {
  position: absolute;
  top: 48px;
  right: 0;
  width: 200px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(91, 143, 249, 0.15);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 210;
}

.user-info {
  padding: 8px 10px;
  border-radius: 8px;
  background: #f5f7fa;
}

.user-info .name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.user-info .email {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  word-break: break-all;
}

.dropdown-item {
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #303133;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: #f0f4ff;
  color: #2b4acb;
}

.dropdown-item.logout {
  color: #f56c6c;
}

.dropdown-item.logout:hover {
  background: #fef0f0;
  color: #d53030;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-toolbar {
    padding: 14px 18px;
  }
  
  .search-bar {
    max-width: none;
  }
  
  .search-bar input {
    font-size: 14px;
    padding: 10px 16px 10px 44px;
  }

  .user-avatar {
    width: 38px;
    height: 38px;
    font-size: 15px;
  }

  .user-dropdown {
    width: 180px;
  }
}
</style>
