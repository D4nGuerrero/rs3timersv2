function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return <span key={index}>{part}</span>
  })
}

function parseBlocks(text) {
  const lines = text.split(/\r?\n/)
  const blocks = []
  let paragraph = []
  let list = []

  function flushParagraph() {
    if (paragraph.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') })
      paragraph = []
    }
  }

  function flushList() {
    if (list.length > 0) {
      blocks.push({ type: 'list', items: list })
      list = []
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    if (line.startsWith('## ')) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'heading', text: line.slice(3) })
      continue
    }

    if (line.startsWith('- ')) {
      flushParagraph()
      list.push(line.slice(2))
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()

  return blocks
}

export default function MarkdownNotes({ text, className = '' }) {
  const blocks = parseBlocks(text)

  return (
    <div className={`notes-markdown${className ? ` ${className}` : ''}`}>
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return <h4 key={index}>{renderInline(block.text)}</h4>
        }

        if (block.type === 'list') {
          return (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }

        return <p key={index}>{renderInline(block.text)}</p>
      })}
    </div>
  )
}
