import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API } from '../config/api'

export default function CreateTripPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) return <Navigate to="/login" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch(`${API}/api/boards/trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, isPublic }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    navigate(`/trip/${data.board.slug}`)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h2 className="font-[Anton] text-4xl text-[#00ccff] mb-2">CREATE TRIP</h2>
      <p className="font-[Courier_Prime] text-sm text-[#aaa49c] mb-8">
        going somewhere. might as well make it worse.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="font-[Courier_Prime] text-sm text-[#ff0055] border border-[#ff0055] p-3">
            {error}
          </div>
        )}

        <div>
          <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
            Trip Name
          </label>
          <input
            className="dare-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Thailand 2026"
            required
          />
        </div>

        <div className="flex items-center gap-3 mt-2">
          <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c]">
            Visibility
          </label>
          <button
            type="button"
            onClick={() => setIsPublic(true)}
            className="font-[Courier_Prime] text-xs px-3 py-1 border cursor-pointer transition-colors"
            style={{
              background: isPublic ? '#00ff99' : 'transparent',
              color: isPublic ? '#0d0d0d' : '#aaa49c',
              borderColor: isPublic ? '#00ff99' : '#555048',
            }}
          >
            public
          </button>
          <button
            type="button"
            onClick={() => setIsPublic(false)}
            className="font-[Courier_Prime] text-xs px-3 py-1 border cursor-pointer transition-colors"
            style={{
              background: !isPublic ? '#ffcc00' : 'transparent',
              color: !isPublic ? '#0d0d0d' : '#aaa49c',
              borderColor: !isPublic ? '#ffcc00' : '#555048',
            }}
          >
            private (invite only)
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="font-[Anton] text-xl px-8 py-3 cursor-pointer border-none mt-4"
          style={{ background: '#00ccff', color: '#0d0d0d', boxShadow: '4px 4px 0 #00ccffaa' }}
        >
          {loading ? 'CREATING...' : 'CREATE TRIP BOARD'}
        </button>
      </form>
    </div>
  )
}
