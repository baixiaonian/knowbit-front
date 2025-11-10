<template>
  <div class="article-card" @click="handleClick">
    <div class="card-header">
      <h3 class="article-title">{{ article.title }}</h3>
      <button class="more-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
        </svg>
      </button>
    </div>
    
    <div class="card-meta">
      <span class="category-tag">{{ article.category }}</span>
      <span class="views">{{ formatViewCount(article.viewCount) }}</span>
      <span v-if="article.status === 1" class="status-tag draft">草稿</span>
      <span v-else-if="article.status === 2" class="status-tag published">已发布</span>
      <span v-if="article.isPublic" class="status-tag public">公开</span>
    </div>
    
    <p class="article-description">{{ article.excerpt || article.description }}</p>
    
    <div v-if="article.tags && article.tags.length > 0" class="tags">
      <span v-for="tag in article.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
      <span v-if="article.tags.length > 3" class="tag-more">+{{ article.tags.length - 3 }}</span>
    </div>
    
    <div v-if="article.reason" class="recommend-reason">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      {{ article.reason }}
    </div>
    
    <div class="card-footer">
      <div class="action-buttons">
        <button class="action-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          编辑
        </button>
        <button class="action-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          预览
        </button>
        <button class="action-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          分享
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  article: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props.article)
}

// 格式化查看次数
const formatViewCount = (count) => {
  if (!count) return '0次'
  
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k次'
  }
  
  return count + '次'
}
</script>

<style scoped>
.article-card {
  background: white;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid #f0f0f0;
}

.article-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
  border-color: #e0e0e0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.article-title {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
  line-height: 1.5;
}

.more-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: #909399;
  border-radius: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.more-btn svg {
  width: 18px;
  height: 18px;
}

.more-btn:hover {
  background: #f5f7fa;
  color: #606266;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.category-tag {
  display: inline-block;
  padding: 5px 14px;
  background: #f0f9ff;
  color: #0284c7;
  font-size: 13px;
  border-radius: 6px;
  font-weight: 500;
}

.views {
  font-size: 13px;
  color: #909399;
}

.status-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.status-tag.draft {
  background: #fef3c7;
  color: #92400e;
}

.status-tag.published {
  background: #d1fae5;
  color: #065f46;
}

.status-tag.public {
  background: #dbeafe;
  color: #1e40af;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 8px 0;
}

.tag {
  padding: 2px 6px;
  background: #f3f4f6;
  color: #374151;
  border-radius: 4px;
  font-size: 10px;
}

.tag-more {
  padding: 2px 6px;
  background: #e5e7eb;
  color: #6b7280;
  border-radius: 4px;
  font-size: 10px;
}

.recommend-reason {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 8px 0;
  padding: 4px 8px;
  background: #fef3c7;
  border-radius: 4px;
  font-size: 11px;
  color: #92400e;
}

.recommend-reason svg {
  flex-shrink: 0;
}

.article-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 18px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  background: #f5f7fa;
  border: none;
  border-radius: 7px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  stroke-width: 2;
}

.action-btn:hover {
  background: #e4e7ed;
  color: #303133;
}

.action-btn svg {
  stroke-width: 2;
  width: 16px;
  height: 16px;
}
</style> 