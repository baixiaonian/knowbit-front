import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import AiHelpComponent from './AiHelpComponent.vue'
import { formatMarkdownToHtml } from '../utils/markdownFormatter.js'

export const AiHelpNode = Node.create({
  name: 'aiHelpNode',

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
      helpId: {
        default: '',
        parseHTML: element => element.getAttribute('data-help-id'),
        renderHTML: attributes => ({
          'data-help-id': attributes.helpId,
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
        tag: 'div[data-type="ai-help-node"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'ai-help-node' }), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(AiHelpComponent)
  },

  addCommands() {
    return {
      insertAiHelp: (attributes) => ({ commands }) => {
        console.log('AiHelpNode insertAiHelp called with:', attributes)
        return commands.insertContent({
          type: this.name,
          attrs: {
            ...attributes,
            helpId: `aihelp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          },
        })
      },
      updateAiHelpContent: (helpId, content) => ({ commands, state, editor }) => {
        const { doc } = state
        let found = false
        
        doc.descendants((node, pos) => {
          if (node.type.name === 'aiHelpNode' && node.attrs.helpId === helpId) {
            try {
              // 使用setNodeMarkup方法
              const tr = state.tr
              const newAttrs = {
                ...node.attrs,
                aiContent: content
              }
              
              tr.setNodeMarkup(pos, null, newAttrs)
              
              // 检查事务是否有效
              if (tr.doc) {
                editor.view.dispatch(tr)
                found = true
              }
            } catch (error) {
              console.error('Failed to update node:', error)
            }
            
            return false
          }
        })
        return found
      },
      acceptAiHelp: (helpId) => ({ commands, state, editor }) => {
        const { doc } = state
        let found = false
        
        doc.descendants((node, pos) => {
          if (node.type.name === 'aiHelpNode' && node.attrs.helpId === helpId) {
            const aiContent = node.attrs.aiContent
            
            // 删除AI帮写节点
            commands.deleteRange({ from: pos, to: pos + node.nodeSize })
            
            // 使用与AiHelpComponent相同的markdown处理逻辑
            const htmlContent = formatMarkdownToHtml(aiContent)
            
            commands.insertContentAt(pos, htmlContent)
            
            found = true
            return false
          }
        })
        
        return found
      },
      rejectAiHelp: (helpId) => ({ commands, state }) => {
        const { doc } = state
        let found = false
        
        doc.descendants((node, pos) => {
          if (node.type.name === 'aiHelpNode' && node.attrs.helpId === helpId) {
            // 直接删除AI帮写节点
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

export default AiHelpNode
