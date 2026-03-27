import { useEffect } from 'react'

/**
 * Best-effort lockdown: blocks copy / paste / cut and common shortcuts while exam is active.
 * Not a security boundary (devtools, screenshots, etc. still exist).
 */
export function useExamLockdown(active) {
  useEffect(() => {
    if (!active) return undefined

    const blockClipboard = (event) => {
      event.preventDefault()
      event.stopPropagation()
    }

    const onKeyDown = (event) => {
      const key = event.key?.toLowerCase()
      const mod = event.ctrlKey || event.metaKey
      if (mod && ['c', 'v', 'x', 'a'].includes(key)) {
        event.preventDefault()
        event.stopPropagation()
      }
      if (event.key === 'Insert') {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    document.addEventListener('copy', blockClipboard, true)
    document.addEventListener('cut', blockClipboard, true)
    document.addEventListener('paste', blockClipboard, true)
    document.addEventListener('contextmenu', blockClipboard, true)
    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.removeEventListener('copy', blockClipboard, true)
      document.removeEventListener('cut', blockClipboard, true)
      document.removeEventListener('paste', blockClipboard, true)
      document.removeEventListener('contextmenu', blockClipboard, true)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [active])
}
