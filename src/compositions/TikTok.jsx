import React from 'react'
import { AbsoluteFill, useVideoConfig, Img, Audio } from 'remotion'

export const TikTokComposition = () => {
  const { width, height, durationInFrames, fps } = useVideoConfig()
  const { background_url, image_list, voice_url, transcripts } = getInputProps()

  return (
    <AbsoluteFill>
      {/* Background */}
      <Img src={background_url} style={{ width, height }} />
      
      {/* Images */}
      {image_list.map((img, index) => (
        <Img
          key={index}
          src={img}
          style={{
            position: 'absolute',
            width: width * 0.8,
            height: height * 0.4,
            left: width * 0.1,
            top: height * (0.1 + (index % 3) * 0.3),
            borderRadius: 20,
            boxShadow: '0 0 20px rgba(0,0,0,0.5)'
          }}
        />
      ))}

      {/* Audio */}
      <Audio src={voice_url} />

      {/* Subtitles */}
      {transcripts.map((transcript, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: 48,
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: '10px 20px',
            borderRadius: 10,
            opacity: transcript.start <= (frame / fps) && (frame / fps) <= transcript.end ? 1 : 0,
            transition: 'opacity 0.2s'
          }}
        >
          {transcript.words}
        </div>
      ))}
    </AbsoluteFill>
  )
}
