const RENDER_TTL = 24 * 60 * 60 * 1000 // 24 hours

export const cleanup = {
  oldRenders(renderCache) {
    const now = Date.now()
    console.log('Starting cleanup:', {
      timestamp: now.toISOString(),
      cacheSize: renderCache.size,
      ttl: RENDER_TTL
    })
    
    let cleanedCount = 0
    let totalBytesFreed = 0
    
    for (const [renderId, render] of renderCache.entries()) {
      const age = now - render.lastAccessed
      if (age > RENDER_TTL) {
        const renderSize = JSON.stringify(render).length
        console.log('Cleaning up render:', {
          renderId,
          ageSeconds: Math.floor(age / 1000),
          sizeBytes: renderSize,
          timestamp: new Date(now).toISOString()
        })
        
        renderCache.delete(renderId)
        cleanedCount++
        totalBytesFreed += renderSize
      }
    }
    
    console.log('Cleanup completed:', {
      timestamp: new Date().toISOString(),
      cleanedCount,
      totalBytesFreed,
      remaining: renderCache.size
    })
    
    return {
      cleanedCount,
      totalBytesFreed,
      remaining: renderCache.size
    }
  },

  temporaryFiles() {
    console.log('Starting temporary files cleanup:', {
      timestamp: new Date().toISOString()
    })
    // TODO: Implement actual temporary file cleanup
    return true
  },

  getCleanupStats() {
    return {
      lastRun: new Date().toISOString(),
      ttl: RENDER_TTL,
      nextRun: new Date(Date.now() + RENDER_TTL).toISOString()
    }
  }
}
