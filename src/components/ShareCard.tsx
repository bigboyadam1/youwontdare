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
    ? `from: ${dare.darer_name} → ${dare.dared_name}`
    : dare.darer_name
      ? `dared by: ${dare.darer_name}`
      : null

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
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
        }}
      >
        <div
          style={{
            fontFamily: '"Anton", sans-serif',
            color: '#ff0055',
            fontSize: 16,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          YOUWONTDARE
        </div>
        <div
          style={{
            fontFamily: '"Anton", sans-serif',
            fontSize: 20,
            color: '#ff0055',
          }}
        >
          🔥
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
              height: 340,
              objectFit: 'cover',
              display: 'block',
              borderRadius: 4,
            }}
          />
          {/* Stamp overlay on image */}
          {(isCompleted || isChickened) && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isChickened ? 'rgba(13,13,13,0.5)' : 'rgba(13,13,13,0.3)',
              }}
            >
              <div
                style={{
                  fontFamily: '"Anton", sans-serif',
                  fontSize: 72,
                  color: isCompleted ? '#00ff9940' : '#ff005540',
                  transform: isCompleted ? 'rotate(-8deg)' : 'rotate(-12deg)',
                  lineHeight: 1,
                  textTransform: 'uppercase',
                  textShadow: isCompleted
                    ? '0 0 30px #00ff9920'
                    : '0 0 30px #ff005520',
                  userSelect: 'none',
                }}
              >
                {isCompleted ? 'DONE' : 'CHICKEN'}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No proof: dare text centered as hero */
        <div
          style={{
            flex: 1,
            display: 'flex',
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
          {/* Stamp overlay for no-proof layout */}
          {(isCompleted || isChickened) && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: '"Anton", sans-serif',
                  fontSize: 72,
                  color: isCompleted ? '#00ff9930' : '#ff005530',
                  transform: isCompleted ? 'rotate(-8deg)' : 'rotate(-12deg)',
                  lineHeight: 1,
                  textTransform: 'uppercase',
                  textShadow: isCompleted
                    ? '0 0 30px #00ff9915'
                    : '0 0 30px #ff005515',
                  userSelect: 'none',
                }}
              >
                {isCompleted ? 'DONE' : 'CHICKEN'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom content area */}
      <div
        style={{
          flex: dare.proof_url ? 1 : undefined,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '16px 16px 0',
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
