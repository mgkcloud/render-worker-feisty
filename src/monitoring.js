export const monitor = {
  logRenderStart(renderId) {
    console.log(`Render started: ${renderId}`)
    // Add your monitoring service integration here
  },

  logError(error) {
    console.error('Error:', error)
    // Add your error tracking service integration here
  },

  alert(message) {
    console.warn('ALERT:', message)
    // Add your alerting service integration here
  }
}
