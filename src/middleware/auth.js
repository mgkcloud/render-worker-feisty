const API_KEYS = new Set([
  process.env.API_KEY_1,
  process.env.API_KEY_2
])

const RATE_LIMIT = 5 // Requests per minute
const rateLimits = new Map()

export function authenticate(request) {
  const apiKey = request.query.api_key
  if (!apiKey || !API_KEYS.has(apiKey)) {
    return new Response(JSON.stringify({
      success: false,
      message: "Invalid API key"
    }), { status: 401 })
  }
}

export function checkRateLimit(request) {
  const apiKey = request.query.api_key
  const now = Date.now()
  
  if (!rateLimits.has(apiKey)) {
    rateLimits.set(apiKey, { count: 1, startTime: now })
    return
  }

  const record = rateLimits.get(apiKey)
  
  if (now - record.startTime > 60000) {
    record.count = 1
    record.startTime = now
    return
  }

  if (record.count >= RATE_LIMIT) {
    return new Response(JSON.stringify({
      success: false,
      message: "Rate limit exceeded. Maximum 5 requests per minute."
    }), { status: 429 })
  }

  record.count++
}
