export const validateRequest = (request) => {
  console.log('Validating request:', {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    headers: request.headers
  })

  // Validate required fields
  const requiredFields = ['videoUrl', 'captions', 'apiKey']
  const missingFields = requiredFields.filter(field => !request.body[field])
  
  if (missingFields.length > 0) {
    console.error('Validation failed - missing fields:', missingFields)
    return {
      valid: false,
      errors: [`Missing required fields: ${missingFields.join(', ')}`]
    }
  }

  // Validate API key format
  const apiKeyPattern = /^[a-f0-9]{32}$/
  if (!apiKeyPattern.test(request.body.apiKey)) {
    console.error('Validation failed - invalid API key format')
    return {
      valid: false,
      errors: ['Invalid API key format']
    }
  }

  // Validate video URL
  try {
    new URL(request.body.videoUrl)
  } catch (error) {
    console.error('Validation failed - invalid video URL:', error.message)
    return {
      valid: false,
      errors: ['Invalid video URL format']
    }
  }

  console.log('Request validation successful')
  return { valid: true }
}
