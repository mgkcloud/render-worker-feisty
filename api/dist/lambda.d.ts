import type { Region, VideoGenerationRequest, LambdaConfig } from './shared-types';
export declare class RemotionLambdaClient {
    private config;
    constructor(config: LambdaConfig);
    renderVideo(request: VideoGenerationRequest): Promise<import("@remotion/lambda/client").RenderMediaOnLambdaOutput>;
    checkProgress(renderId: string): Promise<{
        done: boolean;
        outputFile: string | null;
        overallProgress: number;
    }>;
    static validateConfig(config: LambdaConfig): LambdaConfig & {
        region: Region;
    };
}
//# sourceMappingURL=lambda.d.ts.map