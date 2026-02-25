import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="mb-8 pt-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <Link to="/" className="no-underline">
            <h1
              className="font-[Anton] uppercase leading-none"
              style={{
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                transform: 'skewY(-4deg)',
                textShadow: '3px 3px #ff0055',
                color: '#f0f0f0',
              }}
            >
              YOU WON'T DARE
            </h1>
          </Link>

          <nav className="flex items-center gap-3 font-[Courier_Prime] text-xs">
            {user ? (
              <>
                <Link
                  to="/my-boards"
                  className="text-[#aaa49c] hover:text-[#f0f0f0] transition-colors no-underline"
                >
                  my boards
                </Link>
                <Link
                  to="/create-trip"
                  className="text-[#aaa49c] hover:text-[#00ccff] transition-colors no-underline"
                >
                  + trip
                </Link>
                <Link
                  to={`/profile/${user.username}`}
                  className="text-[#aaa49c] hover:text-[#f0f0f0] transition-colors no-underline"
                >
                  @{user.username}
                </Link>
                <button
                  onClick={logout}
                  className="text-[#555048] hover:text-[#ff0055] transition-colors cursor-pointer border-none bg-transparent font-[Courier_Prime] text-xs"
                >
                  logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[#aaa49c] hover:text-[#f0f0f0] transition-colors no-underline"
                >
                  log in
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1 no-underline"
                  style={{ background: '#ff0055', color: '#f0f0f0' }}
                >
                  sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
