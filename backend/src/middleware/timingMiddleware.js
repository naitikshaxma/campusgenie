/**
 * timingMiddleware.js
 * Tracks response timing metrics for backend routes and adds timing headers.
 */
module.exports = (req, res, next) => {
  const start = process.hrtime()

  res.on('finish', () => {
    const diff = process.hrtime(start)
    const durationMs = Math.round((diff[0] * 1e3 + diff[1] * 1e-6) * 100) / 100
    
    // Log structured timing metric
    console.log(`[METRICS] ${req.method} ${req.originalUrl} - ${durationMs}ms [Status: ${res.statusCode}]`)
    
    // If headers haven't been sent yet, attach the response time
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${durationMs}ms`)
    }
  })

  next()
}
