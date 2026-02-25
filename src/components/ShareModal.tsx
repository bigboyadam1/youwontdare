import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import type { Dare } from '../types'
import ShareCard from './ShareCard'

interface Props {
  dare: Dare
  onClose: () => void
}

export default function ShareModal({ dare, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return
    setGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0d0d0d',
        scale: 2,
        useCORS: true,
      })
      const dataUrl = canvas.toDataURL('image/png')

      // Try Web Share API with file support
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], 'dare-story.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], text: 'YouWontDare' })
            setGenerating(false)
            return
          } catch {
            // Fall through to download
          }
        }
      }

      // Fallback: download
      const link = document.createElement('a')
      link.download = 'dare-story.png'
      link.href = dataUrl
      link.click()
    } catch {
      // Silently fail
    }
    setGenerating(false)
  }

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Preview */}
        <div className="overflow-auto max-h-[70vh] mb-4" style={{ border: '2px solid #555048' }}>
          <ShareCard ref={cardRef} dare={dare} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleDownload}
            disabled={generating}
            className="font-[Anton] text-lg px-8 py-2 border-none cursor-pointer"
            style={{ background: '#ff0055', color: '#f0f0f0' }}
          >
            {generating ? 'GENERATING...' : 'DOWNLOAD / SHARE'}
          </button>
          <button
            onClick={onClose}
            className="font-[Courier_Prime] text-sm border border-[#555048] px-4 py-2 cursor-pointer"
            style={{ background: 'transparent', color: '#aaa49c' }}
          >
            close
          </button>
        </div>
      </div>
    </div>
  )
}
