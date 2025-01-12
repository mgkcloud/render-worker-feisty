import React, { useState, useCallback } from 'react';
import { Player } from '@remotion/player';
import { TikTokComposition, InputPropsSchema } from './TikTok';
import { z } from 'zod';

const VideoDataSchema = z.object({
  type: z.literal('string'),
  data: InputPropsSchema
});

type VideoData = z.infer<typeof VideoDataSchema>;

export const VideoGenerator: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setJsonInput(input);

    try {
      const parsed = JSON.parse(input);
      const validated = VideoDataSchema.parse(parsed);
      console.log('Parsed video data:', validated);
      setVideoData(validated);
      setError(null);
    } catch (err) {
      console.error('Error parsing JSON:', err);
      if (err instanceof z.ZodError) {
        setError(err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n'));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid JSON');
      }
      setVideoData(null);
    }
  }, []);

  // Log when video data changes
  React.useEffect(() => {
    if (videoData) {
      console.log('Video data updated:', videoData);
      console.log('Transcript count:', videoData.data.transcripts.length);
    }
  }, [videoData]);

  const handleReloadPreview = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);

  const calculateDuration = (transcripts: z.infer<typeof InputPropsSchema>['transcripts'], mediaCount: number) => {
    const transcriptDuration = transcripts.reduce((max, t) => 
      Math.max(max, t.end * 1000), 0);
    const mediaDuration = mediaCount * 3000; // 3 seconds per media item
    return Math.max(transcriptDuration, mediaDuration);
  };

  const maxDuration = videoData ? 
    calculateDuration(videoData.data.transcripts, videoData.data.media_list.length) : 0;

  return (
    <div className="p-4 max-w-[1800px] mx-auto min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold">Video Generator</h2>
        <div className="flex gap-2">
          <button
              onClick={() => {
                const sample = {
                  type: 'string',
                  data: {
                    background_url: 'https://example.com/background.mp3',
                    media_list: [
                      'https://example.com/video1.mp4',
                      'https://example.com/image1.jpg'
                    ],
                    voice_url: 'https://example.com/voice.mp3',
                    transcripts: [
                      { words: 'Welcome to our video', start: 0, end: 2 },
                      { words: 'Let me show you something amazing', start: 2, end: 4 },
                      { words: 'Check this out!', start: 4, end: 6 }
                    ]
                  }
                };
                navigator.clipboard.writeText(JSON.stringify(sample, null, 2));
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Copy Sample
            </button>
            <button
              onClick={() => setJsonInput(JSON.stringify({
                type: 'string',
                data: {
                  background_url: 'https://s3.fy.studio/sunset.mp3',
                  media_list: [
                    'https://fal.media/files/kangaroo/yjMIdueONzzQeyFahD7Mo_output.mp4',
                    'https://fal.media/files/lion/Jbp5DAdxY5UJyi7R4GgpC_output.mp4',
                    'https://fal.media/files/zebra/gsFHokDhYrrOLu80-B63h_output.mp4',
                    'https://fal.media/files/zebra/NqoQM97rV4d5yF9ssEo1y_output.mp4',
                    'https://fal.media/files/zebra/Y9Jr9BfAI75PRqqTF4qxB_output.mp4',
                    'https://fal.media/files/koala/y3XGWElP82U-rZq9lrZZ2_output.mp4',
                    'https://fal.media/files/elephant/kWhWYz0q0n5PuWJ6wP9pp_output.mp4',
                    'https://fal.media/files/monkey/e0VQjAtSA78KqVMK9puMn_output.mp4'
                  ],
                  voice_url: 'https://s3.fy.studio/audio-1736660624963.mp3',
                  transcripts: [
                    {"words":"Did you know","start":0,"end":0.5199999809265137},
                    {"words":"that women played","start":0.5199999809265137,"end":1.2200000286102295},
                    {"words":"a crucial role","start":1.2200000286102295,"end":2.059999942779541},
                    {"words":"in medieval warfare?","start":2.059999942779541,"end":2.940000057220459},
                    {"words":"Far beyond the","start":2.940000057220459,"end":4.639999866485596},
                    {"words":"shadows of history.","start":4.639999866485596,"end":5.519999980926514},
                    {"words":"While knights and","start":5.960000038146973,"end":6.980000019073486},
                    {"words":"kings dominate the","start":6.980000019073486,"end":7.800000190734863},
                    {"words":"tales, female warriors,","start":7.800000190734863,"end":9.039999961853027},
                    {"words":"strategists, and leaders","start":10,"end":10.899999618530273},
                    {"words":"quietly shaped the","start":10.899999618530273,"end":12.319999694824219},
                    {"words":"outcomes of battles.","start":12.319999694824219,"end":12.880000114440918}
                  ]
                }
              }, null, 2))}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Load Sample
            </button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8 flex-grow">
        <div className="w-full lg:w-1/2">
          <textarea
          value={jsonInput}
          onChange={handleJsonChange}
          placeholder={`{
  "type": "string",
  "data": {
    "background_url": "https://example.com/background.mp3",
    "media_list": ["https://example.com/video1.mp4", ...],
    "voice_url": "https://example.com/voice.mp3",
    "transcripts": [{"words": "...", "start": 0, "end": 1}, ...]
  }
}`}
          className="w-full h-[400px] lg:h-[800px] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && (
          <pre className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm whitespace-pre-wrap font-mono">
            {error}
          </pre>
        )}
        </div>

        {videoData && (
          <div className="w-full lg:w-1/2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleReloadPreview}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Reload Preview
            </button>
            <div className="text-sm text-gray-600">
              Duration: {(maxDuration / 1000).toFixed(1)}s
            </div>
          </div>
          <div className="aspect-[9/16] w-full max-w-[400px] lg:max-w-[500px] mx-auto bg-gray-100 rounded-lg overflow-hidden relative my-auto">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
                <div className="text-gray-600">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mb-2"></div>
                  <div>Loading preview...</div>
                </div>
              </div>
            )}
            {previewError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
                <div className="text-red-600 p-4 text-center">
                  <div className="font-semibold mb-2">Error loading preview</div>
                  <div className="text-sm">{previewError}</div>
                </div>
              </div>
            )}
            <Player
              errorFallback={({ error }) => {
                console.error('Preview error:', error);
                setPreviewError(error.message || 'Failed to load preview');
                setIsLoading(false);
                return null;
              }}
              renderLoading={() => {
                setIsLoading(true);
                setPreviewError(null);
                return null;
              }}
              key={key}
              component={TikTokComposition}
              inputProps={{
                background_url: videoData.data.background_url,
                media_list: videoData.data.media_list,
                voice_url: videoData.data.voice_url,
                transcripts: videoData.data.transcripts
              }}
              durationInFrames={Math.ceil(maxDuration / (1000 / 30))}
              fps={30}
              compositionWidth={1080}
              compositionHeight={1920}
              style={{
                width: '100%',
                height: '100%',
              }}
              controls
            />
          </div>
          </div>
        )}
      </div>
    </div>
  );
};
