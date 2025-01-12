export const monitor = {
  logRenderStart(renderId, metadata = {}) {
    console.log('Render started:', {
      renderId,
      timestamp: new Date().toISOString(),
      ...metadata
    })
    // Add your monitoring service integration here
  },

  logRenderComplete(renderId, durationMs, metadata = {}) {
    console.log('Render completed:', {
      renderId,
      durationMs,
      timestamp: new Date().toISOString(),
      ...metadata
    })
  },

  logError(error, context = {}) {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    })
    // Add your error tracking service integration here
  },

  alert(message, severity = 'warning', details = {}) {
    console.warn('ALERT:', {
      message,
      severity,
      timestamp: new Date().toISOString(),
      ...details
    })
    // Add your alerting service integration here
  },

  logSystemMetrics() {
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    console.log('System metrics:', {
      timestamp: new Date().toISOString(),
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime(),
      loadavg: process.getLoadAvg()
    })
  },

  logRequestMetrics(request) {
    console.log('Request metrics:', {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      ip: request.ip,
      headers: request.headers,
      durationMs: request.durationMs
    })
  },

  getSystemHealth() {
    const memoryUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()
    
    return {
      timestamp: new Date().toISOString(),
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime(),
      loadavg: process.getLoadAvg()
    }
  }
}
