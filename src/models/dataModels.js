// 数据模型 - 基于后端接口协议

// 用户模型
export const createUserModel = (userData = {}) => ({
  id: userData.id || null,
  username: userData.username || '',
  email: userData.email || '',
  phone: userData.phone || '',
  phoneVerified: userData.phoneVerified || false,
  avatarUrl: userData.avatarUrl || '',
  createdAt: userData.createdAt || null,
  updatedAt: userData.updatedAt || null,
  isActive: userData.isActive !== undefined ? userData.isActive : true,
  isDeleted: userData.isDeleted !== undefined ? userData.isDeleted : false
})

// 分类模型
export const createCategoryModel = (categoryData = {}) => ({
  id: categoryData.id || null,
  name: categoryData.name || '',
  parentId: categoryData.parentId || null,
  slug: categoryData.slug || '',
  createdAt: categoryData.createdAt || null,
  reservedField1: categoryData.reservedField1 || '',
  reservedField2: categoryData.reservedField2 || '',
  reservedField3: categoryData.reservedField3 || ''
})

// 文件夹模型
export const createFolderModel = (folderData = {}) => ({
  id: folderData.id || null,
  name: folderData.name || '',
  parentId: folderData.parentId || null,
  ownerId: folderData.ownerId || null,
  createdAt: folderData.createdAt || null,
  updatedAt: folderData.updatedAt || null,
  isDeleted: folderData.isDeleted !== undefined ? folderData.isDeleted : false,
  reservedField1: folderData.reservedField1 || '',
  reservedField2: folderData.reservedField2 || '',
  reservedField3: folderData.reservedField3 || '',
  // 前端特有字段
  type: 'folder',
  expanded: folderData.expanded !== undefined ? folderData.expanded : false,
  showEditMenu: folderData.showEditMenu || false,
  showFolderAddMenu: folderData.showFolderAddMenu || false,
  isEditing: folderData.isEditing || false,
  children: folderData.children || []
})

// 文档模型
export const createDocumentModel = (documentData = {}) => ({
  id: documentData.id || null,
  title: documentData.title || '未命名文档',
  content: documentData.content || '',
  authorId: documentData.authorId || null,
  folderId: documentData.folderId || null,
  isPublic: documentData.isPublic !== undefined ? documentData.isPublic : false,
  status: documentData.status !== undefined ? documentData.status : 1, // 1=草稿，2=发布，3=归档
  createdAt: documentData.createdAt || null,
  updatedAt: documentData.updatedAt || null,
  excerpt: documentData.excerpt || '',
  categoryId: documentData.categoryId || null,
  tags: documentData.tags || [],
  reservedField1: documentData.reservedField1 || '',
  reservedField2: documentData.reservedField2 || '',
  reservedField3: documentData.reservedField3 || '',
  // 前端特有字段
  type: 'document',
  lastModified: documentData.lastModified || documentData.updatedAt || null,
  parentFolder: documentData.parentFolder || null
})

// 文档统计模型
export const createDocumentStatsModel = (statsData = {}) => ({
  documentId: statsData.documentId || null,
  viewCount: statsData.viewCount || 0,
  likeCount: statsData.likeCount || 0,
  shareCount: statsData.shareCount || 0,
  commentCount: statsData.commentCount || 0,
  updatedAt: statsData.updatedAt || null
})

// 评论模型
export const createCommentModel = (commentData = {}) => ({
  id: commentData.id || null,
  documentId: commentData.documentId || null,
  authorId: commentData.authorId || null,
  parentId: commentData.parentId || null,
  content: commentData.content || '',
  status: commentData.status !== undefined ? commentData.status : 1, // 1=正常，2=隐藏，3=删除
  createdAt: commentData.createdAt || null,
  updatedAt: commentData.updatedAt || null,
  reservedField1: commentData.reservedField1 || '',
  reservedField2: commentData.reservedField2 || '',
  reservedField3: commentData.reservedField3 || '',
  // 关联数据
  author: commentData.author || null,
  replies: commentData.replies || []
})

// 知识库结构模型（用于前端展示）
export const createKnowledgeBaseModel = (kbData = {}) => ({
  id: kbData.id || null,
  name: kbData.name || '',
  type: kbData.type || 'folder',
  parentId: kbData.parentId || null,
  ownerId: kbData.ownerId || null,
  children: kbData.children || [],
  createdAt: kbData.createdAt || null,
  updatedAt: kbData.updatedAt || null,
  // 前端特有字段
  expanded: kbData.expanded !== undefined ? kbData.expanded : false,
  showEditMenu: kbData.showEditMenu || false,
  showFolderAddMenu: kbData.showFolderAddMenu || false,
  isEditing: kbData.isEditing || false
})

// 文档状态常量
export const DOCUMENT_STATUS = {
  DRAFT: 1,      // 草稿
  PUBLISHED: 2,  // 发布
  ARCHIVED: 3    // 归档
}

// 评论状态常量
export const COMMENT_STATUS = {
  NORMAL: 1,     // 正常
  HIDDEN: 2,     // 隐藏
  DELETED: 3     // 删除
}

// 用户状态常量
export const USER_STATUS = {
  ACTIVE: true,
  INACTIVE: false
}

// 文档状态文本映射
export const getDocumentStatusText = (status) => {
  const statusMap = {
    [DOCUMENT_STATUS.DRAFT]: '草稿',
    [DOCUMENT_STATUS.PUBLISHED]: '已发布',
    [DOCUMENT_STATUS.ARCHIVED]: '已归档'
  }
  return statusMap[status] || '未知状态'
}

// 评论状态文本映射
export const getCommentStatusText = (status) => {
  const statusMap = {
    [COMMENT_STATUS.NORMAL]: '正常',
    [COMMENT_STATUS.HIDDEN]: '隐藏',
    [COMMENT_STATUS.DELETED]: '已删除'
  }
  return statusMap[status] || '未知状态'
}

// 验证函数
export const validateDocument = (document) => {
  const errors = []
  
  if (!document.title || document.title.trim() === '') {
    errors.push('文档标题不能为空')
  }
  
  if (document.title && document.title.length > 200) {
    errors.push('文档标题不能超过200个字符')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateFolder = (folder) => {
  const errors = []
  
  if (!folder.name || folder.name.trim() === '') {
    errors.push('文件夹名称不能为空')
  }
  
  if (folder.name && folder.name.length > 100) {
    errors.push('文件夹名称不能超过100个字符')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateCategory = (category) => {
  const errors = []
  
  if (!category.name || category.name.trim() === '') {
    errors.push('分类名称不能为空')
  }
  
  if (category.name && category.name.length > 50) {
    errors.push('分类名称不能超过50个字符')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 工具函数
export const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/[\s_-]+/g, '-') // 替换空格和下划线为连字符
    .replace(/^-+|-+$/g, '')  // 移除首尾连字符
}

export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  
  if (text.length <= maxLength) return text
  
  return text.substring(0, maxLength) + '...'
}

// 导出所有模型和工具函数
export default {
  // 模型创建函数
  createUserModel,
  createCategoryModel,
  createFolderModel,
  createDocumentModel,
  createDocumentStatsModel,
  createCommentModel,
  createKnowledgeBaseModel,
  
  // 常量
  DOCUMENT_STATUS,
  COMMENT_STATUS,
  USER_STATUS,
  
  // 文本映射函数
  getDocumentStatusText,
  getCommentStatusText,
  
  // 验证函数
  validateDocument,
  validateFolder,
  validateCategory,
  
  // 工具函数
  formatDate,
  formatFileSize,
  generateSlug,
  truncateText
}
