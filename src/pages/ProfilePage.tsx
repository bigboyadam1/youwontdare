import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

interface ProfileData {
  user: { id: number; username: string; display_name: string; created_at: string }
  stats: { daresCompleted: number; daresGiven: number; completionRate: number }
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then(res => {
        if (!res.ok) throw new Error('User not found')
        return res.json()
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="font-[Courier_Prime] text-[#aaa49c]">Loading profile...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="font-[Anton] text-3xl text-[#ff0055] mb-2">NOT FOUND</h2>
        <p className="font-[Courier_Prime] text-sm text-[#aaa49c]">{error}</p>
      </div>
    )
  }

  const { user, stats } = data

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h2 className="font-[Anton] text-4xl text-[#f0f0f0]">{user.display_name}</h2>
        <p className="font-[Courier_Prime] text-sm text-[#aaa49c]">@{user.username}</p>
        <p className="font-[Courier_Prime] text-xs text-[#555048] mt-1">
          joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="border border-[#555048] p-4 text-center" style={{ background: '#131313' }}>
          <div className="font-[Anton] text-3xl text-[#00ff99]">{stats.daresCompleted}</div>
          <div className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c]">
            Completed
          </div>
        </div>
        <div className="border border-[#555048] p-4 text-center" style={{ background: '#131313' }}>
          <div className="font-[Anton] text-3xl text-[#ff0055]">{stats.daresGiven}</div>
          <div className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c]">
            Given
          </div>
        </div>
        <div className="border border-[#555048] p-4 text-center" style={{ background: '#131313' }}>
          <div className="font-[Anton] text-3xl text-[#ffcc00]">{stats.completionRate}%</div>
          <div className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c]">
            Rate
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          to={`/board/${user.username}`}
          className="font-[Anton] text-lg px-8 py-2 border-none inline-block no-underline"
          style={{ background: '#ff0055', color: '#f0f0f0', boxShadow: '4px 4px 0 #ff0055aa' }}
        >
          VIEW BOARD
        </Link>
      </div>
    </div>
  )
}
