import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const { user } = useAuth()

  const chickens: { top: string; left?: string; right?: string; size: string; rotate: number; opacity: number }[] = [
    { top: '5%', left: '8%', size: '2.5rem', rotate: -18, opacity: 0.15 },
    { top: '12%', right: '6%', size: '1.8rem', rotate: 25, opacity: 0.12 },
    { top: '38%', left: '3%', size: '1.4rem', rotate: -35, opacity: 0.1 },
    { top: '55%', right: '4%', size: '2rem', rotate: 12, opacity: 0.13 },
    { top: '75%', left: '10%', size: '1.6rem', rotate: 40, opacity: 0.11 },
    { top: '82%', right: '12%', size: '1.2rem', rotate: -22, opacity: 0.1 },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center relative overflow-hidden">
      {/* Scattered chickens */}
      {chickens.map((c, i) => (
        <span
          key={i}
          className="absolute select-none pointer-events-none"
          style={{
            top: c.top,
            left: c.left,
            right: c.right,
            fontSize: c.size,
            transform: `rotate(${c.rotate}deg)`,
            opacity: c.opacity,
          }}
        >
          🐔
        </span>
      ))}
      <h2
        className="font-[Anton] uppercase leading-none mb-4"
        style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          color: '#f0f0f0',
        }}
      >
        DARE YOUR FRIENDS.<br />
        <span style={{ color: '#ff0055' }}>PROVE IT.</span>
      </h2>
      <p className="font-[Courier_Prime] text-sm text-[#aaa49c] mb-12">
        a public record of things you probably shouldn't do.
      </p>

      {user ? (
        <div className="flex flex-col items-center gap-4">
          <Link
            to={`/board/${user.username}`}
            className="font-[Anton] text-xl px-10 py-3 border-none inline-block no-underline"
            style={{ background: '#ff0055', color: '#f0f0f0', boxShadow: '4px 4px 0 #ff0055aa' }}
          >
            MY BOARD
          </Link>
          <Link
            to="/create-group"
            className="font-[Courier_Prime] text-sm text-[#00ccff] hover:text-[#f0f0f0] transition-colors no-underline"
          >
            or create a group board →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/signup"
            className="font-[Anton] text-xl px-10 py-3 border-none inline-block no-underline"
            style={{ background: '#ff0055', color: '#f0f0f0', boxShadow: '4px 4px 0 #ff0055aa' }}
          >
            GET STARTED
          </Link>
          <Link
            to="/login"
            className="font-[Courier_Prime] text-sm text-[#aaa49c] hover:text-[#f0f0f0] transition-colors no-underline"
          >
            already have an account? log in →
          </Link>
        </div>
      )}

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 text-left">
        <div className="border border-[#555048] p-5" style={{ background: '#131313' }}>
          <div className="font-[Anton] text-lg text-[#ff0055] mb-2">PERSONAL BOARD</div>
          <p className="font-[Courier_Prime] text-xs text-[#aaa49c]">
            Your board. Your link. Share it. Wait for the worst.
          </p>
        </div>
        <div className="border border-[#555048] p-5" style={{ background: '#131313' }}>
          <div className="font-[Anton] text-lg text-[#00ccff] mb-2">GROUP BOARDS</div>
          <p className="font-[Courier_Prime] text-xs text-[#aaa49c]">
            Stag do. Work trip. Whatever. Everyone dares everyone. It gets out of hand.
          </p>
        </div>
        <div className="border border-[#555048] p-5" style={{ background: '#131313' }}>
          <div className="font-[Anton] text-lg text-[#00ff99] mb-2">PROVE IT</div>
          <p className="font-[Courier_Prime] text-xs text-[#aaa49c]">
            Upload proof. Get the glory. Or chicken out.
          </p>
        </div>
      </div>
    </div>
  )
}
