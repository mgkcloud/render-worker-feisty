import type { ApiConfig, VideoGenerationRequest, VideoGenerationResponse, ProgressResponse } from './shared-types';
export * from './shared-types';
type RenderMode = 'local' | 'lambda';
export declare class RemotionVideoAPI {
    private lambdaClient?;
    private localRenderer?;
    private mode;
    constructor(config: ApiConfig & {
        mode?: RenderMode;
    });
    /**
     * Generate a video using Remotion Lambda
     * @param request Video generation request parameters
     * @returns Promise resolving to video generation response
     */
    generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;
    /**
     * Check the progress of a video generation request
     * @param renderId The render ID returned from generateVideo
     * @returns Promise resolving to progress response
     */
    checkProgress(renderId: string): Promise<ProgressResponse>;
    /**
     * Get the local file path for a rendered video (only available in local mode)
     * @param renderId The render ID returned from generateVideo
     * @returns The local file path or null if not found
     */
    getLocalVideoPath(renderId: string): string | null;
}
//# sourceMappingURL=index.d.ts.map