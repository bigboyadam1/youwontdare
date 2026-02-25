import type { Dare } from '../types'

interface Props {
  dares: Dare[]
  onProofClick: (url: string, caption: string) => void
}

export default function ProofGallery({ dares, onProofClick }: Props) {
  const withProof = dares.filter(d => d.status === 'completed' && d.proof_url)

  if (withProof.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2
            className="font-[Anton] text-[2.5rem] leading-none"
            style={{ color: '#f0f0f0' }}
          >
            PROOF GALLERY
          </h2>
        </div>
        <div className="border-t-4 border-[#f0f0f0] mb-6" />
        <p className="font-[Courier_Prime] text-sm text-[#aaa49c] text-center py-8">
          No proof submitted yet — complete a dare to see it here.
        </p>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <h2
          className="font-[Anton] text-[2.5rem] leading-none"
          style={{ color: '#f0f0f0' }}
        >
          PROOF GALLERY
        </h2>
        <span className="font-[Courier_Prime] text-sm text-[#aaa49c]">
          {withProof.length} proof{withProof.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="border-t-4 border-[#f0f0f0] mb-6" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {withProof.map(dare => (
          <div
            key={dare.id}
            className="relative cursor-pointer group overflow-hidden border border-[#555048]"
            style={{ background: '#131313', aspectRatio: '1' }}
            onClick={() => onProofClick(dare.proof_url!, dare.proof_caption || '')}
          >
            <img
              src={dare.proof_url!}
              alt="proof"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div
              className="absolute bottom-0 left-0 right-0 p-2"
              style={{ background: 'linear-gradient(transparent, rgba(13,13,13,0.9))' }}
            >
              <p className="font-[Anton] text-xs text-[#f0f0f0] leading-tight truncate">
                {dare.text}
              </p>
              {dare.proof_caption && (
                <p className="font-[Courier_Prime] text-[10px] text-[#aaa49c] truncate">
                  {dare.proof_caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
