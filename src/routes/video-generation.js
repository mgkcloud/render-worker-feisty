import { RemotionVideoAPI } from '../../api';
import { validateRequest } from '../validation';
import { quotaManager } from '../quota';
import { renderCache } from '../cache';

const api = new RemotionVideoAPI({
  mode: 'local',
  serveUrl: 'http://localhost:3001',
  outputDir: './rendered-videos'
});

export async function handleVideoGeneration(request) {
  try {
    const apiKey = request.query.api_key;
    console.log('Starting video generation for API Key:', apiKey);
    
    const input = await request.json();
    console.log('Request body:', JSON.stringify(input, null, 2));

    // Validate request
    console.log('Validating request...');
    const validationResult = validateRequest({ body: input });
    if (!validationResult.valid) {
      console.log('Validation failed:', validationResult.errors);
      return new Response(JSON.stringify({
        success: false,
        message: "Invalid request data",
        errors: validationResult.errors
      }), { status: 400 });
    }

    // Check quota
    console.log('Checking quota...');
    if (!quotaManager.checkQuota(apiKey)) {
      console.log('Quota exceeded for API Key:', apiKey);
      return new Response(JSON.stringify({
        success: false,
        message: "Monthly API quota exceeded"
      }), { status: 429 });
    }

    // Generate video using local renderer
    console.log('Starting local video generation...');
    const response = await api.generateVideo({
      compositionId: input.compositionId,
      inputProps: input.inputProps,
      codec: input.codec
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    const renderId = response.data.id;

    // Store render info
    console.log('Storing render info in cache...');
    renderCache.set(renderId, {
      status: 'processing',
      apiKey,
      startTime: Date.now()
    });

    // Consume quota
    console.log('Consuming quota for API Key:', apiKey);
    quotaManager.consumeQuota(apiKey);

    console.log('Video generation started successfully');
    return new Response(JSON.stringify(response), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Video generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || "Internal server error"
    }), { status: 500 });
  }
}

export async function handleProgressCheck(request) {
  try {
    const { id } = request.params;
    const apiKey = request.query.api_key;
    console.log('Checking progress for render ID:', id, 'API Key:', apiKey);

    const render = renderCache.get(id);
    if (!render) {
      console.log('Render not found for ID:', id);
      return new Response(JSON.stringify({
        success: false,
        message: "Render not found"
      }), { status: 404 });
    }

    if (render.apiKey !== apiKey) {
      console.log('Unauthorized access attempt for render ID:', id);
      return new Response(JSON.stringify({
        success: false,
        message: "Unauthorized"
      }), { status: 403 });
    }

    console.log('Checking render progress...');
    const progress = await api.checkProgress(id);

    // Update cache if render is complete
    if (progress.success && progress.data?.status === 'done') {
      console.log('Render complete, removing from cache:', id);
      renderCache.delete(id);
    }

    console.log('Returning progress response:', progress);
    return new Response(JSON.stringify(progress), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Progress check error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || "Internal server error"
    }), { status: 500 });
  }
}
