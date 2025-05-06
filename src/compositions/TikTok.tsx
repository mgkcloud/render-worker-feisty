import React from 'react'
import { AbsoluteFill, useVideoConfig, Img, Audio, Series, OffthreadVideo, Loop } from 'remotion'
import type { CalculateMetadataFunction } from 'remotion'
import { createTikTokStyleCaptions } from '@remotion/captions'
import { parseMedia } from '@remotion/media-parser'
import { getAudioDurationInSeconds } from '@remotion/media-utils'
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

// Calculate metadata for dynamic duration
export const calculateMetadata: CalculateMetadataFunction<InputProps> = async ({
  props,
}) => {
  const fps = 60;
  console.log('Calculating metadata for props:', props);

  try {
    // Get voice narration duration
    const voiceDuration = await getAudioDurationInSeconds(props.voice_url);
    console.log('Voice duration:', voiceDuration);

    // Get media durations
    const mediaDurations = await Promise.all(
      props.media_list.map(async (url) => {
        if (isVideoUrl(url)) {
          const { slowDurationInSeconds } = await parseMedia({
            src: url,
            fields: { slowDurationInSeconds: true }
          });
          return slowDurationInSeconds;
        }
        return 6; // Default duration for images
      })
    );
    console.log('Media durations:', mediaDurations);

    // Calculate total duration based on the longest between voice and media
    const totalMediaDuration = mediaDurations.reduce((acc, curr) => acc + curr, 0);
    const totalDurationInSeconds = Math.max(voiceDuration, totalMediaDuration);
    const durationInFrames = Math.ceil(totalDurationInSeconds * fps);

    console.log('Final duration calculation:', {
      totalMediaDuration,
      voiceDuration,
      durationInFrames
    });

    return {
      durationInFrames,
      fps,
      width: 1080,
      height: 1920,
      props,
    };
  } catch (error) {
    console.error('Error calculating metadata:', error);
    throw error;
  }
};

// Main component
function TikTokComposition(props: InputProps): React.ReactElement {
  const { background_url, media_list, voice_url, transcripts } = props;
  const { width, height, fps, durationInFrames } = useVideoConfig()

  // Volume controls
  const [videoVolume, setVideoVolume] = React.useState(0.04); // Default video volume
  const [voiceVolume, setVoiceVolume] = React.useState(1); // Default voie-over volume
  const [backgroundVolume, setBackgroundVolume] = React.useState(0.1); // Default background music volume

  React.useEffect(() => {
    console.log('TikTokComposition Initializing with:', {
      background_url,
      media_list,
      voice_url,
      transcripts_count: transcripts.length,
      video_config: { width, height, fps, durationInFrames }
    });
  }, [background_url, media_list, voice_url, transcripts, width, height, fps, durationInFrames])

  // Convert transcripts to captions format
  const captions = React.useMemo(() => transcripts.map((t) => ({
    text: t.words,
    startMs: t.start * 1000,
    endMs: t.end * 1000,
    timestampMs: ((t.start + t.end) / 2) * 1000,
    confidence: null
  })), [transcripts])

  // Create TikTok-style caption pages
  const { pages } = React.useMemo(() => {
    console.log('Creating caption pages from:', {
      caption_count: captions.length,
      total_duration: captions.length > 0 ? captions[captions.length - 1].endMs - captions[0].startMs : 0,
      first_caption: captions[0],
      last_caption: captions[captions.length - 1]
    });

    const result = createTikTokStyleCaptions({
      captions,
      combineTokensWithinMilliseconds: 500
    });

    console.log('Generated caption pages:', {
      page_count: result.pages.length,
      pages: result.pages.map(p => ({
        text: p.text,
        startMs: p.startMs,
        tokens: p.tokens.map(t => ({
          text: t.text,
          fromMs: t.fromMs,
          toMs: t.toMs
        }))
      }))
    });

    return result;
  }, [captions])

  // Error state for no captions
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

  const overlapDurationInFrames = 40; 

  return React.useMemo(() => (
    <AbsoluteFill>
      {/* Background gradient */}
      <div style={{ 
        width, 
        height, 
        background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.9) 100%)',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1
      }} />

      {/* Filter layer for brightness and contrast */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        mixBlendMode: 'overlay',
        background: 'rgba(255,255,255,0.1)',
        filter: 'contrast(1.2) brightness(1.1)'
      }} />

      {/* Vignette effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 3,
        boxShadow: 'inset 0 0 150px rgba(0,0,0,0.8)',
        pointerEvents: 'none'
      }} />
      
      {/* Background music */}
      <Audio src={background_url} volume={backgroundVolume} />
      
      {/* Media sequence */}
      <Series>
        {media_list.map((media: string, index: number) => {
          const cleanUrl = media.split('#')[0];
          const isVideo = isVideoUrl(cleanUrl);
          const duration = 140; // 6 seconds per media

          return (
            <Series.Sequence
              key={index}
              durationInFrames={duration}
              offset={index > 0 ? -overlapDurationInFrames : 0} // Overlap with previous
            >
              {isVideo ? (
                <Loop durationInFrames={duration}>
                  <OffthreadVideo
                    src={cleanUrl}
                    pauseWhenBuffering={true}
                    volume={(frame) => {
                      // Calculate fade in/25t volume
                      const baseVolume = videoVolume;
                      if (frame < overlapDurationInFrames) {
                        // Fade in
                        return (frame / overlapDurationInFrames) * baseVolume;
                      } else if (frame > duration - overlapDurationInFrames) {
                        // Fade out
                        return ((duration - frame) / overlapDurationInFrames) * baseVolume;
                      }
                      return baseVolume; // Full volume
                    }}
                    style={{
                      position: 'absolute',
                      width: width * 1,
                      height: height * 1,
                      left: 0,
                      top: 0,
                      borderRadius: 0,
                      boxShadow: '0 0 30px rgba(0,0,0,0.7)',
                      objectFit: 'contain',
                      filter: 'contrast(1.1) brightness(1.1) saturate(1.2)',
                      zIndex: 4
                    }}
                    onError={(e) => {
                      console.error(`Error loading video ${cleanUrl}:`, e);
                    }}
                    delayRenderTimeoutInMilliseconds={5000}
                  />
                </Loop>
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
                    boxShadow: '0 0 30px rgba(0,0,0,0.7)',
                    opacity: 1,
                    transition: 'opacity 0.5s ease-in-out',
                    filter: 'contrast(1.1) brightness(1.1) saturate(1.2)',
                    zIndex: 4
                  }}
                />
              )}
            </Series.Sequence>
          )
        })}
      </Series>

      {/* Voice narration */}
      <Audio src={voice_url} volume={voiceVolume} />

      {/* Captions */}
      <Series>
        <Series.Sequence offset={0} durationInFrames={durationInFrames}>
          <div style={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            zIndex: 9999,
            filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))'
          }}>
            {pages.map((page, index) => (
              <CaptionPage key={index} page={page} />
            ))}
          </div>
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  ), [background_url, media_list, voice_url, transcripts, width, height, fps, durationInFrames, pages, videoVolume, voiceVolume, backgroundVolume])
}

// Exports
export { TikTokComposition }
export type { InputProps }
export { InputPropsSchema }