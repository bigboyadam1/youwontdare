import { useState } from 'react'
import { API } from '../config/api'

interface Props {
  onSelectDare: (dare: string) => void
}

export default function AIPanel({ onSelectDare }: Props) {
  const [vibe, setVibe] = useState('anything')
  const [location, setLocation] = useState('')
  const [dares, setDares] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true)
    setError('')
    setDares([])
    try {
      const res = await fetch(`${API}/api/generate-dares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe, location }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate')
      }
      const data = await res.json()
      setDares(data.dares)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const selectStyle = {
    background: '#1c1c1c',
    border: '1px solid #555048',
    color: '#f0f0f0',
    fontFamily: 'Courier Prime, monospace',
    fontSize: '0.85rem',
    padding: '0.4rem 0.6rem',
  }

  return (
    <div className="border-t border-[#555048] p-4" style={{ background: '#1c1c1c' }}>
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div>
          <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
            Vibe
          </label>
          <select value={vibe} onChange={e => setVibe(e.target.value)} style={selectStyle}>
            <option value="anything">Anything</option>
            <option value="social">Social</option>
            <option value="food">Food</option>
            <option value="adventure">Adventure</option>
            <option value="performance">Performance</option>
            <option value="fashion">Fashion</option>
            <option value="local exploration">Local Exploration</option>
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
            Location
          </label>
          <input
            className="dare-input"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Optional"
            style={{ fontSize: '0.85rem' }}
          />
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="font-[Anton] text-sm px-5 py-2 cursor-pointer border-none"
          style={{ background: '#00ccff', color: '#0d0d0d' }}
        >
          {loading ? 'THINKING...' : 'GENERATE'}
        </button>
      </div>

      {error && (
        <p className="text-sm text-[#ff0055] mb-2">{error}</p>
      )}

      {dares.length > 0 && (
        <div className="flex flex-col gap-2">
          {dares.map((dare, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDare(dare)}
              className="text-left p-3 border border-[#555048] hover:border-[#00ccff] transition-colors cursor-pointer font-[Courier_Prime] text-sm text-[#f0f0f0]"
              style={{ background: '#131313' }}
            >
              {dare}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
