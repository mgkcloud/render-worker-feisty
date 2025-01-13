// Simple quota manager for local development
export const quotaManager = {
  checkAndResetIfNewMonth: () => {
    // No quota limits in local development
    return true;
  },
  
  incrementUsage: () => {
    // No quota tracking in local development
    return true;
  },
  
  getCurrentUsage: () => {
    return {
      current: 0,
      limit: Infinity
    };
  }
};
