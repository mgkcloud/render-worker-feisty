const API_KEYS = new Set([
  process.env.API_KEY_1,
  process.env.API_KEY_2
])

const RATE_LIMIT = 5 // Requests per minute
const rateLimits = new Map()

export function authenticate(request) {
  const apiKey = request.query.api_key
  console.log('Authenticating API Key:', apiKey)
  
  if (!apiKey) {
    console.log('Authentication failed: No API key provided')
    return new Response(JSON.stringify({
      success: false,
      message: "Invalid API key"
    }), { status: 401 })
  }
  
  if (!API_KEYS.has(apiKey)) {
    console.log('Authentication failed: Invalid API key')
    return new Response(JSON.stringify({
      success: false,
      message: "Invalid API key"
    }), { status: 401 })
  }
  
  console.log('Authentication successful for API Key:', apiKey)
}

export function checkRateLimit(request) {
  const apiKey = request.query.api_key
  const now = Date.now()
  
  console.log('Checking rate limit for API Key:', apiKey)
  
  if (!rateLimits.has(apiKey)) {
    console.log('Initializing new rate limit record for API Key:', apiKey)
    rateLimits.set(apiKey, { count: 1, startTime: now })
    return
  }

  const record = rateLimits.get(apiKey)
  
  if (now - record.startTime > 60000) {
    console.log('Rate limit window reset for API Key:', apiKey)
    record.count = 1
    record.startTime = now
    return
  }

  if (record.count >= RATE_LIMIT) {
    console.log('Rate limit exceeded for API Key:', apiKey)
    return new Response(JSON.stringify({
      success: false,
      message: "Rate limit exceeded. Maximum 5 requests per minute."
    }), { status: 429 })
  }

  console.log(`Request ${record.count + 1}/${RATE_LIMIT} for API Key:`, apiKey)
  record.count++
}
