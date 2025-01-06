const RATE_LIMIT = 100 // Requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute

const requestCounts = new Map()

export function rateLimiter(request) {
  const ip = request.headers.get('cf-connecting-ip')
  const now = Date.now()
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, startTime: now })
    return true
  }

  const record = requestCounts.get(ip)
  
  if (now - record.startTime > RATE_LIMIT_WINDOW) {
    record.count = 1
    record.startTime = now
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count++
  return true
}
