#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

// serve 명령어 실행
const serveProcess = spawn(
  'serve',
  ['-s', path.join(__dirname, '../dist/frontend'), '-l', '80'],
  {
    stdio: 'inherit',
    shell: true,
  }
)

serveProcess.on('error', error => {
  console.error('Frontend serve process error:', error)
  process.exit(1)
})

serveProcess.on('exit', code => {
  console.log(`Frontend serve process exited with code ${code}`)
  process.exit(code)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully')
  serveProcess.kill('SIGTERM')
})

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully')
  serveProcess.kill('SIGINT')
})
