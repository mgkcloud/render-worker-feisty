const MONTHLY_QUOTA = 1000 // Adjust as needed
const quotaUsage = new Map()

export const quotaManager = {
  checkQuota(apiKey) {
    const usage = quotaUsage.get(apiKey) || 0
    return usage < MONTHLY_QUOTA
  },

  consumeQuota(apiKey) {
    const current = quotaUsage.get(apiKey) || 0
    quotaUsage.set(apiKey, current + 1)
  },

  resetQuotas() {
    quotaUsage.clear()
  }
}

// Reset quotas at the start of each month
setInterval(() => {
  const now = new Date()
  if (now.getDate() === 1) {
    quotaManager.resetQuotas()
  }
}, 24 * 60 * 60 * 1000)
