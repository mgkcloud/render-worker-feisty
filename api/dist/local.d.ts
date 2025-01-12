import type { VideoGenerationRequest } from './shared-types';
export declare class RemotionLocalRenderer {
    private outputDir;
    private serveUrl;
    constructor(config: {
        serveUrl: string;
        outputDir?: string;
    });
    renderVideo(request: VideoGenerationRequest): Promise<{
        renderId: string;
        outputFile: string;
    }>;
    checkProgress(renderId: string): Promise<{
        done: boolean;
        overallProgress: number;
        outputFile: string | null;
    }>;
    getVideoPath(renderId: string): string | null;
}
//# sourceMappingURL=local.d.ts.map