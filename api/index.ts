import { RemotionLambdaClient } from './lambda';
import { RemotionLocalRenderer } from './local';
import type {
  ApiConfig,
  VideoGenerationRequest,
  VideoGenerationResponse,
  ProgressResponse
} from './shared-types';

export * from './shared-types';

type RenderMode = 'local' | 'lambda';

export class RemotionVideoAPI {
  private lambdaClient?: RemotionLambdaClient;
  private localRenderer?: RemotionLocalRenderer;
  private mode: RenderMode;

  constructor(config: ApiConfig & { mode?: RenderMode }) {
    this.mode = config.mode || 'lambda';

    if (this.mode === 'lambda') {
      if (!config.lambda) {
        throw new Error('Lambda configuration required when mode is "lambda"');
      }
      this.lambdaClient = new RemotionLambdaClient(config.lambda);
    } else {
      this.localRenderer = new RemotionLocalRenderer({
        serveUrl: config.serveUrl || 'http://localhost:3000',
        outputDir: config.outputDir
      });
    }
  }

  /**
   * Generate a video using Remotion Lambda
   * @param request Video generation request parameters
   * @returns Promise resolving to video generation response
   */
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    try {
      if (this.mode === 'lambda' && this.lambdaClient) {
        const lambdaResponse = await this.lambdaClient.renderVideo(request);
        return {
          success: true,
          message: 'Video generation started',
          data: {
            id: lambdaResponse.renderId
          }
        };
      } else if (this.mode === 'local' && this.localRenderer) {
        const localResponse = await this.localRenderer.renderVideo(request);
        return {
          success: true,
          message: 'Local video generation started',
          data: {
            id: localResponse.renderId
          }
        };
      } else {
        throw new Error('No renderer available');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate video',
      };
    }
  }

  /**
   * Check the progress of a video generation request
   * @param renderId The render ID returned from generateVideo
   * @returns Promise resolving to progress response
   */
  async checkProgress(renderId: string): Promise<ProgressResponse> {
    try {
      if (this.mode === 'lambda' && this.lambdaClient) {
        const progress = await this.lambdaClient.checkProgress(renderId);
        return {
          success: true,
          data: {
            status: progress.done ? 'done' : 'processing',
            url: progress.outputFile,
            progress: progress.overallProgress
          }
        };
      } else if (this.mode === 'local' && this.localRenderer) {
        const progress = await this.localRenderer.checkProgress(renderId);
        return {
          success: true,
          data: {
            status: progress.done ? 'done' : 'processing',
            url: progress.outputFile ? `file://${progress.outputFile}` : null,
            progress: progress.overallProgress
          }
        };
      } else {
        throw new Error('No renderer available');
      }
    } catch (error) {
      console.error('Progress check error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to check progress'
      };
    }
  }

  /**
   * Get the local file path for a rendered video (only available in local mode)
   * @param renderId The render ID returned from generateVideo
   * @returns The local file path or null if not found
   */
  getLocalVideoPath(renderId: string): string | null {
    if (this.mode === 'local' && this.localRenderer) {
      return this.localRenderer.getVideoPath(renderId);
    }
    return null;
  }
}
