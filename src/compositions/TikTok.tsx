import React from 'react'
import { AbsoluteFill, useVideoConfig, Img, Audio, Sequence, Video } from 'remotion'
import type { CompositionProps } from 'remotion'
import { createTikTokStyleCaptions } from '@remotion/captions'
import { CaptionPage } from './CaptionPage'
import { z } from 'zod'

const TranscriptSchema = z.object({
  words: z.string(),
  start: z.number(),
  end: z.number()
})

// Types and Schemas
const InputPropsSchema = z.object({
  background_url: z.string().url(),
  media_list: z.array(z.string().url()),
  voice_url: z.string().url(),
  transcripts: z.array(TranscriptSchema)
})

type InputProps = z.infer<typeof InputPropsSchema>

// Helper functions
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.mov']
  return videoExtensions.some(ext => url.toLowerCase().endsWith(ext))
}

// Main component
function TikTokComposition(props: InputProps): React.ReactElement {
  const { background_url, media_list, voice_url, transcripts } = props;
  const { width, height, fps } = useVideoConfig()

  React.useEffect(() => {
    console.log('TikTokComposition Props:', {
      background_url,
      media_list,
      voice_url,
      transcripts_count: transcripts.length
    })
    console.log('Video Config:', { width, height, fps })
  }, [background_url, media_list, voice_url, transcripts, width, height, fps])

  // Convert transcripts to captions format following Remotion API
  const captions = React.useMemo(() => transcripts.map((t) => ({
    text: t.words,
    startMs: t.start * 1000,
    endMs: t.end * 1000,
    timestampMs: ((t.start + t.end) / 2) * 1000,
    confidence: null
  })), [transcripts])

  // Create TikTok-style caption pages with proper spacing
  const { pages } = React.useMemo(() => {
    console.log('Creating pages from captions:', captions);
    const result = createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: 500 // Reduce timing to make captions more dynamic
    });
    console.log('Generated pages:', result.pages);
    return result;
  }, [captions])

  // Ensure pages are being created
  if (!pages || pages.length === 0) {
    console.error('No caption pages were generated');
    return (
      <AbsoluteFill>
        <div style={{ 
          width, 
          height, 
          backgroundColor: '#000000',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontSize: 48
        }}>
          No captions available
        </div>
      </AbsoluteFill>
    );
  }

  return React.useMemo(() => {
    return (
    <AbsoluteFill>
      {/* Background color instead of image */}
      <div style={{ width, height, backgroundColor: '#000000' }} />
      
      {/* Background narration */}
      <Audio src={background_url} />
      
      {media_list.map((media: string, index: number) => {
        const cleanUrl = media.split('#')[0];
        const isVideo = isVideoUrl(cleanUrl);
        const startFrame = index * 180; // 3 seconds per media (90 frames at 30fps)
        const duration = 720; // Default duration in frames

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={duration}
          >
            {isVideo ? (
              <Video
                src={cleanUrl}
                style={{
                  position: 'absolute',
                  width: width * 0.8,
                  height: height * 0.6,
                  left: width * 0.1,
                  top: height * 0.2,
                  borderRadius: 20,
                  boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  console.error(`Error loading video ${cleanUrl}:`, e);
                }}
              />
            ) : (
              <Img
                src={media}
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
            )}
          </Sequence>
        )
      })}

      <Audio src={voice_url} />

      {/* Captions with absolute positioning */}
      <Sequence from={0}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 9999 }}>
          {pages.map((page, index) => (
            <CaptionPage key={index} page={page} />
          ))}
        </div>
      </Sequence>
    </AbsoluteFill>
    )
  }, [background_url, media_list, voice_url, transcripts, width, height, fps, pages])
}

// Exports
export { TikTokComposition }
export type { InputProps }
export { InputPropsSchema }
