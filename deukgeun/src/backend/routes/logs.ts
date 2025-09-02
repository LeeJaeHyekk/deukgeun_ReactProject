import express from "express"
import { authMiddleware } from "../middlewares/auth.js"
import { logger } from "../utils/logger.js"
import path from "path"
import fs from "fs"

const router = express.Router()

// 로그 파일 경로
const logsDir = path.join(process.cwd(), "logs")
const errorLogPath = path.join(logsDir, "error.log")
const combinedLogPath = path.join(logsDir, "combined.log")

// 로그 조회 API (관리자만 접근 가능)
router.get("/", authMiddleware, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "관리자 권한이 필요합니다.",
      })
    }

    const { level = "all", limit = 100, offset = 0 } = req.query

    // 로그 파일 읽기
    let logContent = ""
    if (level === "error" || level === "all") {
      if (fs.existsSync(errorLogPath)) {
        logContent += fs.readFileSync(errorLogPath, "utf-8")
      }
    }

    if (level === "all") {
      if (fs.existsSync(combinedLogPath)) {
        logContent += fs.readFileSync(combinedLogPath, "utf-8")
      }
    }

    // 로그 파싱 및 필터링
    const logs = logContent
      .split("\n")
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line)
        } catch {
          return { message: line, timestamp: new Date().toISOString() }
        }
      })
      .reverse() // 최신 로그부터
      .slice(Number(offset), Number(offset) + Number(limit))

    res.json({
      success: true,
      data: {
        logs,
        total: logs.length,
        level,
        limit: Number(limit),
        offset: Number(offset),
      },
    })
  } catch (error) {
    logger.error("로그 조회 중 오류 발생", error)
    res.status(500).json({
      success: false,
      message: "로그 조회 중 오류가 발생했습니다.",
    })
  }
})

// 로그 파일 다운로드 API
router.get("/download", authMiddleware, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "관리자 권한이 필요합니다.",
      })
    }

    const { type = "combined" } = req.query
    let filePath = ""

    switch (type) {
      case "error":
        filePath = errorLogPath
        break
      case "combined":
        filePath = combinedLogPath
        break
      default:
        return res.status(400).json({
          success: false,
          message: "잘못된 로그 타입입니다.",
        })
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "로그 파일을 찾을 수 없습니다.",
      })
    }

    res.download(
      filePath,
      `${type}_logs_${new Date().toISOString().split("T")[0]}.log`
    )
  } catch (error) {
    logger.error("로그 다운로드 중 오류 발생", error)
    res.status(500).json({
      success: false,
      message: "로그 다운로드 중 오류가 발생했습니다.",
    })
  }
})

// 로그 정리 API
router.delete("/", authMiddleware, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "관리자 권한이 필요합니다.",
      })
    }

    const { type = "all" } = req.query

    if (type === "error" || type === "all") {
      if (fs.existsSync(errorLogPath)) {
        fs.writeFileSync(errorLogPath, "")
      }
    }

    if (type === "combined" || type === "all") {
      if (fs.existsSync(combinedLogPath)) {
        fs.writeFileSync(combinedLogPath, "")
      }
    }

    logger.info(`로그 파일이 정리되었습니다. (type: ${type})`)

    res.json({
      success: true,
      message: "로그 파일이 성공적으로 정리되었습니다.",
    })
  } catch (error) {
    logger.error("로그 정리 중 오류 발생", error)
    res.status(500).json({
      success: false,
      message: "로그 정리 중 오류가 발생했습니다.",
    })
  }
})

export default router
