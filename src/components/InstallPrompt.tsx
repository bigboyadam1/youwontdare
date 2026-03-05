import { useState, useEffect, useRef } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIosSafari(): boolean {
  const ua = navigator.userAgent
  return /iP(hone|od|ad)/.test(ua) && /WebKit/.test(ua) && !/(CriOS|FxiOS|OPiOS|mercury)/.test(ua)
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone === true)
}

export default function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Never show if already installed/standalone
    if (isStandalone()) return
    // Don't show if previously dismissed
    if (localStorage.getItem('ywd_install_dismissed')) return

    let timer: ReturnType<typeof setTimeout>

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      // Delay showing to avoid overwhelming first-time visitors
      timer = setTimeout(() => setShow(true), 30000)
    }

    const handleAppInstalled = () => {
      deferredPrompt.current = null
      setShow(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    // iOS Safari fallback — no beforeinstallprompt support
    if (isIosSafari()) {
      setIsIos(true)
      timer = setTimeout(() => setShow(true), 30000)
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    deferredPrompt.current = null
  }

  const handleDismiss = () => {
    localStorage.setItem('ywd_install_dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div
      className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[9990] flex items-center gap-3 px-5 py-3"
      style={{
        background: '#131313',
        border: '1px solid #555048',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      {isIos ? (
        <span className="font-[Courier_Prime] text-xs text-[#aaa49c]">
          Tap Share then &ldquo;Add to Home Screen&rdquo;
        </span>
      ) : (
        <>
          <span className="font-[Courier_Prime] text-xs text-[#aaa49c]">
            Install the app?
          </span>
          <button
            onClick={handleInstall}
            className="font-[Anton] text-sm px-4 py-1 border-none cursor-pointer"
            style={{ background: '#ff0055', color: '#f0f0f0' }}
          >
            INSTALL
          </button>
        </>
      )}
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
