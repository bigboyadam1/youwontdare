import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API } from '../config/api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('error') === 'google_failed') {
      setError('Google login failed. Please try again.')
    }
  }, [searchParams])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      triggerShake()
    } else {
      const redirect = searchParams.get('redirect')
      navigate(redirect || '/')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h2 className="font-[Anton] text-4xl text-[#f0f0f0] mb-2">LOG IN</h2>
      <p className="font-[Courier_Prime] text-sm text-[#aaa49c] mb-8">back for more bad decisions.</p>

      {/* Google Login */}
      <a
        href={`${API}/api/auth/google${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
        className="flex items-center justify-center gap-3 w-full py-3 px-6 border border-[#555048] cursor-pointer no-underline mb-6 transition-colors hover:border-[#aaa49c]"
        style={{ background: '#1c1c1c' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="font-[Courier_Prime] text-sm text-[#f0f0f0]">Continue with Google</span>
      </a>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-[#555048]" />
        <span className="font-[Courier_Prime] text-xs text-[#555048]">or</span>
        <div className="flex-1 h-px bg-[#555048]" />
      </div>

      <form onSubmit={handleSubmit} className={`flex flex-col gap-4 ${shake ? 'shake' : ''}`}>
        {error && (
          <div className="font-[Courier_Prime] text-sm text-[#ff0055] border border-[#ff0055] p-3">
            {error}
          </div>
        )}

        <div>
          <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
            Email
          </label>
          <input
            className="dare-input"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            required
          />
        </div>

        <div>
          <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
            Password
          </label>
          <input
            className="dare-input"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="font-[Anton] text-xl px-8 py-3 cursor-pointer border-none mt-2"
          style={{ background: '#ff0055', color: '#f0f0f0', boxShadow: '4px 4px 0 #ff0055aa' }}
        >
          {loading ? 'LOGGING IN...' : 'LOG IN'}
        </button>
      </form>

      <p className="font-[Courier_Prime] text-sm text-[#aaa49c] mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[#00ccff] hover:text-[#f0f0f0] transition-colors no-underline">
          Sign up →
        </Link>
      </p>
    </div>
  )
}
