const MONTHLY_QUOTA = 1000 // Adjust as needed
const quotaUsage = new Map()

export const quotaManager = {
  checkQuota(apiKey) {
    const usage = quotaUsage.get(apiKey) || 0
    const hasQuota = usage < MONTHLY_QUOTA
    console.log('Quota check:', {
      apiKey,
      usage,
      limit: MONTHLY_QUOTA,
      hasQuota,
      timestamp: new Date().toISOString()
    })
    return hasQuota
  },

  consumeQuota(apiKey) {
    const current = quotaUsage.get(apiKey) || 0
    const newUsage = current + 1
    quotaUsage.set(apiKey, newUsage)
    console.log('Quota consumed:', {
      apiKey,
      newUsage,
      limit: MONTHLY_QUOTA,
      timestamp: new Date().toISOString()
    })
  },

  resetQuotas() {
    console.log('Resetting all quotas:', {
      timestamp: new Date().toISOString(),
      previousUsage: quotaUsage.size
    })
    quotaUsage.clear()
  },

  checkAndResetIfNewMonth() {
    const now = new Date()
    if (now.getDate() === 1) {
      console.log('New month detected, resetting quotas:', {
        timestamp: now.toISOString(),
        previousUsage: quotaUsage.size
      })
      this.resetQuotas()
    }
  },

  getQuotaUsage(apiKey) {
    const usage = quotaUsage.get(apiKey) || 0
    console.log('Retrieving quota usage:', {
      apiKey,
      usage,
      limit: MONTHLY_QUOTA,
      timestamp: new Date().toISOString()
    })
    return {
      usage,
      limit: MONTHLY_QUOTA,
      remaining: MONTHLY_QUOTA - usage
    }
  },

  getGlobalUsage() {
    const totalUsage = Array.from(quotaUsage.values()).reduce((sum, val) => sum + val, 0)
    console.log('Retrieving global quota usage:', {
      totalUsage,
      timestamp: new Date().toISOString()
    })
    return {
      totalUsage,
      totalLimit: MONTHLY_QUOTA * quotaUsage.size,
      averageUsage: totalUsage / quotaUsage.size || 0
    }
  }
}
