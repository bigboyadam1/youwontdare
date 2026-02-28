import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface Props {
  inviteCode: string
  slug: string
  isOwner: boolean
  onRegenerate?: () => Promise<string>
}

export default function InviteCodeDisplay({ inviteCode, slug, isOwner, onRegenerate }: Props) {
  const [code, setCode] = useState(inviteCode)
  const [regenerating, setRegenerating] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const joinUrl = `${window.location.origin}/trip/${slug}?code=${code}`

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, joinUrl, {
        width: 120,
        margin: 1,
        color: { dark: '#f0f0f0', light: '#131313' },
      }).catch(() => {})
    }
  }, [joinUrl])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
  }

  const handleRegenerate = async () => {
    if (!onRegenerate) return
    setRegenerating(true)
    const newCode = await onRegenerate()
    setCode(newCode)
    setRegenerating(false)
  }

  const handleDownloadQR = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `youwontdare-${slug}-qr.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="border border-[#555048] mb-6" style={{ background: '#131313' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        className="font-[Courier_Prime] text-sm px-4 py-3 cursor-pointer select-none"
        style={{ color: '#aaa49c' }}
      >
        share / invite {expanded ? '\u25b4' : '\u25be'}
      </div>
      {expanded && <div className="px-4 pb-4">
      <div className="flex flex-wrap items-start gap-4">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-2">
          <canvas ref={canvasRef} />
          <button
            onClick={handleDownloadQR}
            className="font-[Courier_Prime] text-[10px] border border-[#555048] px-2 py-0.5 hover:border-[#00ccff] hover:text-[#00ccff] transition-colors cursor-pointer"
            style={{ background: 'transparent', color: '#aaa49c' }}
          >
            download QR
          </button>
        </div>

        {/* Link + Code */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] mb-1">
                Share Link
              </div>
              <code className="font-[Courier_Prime] text-xs text-[#00ccff] break-all">{joinUrl}</code>
            </div>
            <button
              onClick={handleCopyLink}
              className="font-[Courier_Prime] text-xs border border-[#555048] px-3 py-1 hover:border-[#00ccff] hover:text-[#00ccff] transition-colors cursor-pointer"
              style={{ background: 'transparent', color: '#aaa49c' }}
            >
              copy link
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex-1 min-w-0">
              <div className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] mb-1">
                Invite Code
              </div>
              <code className="font-[Anton] text-lg text-[#ffcc00] tracking-wider">{code}</code>
            </div>
            <button
              onClick={handleCopyCode}
              className="font-[Courier_Prime] text-xs border border-[#555048] px-3 py-1 hover:border-[#ffcc00] hover:text-[#ffcc00] transition-colors cursor-pointer"
              style={{ background: 'transparent', color: '#aaa49c' }}
            >
              copy code
            </button>
            {isOwner && onRegenerate && (
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="font-[Courier_Prime] text-xs border border-[#555048] px-3 py-1 hover:border-[#ff0055] hover:text-[#ff0055] transition-colors cursor-pointer"
                style={{ background: 'transparent', color: '#555048' }}
              >
                {regenerating ? '...' : 'regenerate'}
              </button>
            )}
          </div>
        </div>
      </div>
      </div>}
    </div>
  )
}
