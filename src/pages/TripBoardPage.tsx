import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Dare, Board as BoardType, BoardMember } from '../types'
import DareForm from '../components/DareForm'
import Board from '../components/Board'
import StatsBar from '../components/StatsBar'
import ProofModal from '../components/ProofModal'
import Lightbox from '../components/Lightbox'
import Confetti from '../components/Confetti'
import InviteCodeDisplay from '../components/InviteCodeDisplay'

export default function TripBoardPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const [board, setBoard] = useState<BoardType | null>(null)
  const [dares, setDares] = useState<Dare[]>([])
  const [members, setMembers] = useState<BoardMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [proofModalDare, setProofModalDare] = useState<Dare | null>(null)
  const [lightboxImage, setLightboxImage] = useState<{ url: string; caption: string } | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [isMember, setIsMember] = useState(false)

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch(`/api/boards/trip/${slug}`, { credentials: 'include' })
      if (res.status === 403) {
        setError('private')
        setLoading(false)
        return
      }
      if (!res.ok) {
        setError('Board not found')
        setLoading(false)
        return
      }
      const data = await res.json()
      setBoard(data.board)
      setDares(data.dares)
      setMembers(data.members)
      // Check if current user is a member
      if (user) {
        setIsMember(data.members.some((m: BoardMember) => m.id === user.id))
      }
    } catch {
      setError('Failed to load board')
    } finally {
      setLoading(false)
    }
  }, [slug, user])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  const handleJoin = async () => {
    setJoinError('')
    const res = await fetch(`/api/boards/trip/${slug}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ inviteCode: joinCode }),
    })
    if (!res.ok) {
      const data = await res.json()
      setJoinError(data.error)
      return
    }
    setError('')
    fetchBoard()
  }

  const handleRegenerateInvite = async () => {
    const res = await fetch(`/api/boards/trip/${slug}/invite-code`, {
      method: 'POST',
      credentials: 'include',
    })
    const data = await res.json()
    return data.inviteCode as string
  }

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
        <p className="font-[Courier_Prime] text-[#aaa49c]">Loading trip board...</p>
      </div>
    )
  }

  // Private board — show join form
  if (error === 'private') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="font-[Anton] text-3xl text-[#ffcc00] mb-2">PRIVATE TRIP</h2>
        <p className="font-[Courier_Prime] text-sm text-[#aaa49c] mb-6">Enter the invite code to join</p>
        {joinError && (
          <div className="font-[Courier_Prime] text-sm text-[#ff0055] border border-[#ff0055] p-3 mb-4">
            {joinError}
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <input
            className="dare-input text-center font-[Anton] text-xl tracking-wider"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value)}
            placeholder="invite code"
            style={{ maxWidth: 200 }}
          />
          <button
            onClick={handleJoin}
            className="font-[Anton] text-lg px-6 py-2 border-none cursor-pointer"
            style={{ background: '#ff0055', color: '#f0f0f0' }}
          >
            JOIN
          </button>
        </div>
      </div>
    )
  }

  if (error || !board) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="font-[Anton] text-3xl text-[#ff0055] mb-2">NOT FOUND</h2>
        <p className="font-[Courier_Prime] text-sm text-[#aaa49c]">{error || 'Trip board not found'}</p>
      </div>
    )
  }

  const completed = dares.filter(d => d.status === 'completed').length
  const isOwner = user?.id === board.owner_id

  return (
    <div className="min-h-screen pb-28">
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Board title */}
        <div className="mb-6">
          <h2 className="font-[Anton] text-3xl text-[#f0f0f0]">{board.name}</h2>
          <p className="font-[Courier_Prime] text-sm text-[#aaa49c]">
            {members.length} traveler{members.length !== 1 ? 's' : ''} — dare each other
          </p>
        </div>

        {/* Invite code display for owner/members */}
        {board.invite_code && (isOwner || isMember) && (
          <InviteCodeDisplay
            inviteCode={board.invite_code}
            slug={board.slug}
            isOwner={isOwner}
            onRegenerate={isOwner ? handleRegenerateInvite : undefined}
          />
        )}

        {/* Join button for non-members */}
        {user && !isMember && board.is_public && (
          <div className="mb-6 text-center">
            <button
              onClick={handleJoin}
              className="font-[Anton] text-lg px-8 py-2 border-none cursor-pointer"
              style={{ background: '#00ccff', color: '#0d0d0d' }}
            >
              JOIN THIS TRIP
            </button>
          </div>
        )}

        {/* Dare form — only for members */}
        {user && isMember && (
          <DareForm
            boardId={board.id}
            boardType="trip"
            currentUserId={user.id}
            members={members}
            onDareCreated={fetchBoard}
          />
        )}

        <Board
          dares={dares}
          boardType="trip"
          currentUserId={user?.id ?? null}
          onHype={handleHype}
          onComplete={handleComplete}
          onChicken={handleChicken}
          onShare={handleShare}
          onProofClick={handleProofClick}
        />
      </div>

      <StatsBar total={dares.length} completed={completed} enablers={members.length} enablersLabel="Members" />

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
