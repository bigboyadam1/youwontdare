import type { Dare } from '../types'
import ReactionBar from './ReactionBar'
import SpiceRating from './SpiceRating'
import Countdown from './Countdown'

interface Props {
  dare: Dare
  index: number
  isOwner: boolean
  boardType: 'personal' | 'trip'
  currentUserId?: number | null
  onHype: () => void
  onComplete: () => void
  onChicken: () => void
  onShare: () => void
  onProofClick: (url: string, caption: string) => void
  onDareBack?: () => void
  onShareStory?: () => void
  onReveal?: () => void
  onDelete?: () => void
}

export default function DareCard({ dare, index, isOwner, boardType, currentUserId, onHype, onComplete, onChicken, onShare, onProofClick, onDareBack, onShareStory, onReveal, onDelete }: Props) {
  const isHyped = dare.hypes >= 10 && dare.status === 'pending'
  const isCompleted = dare.status === 'completed'
  const isChickened = dare.status === 'chickened'

  const accentColors = ['#ff0055', '#00ff99', '#00ccff', '#ffcc00']
  const accent = accentColors[(index - 1) % accentColors.length]

  const showOwnerActions = isOwner && !isCompleted && !isChickened

  return (
    <div
      className="border border-[#555048] transition-colors hover:bg-[#1c1c1c] group relative overflow-hidden"
      style={{
        background: '#131313',
      }}
    >
      {/* Big stamp overlays */}
      {isChickened && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          style={{ background: 'rgba(13,13,13,0.6)' }}
        >
          <div
            className="font-[Anton] uppercase text-center select-none"
            style={{
              fontSize: 'clamp(4rem, 10vw, 7rem)',
              color: '#ff005540',
              transform: 'rotate(-12deg)',
              lineHeight: 1,
              textShadow: '0 0 30px #ff005520',
            }}
          >
            CHICKEN
          </div>
        </div>
      )}
      {isCompleted && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          style={{ background: 'rgba(13,13,13,0.3)' }}
        >
          <div
            className="font-[Anton] uppercase text-center select-none"
            style={{
              fontSize: 'clamp(4rem, 10vw, 7rem)',
              color: '#00ff9930',
              transform: 'rotate(-8deg)',
              lineHeight: 1,
              textShadow: '0 0 30px #00ff9915',
            }}
          >
            DONE
          </div>
        </div>
      )}

      <div className="grid gap-4 p-4" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
        {/* Number */}
        <div
          className="font-[Anton] leading-none self-start transition-all group-hover:drop-shadow-[0_0_8px_var(--glow)]"
          style={{
            fontSize: '3.5rem',
            color: '#555048',
            '--glow': accent,
          } as React.CSSProperties}
        >
          {String(index).padStart(2, '0')}
        </div>

        {/* Content */}
        <div className="min-w-0">
          <p
            className="font-[Anton] uppercase leading-tight mb-2"
            style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', color: '#f0f0f0' }}
          >
            {dare.text}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs font-[Courier_Prime] text-[#aaa49c]">
            {boardType === 'trip' ? (
              <>
                {dare.darer_name && (
                  <span>from: {dare.is_anonymous && !dare.revealed ? '???' : dare.darer_name}</span>
                )}
                {dare.dared_name && <span className="text-[#ffcc00]">&rarr; {dare.dared_name}</span>}
              </>
            ) : (
              <span>{dare.is_anonymous && !dare.revealed ? '???' : dare.author}</span>
            )}
            {dare.location && <span>📍 {dare.location}</span>}
            {dare.reward && <span>💰 {dare.reward}</span>}
            {dare.deadline && dare.status === 'pending' && (
              <Countdown deadline={dare.deadline} />
            )}
          </div>

          {/* Proof block */}
          {isCompleted && dare.proof_url && (
            <div
              className="flex items-center gap-3 mt-3 p-2 cursor-pointer relative z-20"
              style={{ border: '2px solid #00ff99' }}
              onClick={() => onProofClick(dare.proof_url!, dare.proof_caption || '')}
            >
              <img
                src={dare.proof_url}
                alt="proof"
                className="object-cover flex-shrink-0"
                style={{ width: 90, height: 90 }}
              />
              <div>
                <span className="font-[Anton] text-sm text-[#00ff99] block">PROOF</span>
                {dare.proof_caption && (
                  <span className="font-[Courier_Prime] text-sm text-[#aaa49c]">{dare.proof_caption}</span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 mt-3 relative z-20">
            <button
              onClick={onHype}
              className="font-[Courier_Prime] text-xs border border-[#555048] px-3 py-1 hover:border-[#ff0055] hover:text-[#ff0055] transition-colors cursor-pointer"
              style={{ background: 'transparent', color: '#aaa49c' }}
            >
              ▲ hype ({dare.hypes})
            </button>
            {showOwnerActions && (
              <>
                <button
                  onClick={onComplete}
                  className="font-[Courier_Prime] text-xs px-3 py-1 border-none cursor-pointer"
                  style={{ background: '#00ff99', color: '#0d0d0d' }}
                >
                  done it
                </button>
                <button
                  onClick={onChicken}
                  className="font-[Courier_Prime] text-xs px-3 py-1 border-none cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: '#ff0055', color: '#f0f0f0' }}
                >
                  🐔 chicken out
                </button>
              </>
            )}
            <button
              onClick={onShare}
              className="font-[Courier_Prime] text-xs border border-[#555048] px-3 py-1 hover:border-[#00ccff] hover:text-[#00ccff] transition-colors cursor-pointer"
              style={{ background: 'transparent', color: '#aaa49c' }}
            >
              ⎘ share
            </button>
            {/* Dare Back button — trip boards, completed dares, current user was dared */}
            {boardType === 'trip' && isCompleted && currentUserId === dare.dared_id && onDareBack && (
              <button
                onClick={onDareBack}
                className="font-[Courier_Prime] text-xs px-3 py-1 border-none cursor-pointer"
                style={{ background: '#ffcc00', color: '#0d0d0d' }}
              >
                DARE BACK
              </button>
            )}
            {/* Share story button — completed dares */}
            {isCompleted && onShareStory && (
              <button
                onClick={onShareStory}
                className="font-[Courier_Prime] text-xs border border-[#555048] px-3 py-1 hover:border-[#ff0055] hover:text-[#ff0055] transition-colors cursor-pointer"
                style={{ background: 'transparent', color: '#aaa49c' }}
              >
                share story
              </button>
            )}
            {/* Reveal button — anonymous dares, darer only, completed */}
            {isCompleted && dare.is_anonymous === 1 && !dare.revealed && currentUserId === dare.darer_id && onReveal && (
              <button
                onClick={onReveal}
                className="font-[Courier_Prime] text-xs px-3 py-1 border-none cursor-pointer"
                style={{ background: '#00ccff', color: '#0d0d0d' }}
              >
                REVEAL
              </button>
            )}
            {/* Delete button — dare creator only */}
            {currentUserId === dare.darer_id && onDelete && (
              <button
                onClick={onDelete}
                className="font-[Courier_Prime] text-xs border border-[#555048] px-3 py-1 hover:border-[#ff0055] hover:text-[#ff0055] transition-colors cursor-pointer"
                style={{ background: 'transparent', color: '#555048' }}
              >
                delete
              </button>
            )}
          </div>

          {/* Reactions + Spice on completed dares */}
          {isCompleted && (
            <div className="flex flex-wrap items-center gap-3 mt-2 relative z-20">
              <ReactionBar
                dareId={dare.id}
                fire={dare.react_fire || 0}
                skull={dare.react_skull || 0}
                crying={dare.react_crying || 0}
              />
              <SpiceRating
                dareId={dare.id}
                avg={dare.spice_avg ?? null}
                count={dare.spice_count || 0}
              />
            </div>
          )}
        </div>

        {/* Status badge — small label in corner */}
        <div className="self-start text-right">
          {isHyped && (
            <span className="font-[Anton] text-sm text-[#ff0055]">
              HOT
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
