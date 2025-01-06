const RENDER_TTL = 24 * 60 * 60 * 1000 // 24 hours

export function cleanupOldRenders(renderCache) {
  const now = Date.now()
  
  for (const [renderId, render] of renderCache.entries()) {
    if (now - render.lastAccessed > RENDER_TTL) {
      renderCache.delete(renderId)
      // Add cleanup of AWS resources if needed
    }
  }
}
