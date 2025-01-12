interface VideoGenerationRequest {
  siteName: string;
  compositionId: string;
  inputProps: any;
  codec: string;
}

interface VideoGenerationResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
  };
  errors?: string[];
}

interface ProgressResponse {
  success: boolean;
  data?: {
    status: 'processing' | 'done';
    url: string | null;
    progress: number;
  };
  message?: string;
}

const API_KEY = import.meta.env.VITE_API_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const videoService = {
  async generateVideo(videoProps: any): Promise<VideoGenerationResponse> {
    try {
      const request: VideoGenerationRequest = {
        siteName: 'tiktok-video',
        compositionId: 'TikTok',
        inputProps: videoProps,
        codec: 'h264'
      };

      const response = await fetch(`${API_BASE_URL}/api/function/video-generation/mix-video?api_key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate video');
      }

      return data;
    } catch (error) {
      console.error('Video generation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate video',
      };
    }
  },

  async checkProgress(renderId: string): Promise<ProgressResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/function/video-generation/progress/${renderId}?api_key=${API_KEY}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check progress');
      }

      return data;
    } catch (error) {
      console.error('Progress check error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check progress',
      };
    }
  },
};
