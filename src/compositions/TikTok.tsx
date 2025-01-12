import React from 'react'
import { AbsoluteFill, useVideoConfig, Img, Audio, Sequence, getInputProps } from 'remotion'
import { createTikTokStyleCaptions } from '@remotion/captions'
import { CaptionPage } from './CaptionPage'

interface Transcript {
  words: string
  start: number
  end: number
}

interface InputProps {
  background_url: string
  image_list: string[]
  voice_url: string
  transcripts: Transcript[]
}

export const TikTokComposition = () => {
  const { width, height, durationInFrames, fps } = useVideoConfig()
  const validateInputProps = (props: unknown): props is InputProps => {
    if (typeof props !== 'object' || props === null) return false
    const p = props as Record<string, unknown>
    return (
      typeof p.background_url === 'string' &&
      Array.isArray(p.image_list) &&
      p.image_list.every(i => typeof i === 'string') &&
      typeof p.voice_url === 'string' &&
      Array.isArray(p.transcripts) &&
      p.transcripts.every(t => 
        typeof t === 'object' && t !== null &&
        typeof t.words === 'string' &&
        typeof t.start === 'number' &&
        typeof t.end === 'number'
      )
    )
  }

  const input = getInputProps()
  if (!validateInputProps(input)) {
    throw new Error('Invalid input props')
  }

  const { 
    background_url, 
    image_list, 
    voice_url, 
    transcripts 
  } = input

  // Convert transcripts to captions format
  const captions = transcripts.map(t => ({
    text: t.words,
    startMs: t.start * 1000,
    endMs: t.end * 1000,
    timestampMs: ((t.start + t.end) / 2) * 1000,
    confidence: null
  }))

  // Create TikTok-style caption pages
  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: 1200
  })

  return (
    <AbsoluteFill>
      {/* Background */}
      <Img src={background_url} style={{ width, height }} />
      
      {/* Image Slideshow */}
      {image_list.map((img, index) => (
        <Sequence
          key={index}
          from={index * 90} // 3 seconds per image (90 frames at 30fps)
          durationInFrames={90}
        >
          <Img
            src={img}
            style={{
              position: 'absolute',
              width: width * 0.8,
              height: height * 0.6,
              left: width * 0.1,
              top: height * 0.2,
              borderRadius: 20,
              boxShadow: '0 0 20px rgba(0,0,0,0.5)',
              opacity: 1,
              transition: 'opacity 0.5s ease-in-out'
            }}
          />
        </Sequence>
      ))}

      {/* Audio */}
      <Audio src={voice_url} />

      {/* Caption Pages */}
      {pages.map((page, index) => (
        <Sequence
          key={index}
          from={Math.floor(page.startMs / 1000 * fps)}
          durationInFrames={Math.floor((page.tokens[page.tokens.length - 1].toMs - page.startMs) / 1000 * fps)}
        >
          <CaptionPage page={page} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
