export type Region = 'us-east-1' | 'us-east-2' | 'us-west-1' | 'us-west-2' | 'eu-west-1' | 'eu-west-2' | 'eu-west-3' | 'eu-central-1' | 'eu-central-2' | 'ap-south-1' | 'ap-southeast-1' | 'ap-southeast-2' | 'ap-northeast-1' | 'ap-northeast-2' | 'ap-northeast-3' | 'sa-east-1' | 'ca-central-1';
export type Codec = 'h264' | 'h265' | 'vp8' | 'vp9' | 'mp3' | 'aac' | 'wav' | 'gif' | 'prores';
export interface VideoGenerationRequest {
    compositionId: string;
    inputProps: any;
    codec: Codec;
}
export interface VideoGenerationResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
    };
    errors?: string[];
}
export interface ProgressResponse {
    success: boolean;
    data?: {
        status: 'processing' | 'done';
        url: string | null;
        progress: number;
    };
    message?: string;
}
export interface RenderInfo {
    status: 'processing' | 'done';
    bucketName: string;
    apiKey: string;
    startTime: number;
}
export interface LambdaConfig {
    region: string;
    functionName: string;
}
export interface QuotaConfig {
    maxRequestsPerMonth: number;
    resetDay: number;
}
export interface CacheConfig {
    maxAge: number;
    cleanupInterval: number;
}
export interface LocalConfig {
    serveUrl?: string;
    outputDir?: string;
}
export interface ApiConfig {
    lambda?: LambdaConfig;
    local?: LocalConfig;
    quota?: QuotaConfig;
    cache?: CacheConfig;
    serveUrl?: string;
    outputDir?: string;
}
//# sourceMappingURL=shared-types.d.ts.map