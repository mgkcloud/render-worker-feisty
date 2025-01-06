import { Router } from 'itty-router'
import { 
  handleVideoGeneration,
  handleProgressCheck
} from './routes/video-generation'
import { authenticate, checkRateLimit } from './middleware/auth'

const router = Router()

// Middleware
router.all('*', authenticate, checkRateLimit)

// Routes
router.post('/api/function/video-generation/image-video', handleVideoGeneration)
router.get('/api/function/video-generation/progress/:id', handleProgressCheck)

// Error handling
router.all('*', () => new Response('Not Found', { status: 404 }))

async function handleRequest(request) {
  return router.handle(request)
}

export { handleRequest }
