import { forwardRef } from 'react'
import type { Dare } from '../types'

interface Props {
  dare: Dare
}

const ShareCard = forwardRef<HTMLDivElement, Props>(({ dare }, ref) => {
  const isCompleted = dare.status === 'completed'
  const isChickened = dare.status === 'chickened'

  // Attribution line
  const attribution = dare.darer_name && dare.dared_name
    ? `${dare.darer_name} dared ${dare.dared_name}`
    : dare.darer_name
      ? `dared by ${dare.darer_name}`
      : null

  const statusColor = isCompleted ? '#00ff99' : isChickened ? '#ff0055' : '#ffcc00'
  const statusText = isCompleted ? 'DONE' : isChickened ? 'CHICKENED OUT' : 'PENDING'

  return (
    <div
      ref={ref}
      style={{
        width: 360,
        height: 640,
        background: '#0d0d0d',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Logo — exact match of Header: Anton, skewed, pink text-shadow */}
      <div style={{ padding: '16px 16px 16px', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 24,
            color: '#f0f0f0',
            textTransform: 'uppercase',
            lineHeight: 1,
            transform: 'skewY(-4deg)',
            textShadow: '2px 2px #ff0055',
          }}
        >
          YOU WON'T DARE
        </div>
      </div>

      {/* Hero proof image or dare text fallback */}
      {dare.proof_url ? (
        <div style={{ position: 'relative', margin: '0 10px' }}>
          <img
            src={dare.proof_url}
            alt="proof"
            crossOrigin="anonymous"
            style={{
              width: '100%',
              height: 420,
              objectFit: 'cover',
              display: 'block',
              borderRadius: 4,
            }}
          />
          {/* Small status badge — bottom-right corner of image */}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              fontFamily: '"Anton", sans-serif',
              fontSize: 14,
              color: statusColor,
              background: 'rgba(13,13,13,0.8)',
              padding: '4px 10px',
              borderRadius: 2,
              letterSpacing: 1,
            }}
          >
            {statusText}
          </div>
        </div>
      ) : (
        /* No proof: dare text centered as hero */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 24px',
            position: 'relative',
          }}
        >
          <p
            style={{
              fontFamily: '"Anton", sans-serif',
              color: '#f0f0f0',
              fontSize: 32,
              textTransform: 'uppercase',
              lineHeight: 1.2,
              textAlign: 'center',
              margin: 0,
            }}
          >
            {dare.text}
          </p>
          {/* Status below text when no image */}
          <div
            style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: 16,
              color: statusColor,
              marginTop: 16,
              letterSpacing: 2,
            }}
          >
            {statusText}
          </div>
        </div>
      )}

      {/* Bottom content area */}
      <div
        style={{
          flex: dare.proof_url ? 1 : undefined,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '10px 16px 0',
        }}
      >
        {/* Dare text (only when proof image is shown) */}
        {dare.proof_url && (
          <p
            style={{
              fontFamily: '"Anton", sans-serif',
              color: '#f0f0f0',
              fontSize: 20,
              textTransform: 'uppercase',
              lineHeight: 1.2,
              margin: '0 0 4px',
            }}
          >
            &ldquo;{dare.text}&rdquo;
          </p>
        )}

        {/* Caption */}
        {dare.proof_caption && (
          <p
            style={{
              fontFamily: '"Courier Prime", monospace',
              color: '#aaa49c',
              fontSize: 12,
              fontStyle: 'italic',
              margin: '4px 0 0',
            }}
          >
            {dare.proof_caption}
          </p>
        )}

        {/* Attribution */}
        {attribution && (
          <p
            style={{
              fontFamily: '"Courier Prime", monospace',
              color: '#777',
              fontSize: 12,
              margin: '8px 0 0',
            }}
          >
            {attribution}
          </p>
        )}
      </div>

      {/* Bottom branding */}
      <div style={{ padding: '0 16px 14px' }}>
        <div
          style={{
            height: 1,
            background: '#ff0055',
            margin: '12px 0',
          }}
        />
        <p
          style={{
            fontFamily: '"Courier Prime", monospace',
            color: '#555048',
            fontSize: 10,
            margin: 0,
            letterSpacing: 1,
          }}
        >
          youwontdare.xyz
        </p>
      </div>
    </div>
  )
})

ShareCard.displayName = 'ShareCard'
export default ShareCard
