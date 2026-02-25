import { forwardRef } from 'react'
import type { Dare } from '../types'

interface Props {
  dare: Dare
}

const ShareCard = forwardRef<HTMLDivElement, Props>(({ dare }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: 360,
        height: 640,
        background: '#0d0d0d',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top branding */}
      <div>
        <div style={{ color: '#ff0055', fontSize: 14, fontWeight: 'bold', letterSpacing: 4, marginBottom: 8 }}>
          YOU WON'T DARE
        </div>
        <div style={{ width: 40, height: 4, background: '#ff0055' }} />
      </div>

      {/* Dare text */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{
          color: '#f0f0f0',
          fontSize: 28,
          fontWeight: 'bold',
          textTransform: 'uppercase',
          lineHeight: 1.2,
          textAlign: 'center',
        }}>
          {dare.text}
        </p>
      </div>

      {/* Proof image if exists */}
      {dare.proof_url && (
        <div style={{ marginBottom: 16, textAlign: 'center' }}>
          <img
            src={dare.proof_url}
            alt="proof"
            style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover', border: '2px solid #00ff99' }}
            crossOrigin="anonymous"
          />
          {dare.proof_caption && (
            <p style={{ color: '#aaa49c', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
              {dare.proof_caption}
            </p>
          )}
        </div>
      )}

      {/* Status + branding */}
      <div>
        <div style={{
          color: dare.status === 'completed' ? '#00ff99' : dare.status === 'chickened' ? '#ff0055' : '#ffcc00',
          fontSize: 32,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 12,
        }}>
          {dare.status === 'completed' ? 'DONE' : dare.status === 'chickened' ? 'CHICKENED' : 'PENDING'}
        </div>
        <div style={{ color: '#555048', fontSize: 10, textAlign: 'center', letterSpacing: 2 }}>
          youwontdare.com
        </div>
      </div>
    </div>
  )
})

ShareCard.displayName = 'ShareCard'
export default ShareCard
