import { useState } from 'react'
import { useAnonId } from '../hooks/useAnonId'

interface Props {
  dareId: number
  avg: number | null
  count: number
}

export default function SpiceRating({ dareId, avg, count }: Props) {
  const [spiceAvg, setSpiceAvg] = useState(avg || 0)
  const [spiceCount, setSpiceCount] = useState(count)
  const [hovered, setHovered] = useState(0)
  const anonId = useAnonId()

  const handleRate = async (rating: number) => {
    const res = await fetch(`/api/dares/${dareId}/spice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rating, anon_id: anonId }),
    })
    if (res.ok) {
      const data = await res.json()
      setSpiceAvg(data.spice_avg)
      setSpiceCount(data.spice_count)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => handleRate(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer text-sm transition-transform hover:scale-125"
          style={{
            background: 'transparent',
            border: 'none',
            padding: '0 1px',
            opacity: n <= (hovered || Math.round(spiceAvg)) ? 1 : 0.3,
            filter: n <= (hovered || Math.round(spiceAvg)) ? 'none' : 'grayscale(1)',
          }}
          title={`${n}/5 peppers`}
        >
          {'\uD83C\uDF36\uFE0F'}
        </button>
      ))}
      {spiceCount > 0 && (
        <span className="font-[Courier_Prime] text-[10px] text-[#aaa49c] ml-1">
          {spiceAvg} ({spiceCount})
        </span>
      )}
    </div>
  )
}
