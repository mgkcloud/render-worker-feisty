export const renderCache = new Map()

// Add logging to cache operations
const originalSet = renderCache.set.bind(renderCache)
const originalGet = renderCache.get.bind(renderCache)
const originalDelete = renderCache.delete.bind(renderCache)

renderCache.set = (key, value) => {
  console.log('Setting cache:', {
    renderId: key,
    timestamp: new Date().toISOString(),
    cacheSize: renderCache.size,
    valueSize: JSON.stringify(value).length
  })
  return originalSet(key, value)
}

renderCache.get = (key) => {
  const value = originalGet(key)
  console.log('Getting cache:', {
    renderId: key,
    timestamp: new Date().toISOString(),
    cacheSize: renderCache.size,
    hit: value !== undefined
  })
  return value
}

renderCache.delete = (key) => {
  console.log('Deleting cache:', {
    renderId: key,
    timestamp: new Date().toISOString(),
    cacheSize: renderCache.size
  })
  return originalDelete(key)
}

renderCache.getStats = () => {
  const stats = {
    size: renderCache.size,
    totalBytes: Array.from(renderCache.values()).reduce((sum, val) => {
      return sum + JSON.stringify(val).length
    }, 0),
    timestamp: new Date().toISOString()
  }
  
  console.log('Cache statistics:', stats)
  return stats
}

renderCache.clearExpired = (maxAgeMs) => {
  const now = Date.now()
  let clearedCount = 0
  
  for (const [key, value] of renderCache.entries()) {
    if (now - value.timestamp > maxAgeMs) {
      renderCache.delete(key)
      clearedCount++
    }
  }
  
  console.log('Cleared expired cache entries:', {
    clearedCount,
    remaining: renderCache.size,
    timestamp: new Date().toISOString()
  })
  
  return clearedCount
}
