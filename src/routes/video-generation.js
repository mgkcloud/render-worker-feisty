import { setAWSRegion, renderMediaOnLambda, getRenderProgress } from '@remotion/lambda'
import { validateVideoRequest } from '../validation'
import { quotaManager } from '../quota'
import { renderCache } from '../cache'

setAWSRegion('us-east-1')

export async function handleVideoGeneration(request) {
  try {
    const apiKey = request.query.api_key
    const input = await request.json()

    // Validate request
    const validationErrors = validateVideoRequest(input)
    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: "Invalid request data",
        errors: validationErrors
      }), { status: 400 })
    }

    // Check quota
    if (!quotaManager.checkQuota(apiKey)) {
      return new Response(JSON.stringify({
        success: false,
        message: "Monthly API quota exceeded"
      }), { status: 429 })
    }

    // Start render
    const { renderId, bucketName } = await renderMediaOnLambda({
      region: 'us-east-1',
      functionName: 'remotion-render-function',
      composition: 'TikTokStyle',
      serveUrl: 'https://your-serve-url.com',
      codec: 'h264',
      imageFormat: 'jpeg',
      inputProps: input.data,
      concurrency: 10
    })

    // Store render info
    renderCache.set(renderId, {
      status: 'processing',
      bucketName,
      apiKey,
      startTime: Date.now()
    })

    // Consume quota
    quotaManager.consumeQuota(apiKey)

    return new Response(JSON.stringify({
      success: true,
      message: "Video generation started",
      data: {
        id: renderId
      }
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: "Internal server error"
    }), { status: 500 })
  }
}

export async function handleProgressCheck(request) {
  try {
    const { id } = request.params
    const apiKey = request.query.api_key
    const render = renderCache.get(id)

    if (!render) {
      return new Response(JSON.stringify({
        success: false,
        message: "Render not found"
      }), { status: 404 })
    }

    if (render.apiKey !== apiKey) {
      return new Response(JSON.stringify({
        success: false,
        message: "Unauthorized"
      }), { status: 403 })
    }

    const progress = await getRenderProgress({
      renderId: id,
      bucketName: render.bucketName,
      functionName: 'remotion-render-function',
      region: 'us-east-1'
    })

    const response = {
      success: true,
      data: {
        status: progress.done ? 'done' : 'processing',
        url: progress.outputFile || null,
        progress: progress.overallProgress
      }
    }

    // Update cache
    if (progress.done) {
      renderCache.delete(id)
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: "Internal server error"
    }), { status: 500 })
  }
}
