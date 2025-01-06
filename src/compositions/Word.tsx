import React from 'react'

export const Word = ({ words, start, end, currentFrame }) => {
  const isVisible = currentFrame >= start && currentFrame <= end

  return (
    <span style={{
      display: 'inline-block',
      margin: '0 4px',
      color: 'white',
      fontSize: 48,
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: '8px 16px',
      borderRadius: 8,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.2s'
    }}>
      {words}
    </span>
  )
}
