import { useState, useEffect } from 'react'

export default function NotificationPrompt() {
  const [show, setShow] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    // Only show if notifications are supported and not already granted/denied
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission !== 'default') return
    // Don't show if user dismissed before
    if (localStorage.getItem('ywd_notif_dismissed')) return
    setShow(true)
  }, [])

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setShow(false)
        return
      }

      // Get VAPID key
      const res = await fetch('/api/notifications/vapid-key')
      const { key } = await res.json()
      if (!key) {
        setShow(false)
        return
      }

      // Subscribe
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      })

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })

      setSubscribed(true)
      setTimeout(() => setShow(false), 2000)
    } catch {
      setShow(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('ywd_notif_dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  if (subscribed) {
    return (
      <div
        className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[9990] font-[Courier_Prime] text-sm px-5 py-3 text-center"
        style={{ background: '#00ff99', color: '#0d0d0d' }}
      >
        Notifications enabled!
      </div>
    )
  }

  return (
    <div
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[9990] flex items-center gap-3 px-5 py-3"
      style={{
        background: '#131313',
        border: '1px solid #555048',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <span className="font-[Courier_Prime] text-xs text-[#aaa49c]">
        Get notified when you're dared?
      </span>
      <button
        onClick={handleEnable}
        className="font-[Anton] text-sm px-4 py-1 border-none cursor-pointer"
        style={{ background: '#ff0055', color: '#f0f0f0' }}
      >
        YES
      </button>
      <button
        onClick={handleDismiss}
        className="font-[Courier_Prime] text-xs text-[#555048] cursor-pointer"
        style={{ background: 'transparent', border: 'none' }}
      >
        nah
      </button>
    </div>
  )
}
