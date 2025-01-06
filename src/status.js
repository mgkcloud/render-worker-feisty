import { getRenderProgress } from '@remotion/lambda'

async function handleStatusRequest(request, renderId) {
  try {
    const cachedStatus = renderCache.get(renderId)
    if (!cachedStatus) {
      return new Response('Render not found', { status: 404 })
    }

    const progress = await getRenderProgress({
      renderId,
      bucketName: cachedStatus.bucketName,
      functionName: 'remotion-render-function',
      region: 'us-east-1'
    })

    // Update cache
    renderCache.set(renderId, {
      ...cachedStatus,
      status: progress.done ? 'completed' : 'processing',
      progress: progress.overallProgress
    })

    return new Response(JSON.stringify({
      status: progress.done ? 'completed' : 'processing',
      progress: progress.overallProgress,
      outputUrl: progress.outputFile,
      duration: Date.now() - cachedStatus.startTime
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export { handleStatusRequest }
