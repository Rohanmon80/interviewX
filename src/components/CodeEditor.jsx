function CodeEditor({ value, onChange }) {
  const handleKeyDown = (event) => {
    const mod = event.ctrlKey || event.metaKey
    const key = event.key?.toLowerCase()
    if (mod && ['c', 'v', 'x', 'a'].includes(key)) {
      event.preventDefault()
      return
    }
    if (event.key === 'Insert') {
      event.preventDefault()
      return
    }
    if (event.key === 'Tab') {
      event.preventDefault()
      const { selectionStart, selectionEnd } = event.target
      const nextValue = `${value.slice(0, selectionStart)}    ${value.slice(selectionEnd)}`
      onChange(nextValue)
      requestAnimationFrame(() => {
        event.target.selectionStart = selectionStart + 4
        event.target.selectionEnd = selectionStart + 4
      })
    }
  }

  const preventClipboard = (event) => event.preventDefault()

  return (
    <textarea
      className="code-editor"
      rows={12}
      value={value}
      placeholder="Write Python code here..."
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
      onCopy={preventClipboard}
      onPaste={preventClipboard}
      onCut={preventClipboard}
      spellCheck={false}
    />
  )
}

export default CodeEditor
