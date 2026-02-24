import type { BoardMember } from '../types'

interface Props {
  members: BoardMember[]
  selectedId: number | null
  currentUserId: number
  onChange: (id: number) => void
}

export default function MemberPicker({ members, selectedId, currentUserId, onChange }: Props) {
  // Filter out current user — can't dare yourself
  const options = members.filter(m => m.id !== currentUserId)

  if (options.length === 0) {
    return (
      <p className="font-[Courier_Prime] text-xs text-[#555048]">
        No other members yet — invite friends to start daring!
      </p>
    )
  }

  return (
    <div>
      <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
        Who are you daring?
      </label>
      <select
        value={selectedId ?? ''}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          background: '#1c1c1c',
          border: '1px solid #555048',
          color: '#f0f0f0',
          fontFamily: 'Courier Prime, monospace',
          fontSize: '0.85rem',
          padding: '0.4rem 0.6rem',
          width: '100%',
        }}
      >
        <option value="">Select a person...</option>
        {options.map(m => (
          <option key={m.id} value={m.id}>
            {m.display_name} (@{m.username})
          </option>
        ))}
      </select>
    </div>
  )
}
