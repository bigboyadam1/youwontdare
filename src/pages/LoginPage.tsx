import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h2 className="font-[Anton] text-4xl text-[#f0f0f0] mb-2">LOG IN</h2>
      <p className="font-[Courier_Prime] text-sm text-[#aaa49c] mb-8">back for more bad decisions.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
