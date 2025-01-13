import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

interface Token {
  text: string;
  fromMs: number;
  toMs: number;
}

interface Page {
  text: string;
  startMs: number;
  tokens: Token[];
}

interface CaptionPageProps {
  page: Page;
}

export const CaptionPage: React.FC<CaptionPageProps> = React.memo(({ page }) => {
  const frame = useCurrentFrame()
  const currentTime = frame / 30 * 1000 // Convert frame to milliseconds

  // Log page details for debugging
  React.useEffect(() => {
    console.log('Rendering page:', {
      text: page.text,
      startMs: page.startMs,
      tokens: page.tokens
    })
  }, [page])

  return React.useMemo(() => (
<div style={{
  position: 'absolute',
  top: '15%',
  left: '50%',
  transform: 'translateX(-50%)',
  color: 'white',
  fontSize: 72,
  textAlign: 'center',
  background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(60,60,60,0.25) 80%)',
  padding: '40px',
  borderRadius: 15,
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  lineHeight: 1.3,
  zIndex: 9999,
  minWidth: '85%',
  minHeight: '120px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 4px 30px rgba(0,0,0,0.05)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.1)'
}}>
      {page.tokens?.map((token, index) => {
        if (!token?.text || typeof token.fromMs !== 'number' || typeof token.toMs !== 'number') {
          return null;
        }

        // Ensure fromMs and toMs are valid
        const fromMs = Math.max(0, token.fromMs);
        const toMs = Math.max(fromMs + 100, token.toMs);

        // Ensure the input range is strictly increasing
        const fadeInStart = Math.max(0, fromMs - 100);
        const fadeInEnd = Math.max(fadeInStart + 1, fromMs + 100);
        const fadeOutStart = Math.max(fadeInEnd + 1, toMs - 100);
        const fadeOutEnd = Math.max(fadeOutStart + 1, toMs + 100);

        const opacity = interpolate(
          currentTime,
          [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        )

        return (
          <span
            key={index}
            style={{
            opacity,
            transition: 'opacity 0.2s',
            position: 'absolute',
            padding: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            WebkitTextStroke: '1px rgba(0,0,0,0.3)'
            }}
          >
            {token.text}
          </span>
        )
      })}
    </div>
  ), [page, currentTime])
})
