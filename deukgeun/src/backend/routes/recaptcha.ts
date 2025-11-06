import { Router, Request, Response } from 'express'
import { verifyRecaptcha } from '@backend/utils/recaptcha'
import * as fs from 'fs'
import * as path from 'path'
import { logger } from '@backend/utils/logger'

const router = Router()

// 로그 디렉토리 경로
const logDir = path.join(process.cwd(), 'logs')
const logFile = path.join(logDir, 'recaptcha.log')

// 로그 디렉토리 생성
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true })
  } catch (error) {
    logger.warn('로그 디렉토리 생성 실패:', error)
  }
}

/**
 * reCAPTCHA v3 토큰 검증 엔드포인트
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { token, action } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA token is required'
      })
    }

    // v3 검증 (action 검증 포함)
    const isValid = await verifyRecaptcha(token, action || undefined, req)

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA verification failed'
      })
    }

    res.json({
      success: true,
      message: 'reCAPTCHA verification successful'
    })
  } catch (error) {
    logger.error('reCAPTCHA 검증 오류:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * 프론트엔드 로그 수신 엔드포인트
 * 프론트엔드에서 발생한 reCAPTCHA 오류를 백엔드 로그 파일에 기록
 */
router.post('/log', async (req: Request, res: Response) => {
  try {
    const { level, message, data } = req.body

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level || 'info',
      message: message || 'reCAPTCHA 로그',
      data: data || {},
      source: 'frontend',
      userAgent: req.headers['user-agent'] || req.get('user-agent') || undefined,
      userIpAddress: req.ip || req.socket.remoteAddress || undefined,
      requestUrl: req.url || req.originalUrl || undefined,
      environment: process.env.NODE_ENV || 'development',
      mode: process.env.MODE || 'development',
    }

    try {
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf-8')
    } catch (error) {
      logger.warn('reCAPTCHA 로그 파일 기록 실패:', error)
    }

    res.json({
      success: true,
      message: 'Log recorded'
    })
  } catch (error) {
    logger.error('reCAPTCHA 로그 수신 오류:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * reCAPTCHA 설정 정보 엔드포인트 (개발용)
 */
router.get('/config', (req: Request, res: Response) => {
  try {
    const config = {
      siteKey: process.env.RECAPTCHA_SITE_KEY || process.env.VITE_RECAPTCHA_SITE_KEY,
      hasSecret: !!(process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET),
      minScore: parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5'),
      environment: process.env.NODE_ENV || 'development',
    }

    res.json({
      success: true,
      config
    })
  } catch (error) {
    logger.error('reCAPTCHA 설정 정보 오류:', error)
    res.status(500).json({
      success: false,
      error: 'Config retrieval failed'
    })
  }
})

export default router
