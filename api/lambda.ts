import { renderMediaOnLambda } from '@remotion/lambda/client';
import type { Region, Codec, VideoGenerationRequest, LambdaConfig } from './shared-types';

type LambdaProgressResponse = {
  renderId: string;
  bucketName: string;
  renderMetadata: {
    estimatedTotalLambdaInvokations: number;
    estimatedRenderLambdaInvokations: number;
    currentLambdaInvokations: number;
    outputFile: string | null;
  };
  done: boolean;
  overallProgress: number;
};

export class RemotionLambdaClient {
  private config: {
    region: Region;
    functionName: string;
  };

  constructor(config: LambdaConfig) {
    const validatedConfig = RemotionLambdaClient.validateConfig(config);
    this.config = validatedConfig;
  }

  async renderVideo(request: VideoGenerationRequest) {
    console.log('Invoking Remotion Lambda function...');

    try {
      const response = await renderMediaOnLambda({
        region: this.config.region,
        functionName: this.config.functionName,
        serveUrl: process.env.REMOTION_SERVE_URL || 'http://localhost:3000',
        composition: request.compositionId,
        inputProps: request.inputProps,
        codec: request.codec as Codec,
        imageFormat: 'jpeg',
      });

      console.log('Remotion Lambda response:', response);
      return response;
    } catch (error) {
      console.error('Remotion Lambda invocation error:', error);
      throw error;
    }
  }

  async checkProgress(renderId: string) {
    try {
      const response = await fetch(
        `https://${this.config.region}.lambda.amazonaws.com/2015-03-31/functions/${this.config.functionName}/invocations/progress/${renderId}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch progress: ${response.statusText}`);
      }

      const data: LambdaProgressResponse = await response.json();
      return {
        done: data.done,
        outputFile: data.renderMetadata.outputFile,
        overallProgress: data.overallProgress,
      };
    } catch (error) {
      console.error('Progress check error:', error);
      throw error;
    }
  }

  static validateConfig(config: LambdaConfig): LambdaConfig & { region: Region } {
    if (!config.region) {
      throw new Error('Lambda region is required');
    }
    if (!config.functionName) {
      throw new Error('Lambda function name is required');
    }
    
    const validRegions = [
      'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
      'eu-west-1', 'eu-west-2', 'eu-west-3',
      'eu-central-1', 'eu-central-2',
      'ap-south-1', 'ap-southeast-1', 'ap-southeast-2',
      'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3',
      'sa-east-1', 'ca-central-1'
    ] as Region[];
    
    if (!validRegions.includes(config.region as Region)) {
      throw new Error(`Invalid AWS region: ${config.region}`);
    }

    return {
      ...config,
      region: config.region as Region
    };
  }
}
