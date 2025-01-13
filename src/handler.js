import { Router } from 'itty-router';
import { handleRender, handleProgress } from './routes/render.js';
import { authenticate, checkRateLimit } from './middleware/auth.js';
import { quotaManager } from './quota.js';
import path from 'path';
import fs from 'fs';

const router = Router();

// Request logger
const logRequest = (request) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers),
    cf: request.cf
  };
  console.log('Incoming Request:', JSON.stringify(logEntry, null, 2));
};

// Response logger
const logResponse = (response) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    status: response.status,
    headers: Object.fromEntries(response.headers)
  };
  console.log('Outgoing Response:', JSON.stringify(logEntry, null, 2));
  return response;
};

// CORS Preflight handler
router.options('*', async (request) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
});

// Middleware (skip for OPTIONS requests)
router.all('*', async (request) => {
  try {
    if (request.method === 'OPTIONS') {
      return;
    }

    logRequest(request);

    console.log('Checking quota reset...');
    quotaManager.checkAndResetIfNewMonth();

    console.log('Authenticating request...');
    const authResponse = await authenticate(request);
    if (authResponse) {
      console.log('Authentication failed:', authResponse.status);
      return logResponse(authResponse);
    }

    console.log('Checking rate limit...');
    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) {
      console.log('Rate limit exceeded:', rateLimitResponse.status);
      return logResponse(rateLimitResponse);
    }

    console.log('Request passed all middleware checks');
    return;
  } catch (error) {
    console.error('Middleware error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});

// Routes
// Video rendering routes
router.post('/api/render', handleRender);
router.get('/api/render/progress/:id', handleProgress);

// Static file serving for rendered videos
router.get('/videos/:filename', async (request) => {
  try {
    const { filename } = request.params;
    const filePath = path.join(process.cwd(), 'rendered-videos', filename);
    
    if (!fs.existsSync(filePath)) {
      return new Response('File not found', { status: 404 });
    }

    const fileStream = fs.createReadStream(filePath);
    const headers = {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Access-Control-Allow-Origin': '*'
    };

    return new Response(fileStream, { headers });
  } catch (error) {
    console.error('Error serving video:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});

// Error handling
router.all('*', () => new Response('Not Found', { status: 404 }));

async function handleRequest(request) {
  try {
    console.log('Handling request:', {
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    const response = await router.handle(request);
    
    console.log('Router response:', {
      status: response.status,
      headers: response.headers,
      body: response.body
    });

    return response;
  } catch (error) {
    console.error('Request handling error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

export { handleRequest };
