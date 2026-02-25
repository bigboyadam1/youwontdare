import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
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
            to="/create-trip"
            className="font-[Courier_Prime] text-sm text-[#00ccff] hover:text-[#f0f0f0] transition-colors no-underline"
          >
            or create a trip board →
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
            Your board. Your link. Friends dare you anonymously. You prove it or don't.
          </p>
        </div>
        <div className="border border-[#555048] p-5" style={{ background: '#131313' }}>
          <div className="font-[Anton] text-lg text-[#00ccff] mb-2">TRIP BOARDS</div>
          <p className="font-[Courier_Prime] text-xs text-[#aaa49c]">
            Travelling with people. Everyone dares everyone. It gets out of hand.
          </p>
        </div>
        <div className="border border-[#555048] p-5" style={{ background: '#131313' }}>
          <div className="font-[Anton] text-lg text-[#00ff99] mb-2">AI DARES</div>
          <p className="font-[Courier_Prime] text-xs text-[#aaa49c]">
            Can't think of anything. AI can.
          </p>
        </div>
      </div>
    </div>
  )
}
