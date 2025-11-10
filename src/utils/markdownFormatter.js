/**
 * Markdown转HTML格式化工具函数
 * 支持标题、列表、粗体、斜体等常见Markdown语法
 */

export function formatMarkdownToHtml(content) {
  if (!content) return ''
  
  // 如果内容没有换行符，尝试根据markdown格式添加换行
  if (!content.includes('\n')) {
    // 在标题前添加换行
    content = content.replace(/(#+ )/g, '\n$1')
    // 在列表项前添加换行
    content = content.replace(/(^| )(?=- )/g, '\n- ')
    content = content.replace(/(^| )(?=\* )/g, '\n* ')
    // 清理多余的换行
    content = content.replace(/\n+/g, '\n').trim()
  }
  
  // 先按行分割内容
  const lines = content.split('\n')
  const processedLines = []
  let inList = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 处理标题
    if (line.startsWith('### ')) {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push('<h3>' + line.substring(4) + '</h3>')
    } else if (line.startsWith('## ')) {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push('<h2>' + line.substring(3) + '</h2>')
    } else if (line.startsWith('# ')) {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push('<h1>' + line.substring(2) + '</h1>')
    }
    // 处理列表项
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        processedLines.push('<ul>')
        inList = true
      }
      processedLines.push('<li>' + line.substring(2) + '</li>')
    }
    // 处理普通段落
    else if (line) {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push('<p>' + line + '</p>')
    }
    // 处理空行
    else {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      // 空行不添加<br>，让CSS处理间距
    }
  }
  
  // 如果最后还在列表中，关闭列表
  if (inList) {
    processedLines.push('</ul>')
  }
  
  let result = processedLines.join('')
  
  // 处理粗体和斜体
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  return result
}

