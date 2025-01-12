# Remotion Video Generation API

A framework-agnostic API package for generating videos using Remotion Lambda.

## Installation

```bash
npm install @remotion-api/core
```

## Usage

### Basic Setup

```typescript
import { RemotionVideoAPI } from '@remotion-api/core';

// Lambda rendering
const lambdaApi = new RemotionVideoAPI({
  mode: 'lambda',
  lambda: {
    region: 'us-east-1', // Your AWS region
    functionName: 'your-lambda-function-name'
  }
});

// Local rendering
const localApi = new RemotionVideoAPI({
  mode: 'local',
  serveUrl: 'http://localhost:3000', // URL where your Remotion project is served
  outputDir: './rendered-videos' // Optional: Where to save rendered videos
});
```

### Generating Videos

```typescript
const response = await api.generateVideo({
  compositionId: 'MyComposition',
  inputProps: {
    title: 'My Video',
    // ... other props for your composition
  },
  codec: 'h264'
});

if (response.success) {
  const renderId = response.data.id;
  // Store renderId for progress tracking
}
```

### Checking Progress

```typescript
const progress = await api.checkProgress(renderId);

if (progress.success && progress.data) {
  const { status, url, progress: percent } = progress.data;
  if (status === 'done') {
    // Video is ready at 'url'
  }
}
```

## Rendering Modes

### Lambda Rendering
Uses AWS Lambda for scalable, cloud-based rendering. Requires:
- AWS Lambda function set up with Remotion
- AWS credentials configured
- Lambda function name and region

### Local Rendering
Renders videos directly on your machine. Requires:
- Remotion project running locally (npm run remotion:studio)
- More CPU/memory resources
- Suitable for development and testing

## Next.js Integration

### 1. Choose Rendering Mode
Choose between local and Lambda rendering based on your needs:

```typescript
// config/remotion.ts
export const remotionConfig = {
  mode: process.env.NODE_ENV === 'development' ? 'local' : 'lambda',
  lambda: {
    region: process.env.REMOTION_AWS_REGION,
    functionName: process.env.REMOTION_AWS_LAMBDA_FUNCTION
  },
  serveUrl: process.env.REMOTION_SERVE_URL || 'http://localhost:3000',
  outputDir: './public/rendered-videos'
};
```

### 2. API Route Setup

Create an API route in your Next.js project:

```typescript
// app/api/video/route.ts
import { RemotionVideoAPI } from '@remotion-api/core';

import { remotionConfig } from '@/config/remotion';

const api = new RemotionVideoAPI(remotionConfig);

export async function POST(request: Request) {
  const body = await request.json();
  const response = await api.generateVideo(body);
  return Response.json(response);
}

// app/api/video/progress/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const progress = await api.checkProgress(params.id);
  return Response.json(progress);
}
```

### 2. Frontend Integration

Update your frontend service to use the Next.js API routes:

```typescript
// services/videoService.ts
import type { VideoGenerationRequest } from '@remotion-api/core';

export const videoService = {
  async generateVideo(props: any) {
    const request: VideoGenerationRequest = {
      compositionId: 'MyComposition',
      inputProps: props,
      codec: 'h264'
    };

    const response = await fetch('/api/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    return response.json();
  },

  async checkProgress(renderId: string) {
    const response = await fetch(`/api/video/progress/${renderId}`);
    return response.json();
  }
};
```

### 3. Environment Variables

Add these to your Next.js .env:

```env
# Required for Lambda rendering
REMOTION_AWS_REGION=your-aws-region
REMOTION_AWS_LAMBDA_FUNCTION=your-lambda-function-name

# Required for local rendering
REMOTION_SERVE_URL=http://localhost:3000

# Optional
REMOTION_RENDER_MODE=local # or 'lambda'
REMOTION_OUTPUT_DIR=./public/rendered-videos
```

## Maintaining Demo Compatibility

The API package maintains the same interface as the original demo, so existing frontend code will continue to work. Just update the API endpoint in your .env:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Development

1. Start the Remotion preview server:
```bash
npm run remotion:studio
```

2. Build the API package:
```bash
cd api
npm install
npm run build
```

3. Link for local development:
```bash
cd api
npm link
cd ../your-next-project
npm link @remotion-api/core
```

4. Test local rendering:
```typescript
const api = new RemotionVideoAPI({
  mode: 'local',
  serveUrl: 'http://localhost:3000'
});

// Generate video
const result = await api.generateVideo({
  compositionId: 'MyVideo',
  inputProps: { /* your props */ },
  codec: 'h264'
});

// Get local file path
const videoPath = api.getLocalVideoPath(result.data.id);
```

## License

MIT
