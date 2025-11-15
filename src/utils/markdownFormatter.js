/**
 * Markdown转HTML格式化工具函数
 * 支持标题、列表、粗体、斜体等常见Markdown语法
 */

export function formatMarkdownToHtml(content) {
  if (!content) return ''

  content = content.replace(/\r?\n/g, '\n')

  const insertLineBreak = (before, marker) => {
    if (before.endsWith('#')) {
      return before + marker
    }
    return `${before}\n${marker.trimStart()}`
  }

  content = content
    .replace(/([^\n])(\s*#{1,6}\s+)/g, (_, before, marker) => insertLineBreak(before, marker))
    .replace(/([^\n])(\s*[-\*\+]\s+)/g, (_, before, marker) => insertLineBreak(before, marker))
    .replace(/([^\n])(\s*\d+[\.\)]\s+)/g, (_, before, marker) => insertLineBreak(before, marker))

  const lines = content.split('\n')
  const processedLines = []
  let currentListTag = null

  const closeListIfNeeded = () => {
    if (currentListTag) {
      processedLines.push(`</${currentListTag}>`)
      currentListTag = null
    }
  }

  lines.forEach(rawLine => {
    const line = rawLine.trim()

    if (!line) {
      closeListIfNeeded()
      return
    }

    const headingMatch = line.match(/^(#{1,6})\s*(.+)$/)
    const orderedMatch = line.match(/^(\d+)[\.\)]\s*(.+)$/)
    const unorderedMatch = line.match(/^[-\*\+]\s+(.+)$/)

    if (headingMatch) {
      closeListIfNeeded()
      const level = Math.min(headingMatch[1].length, 6)
      processedLines.push(`<h${level}>${headingMatch[2].trim()}</h${level}>`)
    } else if (orderedMatch) {
      if (currentListTag !== 'ol') {
        closeListIfNeeded()
        processedLines.push('<ol>')
        currentListTag = 'ol'
      }
      processedLines.push('<li>' + orderedMatch[2].trim() + '</li>')
    } else if (unorderedMatch) {
      if (currentListTag !== 'ul') {
        closeListIfNeeded()
        processedLines.push('<ul>')
        currentListTag = 'ul'
      }
      processedLines.push('<li>' + unorderedMatch[1].trim() + '</li>')
    } else {
      closeListIfNeeded()
      processedLines.push('<p>' + line + '</p>')
    }
  })

  closeListIfNeeded()

  let result = processedLines.join('')

  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>')

  return result
}

