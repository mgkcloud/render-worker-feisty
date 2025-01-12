import { validateRequest } from '../validation'
import { quotaManager } from '../quota'
import { renderCache } from '../cache'
import { invokeLambda } from '../lambda-client'

export async function handleVideoGeneration(request) {
  try {
    const apiKey = request.query.api_key
    console.log('Starting video generation for API Key:', apiKey)
    
    const input = await request.json()
    console.log('Request body:', JSON.stringify(input, null, 2))

    // Validate request
    console.log('Validating request...')
    const validationResult = validateRequest({ body: input })
    if (!validationResult.valid) {
      console.log('Validation failed:', validationResult.errors)
      return new Response(JSON.stringify({
        success: false,
        message: "Invalid request data",
        errors: validationResult.errors
      }), { status: 400 })
    }

    // Check quota
    console.log('Checking quota...')
    if (!quotaManager.checkQuota(apiKey)) {
      console.log('Quota exceeded for API Key:', apiKey)
      return new Response(JSON.stringify({
        success: false,
        message: "Monthly API quota exceeded"
      }), { status: 429 })
    }

    // Invoke Lambda
    console.log('Invoking Lambda function...')
    const lambdaResponse = await invokeLambda(input)
    console.log('Lambda invocation complete.');
    const { renderId, bucketName } = lambdaResponse
    console.log('Lambda response:', { renderId, bucketName })

    // Store render info
    console.log('Storing render info in cache...')
    renderCache.set(renderId, {
      status: 'processing',
      bucketName,
      apiKey,
      startTime: Date.now()
    })

    // Consume quota
    console.log('Consuming quota for API Key:', apiKey)
    quotaManager.consumeQuota(apiKey)

    console.log('Video generation started successfully')
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
    console.error('Video generation error:', error)
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
    console.log('Checking progress for render ID:', id, 'API Key:', apiKey)

    const render = renderCache.get(id)
    if (!render) {
      console.log('Render not found for ID:', id)
      return new Response(JSON.stringify({
        success: false,
        message: "Render not found"
      }), { status: 404 })
    }

    if (render.apiKey !== apiKey) {
      console.log('Unauthorized access attempt for render ID:', id)
      return new Response(JSON.stringify({
        success: false,
        message: "Unauthorized"
      }), { status: 403 })
    }

    console.log('Fetching progress from Lambda...')
    const progress = await invokeLambda({
      method: 'GET',
      url: `/progress/${id}`
    })
    console.log('Progress response:', progress)

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
      console.log('Render complete, removing from cache:', id)
      renderCache.delete(id)
    }

    console.log('Returning progress response:', response)
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Progress check error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: "Internal server error"
    }), { status: 500 })
  }
}
