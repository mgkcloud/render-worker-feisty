import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import { Player } from '@remotion/player';
import { TikTokComposition } from './compositions/TikTok';
import sampleData from './test-data.json';
import { videoService } from './services/videoService';
import { ErrorBoundary } from './components/ErrorBoundary';

const App = () => {
  const [renderId, setRenderId] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState<number>(0);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const progressInterval = React.useRef<number | null>(null);

  const checkProgress = React.useCallback(async (id: string) => {
    const response = await videoService.checkProgress(id);
    if (response.success && response.data) {
      setProgress(response.data.progress);
      if (response.data.status === 'done') {
        setVideoUrl(response.data.url);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
      }
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const loadSampleData = () => {
    setJsonInput(JSON.stringify(sampleData, null, 2));
    setVideoProps(sampleData.data);
    setError(null);
  };

  const [jsonInput, setJsonInput] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [videoProps, setVideoProps] = React.useState<any>(null);
  const [key, setKey] = React.useState(0);
  const [generating, setGenerating] = React.useState(false);
  const [generationError, setGenerationError] = React.useState<string | null>(null);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      if (parsed.type === 'string' && parsed.data) {
        setVideoProps(parsed.data);
        setError(null);
      } else {
        setError('Invalid JSON structure. Must include type and data fields.');
      }
    } catch (err) {
      setError('Invalid JSON format');
      setVideoProps(null);
    }
  };

  const handleReload = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8 flex justify-between">
        <div className="bg-white rounded-lg shadow p-6 min-w-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Video Generator</h2>
            <button
              onClick={loadSampleData}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Load Sample
            </button>
          </div>
          <textarea
            className="w-full h-64 p-4 font-mono text-sm border rounded-lg"
            value={jsonInput}
            onChange={handleJsonChange}
            placeholder={`Paste JSON configuration here:
{
  "type": "string",
  "data": {
    "background_url": "...",
    "media_list": [...],
    "voice_url": "...",
    "transcripts": [...]
  }
}`}
          />
          {error && (
            <div className="mt-2 text-red-600">{error}</div>
          )}
        </div>

        {videoProps && (
          <div className="bg-white rounded-lg shadow p-6 min-w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Preview</h3>
              <button
                onClick={handleReload}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reload Preview
              </button>
            </div>
            <div className="space-y-4">
              <div className="aspect-[9/16] w-full max-w-md mx-auto">
                <ErrorBoundary>
                  <Player
                  key={key}
                  component={TikTokComposition}
                  inputProps={videoProps}
                  durationInFrames={Math.max(
                    ...videoProps.transcripts.map((t: any) => Math.ceil(t.end * 30))
                  )}
                  fps={30}
                  compositionWidth={1080}
                  compositionHeight={1920}
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  controls
                  showVolumeControls
                  />
                </ErrorBoundary>
                <div className="mt-2 text-sm text-gray-500 text-center">
                  {`${Math.max(...videoProps.transcripts.map((t: any) => Math.ceil(t.end * 30)))} frames @ ${30}fps`}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-gray-600 px-4">
                  <div>
                    Duration: {(Math.max(...videoProps.transcripts.map((t: any) => t.end)) / 1).toFixed(1)}s
                  </div>
                  <button
                    onClick={async () => {
                      setGenerating(true);
                      setGenerationError(null);
                      setProgress(0);
                      setVideoUrl(null);
                      
                      try {
                        const response = await videoService.generateVideo(videoProps);
                        if (!response.success || !response.data) {
                          throw new Error(response.message);
                        }

                        const { id } = response.data;
                        if (!id) {
                          throw new Error('No render ID received');
                        }
                        
                        setRenderId(id);
                        if (progressInterval.current) {
                          clearInterval(progressInterval.current);
                        }
                        progressInterval.current = window.setInterval(() => {
                          checkProgress(id);
                        }, 1000);
                      } catch (err) {
                        setGenerationError(err instanceof Error ? err.message : 'Failed to generate video');
                        setGenerating(false);
                      }
                    }}
                    disabled={generating}
                    className={`px-6 py-2 text-white rounded transition-colors ${
                      generating 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-purple-500 hover:bg-purple-600'
                    }`}
                  >
                    {generating ? 'Generating...' : 'Generate Video'}
                  </button>
                </div>
                {generating && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-purple-500 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-center text-sm text-gray-600">
                      {progress.toFixed(1)}% Complete
                    </div>
                  </div>
                )}
                {generationError && (
                  <div className="text-red-500 text-sm text-center">
                    {generationError}
                  </div>
                )}
                {videoUrl && (
                  <div className="text-center space-y-2">
                    <div className="text-green-500 font-medium">Video Generated Successfully!</div>
                    <a 
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 underline"
                    >
                      Download Video
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
