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

  // Lock body scroll when modal is open
  useEffect(() => {
    const scrollY = window.scrollY
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    return () => {
      document.documentElement.style.overflow = ''
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
      className="fixed inset-0"
      style={{ zIndex: 9990, background: '#0d0d0d' }}
    >
      {/* Close button */}
      <div
        className="absolute top-4 right-4 font-[Anton] text-lg px-4 py-2 cursor-pointer select-none"
        style={{ color: '#aaa49c', zIndex: 1 }}
        onClick={onClose}
      >
        CLOSE ✕
      </div>

      <div
        className="h-full overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-md mx-auto px-4 pt-14 pb-8">
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
                Tap to upload photo or video
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
          <div className="mb-6">
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

          {/* Submit — full width, big tap target */}
          <div
            onClick={handleSubmit}
            role="button"
            className="font-[Anton] text-xl text-center py-4 cursor-pointer select-none"
            style={{
              background: mediaData ? '#00ff99' : '#333',
              color: mediaData ? '#0d0d0d' : '#666',
            }}
          >
            SUBMIT PROOF
          </div>

          <div
            onClick={onClose}
            role="button"
            className="font-[Courier_Prime] text-sm text-center text-[#aaa49c] mt-4 py-3 cursor-pointer select-none"
          >
            cancel
          </div>
        </div>
      </div>
    </div>
  )
}
