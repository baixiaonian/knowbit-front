/**
 * 编辑器插件统一导出
 * 
 * 三个核心插件：
 * 1. InsertNode - 新增内容插件（AI生成新内容）
 * 2. DeleteNode - 删除内容插件（标记删除原文）
 * 3. DiffNode - 对比修改插件（显示原文和修改后的对比）
 */

export { InsertNode } from './InsertNode.js'
export { DeleteNode } from './DeleteNode.js'
export { DiffNode } from './DiffNode.js'
