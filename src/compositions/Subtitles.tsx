import React from 'react'
import { useCurrentFrame } from 'remotion'
import { Word } from './Word'

export const Subtitles = ({ transcripts }) => {
  const frame = useCurrentFrame()

  return (
    <div style={{
      position: 'absolute',
      bottom: 100,
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center'
    }}>
      {transcripts.map((transcript, index) => (
        <Word
          key={index}
          words={transcript.words}
          start={transcript.start}
          end={transcript.end}
          currentFrame={frame}
        />
      ))}
    </div>
  )
}
