#!/usr/bin/env node

/**
 * 데이터베이스 연결 테스트 스크립트
 * 프로덕션 환경에서 새로운 DB 호스트 연결을 테스트합니다.
 */

import mysql from "mysql2/promise"
import dotenv from "dotenv"

// 환경 변수 로드
dotenv.config({ path: ".env.production" })

const testConnection = async () => {
  const config = {
    host: process.env.DB_HOST || "deukgeun_production_db_host",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USERNAME || "deukgeun_production_User",
    password: process.env.DB_PASSWORD || "6204",
    database: process.env.DB_NAME || "deukgeun_db",
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000,
  }

  console.log("🔍 Testing database connection...")
  console.log(`📍 Host: ${config.host}`)
  console.log(`🔌 Port: ${config.port}`)
  console.log(`👤 User: ${config.user}`)
  console.log(`🗄️  Database: ${config.database}`)
  console.log("─".repeat(50))

  let connection = null

  try {
    // 1. DNS 해석 테스트
    console.log("1️⃣ Testing DNS resolution...")
    const dns = await import("dns")
    const { promisify } = await import("util")
    const lookup = promisify(dns.lookup)

    try {
      const result = await lookup(config.host)
      console.log(`✅ DNS resolved: ${config.host} -> ${result.address}`)
    } catch (dnsError) {
      console.log(`❌ DNS resolution failed: ${dnsError.message}`)
      console.log(
        "   This might be a local hostname or the DNS is not configured"
      )
    }

    // 2. TCP 연결 테스트
    console.log("\n2️⃣ Testing TCP connection...")
    const net = await import("net")
    const socket = new net.Socket()

    const tcpTest = new Promise((resolve, reject) => {
      socket.setTimeout(5000)
      socket.on("connect", () => {
        console.log(
          `✅ TCP connection successful to ${config.host}:${config.port}`
        )
        socket.destroy()
        resolve(true)
      })
      socket.on("error", err => {
        console.log(`❌ TCP connection failed: ${err.message}`)
        reject(err)
      })
      socket.on("timeout", () => {
        console.log(`⏰ TCP connection timeout`)
        socket.destroy()
        reject(new Error("Connection timeout"))
      })
      socket.connect(config.port, config.host)
    })

    try {
      await tcpTest
    } catch (tcpError) {
      console.log("   This might be a firewall or network issue")
    }

    // 3. MySQL 연결 테스트
    console.log("\n3️⃣ Testing MySQL connection...")
    connection = await mysql.createConnection(config)
    console.log("✅ MySQL connection established successfully")

    // 4. 데이터베이스 존재 확인
    console.log("\n4️⃣ Checking database existence...")
    const [databases] = await connection.execute("SHOW DATABASES")
    const dbExists = databases.some(db => db.Database === config.database)

    if (dbExists) {
      console.log(`✅ Database '${config.database}' exists`)
    } else {
      console.log(`❌ Database '${config.database}' does not exist`)
      console.log("Available databases:")
      databases.forEach(db => console.log(`   - ${db.Database}`))
    }

    // 5. 사용자 권한 확인
    console.log("\n5️⃣ Checking user permissions...")
    await connection.execute(`USE ${config.database}`)
    console.log(`✅ Successfully connected to database '${config.database}'`)

    // 6. 테이블 확인
    console.log("\n6️⃣ Checking tables...")
    const [tables] = await connection.execute("SHOW TABLES")
    if (tables.length > 0) {
      console.log(`✅ Found ${tables.length} tables:`)
      tables.forEach(table => {
        const tableName = Object.values(table)[0]
        console.log(`   - ${tableName}`)
      })
    } else {
      console.log("⚠️  No tables found in the database")
    }

    console.log("\n🎉 Database connection test completed successfully!")
  } catch (error) {
    console.log("\n❌ Database connection test failed!")
    console.log("Error details:", error.message)

    if (error.code === "ENOTFOUND") {
      console.log("\n🔧 Troubleshooting suggestions:")
      console.log("   1. Check if the hostname is correct")
      console.log("   2. Verify DNS configuration")
      console.log(
        "   3. Check if the hostname is in /etc/hosts (for local development)"
      )
    } else if (error.code === "ECONNREFUSED") {
      console.log("\n🔧 Troubleshooting suggestions:")
      console.log("   1. Check if MySQL server is running")
      console.log("   2. Verify the port number")
      console.log("   3. Check firewall settings")
      console.log("   4. Ensure MySQL is accepting external connections")
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n🔧 Troubleshooting suggestions:")
      console.log("   1. Verify username and password")
      console.log("   2. Check user permissions in MySQL")
      console.log("   3. Ensure user can connect from this host")
    }

    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// 스크립트 실행
testConnection().catch(console.error)
