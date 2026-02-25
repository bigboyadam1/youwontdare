import { useState } from 'react'
import { useAnonId } from '../hooks/useAnonId'

interface Props {
  dareId: number
  fire: number
  skull: number
  crying: number
}

const REACTIONS = [
  { type: 'fire', emoji: '\uD83D\uDD25' },
  { type: 'skull', emoji: '\uD83D\uDC80' },
  { type: 'crying', emoji: '\uD83D\uDE2D' },
] as const

export default function ReactionBar({ dareId, fire, skull, crying }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({ fire, skull, crying })
  const anonId = useAnonId()

  const handleReact = async (reactionType: string) => {
    const res = await fetch(`/api/dares/${dareId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ reaction_type: reactionType, anon_id: anonId }),
    })
    if (res.ok) {
      const data = await res.json()
      setCounts(data.reactions)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {REACTIONS.map(({ type, emoji }) => (
        <button
          key={type}
          onClick={() => handleReact(type)}
          className="font-[Courier_Prime] text-xs border border-[#555048] px-2 py-0.5 hover:border-[#ffcc00] transition-colors cursor-pointer"
          style={{ background: 'transparent', color: '#aaa49c' }}
        >
          {emoji} {counts[type] || 0}
        </button>
      ))}
    </div>
  )
}
