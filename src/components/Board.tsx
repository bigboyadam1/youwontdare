import type { Dare } from '../types'
import DareCard from './DareCard'

interface Props {
  dares: Dare[]
  boardType: 'personal' | 'group'
  currentUserId: number | null
  onHype: (id: number) => void
  onComplete: (dare: Dare) => void
  onChicken: (id: number) => void
  onShare: (dare: Dare) => void
  onProofClick: (url: string, caption: string) => void
  onDareBack?: (dare: Dare) => void
  onShareStory?: (dare: Dare) => void
  onReveal?: (dare: Dare) => void
  onDelete?: (dare: Dare) => void
}

export default function Board({ dares, boardType, currentUserId, onHype, onComplete, onChicken, onShare, onProofClick, onDareBack, onShareStory, onReveal, onDelete }: Props) {
  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <h2
          className="font-[Anton] text-[2.5rem] leading-none"
          style={{ color: '#f0f0f0' }}
        >
          THE BOARD
        </h2>
        <span className="font-[Courier_Prime] text-sm text-[#aaa49c]">
          {dares.length} dare{dares.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="border-t-4 border-[#f0f0f0] mb-6" />

      <div className="flex flex-col gap-4">
        {dares.map((dare, i) => (
          <DareCard
            key={dare.id}
            dare={dare}
            index={dares.length - i}
            isOwner={currentUserId !== null && dare.dared_id === currentUserId}
            boardType={boardType}
            currentUserId={currentUserId}
            onHype={() => onHype(dare.id)}
            onComplete={() => onComplete(dare)}
            onChicken={() => onChicken(dare.id)}
            onShare={() => onShare(dare)}
            onProofClick={onProofClick}
            onDareBack={onDareBack ? () => onDareBack(dare) : undefined}
            onShareStory={onShareStory ? () => onShareStory(dare) : undefined}
            onReveal={onReveal ? () => onReveal(dare) : undefined}
            onDelete={onDelete ? () => onDelete(dare) : undefined}
          />
        ))}
      </div>
    </section>
  )
}
