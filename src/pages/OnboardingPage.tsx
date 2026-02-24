import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function OnboardingPage() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

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
