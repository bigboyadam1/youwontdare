import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Dare, Board as BoardType } from '../types'
import DareForm from '../components/DareForm'
import Board from '../components/Board'
import StatsBar from '../components/StatsBar'
import ProofModal from '../components/ProofModal'
import Lightbox from '../components/Lightbox'
import Confetti from '../components/Confetti'
import ProofGallery from '../components/ProofGallery'
import ShareModal from '../components/ShareModal'
import { toast } from '../components/Toast'
import { useSoundEffect } from '../hooks/useSoundEffect'

export default function PersonalBoardPage() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const [board, setBoard] = useState<BoardType | null>(null)
  const [dares, setDares] = useState<Dare[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [proofModalDare, setProofModalDare] = useState<Dare | null>(null)
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption: string } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [viewMode, setViewMode] = useState<'board' | 'gallery'>('board')
  const [shareStoryDare, setShareStoryDare] = useState<Dare | null>(null)
  const playAirhorn = useSoundEffect('/sounds/airhorn.wav')
  const playChicken = useSoundEffect('/sounds/chicken.wav')

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch(`/api/boards/personal/${username}`, { credentials: 'include' })
      if (!res.ok) {
        setError('Board not found')
        return
      }
      const data = await res.json()
      setBoard(data.board)
      setDares(data.dares)
    } catch {
      setError('Failed to load board')
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  const handleHype = async (id: number) => {
    await fetch(`/api/dares/${id}/hype`, { method: 'POST', credentials: 'include' })
    fetchBoard()
  }

  const handleComplete = (dare: Dare) => {
    setProofModalDare(dare)
  }

  const handleProofSubmit = async (id: number, proofUrl: string, caption: string) => {
    const res = await fetch(`/api/dares/${id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ proof_url: proofUrl, proof_caption: caption }),
    })
    if (!res.ok) return
    setProofModalDare(null)
    setShowConfetti(true)
    playAirhorn()
    setTimeout(() => setShowConfetti(false), 3000)
    fetchBoard()
  }

  const handleChicken = async (id: number) => {
    if (!confirm('Are you sure you want to chicken out?')) return
    await fetch(`/api/dares/${id}/chicken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    playChicken()
    fetchBoard()
  }

  const handleShare = async (dare: Dare) => {
    const shareText = `🔥 DARE: ${dare.text} — YouWontDare`
    const shareUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, url: shareUrl })
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
    toast('Copied to clipboard!')
  }

  const handleProofClick = (url: string, caption: string) => {
    setLightboxImage({ url, caption })
  }

  const handleReveal = async (dare: Dare) => {
    const res = await fetch(`/api/dares/${dare.id}/reveal`, {
      method: 'POST',
      credentials: 'include',
    })
    if (res.ok) fetchBoard()
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="font-[Courier_Prime] text-[#aaa49c]">Loading board...</p>
      </div>
    )
  }

  if (error || !board) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-[Anton] text-3xl text-[#ff0055] mb-2">NOT FOUND</h2>
        <p className="font-[Courier_Prime] text-sm text-[#aaa49c]">{error || 'Board not found'}</p>
      </div>
    )
  }

  const completed = dares.filter(d => d.status === 'completed').length
  const uniqueAuthors = new Set(dares.map(d => d.author)).size

  return (
    <div className="min-h-screen pb-28">
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Board title */}
        <div className="mb-8">
          <h2 className="font-[Anton] text-3xl text-[#f0f0f0]">{board.name}</h2>
          <p className="font-[Courier_Prime] text-sm text-[#aaa49c]">
            dare @{board.slug} — they won't do it.
          </p>
        </div>

        <DareForm
          boardId={board.id}
          boardType="personal"
          currentUserId={user?.id ?? null}
          onDareCreated={fetchBoard}
        />

        {/* View toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('board')}
            className="font-[Anton] text-sm px-4 py-1 cursor-pointer border-none"
            style={{
              background: viewMode === 'board' ? '#f0f0f0' : 'transparent',
              color: viewMode === 'board' ? '#0d0d0d' : '#555048',
              border: viewMode === 'board' ? 'none' : '1px solid #555048',
            }}
          >
            BOARD
          </button>
          <button
            onClick={() => setViewMode('gallery')}
            className="font-[Anton] text-sm px-4 py-1 cursor-pointer border-none"
            style={{
              background: viewMode === 'gallery' ? '#f0f0f0' : 'transparent',
              color: viewMode === 'gallery' ? '#0d0d0d' : '#555048',
              border: viewMode === 'gallery' ? 'none' : '1px solid #555048',
            }}
          >
            GALLERY
          </button>
        </div>

        {viewMode === 'board' ? (
          <Board
            dares={dares}
            boardType="personal"
            currentUserId={user?.id ?? null}
            onHype={handleHype}
            onComplete={handleComplete}
            onChicken={handleChicken}
            onShare={handleShare}
            onProofClick={handleProofClick}
            onShareStory={setShareStoryDare}
            onReveal={handleReveal}
          />
        ) : (
          <ProofGallery dares={dares} onProofClick={handleProofClick} />
        )}
      </div>

      <StatsBar total={dares.length} completed={completed} enablers={uniqueAuthors} />

      {proofModalDare && (
        <ProofModal
          dare={proofModalDare}
          onSubmit={handleProofSubmit}
          onClose={() => setProofModalDare(null)}
        />
      )}
      {lightboxImage && (
        <Lightbox
          url={lightboxImage.url}
          caption={lightboxImage.caption}
          onClose={() => setLightboxImage(null)}
        />
      )}
      {showConfetti && <Confetti />}
      {shareStoryDare && (
        <ShareModal dare={shareStoryDare} onClose={() => setShareStoryDare(null)} />
      )}
    </div>
  )
}
