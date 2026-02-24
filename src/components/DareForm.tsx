import { useState } from 'react'
import AIPanel from './AIPanel'
import MemberPicker from './MemberPicker'
import type { BoardMember } from '../types'

interface Props {
  boardId: number
  boardType: 'personal' | 'trip'
  currentUserId: number | null
  members?: BoardMember[]
  onDareCreated: () => void
}

export default function DareForm({ boardId, boardType, currentUserId, members, onDareCreated }: Props) {
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [location, setLocation] = useState('')
  const [reward, setReward] = useState('')
  const [daredId, setDaredId] = useState<number | null>(null)
  const [showAI, setShowAI] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    if (boardType === 'personal' && !author.trim()) return
    if (boardType === 'trip' && !daredId) return

    await fetch(`/api/boards/${boardId}/dares`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ author, text, location, reward, daredId }),
    })
    setAuthor('')
    setText('')
    setLocation('')
    setReward('')
    setDaredId(null)
    onDareCreated()
  }

  const handleAIDare = (dare: string) => {
    setText(dare)
    setShowAI(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative border-2 border-[#555048] mb-12"
      style={{ background: '#131313' }}
    >
      {/* Red tab label */}
      <div
        className="absolute -top-4 left-4 px-3 py-0.5 font-[Anton] text-sm tracking-wide"
        style={{ background: '#ff0055', color: '#f0f0f0' }}
      >
        SUBMIT A DARE
      </div>

      <div className="grid grid-cols-2 gap-0 pt-6">
        {/* Name — only on personal boards (anonymous dares) */}
        {boardType === 'personal' && (
          <div className="p-4 border-b border-r border-[#555048]">
            <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
              Your Name
            </label>
            <input
              className="dare-input"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Anonymous"
              required
            />
          </div>
        )}

        {/* Member picker — only on trip boards */}
        {boardType === 'trip' && members && currentUserId && (
          <div className="p-4 border-b border-r border-[#555048]">
            <MemberPicker
              members={members}
              selectedId={daredId}
              currentUserId={currentUserId}
              onChange={setDaredId}
            />
          </div>
        )}

        {/* Reward */}
        <div className="p-4 border-b border-[#555048]">
          <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
            Reward
          </label>
          <input
            className="dare-input"
            value={reward}
            onChange={e => setReward(e.target.value)}
            placeholder="Bragging rights"
          />
        </div>

        {/* Location */}
        <div className="p-4 border-b border-[#555048] col-span-2">
          <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
            Location
          </label>
          <input
            className="dare-input"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Anywhere on earth"
          />
        </div>

        {/* Dare */}
        <div className="p-4 col-span-2">
          <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
            The Dare
          </label>
          <textarea
            className="dare-input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="I dare you to..."
            required
          />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between p-4 border-t border-[#555048]">
        <button
          type="button"
          onClick={() => setShowAI(!showAI)}
          className="font-[Courier_Prime] text-xs text-[#aaa49c] hover:text-[#ff0055] transition-colors cursor-pointer"
          style={{ borderBottom: '2px dotted #555048' }}
        >
          Need inspiration?
        </button>
        <button
          type="submit"
          className="font-[Anton] text-xl px-8 py-2 cursor-pointer border-none"
          style={{
            background: '#ff0055',
            color: '#f0f0f0',
            boxShadow: '4px 4px 0 #ff0055aa',
          }}
        >
          POST IT
        </button>
      </div>

      {showAI && <AIPanel onSelectDare={handleAIDare} />}
    </form>
  )
}
