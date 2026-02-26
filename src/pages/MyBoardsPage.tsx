import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API } from '../config/api'

interface Member {
  id: number
  username: string
  display_name: string
}

interface Board {
  id: number
  slug: string
  name: string
  type: 'personal' | 'trip'
  owner_id: number
  owner_name: string
  dare_count: number
  member_count: number
  members?: Member[]
}

export default function MyBoardsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [joining, setJoining] = useState(false)
  const [shareToast, setShareToast] = useState(false)

  useEffect(() => {
    if (!user) return
    fetch(`${API}/api/boards/mine`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setBoards(data.boards)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  if (!user) return <Navigate to="/login" replace />

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <p className="font-[Courier_Prime] text-sm text-[#aaa49c]">Loading boards...</p>
      </div>
    )
  }

  const personalBoard = boards.find(b => b.type === 'personal' && b.owner_id === user.id)
  const friendsBoards = boards.filter(b => b.type === 'personal' && b.owner_id !== user.id)
  const tripBoards = boards.filter(b => b.type === 'trip')

  const formatMembers = (members: Member[]) => {
    if (!members || members.length === 0) return ''
    const shown = members.slice(0, 3).map(m => m.display_name || m.username)
    const remaining = members.length - 3
    return remaining > 0 ? `${shown.join(', ')} +${remaining}` : shown.join(', ')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Personal Board Section */}
      <h2 className="font-[Anton] text-3xl text-[#f0f0f0] mb-4">MY BOARD</h2>
      {personalBoard ? (
        <div className="flex items-stretch gap-2 mb-12">
          <Link
            to={`/board/${personalBoard.slug}`}
            className="block no-underline flex-1"
          >
            <div
              className="p-5 border transition-colors hover:border-[#aaa49c] h-full"
              style={{ background: '#131313', borderColor: '#555048' }}
            >
              <div className="flex items-center justify-between">
                <span className="font-[Anton] text-xl text-[#f0f0f0]">
                  {personalBoard.name || 'Personal Board'}
                </span>
                <span className="font-[Courier_Prime] text-xs text-[#aaa49c]">
                  {personalBoard.dare_count} {personalBoard.dare_count === 1 ? 'dare' : 'dares'}
                </span>
              </div>
            </div>
          </Link>
          <button
            onClick={async () => {
              const shareUrl = `${window.location.origin}/board/${personalBoard.slug}`
              const shareText = `🔥 Dare me on YouWontDare!`
              if (navigator.share) {
                try {
                  await navigator.share({ text: shareText, url: shareUrl })
                  return
                } catch {
                  // User cancelled or share failed — fall through to clipboard
                }
              }
              await navigator.clipboard.writeText(shareUrl)
              setShareToast(true)
              setTimeout(() => setShareToast(false), 2000)
            }}
            className="font-[Anton] text-sm px-4 cursor-pointer border transition-colors hover:border-[#aaa49c] flex items-center"
            style={{ background: '#131313', borderColor: '#555048', color: '#f0f0f0' }}
            title="Share your board"
          >
            {shareToast ? 'COPIED!' : 'SHARE'}
          </button>
        </div>
      ) : (
        <p className="font-[Courier_Prime] text-sm text-[#555048] mb-12">
          No personal board yet.
        </p>
      )}

      {/* Friends' Boards Section */}
      {friendsBoards.length > 0 && (
        <>
          <h2 className="font-[Anton] text-3xl text-[#ffcc00] mb-4">FRIENDS' BOARDS</h2>
          <div className="flex flex-col gap-3 mb-12">
            {friendsBoards.map(board => (
              <Link
                key={board.id}
                to={`/board/${board.slug}`}
                className="block no-underline"
              >
                <div
                  className="p-5 border transition-colors hover:border-[#aaa49c]"
                  style={{ background: '#131313', borderColor: '#555048' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-[Anton] text-xl text-[#f0f0f0]">
                      {board.owner_name ? `${board.owner_name}'s Board` : board.name}
                    </span>
                    <span className="font-[Courier_Prime] text-xs text-[#aaa49c]">
                      {board.dare_count} {board.dare_count === 1 ? 'dare' : 'dares'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Trip Boards Section */}
      <h2 className="font-[Anton] text-3xl text-[#00ccff] mb-1">TRIP BOARDS</h2>
      <p className="font-[Courier_Prime] text-sm text-[#aaa49c] mb-4">who's on board?</p>
      {tripBoards.length > 0 ? (
        <div className="flex flex-col gap-3 mb-8">
          {tripBoards.map(board => (
            <Link
              key={board.id}
              to={`/trip/${board.slug}`}
              className="block no-underline"
            >
              <div
                className="p-5 border transition-colors hover:border-[#aaa49c]"
                style={{ background: '#131313', borderColor: '#555048' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-[Anton] text-xl text-[#f0f0f0]">
                      {board.name}
                    </span>
                    {board.owner_id === user.id && (
                      <span
                        className="font-[Courier_Prime] text-[10px] uppercase px-2 py-0.5"
                        style={{ background: '#ffcc00', color: '#0d0d0d' }}
                      >
                        owner
                      </span>
                    )}
                  </div>
                  <span className="font-[Courier_Prime] text-xs text-[#aaa49c]">
                    {board.dare_count} {board.dare_count === 1 ? 'dare' : 'dares'}
                  </span>
                </div>
                {board.members && board.members.length > 0 && (
                  <p className="font-[Courier_Prime] text-xs text-[#aaa49c] m-0">
                    {formatMembers(board.members)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="font-[Courier_Prime] text-sm text-[#555048] mb-8">
          No trip boards yet. Create one or join with an invite code.
        </p>
      )}

      {/* Join Trip + Create Trip */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!joinCode.trim()) return
            setJoinError('')
            setJoining(true)
            try {
              const res = await fetch(`${API}/api/boards/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ code: joinCode.trim() }),
              })
              const data = await res.json()
              if (!res.ok) {
                setJoinError(data.error || 'Failed to join')
              } else {
                navigate(`/trip/${data.slug}`)
              }
            } catch {
              setJoinError('Network error')
            } finally {
              setJoining(false)
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="invite code"
            value={joinCode}
            onChange={(e) => { setJoinCode(e.target.value); setJoinError('') }}
            className="font-[Courier_Prime] text-sm px-3 py-3 border bg-transparent text-[#f0f0f0] outline-none"
            style={{ borderColor: '#555048', width: '160px' }}
          />
          <button
            type="submit"
            disabled={joining}
            className="font-[Anton] text-xl px-6 py-3 cursor-pointer border-none"
            style={{ background: '#ffcc00', color: '#0d0d0d', boxShadow: '4px 4px 0 #ffcc00aa' }}
          >
            {joining ? '...' : 'JOIN'}
          </button>
        </form>

        <Link to="/create-trip" className="no-underline">
          <button
            className="font-[Anton] text-xl px-8 py-3 cursor-pointer border-none"
            style={{ background: '#00ccff', color: '#0d0d0d', boxShadow: '4px 4px 0 #00ccffaa' }}
          >
            + CREATE TRIP
          </button>
        </Link>
      </div>
      {joinError && (
        <p className="font-[Courier_Prime] text-sm mt-2" style={{ color: '#ff4444' }}>
          {joinError}
        </p>
      )}
    </div>
  )
}
