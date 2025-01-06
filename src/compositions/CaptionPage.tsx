import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

export const CaptionPage = ({ page }) => {
  const frame = useCurrentFrame()
  const currentTime = frame / 30 * 1000 // Convert frame to milliseconds

  return (
    <div style={{
      position: 'absolute',
      bottom: 100,
      left: '50%',
      transform: 'translateX(-50%)',
      color: 'white',
      fontSize: 48,
      textAlign: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: '20px',
      borderRadius: 10,
      whiteSpace: 'pre'
    }}>
      {page.tokens.map((token, index) => {
        const opacity = interpolate(
          currentTime,
          [token.fromMs, token.fromMs + 200],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )

        return (
          <span
            key={index}
            style={{
              opacity,
              transition: 'opacity 0.2s'
            }}
          >
            {token.text}
          </span>
        )
      })}
    </div>
  )
}
