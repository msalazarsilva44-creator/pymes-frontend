import { useEffect, useRef } from 'react'

/**
 * Intercepts the browser back button by pushing a guard entry
 * to the history stack. When popstate fires, calls `onBack`
 * instead of navigating away.
 */
export function useBackButtonGuard(onBack: () => void) {
  const isGuarding = useRef(true)

  useEffect(() => {
    isGuarding.current = true

    // Push a guard entry so pressing back pops this instead of leaving
    window.history.pushState({ backGuard: true }, '')

    const handlePopState = () => {
      if (!isGuarding.current) return
      // Re-push guard to keep trapping future back presses
      window.history.pushState({ backGuard: true }, '')
      onBack()
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      isGuarding.current = false
      window.removeEventListener('popstate', handlePopState)
    }
  }, [onBack])
}
