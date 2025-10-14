import express from "express"

console.log("=".repeat(60))
console.log("🔧 TEST SERVER INITIALIZATION DEBUG START")
console.log("=".repeat(60))

const app = express()
const port = process.env.PORT || 5000

console.log(`🔧 Test server configuration:`)
console.log(`   - Port: ${port}`)
console.log(`   - Environment: ${process.env.NODE_ENV || "development"}`)
console.log(`   - Process ID: ${process.pid}`)

app.get("/", (req, res) => {
  console.log(`🔍 Test server root accessed - ${req.method} ${req.url}`)
  res.json({ 
    message: "Test server is running!", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    process: {
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime()
    }
  })
})

app.get("/health", (req, res) => {
  console.log(`🔍 Test server health check accessed - ${req.method} ${req.url}`)
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})

app.get("/debug", (req, res) => {
  console.log(`🔍 Test server debug accessed - ${req.method} ${req.url}`)
  res.json({
    status: "debug",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    process: {
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    }
  })
})

app.listen(port, () => {
  console.log("=".repeat(60))
  console.log("🚀 TEST SERVER STARTED")
  console.log("=".repeat(60))
  console.log(`🌐 Server URL: http://localhost:${port}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🔧 Port: ${port}`)
  console.log(`🔧 Process ID: ${process.pid}`)
  console.log(`🔧 Node Version: ${process.version}`)
  console.log(`🔧 Platform: ${process.platform}`)
  console.log(`🔧 Architecture: ${process.arch}`)
  console.log("📝 Available endpoints:")
  console.log(`   - GET  /         - Root endpoint`)
  console.log(`   - GET  /health   - Health check`)
  console.log(`   - GET  /debug    - Debug information`)
  console.log("=".repeat(60))
  console.log("✅ Test server is ready!")
  console.log("=".repeat(60))
  console.log("🔧 TEST SERVER INITIALIZATION DEBUG END")
  console.log("=".repeat(60))
})
