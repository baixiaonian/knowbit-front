import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import DeleteComponent from './DeleteComponent.vue'

export const DeleteNode = Node.create({
  name: 'deleteNode',

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
      deleteId: {
        default: '',
        parseHTML: element => element.getAttribute('data-delete-id'),
        renderHTML: attributes => ({
          'data-delete-id': attributes.deleteId,
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
        tag: 'div[data-type="delete-node"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'delete-node' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(DeleteComponent)
  },

  addCommands() {
    return {
      insertDelete: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            ...attributes,
            deleteId: `delete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          },
        })
      },
      acceptDelete: (deleteId) => ({ commands, state }) => {
        const { doc } = state
        let found = false
        
        doc.descendants((node, pos) => {
          if (node.type.name === 'deleteNode' && node.attrs.deleteId === deleteId) {
            // 确认删除 - 直接删除节点
            commands.deleteRange({ from: pos, to: pos + node.nodeSize })
            
            found = true
            return false
          }
        })
        
        return found
      },
      rejectDelete: (deleteId) => ({ commands, state }) => {
        const { doc } = state
        let found = false
        
        doc.descendants((node, pos) => {
          if (node.type.name === 'deleteNode' && node.attrs.deleteId === deleteId) {
            const originalText = node.attrs.originalText
            const originalMarks = node.attrs.originalMarks || []
            
            // 保留内容 - 删除delete节点，恢复原文
            commands.deleteRange({ from: pos, to: pos + node.nodeSize })
            
            // 构建带格式的内容对象
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
            
            // 插入原文
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

export default DeleteNode
