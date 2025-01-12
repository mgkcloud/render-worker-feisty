import React, { useEffect, useState } from 'react';

interface VideoPreloaderProps {
  urls: string[];
  onAllLoaded: () => void;
  onError: (error: string) => void;
}

export const VideoPreloader: React.FC<VideoPreloaderProps> = ({ urls, onAllLoaded, onError }) => {
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();
    const blobUrls: string[] = [];

    const preloadVideo = async (url: string) => {
      const cleanUrl = url.split('#')[0];
      
      try {
        // Fetch the video data
        const response = await fetch(cleanUrl, {
          mode: 'no-cors',
          signal: abortController.signal
        });

        // Create a blob URL from the response
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        blobUrls.push(blobUrl);

        // Create a video element to ensure it's loadable
        return new Promise<void>((resolve, reject) => {
          const video = document.createElement('video');
          video.muted = true;
          video.playsInline = true;
          video.preload = '';
          video.style.display = 'none';
          document.body.appendChild(video);

          const timeoutId = setTimeout(() => {
            if (video.parentNode) {
              video.parentNode.removeChild(video);
            }
            reject(new Error(`Timeout loading video: ${cleanUrl}`));
          }, 30000);

          video.onloadeddata = () => {
            clearTimeout(timeoutId);
            if (mounted) {
              setLoadedCount(prev => prev + 1);
            }
            if (video.parentNode) {
              video.parentNode.removeChild(video);
            }
            resolve();
          };

          video.onerror = () => {
            clearTimeout(timeoutId);
            if (video.parentNode) {
              video.parentNode.removeChild(video);
            }
            reject(new Error(`Failed to load video: ${cleanUrl}`));
          };

          video.src = blobUrl;
          video.load();
        });
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        throw error;
      }
    };

    const videoPromises = urls
      .filter(url => url.match(/\.(mp4|webm|mov)$/i))
      .map(url => preloadVideo(url));

    Promise.all(videoPromises)
      .then(() => {
        if (mounted) {
          onAllLoaded();
        }
      })
      .catch(error => {
        if (mounted) {
          onError(error instanceof Error ? error.message : 'Failed to load videos');
        }
      });

    return () => {
      mounted = false;
      abortController.abort();
      // Clean up blob URLs
      blobUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [urls, onAllLoaded, onError]);

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="text-white text-center">
        <div className="mb-4">Loading videos: {loadedCount}/{urls.length}</div>
        <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(loadedCount / urls.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
