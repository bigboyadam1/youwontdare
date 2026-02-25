import { useState, useEffect, useCallback } from 'react'

let showToastFn: ((message: string) => void) | null = null

export function toast(message: string) {
  showToastFn?.(message)
}

export default function Toast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)

  const show = useCallback((msg: string) => {
    setMessage(msg)
    setVisible(true)
    setTimeout(() => setVisible(false), 2000)
  }, [])

  useEffect(() => {
    showToastFn = show
    return () => { showToastFn = null }
  }, [show])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] font-[Courier_Prime] text-sm px-5 py-2 pointer-events-none"
      style={{
        background: '#f0f0f0',
        color: '#0d0d0d',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      {message}
    </div>
  )
}
