const statusMap = new Map()

export const updateStatus = (renderId, status, metadata = {}) => {
  console.log('Updating render status:', {
    renderId,
    status,
    timestamp: new Date().toISOString(),
    ...metadata
  })

  statusMap.set(renderId, {
    status,
    lastUpdated: Date.now(),
    ...metadata
  })

  return true
}

export const getStatus = (renderId) => {
  const status = statusMap.get(renderId)
  console.log('Retrieving status for render:', {
    renderId,
    status: status ? status.status : 'not_found',
    timestamp: new Date().toISOString()
  })

  return status ? status.status : 'not_found'
}

export const getStatusDetails = (renderId) => {
  const status = statusMap.get(renderId)
  console.log('Retrieving status details for render:', {
    renderId,
    status: status ? status.status : 'not_found',
    timestamp: new Date().toISOString()
  })

  return status || { status: 'not_found' }
}

export const cleanupOldStatuses = () => {
  const now = Date.now()
  const TTL = 24 * 60 * 60 * 1000 // 24 hours
  let cleanedCount = 0

  for (const [renderId, status] of statusMap.entries()) {
    if (now - status.lastUpdated > TTL) {
      statusMap.delete(renderId)
      cleanedCount++
    }
  }

  console.log('Cleaned up old statuses:', {
    timestamp: new Date().toISOString(),
    cleanedCount
  })
}
