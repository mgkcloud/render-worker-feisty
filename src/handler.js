import { Router } from 'itty-router'
import { handleVideoGeneration, handleProgressCheck } from './routes/video-generation.js'
import { authenticate, checkRateLimit } from './middleware/auth'
import { quotaManager } from './quota'

const router = Router()

// Request logger
const logRequest = (request) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers),
    cf: request.cf
  }
  context.log('Incoming Request:', JSON.stringify(logEntry, null, 2))
}

// Response logger
const logResponse = (response) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    status: response.status,
    headers: Object.fromEntries(response.headers)
  }
  context.log('Outgoing Response:', JSON.stringify(logEntry, null, 2))
  return response
}

// Middleware
router.all('*', async (request) => {
  try {
    logRequest(request)

    context.log('Checking quota reset...')
    quotaManager.checkAndResetIfNewMonth()

    context.log('Authenticating request...')
    const authResponse = await authenticate(request)
    if (authResponse) {
      context.log('Authentication failed:', authResponse.status)
      return logResponse(authResponse)
    }

    context.log('Checking rate limit...')
    const rateLimitResponse = await checkRateLimit(request)
    if (rateLimitResponse) {
      context.log('Rate limit exceeded:', rateLimitResponse.status)
      return logResponse(rateLimitResponse)
    }

    context.log('Request passed all middleware checks')
    return
  } catch (error) {
    console.error('Middleware error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
})

// Routes
router.post('/api/function/video-generation/image-video', handleVideoGeneration)
router.get('/api/function/video-generation/progress/:id', handleProgressCheck)

// Error handling
router.all('*', () => new Response('Not Found', { status: 404 }))

async function handleRequest(request, context) {
  console.log('Handling request:', request.url);
  return router.handle(request)
}

export { handleRequest }
