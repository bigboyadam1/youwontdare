import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signup(email, password, username, displayName)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      navigate('/onboarding')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h2 className="font-[Anton] text-4xl text-[#f0f0f0] mb-2">SIGN UP</h2>
      <p className="font-[Courier_Prime] text-sm text-[#aaa49c] mb-8">this will end well.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            placeholder="your-url-slug"
            required
          />
          <span className="font-[Courier_Prime] text-[10px] text-[#555048] mt-1 block">
            youwontdare.com/board/{username || '...'}
          </span>
        </div>

        <div>
          <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
            Email
          </label>
          <input
            className="dare-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="font-[Anton] text-xl px-8 py-3 cursor-pointer border-none mt-2"
          style={{ background: '#ff0055', color: '#f0f0f0', boxShadow: '4px 4px 0 #ff0055aa' }}
        >
          {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <p className="font-[Courier_Prime] text-sm text-[#aaa49c] mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-[#00ccff] hover:text-[#f0f0f0] transition-colors no-underline">
          Log in →
        </Link>
      </p>
    </div>
  )
}
