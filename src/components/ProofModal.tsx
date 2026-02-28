import { useState, useRef, useEffect } from 'react'
import type { Dare } from '../types'

interface Props {
  dare: Dare
  onSubmit: (id: number, proofUrl: string, caption: string) => void
  onClose: () => void
}

export default function ProofModal({ dare, onSubmit, onClose }: Props) {
  const [mediaData, setMediaData] = useState('')
  const [isVideo, setIsVideo] = useState(false)
  const [caption, setCaption] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when modal is open (fixes iOS Safari scroll bleed-through)
  useEffect(() => {
    const scrollY = window.scrollY
    const html = document.documentElement
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    return () => {
      html.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  const handleFile = (file: File) => {
    setIsVideo(file.type.startsWith('video/'))
    const reader = new FileReader()
    reader.onload = () => setMediaData(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleSubmit = () => {
    if (!mediaData) return
    onSubmit(dare.id, mediaData, caption)
  }

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 overflow-y-auto overscroll-none"
      style={{
        background: 'rgba(0,0,0,0.85)',
        WebkitOverflowScrolling: 'touch',
        zIndex: 9990,
        touchAction: 'pan-y',
      }}
      onClick={onClose}
    >
      <div className="min-h-full flex items-start sm:items-center justify-center p-4 pb-8">
        <div
          className="w-full max-w-md p-6 border border-[#555048] mt-4 mb-8 sm:my-auto flex-shrink-0"
          style={{ background: '#131313', touchAction: 'manipulation' }}
          onClick={e => e.stopPropagation()}
        >
          <h3 className="font-[Anton] text-2xl text-[#00ff99] mb-1">PROVE IT</h3>
          <p className="font-[Courier_Prime] text-xs text-[#aaa49c] mb-4">
            upload your proof photo or video
          </p>

          {/* Drop zone */}
          <div
            className="border-2 border-dashed p-8 text-center mb-4 cursor-pointer transition-colors"
            style={{
              borderColor: dragging ? '#00ff99' : '#555048',
              background: dragging ? '#1c1c1c' : 'transparent',
            }}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            {mediaData ? (
              isVideo ? (
                <video src={mediaData} controls className="max-h-48 mx-auto" />
              ) : (
                <img src={mediaData} alt="proof preview" className="max-h-48 mx-auto" />
              )
            ) : (
              <p className="font-[Courier_Prime] text-sm text-[#aaa49c]">
                Drag & drop or tap to upload
              </p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </div>

          {/* Caption */}
          <div className="mb-4">
            <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
              Caption
            </label>
            <input
              className="dare-input font-[Courier_Prime] text-sm"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="I actually did it..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onPointerUp={e => { e.stopPropagation(); handleSubmit() }}
              className="font-[Anton] text-lg px-6 py-3 border-none cursor-pointer"
              style={{
                background: '#00ff99',
                color: '#0d0d0d',
                opacity: mediaData ? 1 : 0.4,
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                minHeight: 48,
              }}
            >
              SUBMIT PROOF
            </button>
            <button
              onPointerUp={e => { e.stopPropagation(); onClose() }}
              className="font-[Courier_Prime] text-sm text-[#aaa49c] hover:text-[#f0f0f0] cursor-pointer border-none bg-transparent"
              style={{ touchAction: 'manipulation', minHeight: 48 }}
            >
              cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
