import React from 'react'
import { AbsoluteFill, useVideoConfig, Img, Audio, Sequence } from 'remotion'
import { createTikTokStyleCaptions } from '@remotion/captions'
import { CaptionPage } from './CaptionPage'

export const TikTokComposition = () => {
  const { width, height, durationInFrames, fps } = useVideoConfig()
  const { background_url, image_list, voice_url, transcripts } = getInputProps()

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
