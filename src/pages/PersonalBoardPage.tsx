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
    fetchBoard()
  }

  const handleShare = (dare: Dare) => {
    navigator.clipboard.writeText(`🔥 DARE: ${dare.text} — YouWontDare`)
  }

  const handleProofClick = (url: string, caption: string) => {
    setLightboxImage({ url, caption })
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

        <Board
          dares={dares}
          boardType="personal"
          currentUserId={user?.id ?? null}
          onHype={handleHype}
          onComplete={handleComplete}
          onChicken={handleChicken}
          onShare={handleShare}
          onProofClick={handleProofClick}
        />
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
    </div>
  )
}
