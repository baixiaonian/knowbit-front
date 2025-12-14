import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import InsertComponent from './InsertComponent.vue'
import { formatMarkdownToHtml } from '../utils/markdownFormatter.js'

export const InsertNode = Node.create({
  name: 'insertNode',

  group: 'block',

  content: 'text*',

  atom: true,

  addAttributes() {
    return {
      aiContent: {
        default: '',
        parseHTML: element => element.getAttribute('data-ai-content'),
        renderHTML: attributes => ({
          'data-ai-content': attributes.aiContent,
        }),
      },
      insertId: {
        default: '',
        parseHTML: element => element.getAttribute('data-insert-id'),
        renderHTML: attributes => ({
          'data-insert-id': attributes.insertId,
        }),
      },
      prompt: {
        default: '',
        parseHTML: element => element.getAttribute('data-prompt'),
        renderHTML: attributes => ({
          'data-prompt': attributes.prompt,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="insert-node"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'insert-node' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(InsertComponent)
  },

  addCommands() {
    return {
      insertAiContent: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            ...attributes,
            insertId: `insert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          },
        })
      },
      updateInsertContent: (insertId, content) => ({ commands, state, editor }) => {
        const { doc } = state
        let found = false
        
        doc.descendants((node, pos) => {
          if (node.type.name === 'insertNode' && node.attrs.insertId === insertId) {
            try {
              const tr = state.tr
              const newAttrs = {
                ...node.attrs,
                aiContent: content
              }
              
              tr.setNodeMarkup(pos, null, newAttrs)
              
              if (tr.doc) {
                editor.view.dispatch(tr)
                found = true
              }
            } catch (error) {
              console.error('Failed to update insert node:', error)
            }
            
            return false
          }
        })
        return found
      },
      acceptInsert: (insertId) => ({ commands, state, editor }) => {
        const { doc } = state
        let found = false
        
        doc.descendants((node, pos) => {
          if (node.type.name === 'insertNode' && node.attrs.insertId === insertId) {
            const aiContent = node.attrs.aiContent
            
            commands.deleteRange({ from: pos, to: pos + node.nodeSize })
            
            const htmlContent = formatMarkdownToHtml(aiContent)
            commands.insertContentAt(pos, htmlContent)
            
            found = true
            return false
          }
        })
        
        return found
      },
      rejectInsert: (insertId) => ({ commands, state }) => {
        const { doc } = state
        let found = false
        
        doc.descendants((node, pos) => {
          if (node.type.name === 'insertNode' && node.attrs.insertId === insertId) {
            commands.deleteRange({ from: pos, to: pos + node.nodeSize })
            
            found = true
            return false
          }
        })
        
        return found
      },
    }
  },
})

export default InsertNode
