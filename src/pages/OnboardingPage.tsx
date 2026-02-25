import { useState } from 'react'
import { Link, Navigate, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API } from '../config/api'

export default function OnboardingPage() {
  const { user, refresh } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const needsSetup = searchParams.get('setup') === 'true'

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) return <Navigate to="/login" replace />

  const handleSetupUsername = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(`${API}/api/auth/setup-username`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, displayName }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    await refresh()
    navigate('/onboarding')
  }

  // Show username setup form for Google users
  if (needsSetup) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <h2 className="font-[Anton] text-4xl text-[#00ff99] mb-2">ALMOST THERE</h2>
        <p className="font-[Courier_Prime] text-sm text-[#aaa49c] mb-8">
          pick a username for your dare board.
        </p>

        <form onSubmit={handleSetupUsername} className="flex flex-col gap-4">
          {error && (
            <div className="font-[Courier_Prime] text-sm text-[#ff0055] border border-[#ff0055] p-3">
              {error}
            </div>
          )}

          <div>
            <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
              Display Name
            </label>
            <input
              className="dare-input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="How your friends know you"
              required
            />
          </div>

          <div>
            <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
              Username
            </label>
            <input
              className="dare-input"
              value={username}
              onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')); setError('') }}
              placeholder="your-url-slug"
              required
            />
            <span className="font-[Courier_Prime] text-[10px] text-[#555048] mt-1 block">
              youwontdare.com/board/{username || '...'}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="font-[Anton] text-xl px-8 py-3 cursor-pointer border-none mt-2"
            style={{ background: '#ff0055', color: '#f0f0f0', boxShadow: '4px 4px 0 #ff0055aa' }}
          >
            {loading ? 'SAVING...' : 'CLAIM USERNAME'}
          </button>
        </form>
      </div>
    )
  }

  const boardUrl = `${window.location.origin}/board/${user.username}`

  const handleCopy = () => {
    navigator.clipboard.writeText(boardUrl)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <h2 className="font-[Anton] text-4xl text-[#00ff99] mb-2">YOU'RE IN</h2>
      <p className="font-[Courier_Prime] text-sm text-[#aaa49c] mb-10">
        ok {user.display_name}, your board exists now. no pressure.
      </p>

      {/* Board link */}
      <div className="border border-[#555048] p-6 mb-8 text-left" style={{ background: '#131313' }}>
        <div className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] mb-2">
          Your Board Link
        </div>
        <div className="flex items-center gap-3">
          <code className="font-[Courier_Prime] text-sm text-[#00ccff] flex-1 break-all">
            {boardUrl}
          </code>
          <button
            onClick={handleCopy}
            className="font-[Anton] text-sm px-4 py-2 border-none cursor-pointer flex-shrink-0"
            style={{ background: '#ff0055', color: '#f0f0f0' }}
          >
            COPY
          </button>
        </div>
        <p className="font-[Courier_Prime] text-xs text-[#555048] mt-3">
          share this — anyone can dare you without signing up.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <Link
          to={`/board/${user.username}`}
          className="font-[Anton] text-xl px-8 py-3 border-none inline-block no-underline text-center"
          style={{ background: '#ff0055', color: '#f0f0f0', boxShadow: '4px 4px 0 #ff0055aa' }}
        >
          GO TO MY BOARD
        </Link>
        <Link
          to="/create-trip"
          className="font-[Courier_Prime] text-sm text-[#00ccff] hover:text-[#f0f0f0] transition-colors no-underline"
        >
          create a trip board →
        </Link>
      </div>
    </div>
  )
}
