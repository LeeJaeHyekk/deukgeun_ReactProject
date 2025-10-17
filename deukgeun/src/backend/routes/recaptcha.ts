import { Router, Request, Response } from 'express'
import { verifyRecaptchaEnterprise, checkRecaptchaEnterpriseHealth } from '@backend/utils/recaptcha-enterprise'

const router = Router()

/**
 * reCAPTCHA Enterprise 토큰 검증 엔드포인트
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

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action is required'
      })
    }

    const result = await verifyRecaptchaEnterprise(token, action)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        score: result.score
      })
    }

    res.json({
      success: true,
      score: result.score,
      message: 'reCAPTCHA verification successful'
    })
  } catch (error) {
    console.error('reCAPTCHA 검증 오류:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

/**
 * reCAPTCHA Enterprise 헬스체크 엔드포인트
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await checkRecaptchaEnterpriseHealth()
    
    res.json({
      success: true,
      health,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('reCAPTCHA 헬스체크 오류:', error)
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    })
  }
})

/**
 * reCAPTCHA Enterprise 설정 정보 엔드포인트 (개발용)
 */
router.get('/config', (req: Request, res: Response) => {
  try {
    const config = {
      siteKey: process.env.RECAPTCHA_SITE_KEY,
      projectId: process.env.RECAPTCHA_PROJECT_ID,
      hasApiKey: !!process.env.RECAPTCHA_API_KEY,
      hasSecret: !!process.env.RECAPTCHA_SECRET
    }

    res.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('reCAPTCHA 설정 정보 오류:', error)
    res.status(500).json({
      success: false,
      error: 'Config retrieval failed'
    })
  }
})

export default router
