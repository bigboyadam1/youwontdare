import ShareCard from '../components/ShareCard'
import type { Dare } from '../types'

const exampleWithProof: Dare = {
  id: 1,
  author: 'adam',
  text: 'Eat a raw onion like an apple',
  location: null,
  reward: null,
  hypes: 5,
  status: 'completed',
  proof_url: 'https://picsum.photos/id/292/600/600',
  proof_caption: 'it burned so bad',
  created_at: '2026-02-28T12:00:00Z',
  board_id: 1,
  darer_id: 1,
  dared_id: 2,
  darer_name: 'Adam',
  dared_name: 'Benny',
}

const exampleChickened: Dare = {
  id: 2,
  author: 'benny',
  text: 'Jump in the ocean at midnight',
  location: null,
  reward: null,
  hypes: 3,
  status: 'chickened',
  proof_url: null,
  proof_caption: null,
  created_at: '2026-02-28T12:00:00Z',
  board_id: 1,
  darer_id: 2,
  dared_id: 1,
  darer_name: 'Benny',
  dared_name: 'Adam',
}

const exampleNoProof: Dare = {
  id: 3,
  author: 'adam',
  text: 'Do a backflip off the diving board',
  location: null,
  reward: null,
  hypes: 8,
  status: 'completed',
  proof_url: null,
  proof_caption: null,
  created_at: '2026-02-28T12:00:00Z',
  board_id: null,
  darer_id: 1,
  dared_id: null,
  darer_name: 'Adam',
}

export default function SharePreviewPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="font-[Anton] text-2xl text-[#f0f0f0] mb-6">ShareCard Preview</h2>
      <div className="flex flex-wrap gap-8 justify-center">
        <div>
          <p className="font-[Courier_Prime] text-xs text-[#777] mb-2">With proof + attribution</p>
          <div style={{ border: '1px solid #333' }}>
            <ShareCard dare={exampleWithProof} />
          </div>
        </div>
        <div>
          <p className="font-[Courier_Prime] text-xs text-[#777] mb-2">Chickened — no proof</p>
          <div style={{ border: '1px solid #333' }}>
            <ShareCard dare={exampleChickened} />
          </div>
        </div>
        <div>
          <p className="font-[Courier_Prime] text-xs text-[#777] mb-2">Completed — no proof, single darer</p>
          <div style={{ border: '1px solid #333' }}>
            <ShareCard dare={exampleNoProof} />
          </div>
        </div>
      </div>
    </div>
  )
}
