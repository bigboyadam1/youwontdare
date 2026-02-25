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

          <nav className="flex items-center gap-2 font-[Courier_Prime] text-xs">
            {user ? (
              <>
                <Link
                  to="/my-boards"
                  className="px-2.5 py-1 no-underline transition-opacity hover:opacity-80"
                  style={{ background: '#ff0055', color: '#f0f0f0' }}
                >
                  my boards
                </Link>
                <Link
                  to="/create-trip"
                  className="px-2.5 py-1 no-underline transition-opacity hover:opacity-80"
                  style={{ background: '#00ccff', color: '#0d0d0d' }}
                >
                  + trip
                </Link>
                <Link
                  to={`/profile/${user.username}`}
                  className="px-2.5 py-1 no-underline transition-opacity hover:opacity-80"
                  style={{ background: '#ffcc00', color: '#0d0d0d' }}
                >
                  profile
                </Link>
                <button
                  onClick={logout}
                  className="px-2.5 py-1 cursor-pointer border-none font-[Courier_Prime] text-xs transition-opacity hover:opacity-80"
                  style={{ background: '#555048', color: '#f0f0f0' }}
                >
                  logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-2.5 py-1 no-underline transition-opacity hover:opacity-80"
                  style={{ background: '#ff0055', color: '#f0f0f0' }}
                >
                  log in
                </Link>
                <Link
                  to="/signup"
                  className="px-2.5 py-1 no-underline transition-opacity hover:opacity-80"
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
