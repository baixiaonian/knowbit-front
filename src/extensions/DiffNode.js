import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import DiffComponent from './DiffComponent.vue'
import { formatMarkdownToHtml } from '../utils/markdownFormatter.js'

export const DiffNode = Node.create({
  name: 'diffNode',

  group: 'block',

  content: 'text*',

  atom: true,

  addAttributes() {
    return {
      originalText: {
        default: '',
        parseHTML: element => element.getAttribute('data-original-text'),
        renderHTML: attributes => ({
          'data-original-text': attributes.originalText,
        }),
      },
      aiText: {
        default: '',
        parseHTML: element => element.getAttribute('data-ai-text'),
        renderHTML: attributes => ({
          'data-ai-text': attributes.aiText,
        }),
      },
      diffType: {
        default: 'expand',
        parseHTML: element => element.getAttribute('data-diff-type'),
        renderHTML: attributes => ({
          'data-diff-type': attributes.diffType,
        }),
      },
      diffId: {
        default: '',
        parseHTML: element => element.getAttribute('data-diff-id'),
        renderHTML: attributes => ({
          'data-diff-id': attributes.diffId,
        }),
      },
      originalMarks: {
        default: [],
        parseHTML: element => {
          const marks = element.getAttribute('data-original-marks')
          return marks ? JSON.parse(marks) : []
        },
        renderHTML: attributes => ({
          'data-original-marks': JSON.stringify(attributes.originalMarks || []),
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="diff-node"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'diff-node' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(DiffComponent)
  },

  addCommands() {
    return {
      insertDiff: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            ...attributes,
            diffId: `diff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          },
        })
      },
      updateDiff: (diffId, content) => ({ tr, state, editor }) => {
        const { doc } = state
        
        doc.descendants((node, pos) => {
          if (node.type.name === 'diffNode' && node.attrs.diffId === diffId) {
            // 使用传入的tr来更新节点属性
            const newAttrs = {
              ...node.attrs,
              aiText: content
            }
            tr.setNodeMarkup(pos, null, newAttrs)
            return false
          }
        })
        
        return true
      },
      acceptDiff: (diffId) => ({ commands, state, editor }) => {
        const { doc } = state
        let found = false
        
        doc.descendants((node, pos) => {
          if (node.type.name === 'diffNode' && node.attrs.diffId === diffId) {
            const aiText = node.attrs.aiText
            const originalMarks = node.attrs.originalMarks || []
            const insertPos = pos
            
            // 删除diff节点
            commands.deleteRange({ from: pos, to: pos + node.nodeSize })
            
            const htmlContent = formatMarkdownToHtml(aiText)
            if (htmlContent) {
              commands.insertContentAt(insertPos, htmlContent)
            } else {
              let marks = []
              
              originalMarks.forEach(mark => {
                if (mark.type === 'textStyle' && mark.attrs) {
                  marks.push({
                    type: 'textStyle',
                    attrs: mark.attrs
                  })
                } else if (mark.type === 'bold') {
                  marks.push({ type: 'bold' })
                } else if (mark.type === 'italic') {
                  marks.push({ type: 'italic' })
                } else if (mark.type === 'underline') {
                  marks.push({ type: 'underline' })
                } else if (mark.type === 'strike') {
                  marks.push({ type: 'strike' })
                }
              })
              
              if (marks.length > 0) {
                const textNode = {
                  type: 'text',
                  text: aiText,
                  marks: marks
                }
                commands.insertContentAt(insertPos, textNode)
              } else {
                commands.insertContentAt(insertPos, aiText)
              }
            }
            
            found = true
            return false
          }
        })
        
        return found
      },
      rejectDiff: (diffId) => ({ commands, state }) => {
        const { doc } = state
        let found = false
        
        doc.descendants((node, pos) => {
          if (node.type.name === 'diffNode' && node.attrs.diffId === diffId) {
            const originalText = node.attrs.originalText
            const originalMarks = node.attrs.originalMarks || []
            
            // 删除diff节点
            commands.deleteRange({ from: pos, to: pos + node.nodeSize })
            
            // 构建带格式的内容对象
            let marks = []
            
            // 收集所有格式标记
            originalMarks.forEach(mark => {
              if (mark.type === 'textStyle' && mark.attrs) {
                marks.push({
                  type: 'textStyle',
                  attrs: mark.attrs
                })
              } else if (mark.type === 'bold') {
                marks.push({ type: 'bold' })
              } else if (mark.type === 'italic') {
                marks.push({ type: 'italic' })
              } else if (mark.type === 'underline') {
                marks.push({ type: 'underline' })
              } else if (mark.type === 'strike') {
                marks.push({ type: 'strike' })
              }
            })
            
            // 如果有格式标记，创建带格式的文本节点
            if (marks.length > 0) {
              const textNode = {
                type: 'text',
                text: originalText,
                marks: marks
              }
              commands.insertContentAt(pos, textNode)
            } else {
              commands.insertContentAt(pos, originalText)
            }
            
            found = true
            return false
          }
        })
        
        return found
      },
    }
  },
})

export default DiffNode
