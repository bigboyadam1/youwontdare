import { useState, useEffect } from 'react'
import MemberPicker from './MemberPicker'
import type { BoardMember } from '../types'
import { API } from '../config/api'

interface Props {
  boardId: number
  boardType: 'personal' | 'trip'
  currentUserId: number | null
  members?: BoardMember[]
  onDareCreated: () => void
  defaultDaredId?: number | null
  formRef?: React.RefObject<HTMLFormElement | null>
}

export default function DareForm({ boardId, boardType, currentUserId, members, onDareCreated, defaultDaredId, formRef }: Props) {
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [location, setLocation] = useState('')
  const [reward, setReward] = useState('')
  const [deadline, setDeadline] = useState('')
  const [daredId, setDaredId] = useState<number | null>(defaultDaredId ?? null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (defaultDaredId !== undefined && defaultDaredId !== null) {
      setDaredId(defaultDaredId)
      setExpanded(true)
    }
  }, [defaultDaredId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    if (boardType === 'personal' && !isAnonymous && !author.trim()) return
    if (boardType === 'trip' && !daredId) return

    await fetch(`${API}/api/boards/${boardId}/dares`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ author, text, location, reward, daredId, deadline: deadline || undefined, isAnonymous }),
    })
    setAuthor('')
    setText('')
    setLocation('')
    setReward('')
    setDeadline('')
    setDaredId(null)
    setIsAnonymous(false)
    setExpanded(false)
    onDareCreated()
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="relative w-full border-2 border-[#555048] mb-12 p-4 cursor-pointer text-left flex items-center justify-between group transition-colors hover:border-[#ff0055]"
        style={{ background: '#131313' }}
      >
        <div
          className="absolute -top-4 left-4 px-3 py-0.5 font-[Anton] text-sm tracking-wide"
          style={{ background: '#ff0055', color: '#f0f0f0' }}
        >
          SUBMIT A DARE
        </div>
        <span className="font-[Courier_Prime] text-sm text-[#aaa49c] group-hover:text-[#f0f0f0] transition-colors">
          I dare you to...
        </span>
        <span className="font-[Anton] text-lg text-[#ff0055]">+</span>
      </button>
    )
  }

  return (
    <form
      ref={formRef}
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

      {/* Collapse button */}
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="absolute -top-4 right-4 px-2 py-0.5 font-[Courier_Prime] text-xs cursor-pointer border-none"
        style={{ background: '#555048', color: '#f0f0f0' }}
      >
        collapse
      </button>

      <div className="grid grid-cols-2 gap-0 pt-6">
        {/* Name — only on personal boards, hidden when anonymous */}
        {boardType === 'personal' && !isAnonymous && (
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

        {/* Deadline */}
        <div className="p-4 border-b border-[#555048]">
          <label className="font-[Courier_Prime] text-[10px] uppercase tracking-widest text-[#aaa49c] block mb-1">
            Deadline (optional)
          </label>
          <input
            type="datetime-local"
            className="dare-input"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
        </div>

        {/* Anonymous checkbox — personal boards only */}
        {boardType === 'personal' && (
          <div className="p-4 border-b border-[#555048] flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous-dare"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              className="cursor-pointer"
            />
            <label htmlFor="anonymous-dare" className="font-[Courier_Prime] text-xs text-[#aaa49c] cursor-pointer">
              Submit anonymously
            </label>
          </div>
        )}

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
      <div className="flex items-center justify-end p-4 border-t border-[#555048]">
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
    </form>
  )
}
