import { useEffect, useRef } from 'react'

export function useAutoResizeTextarea(value: string, minHeight: number = 100) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Сбрасываем высоту для правильного расчета scrollHeight
    textarea.style.height = 'auto'
    
    // Устанавливаем новую высоту на основе содержимого
    const newHeight = Math.max(textarea.scrollHeight, minHeight)
    textarea.style.height = `${newHeight}px`
  }, [value, minHeight])

  return textareaRef
} 