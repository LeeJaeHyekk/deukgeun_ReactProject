#!/usr/bin/env npx tsx

/**
 * 환경 변수 디버깅 스크립트
 * 서버 시작 전 환경 설정을 확인하는 도구
 */

import * as path from 'path'
import * as fs from 'fs'
import { config } from 'dotenv'

console.log("=".repeat(80))
console.log("🔧 ENVIRONMENT DEBUGGING SCRIPT")
console.log("=".repeat(80))

// 현재 작업 디렉토리 정보
console.log("📁 Directory Information:")
console.log(`   - Current Working Directory: ${process.cwd()}`)
console.log(`   - Script Location: ${__filename}`)
console.log(`   - Script Directory: ${path.dirname(__filename)}`)

// Node.js 환경 정보
console.log("\n🔧 Node.js Environment:")
console.log(`   - Node Version: ${process.version}`)
console.log(`   - Platform: ${process.platform}`)
console.log(`   - Architecture: ${process.arch}`)
console.log(`   - Process ID: ${process.pid}`)
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'NOT SET'}`)

// 환경 파일 경로 확인
console.log("\n📄 Environment File Paths:")
const envPaths = [
  '.env.local',
  '.env',
  'env.development',
  'env.production',
  path.join(process.cwd(), '.env.local'),
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'env.development'),
  path.join(process.cwd(), 'env.production'),
  path.join(process.cwd(), 'src', 'backend', '.env'),
  path.join(process.cwd(), 'src', 'backend', 'env.development'),
]

envPaths.forEach((envPath, index) => {
  const exists = fs.existsSync(envPath)
  const resolved = path.resolve(envPath)
  console.log(`   ${index + 1}. ${envPath}`)
  console.log(`      Resolved: ${resolved}`)
  console.log(`      Exists: ${exists ? '✅ YES' : '❌ NO'}`)
  if (exists) {
    try {
      const stats = fs.statSync(envPath)
      console.log(`      Size: ${stats.size} bytes`)
      console.log(`      Modified: ${stats.mtime.toISOString()}`)
    } catch (error) {
      console.log(`      Error reading file: ${error}`)
    }
  }
  console.log()
})

// 환경 변수 로딩 시도
console.log("🔄 Attempting to load environment variables...")
let loadedEnvPath = null
let loadedVars = 0

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      console.log(`   🔄 Loading: ${envPath}`)
      const result = config({ path: envPath })
      if (result.parsed && Object.keys(result.parsed).length > 0) {
        loadedEnvPath = envPath
        loadedVars = Object.keys(result.parsed).length
        console.log(`   ✅ Successfully loaded ${loadedVars} variables`)
        break
      }
    } catch (error) {
      console.log(`   ❌ Failed to load: ${error}`)
    }
  }
}

if (!loadedEnvPath) {
  console.log("⚠️ No environment file loaded, using system environment variables")
}

// 중요한 환경 변수 확인
console.log("\n🔑 Critical Environment Variables:")
const criticalVars = [
  'NODE_ENV',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'DB_NAME',
  'JWT_SECRET',
  'CORS_ORIGIN'
]

criticalVars.forEach(varName => {
  const value = process.env[varName]
  const isSet = value !== undefined && value !== ''
  const displayValue = varName.includes('PASSWORD') || varName.includes('SECRET') ? 
    (isSet ? '***' : 'NOT SET') : 
    (isSet ? value : 'NOT SET')
  
  console.log(`   - ${varName}: ${displayValue} ${isSet ? '✅' : '❌'}`)
})

// 데이터베이스 연결 정보
console.log("\n🗄️ Database Configuration:")
console.log(`   - Host: ${process.env.DB_HOST || 'localhost'}`)
console.log(`   - Port: ${process.env.DB_PORT || '3306'}`)
console.log(`   - Username: ${process.env.DB_USERNAME || 'root'}`)
console.log(`   - Password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`)
console.log(`   - Database: ${process.env.DB_DATABASE || process.env.DB_NAME || 'deukgeun_db'}`)

// JWT 설정
console.log("\n🔐 JWT Configuration:")
console.log(`   - Secret: ${process.env.JWT_SECRET ? 'SET ✅' : 'NOT SET ❌'}`)
console.log(`   - Expires In: ${process.env.JWT_EXPIRES_IN || 'NOT SET'}`)

// CORS 설정
console.log("\n🌐 CORS Configuration:")
const corsOrigin = process.env.CORS_ORIGIN
if (corsOrigin) {
  const origins = corsOrigin.split(',').filter(origin => origin.trim() !== '')
  console.log(`   - Origins: ${origins.join(', ')}`)
} else {
  console.log(`   - Origins: DEFAULT (localhost ports)`)
}

// API 키 설정
console.log("\n🔑 API Keys Configuration:")
const apiKeys = [
  'KAKAO_API_KEY',
  'GOOGLE_PLACES_API_KEY',
  'SEOUL_OPENAPI_KEY',
  'VITE_GYM_API_KEY'
]

apiKeys.forEach(key => {
  const value = process.env[key]
  console.log(`   - ${key}: ${value ? 'SET ✅' : 'NOT SET ⚠️'}`)
})

// 권장사항
console.log("\n💡 Recommendations:")
if (!process.env.DB_PASSWORD) {
  console.log("   ⚠️ DB_PASSWORD is not set - database connection may fail")
}
if (!process.env.JWT_SECRET) {
  console.log("   ⚠️ JWT_SECRET is not set - authentication will not work")
}
if (!loadedEnvPath) {
  console.log("   ⚠️ No .env file found - create one with your configuration")
}

console.log("\n" + "=".repeat(80))
console.log("✅ ENVIRONMENT DEBUGGING COMPLETE")
console.log("=".repeat(80))
