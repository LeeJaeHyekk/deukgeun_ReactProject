import axios from 'axios'

interface RecaptchaEnterpriseResponse {
  tokenProperties: {
    valid: boolean
    invalidReason?: string
    hostname: string
    action: string
    createTime: string
  }
  riskAnalysis: {
    score: number
    reasons?: string[]
  }
  event: {
    token: string
    siteKey: string
    userAgent: string
    userIpAddress: string
    expectedAction: string
  }
}

interface RecaptchaAssessmentRequest {
  event: {
    token: string
    siteKey: string
    expectedAction: string
  }
}

/**
 * reCAPTCHA Enterprise 검증 함수
 * Google reCAPTCHA Enterprise API를 사용하여 토큰을 검증합니다.
 */
export const verifyRecaptchaEnterprise = async (
  token: string,
  expectedAction: string
): Promise<{ success: boolean; score: number; error?: string }> => {
  try {
    const projectId = process.env.RECAPTCHA_PROJECT_ID
    const apiKey = process.env.RECAPTCHA_API_KEY

    if (!projectId || !apiKey) {
      throw new Error('reCAPTCHA Enterprise 설정이 누락되었습니다.')
    }

    // reCAPTCHA Enterprise API 요청 데이터 구성
    const requestData: RecaptchaAssessmentRequest = {
      event: {
        token,
        siteKey: process.env.RECAPTCHA_SITE_KEY || '6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG',
        expectedAction
      }
    }

    // Google reCAPTCHA Enterprise API 호출
    const response = await axios.post(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const data: RecaptchaEnterpriseResponse = response.data

    // 토큰 유효성 검사
    if (!data.tokenProperties.valid) {
      return {
        success: false,
        score: 0,
        error: data.tokenProperties.invalidReason || 'Invalid token'
      }
    }

    // 액션 검증
    if (data.tokenProperties.action !== expectedAction) {
      return {
        success: false,
        score: data.riskAnalysis.score,
        error: 'Action mismatch'
      }
    }

    // 점수 반환
    return {
      success: true,
      score: data.riskAnalysis.score
    }
  } catch (error) {
    console.error('reCAPTCHA Enterprise 검증 오류:', error)
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error?.message || error.message
      return {
        success: false,
        score: 0,
        error: `API 오류: ${errorMessage}`
      }
    }
    
    return {
      success: false,
      score: 0,
      error: 'Verification failed'
    }
  }
}

/**
 * reCAPTCHA Enterprise 점수 기반 처리
 * 점수에 따라 적절한 조치를 결정합니다.
 */
export const processRecaptchaScore = (score: number, action: string) => {
  const scoreThresholds = {
    LOGIN: 0.5,
    REGISTER: 0.7,
    SENSITIVE: 0.8,
    ADMIN: 0.9
  }

  const threshold = scoreThresholds[action as keyof typeof scoreThresholds] || 0.5

  return {
    allowed: score >= threshold,
    score,
    threshold,
    riskLevel: score >= 0.8 ? 'low' : score >= 0.5 ? 'medium' : 'high'
  }
}

/**
 * reCAPTCHA Enterprise 미들웨어
 * Express 미들웨어로 사용할 수 있는 reCAPTCHA 검증 함수
 */
export const recaptchaEnterpriseMiddleware = (
  action: string,
  minScore: number = 0.5
) => {
  return async (req: any, res: any, next: any) => {
    try {
      const token = req.body.recaptchaToken || req.headers['x-recaptcha-token']

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'reCAPTCHA token is required'
        })
      }

      const result = await verifyRecaptchaEnterprise(token, action)

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error || 'reCAPTCHA verification failed'
        })
      }

      const scoreResult = processRecaptchaScore(result.score, action)

      if (!scoreResult.allowed) {
        return res.status(400).json({
          success: false,
          error: `Score too low: ${result.score} (minimum: ${minScore})`,
          score: result.score,
          riskLevel: scoreResult.riskLevel
        })
      }

      // 검증 결과를 요청 객체에 추가
      req.recaptchaScore = result.score
      req.recaptchaRiskLevel = scoreResult.riskLevel
      next()
    } catch (error) {
      console.error('reCAPTCHA Enterprise 미들웨어 오류:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}

/**
 * reCAPTCHA Enterprise 헬스체크
 * reCAPTCHA Enterprise API 연결 상태를 확인합니다.
 */
export const checkRecaptchaEnterpriseHealth = async () => {
  try {
    const projectId = process.env.RECAPTCHA_PROJECT_ID
    const apiKey = process.env.RECAPTCHA_API_KEY

    if (!projectId || !apiKey) {
      return {
        status: 'unhealthy',
        message: 'reCAPTCHA Enterprise 설정이 누락되었습니다.'
      }
    }

    // 간단한 API 연결 테스트
    const response = await axios.get(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}?key=${apiKey}`,
      { timeout: 5000 }
    )

    return {
      status: 'healthy',
      message: 'reCAPTCHA Enterprise API 연결 정상',
      projectId
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'reCAPTCHA Enterprise API 연결 실패',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
