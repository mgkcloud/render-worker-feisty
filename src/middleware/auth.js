// Simple auth middleware for local development
export const authenticate = async (request) => {
  const apiKey = new URL(request.url).searchParams.get('api_key');
  
  if (!apiKey || apiKey !== 'dev_api_key_123') {
    return new Response(JSON.stringify({
      success: false,
      message: 'Invalid API key'
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  return null;
};

// Simple rate limiter for local development
export const checkRateLimit = async () => {
  // No rate limiting in local development
  return null;
};
