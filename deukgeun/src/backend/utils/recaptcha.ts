import axios from "axios"
import { Request } from "express"
import { logger } from "@backend/utils/logger"
import * as fs from "fs"
import * as path from "path"

// 토큰 재사용 방지를 위한 캐시 (메모리 기반, 프로덕션에서는 Redis 등 사용 권장)
// 토큰 해시를 키로 사용하여 재사용 방지
const tokenCache = new Map<string, number>()
const TOKEN_CACHE_TTL = 2 * 60 * 1000 // 2분 (토큰 유효 시간과 동일)
const MAX_CACHE_SIZE = 10000 // 최대 캐시 크기 (메모리 보호)

// Rate limiting을 위한 요청 추적 (IP 기반)
const requestTracker = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1분
const RATE_LIMIT_MAX_REQUESTS = 10 // 1분당 최대 10회 요청

// 캐시 정리 함수 (주기적으로 오래된 항목 제거)
function cleanupCache(): void {
  const now = Date.now()
  
  // 토큰 캐시 정리
  for (const [tokenHash, timestamp] of tokenCache.entries()) {
    if (now - timestamp > TOKEN_CACHE_TTL) {
      tokenCache.delete(tokenHash)
    }
  }
  
  // 캐시 크기 제한
  if (tokenCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(tokenCache.entries())
    entries.sort((a, b) => a[1] - b[1]) // 오래된 순으로 정렬
    const toDelete = entries.slice(0, tokenCache.size - MAX_CACHE_SIZE)
    toDelete.forEach(([tokenHash]) => tokenCache.delete(tokenHash))
  }
  
  // Rate limiting 추적 정리
  for (const [ip, data] of requestTracker.entries()) {
    if (now > data.resetTime) {
      requestTracker.delete(ip)
    }
  }
}

// 토큰 해시 생성 (간단한 해시 함수)
function hashToken(token: string): string {
  // 간단한 해시 함수 (프로덕션에서는 crypto 모듈 사용 권장)
  let hash = 0
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32bit 정수로 변환
  }
  return hash.toString(36)
}

// Rate limiting 검증
function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const tracker = requestTracker.get(ip)
  
  if (!tracker || now > tracker.resetTime) {
    // 새로운 윈도우 시작
    requestTracker.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (tracker.count >= RATE_LIMIT_MAX_REQUESTS) {
    logger.warn(`Rate limit 초과 - IP: ${ip}, 요청 횟수: ${tracker.count}`)
    return false
  }
  
  tracker.count++
  return true
}

// reCAPTCHA 검증 컨텍스트
export interface RecaptchaVerificationContext {
  userAgent?: string
  userIpAddress?: string
  requestUrl?: string
  host?: string // Host 헤더 (도메인 불일치 디버깅용)
  xForwardedHost?: string // X-Forwarded-Host 헤더
  xForwardedProto?: string // X-Forwarded-Proto 헤더
}

// 프로덕션 로깅 함수
function writeRecaptchaLog(
  level: "info" | "warn" | "error",
  message: string,
  data?: any
): void {
  const logDir = path.join(process.cwd(), "logs")
  const logFile = path.join(logDir, "recaptcha.log")

  // 로그 디렉토리 생성
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true })
    } catch (error) {
      logger.warn("로그 디렉토리 생성 실패:", error)
      return
    }
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data: data || {},
    environment: process.env.NODE_ENV || "development",
    mode: process.env.MODE || "development",
  }

  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n", "utf-8")
  } catch (error) {
    logger.warn("reCAPTCHA 로그 파일 기록 실패:", error)
  }
}

// Request 객체에서 컨텍스트 추출
function extractContext(req?: Request | RecaptchaVerificationContext): RecaptchaVerificationContext {
  if (!req) {
    return {}
  }

    // Request 객체인지 확인
    if ("headers" in req && "ip" in req) {
      const request = req as Request
      // Host 헤더 추출 (Nginx 리버스 프록시에서 전달된 Host 헤더 확인)
      // 헤더 값이 배열인 경우 첫 번째 값 사용
      const hostHeader = request.headers["host"]
      const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader || request.get("host") || undefined
      const xForwardedHostHeader = request.headers["x-forwarded-host"]
      const xForwardedHost = Array.isArray(xForwardedHostHeader) ? xForwardedHostHeader[0] : xForwardedHostHeader || request.get("x-forwarded-host") || undefined
      const xForwardedProtoHeader = request.headers["x-forwarded-proto"]
      const xForwardedProto = Array.isArray(xForwardedProtoHeader) ? xForwardedProtoHeader[0] : xForwardedProtoHeader || request.get("x-forwarded-proto") || undefined
    
    // Host 헤더 로깅 (도메인 불일치 디버깅용)
    if (host) {
      logger.info("reCAPTCHA 검증 - Host 헤더 확인:", {
        host,
        xForwardedHost,
        xForwardedProto,
        originalUrl: request.originalUrl || request.url,
      })
    } else {
      logger.warn("⚠️ reCAPTCHA 검증 - Host 헤더가 없습니다. Nginx 설정을 확인하세요.")
    }
    
    return {
      userAgent: request.headers["user-agent"] || request.get("user-agent") || undefined,
      userIpAddress: request.ip || request.socket.remoteAddress || undefined,
      requestUrl: request.url || request.originalUrl || undefined,
      host: host || xForwardedHost, // Host 헤더 추가
      xForwardedHost,
      xForwardedProto,
    }
  }

  // 이미 컨텍스트 객체인 경우
  return req as RecaptchaVerificationContext
}

// reCAPTCHA 검증 함수 (v3 표준)
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string,
  context?: Request | RecaptchaVerificationContext
): Promise<boolean> {
  logger.info(`[verifyRecaptcha] 검증 시작`, {
    tokenLength: token.length,
    tokenPreview: token.substring(0, 20) + '...',
    expectedAction,
    hasContext: !!context
  })
  const requestId = `recaptcha-${Date.now()}-${Math.random().toString(36).substring(7)}`
  const startTime = Date.now()
  
  try {
    // 캐시 정리 (주기적으로 실행)
    if (Math.random() < 0.1) { // 10% 확률로 실행 (성능 최적화)
      cleanupCache()
    }
    
    // 토큰 검증 (null, undefined, 빈 문자열 체크)
    if (!token || typeof token !== 'string' || token.trim() === '') {
      logger.error("reCAPTCHA 토큰이 없거나 유효하지 않습니다:", {
        tokenType: typeof token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null/undefined',
      })
      writeRecaptchaLog("error", "reCAPTCHA 토큰 없음 또는 유효하지 않음", {
        requestId,
        expectedAction,
        tokenType: typeof token,
        tokenLength: token ? token.length : 0,
      })
      return false
    }

    // 토큰 형식 검증 (reCAPTCHA 토큰은 보통 매우 긴 문자열)
    if (token.length < 100) {
      logger.error("reCAPTCHA 토큰이 너무 짧습니다 (유효하지 않을 수 있음):", {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 30) + '...',
      })
      writeRecaptchaLog("error", "reCAPTCHA 토큰 형식 오류 (너무 짧음)", {
        requestId,
        expectedAction,
        tokenLength: token.length,
      })
      return false
    }
    
    // 토큰 재사용 방지 검증
    const tokenHash = hashToken(token)
    if (tokenCache.has(tokenHash)) {
      const cachedTime = tokenCache.get(tokenHash)!
      const age = Date.now() - cachedTime
      logger.warn("reCAPTCHA 토큰 재사용 감지:", {
        tokenHash: tokenHash.substring(0, 10) + '...',
        age: `${Math.round(age / 1000)}초`,
        cachedTime: new Date(cachedTime).toISOString(),
      })
      writeRecaptchaLog("warn", "reCAPTCHA 토큰 재사용 감지", {
        requestId,
        expectedAction,
        tokenHash: tokenHash.substring(0, 10) + '...',
        age: `${Math.round(age / 1000)}초`,
      })
      return false
    }
    
    // Rate limiting 검증
    const verificationContext = extractContext(context)
    const { userIpAddress } = verificationContext
    if (userIpAddress) {
      if (!checkRateLimit(userIpAddress)) {
        logger.warn("reCAPTCHA Rate limit 초과:", {
          ip: userIpAddress,
          limit: RATE_LIMIT_MAX_REQUESTS,
          window: `${RATE_LIMIT_WINDOW / 1000}초`,
        })
        writeRecaptchaLog("warn", "reCAPTCHA Rate limit 초과", {
          requestId,
          expectedAction,
          ip: userIpAddress,
          limit: RATE_LIMIT_MAX_REQUESTS,
        })
        return false
      }
    }

    // 개발 환경에서 더미 토큰 허용
    if (process.env.NODE_ENV === "development") {
      if (token.includes("dummy-token") || token.includes("test-token")) {
        logger.info("개발 환경에서 더미 reCAPTCHA 토큰 허용")
        writeRecaptchaLog("info", "개발 환경 더미 토큰 허용", {
          requestId,
          expectedAction,
          token: token.substring(0, 20) + "...",
        })
        return true
      }
    }

    const secret =
      process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET
    if (!secret || secret === "") {
      // 개발 환경에서는 시크릿 키가 없어도 더미 토큰 허용
      if (process.env.NODE_ENV === "development") {
        logger.warn(
          "개발 환경에서 reCAPTCHA 시크릿 키가 설정되지 않았지만 더미 토큰 허용"
        )
        writeRecaptchaLog("warn", "개발 환경 시크릿 키 없음", {
          requestId,
          expectedAction,
        })
        return true
      }
      logger.error("reCAPTCHA 시크릿 키가 설정되지 않았습니다.")
      writeRecaptchaLog("error", "reCAPTCHA 시크릿 키 없음", {
        requestId,
        expectedAction,
      })
      return false
    }

    // Secret Key와 Site Key 검증 (키 쌍 확인)
    const siteKey = process.env.RECAPTCHA_SITE_KEY || process.env.VITE_RECAPTCHA_SITE_KEY
    if (siteKey) {
      logger.info("reCAPTCHA 키 정보:", {
        siteKey: siteKey.substring(0, 20) + "...",
        secretKey: secret.substring(0, 20) + "...",
        tokenLength: token.length,
      })
    }

    // 컨텍스트 추출 (이미 위에서 추출했으므로 재사용)
    const { userAgent, userIpAddress: userIp, requestUrl, host, xForwardedHost, xForwardedProto } = verificationContext

    // 실제 reCAPTCHA 검증 (v3 표준 API)
    // Google reCAPTCHA v3 표준 API는 Secret Key만으로 인증 가능하며,
    // 별도의 Google Cloud 인증(서비스 계정, OAuth 등)이 필요하지 않습니다.
    // 
    // 표준 API vs Enterprise API:
    // - 표준 API (현재 사용): https://www.google.com/recaptcha/api/siteverify
    //   - Secret Key만으로 인증
    //   - POST body로 URLSearchParams 형식 전송
    // - Enterprise API: https://recaptchaenterprise.googleapis.com/v1/projects/{projectId}/assessments
    //   - Google Cloud 인증 필요 (서비스 계정, API 키 등)
    //   - JSON 형식으로 전송
    //
    // Google reCAPTCHA v3 API는 토큰 검증 시 자동으로 점수(score)를 반환합니다
    
    // IP 주소 유효성 검증 (선택사항이지만 전달 시 유효한 형식인지 확인)
    let remoteIp = userIp || ''
    if (remoteIp) {
      // IP 주소 형식 검증 (IPv4 또는 IPv6)
      const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/
      const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
      if (!ipv4Pattern.test(remoteIp) && !ipv6Pattern.test(remoteIp)) {
        logger.warn("유효하지 않은 IP 주소 형식:", { ip: remoteIp })
        remoteIp = '' // 유효하지 않은 IP는 전달하지 않음
      }
    }
    
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      new URLSearchParams({
        secret: secret,
        response: token,
        remoteip: remoteIp, // IP 주소 전달 (유효한 경우에만)
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'deukgeun-backend/1.0', // User-Agent 설정 (선택사항)
        },
        timeout: 10000, // 10초 타임아웃
        validateStatus: (status) => status < 500, // 5xx 오류만 예외로 처리
      }
    )

    const duration = Date.now() - startTime
    
    // HTTP 응답 상태 코드 검증
    if (response.status !== 200) {
      logger.error("reCAPTCHA API HTTP 오류:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      })
      writeRecaptchaLog("error", "reCAPTCHA API HTTP 오류", {
        requestId,
        expectedAction,
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
      })
      return false
    }
    
    // 응답 데이터 유효성 검증
    if (!response.data || typeof response.data !== 'object') {
      logger.error("reCAPTCHA API 응답 데이터 형식 오류:", {
        dataType: typeof response.data,
        data: response.data,
      })
      writeRecaptchaLog("error", "reCAPTCHA API 응답 데이터 형식 오류", {
        requestId,
        expectedAction,
        dataType: typeof response.data,
        duration: `${duration}ms`,
      })
      return false
    }
    
    // 토큰 만료 시간 검증 (challenge_ts 기반)
    const challengeTs = response.data.challenge_ts
    let tokenAge: number | null = null
    if (challengeTs) {
      try {
        const challengeTime = new Date(challengeTs).getTime()
        if (isNaN(challengeTime)) {
          logger.warn("reCAPTCHA challenge_ts 파싱 실패:", { challengeTs })
        } else {
          tokenAge = Math.round((Date.now() - challengeTime) / 1000) // 초 단위
          
          // 토큰이 2분(120초) 이상 지났으면 만료로 간주
          const TOKEN_MAX_AGE = 120 // 2분
          if (tokenAge > TOKEN_MAX_AGE) {
            logger.warn("reCAPTCHA 토큰 만료:", {
              tokenAge: `${tokenAge}초`,
              maxAge: `${TOKEN_MAX_AGE}초`,
              challengeTs,
            })
            writeRecaptchaLog("warn", "reCAPTCHA 토큰 만료", {
              requestId,
              expectedAction,
              tokenAge: `${tokenAge}초`,
              maxAge: `${TOKEN_MAX_AGE}초`,
              challengeTs,
            })
            return false
          }
          
          // 토큰이 음수 나이를 가지는 경우 (시스템 시간 불일치)
          if (tokenAge < 0) {
            logger.warn("reCAPTCHA 토큰 시간 불일치 (시스템 시간 확인 필요):", {
              tokenAge: `${tokenAge}초`,
              challengeTs,
              serverTime: new Date().toISOString(),
            })
            // 음수 나이는 허용하되 경고만 기록 (시스템 시간 불일치 가능성)
          }
        }
      } catch (error) {
        logger.warn("reCAPTCHA 토큰 만료 시간 파싱 실패:", error)
      }
    }

    // Google API 응답 로깅 (디버깅용) - 항상 출력 (전체 응답 포함)
    console.log("🔍 [reCAPTCHA] Google API 응답:", JSON.stringify({
      success: response.data.success,
      hasScore: response.data.score !== undefined,
      score: response.data.score,
      action: response.data.action,
      hostname: response.data.hostname,
      challenge_ts: response.data.challenge_ts,
      tokenAge: tokenAge !== null ? `${tokenAge}초` : "알 수 없음",
      errorCodes: response.data["error-codes"] || [],
      fullResponse: response.data, // 전체 응답 추가 (디버깅용)
    }, null, 2))
    
    logger.info("reCAPTCHA API 응답:", {
      success: response.data.success,
      hasScore: response.data.score !== undefined,
      score: response.data.score,
      action: response.data.action,
      hostname: response.data.hostname,
      challenge_ts: response.data.challenge_ts,
      tokenAge: tokenAge !== null ? `${tokenAge}초` : "알 수 없음",
      errorCodes: response.data["error-codes"] || [],
    })

    if (!response.data.success) {
      const errorCodes = response.data["error-codes"] || []
      const apiHostname = response.data.hostname
      const apiChallengeTs = response.data.challenge_ts
      
      // 등록된 도메인 목록 (환경 변수에서 가져오거나 기본값 사용)
      const registeredDomains = (process.env.RECAPTCHA_REGISTERED_DOMAINS || 
        "devtrail.net,www.devtrail.net,43.203.30.167,localhost,127.0.0.1")
        .split(",")
        .map(domain => domain.trim().toLowerCase())
        .filter(domain => domain.length > 0)
      
      // 도메인 불일치 검증
      let domainMismatch = false
      let domainMismatchDetails = null
      
      if (apiHostname) {
        // hostname이 있는 경우 등록된 도메인과 비교
        const normalizedHostname = apiHostname.toLowerCase().trim()
        
        // IP 주소 패턴 확인 (IPv4 또는 IPv6)
        const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(normalizedHostname)
        
        const isRegistered = registeredDomains.some(domain => {
          const normalizedDomain = domain.toLowerCase().trim()
          
          // IP 주소인 경우 정확히 일치해야 함
          if (isIpAddress) {
            return normalizedHostname === normalizedDomain
          }
          
          // 도메인인 경우 정확히 일치하거나 서브도메인인 경우
          return normalizedHostname === normalizedDomain || 
                 normalizedHostname.endsWith(`.${normalizedDomain}`)
        })
        
        if (!isRegistered) {
          domainMismatch = true
          domainMismatchDetails = {
            apiHostname: apiHostname,
            registeredDomains: registeredDomains,
            mismatch: true,
            isIpAddress,
            suggestion: `Google Console에 '${apiHostname}' ${isIpAddress ? 'IP 주소' : '도메인'}를 추가하세요.`
          }
        }
      } else {
        // hostname이 null인 경우 - 도메인 불일치 가능성 높음
        // 단, success가 false인 경우에만 도메인 불일치로 간주
        // (success가 true인데 hostname이 null인 경우는 Google API 버그일 수 있음)
        domainMismatch = true
        domainMismatchDetails = {
          apiHostname: null,
          registeredDomains: registeredDomains,
          mismatch: true,
          reason: "Google API 응답에 hostname이 없습니다. 이는 도메인이 등록되지 않았거나 불일치할 가능성이 높습니다.",
          suggestion: "Google Console (https://www.google.com/recaptcha/admin)에서 도메인 등록 상태를 확인하세요."
        }
      }
      
      // 상세한 오류 정보 로깅
      let errorMessage = ""
      if (errorCodes.includes("invalid-input-response")) {
        if (domainMismatch) {
          errorMessage = `도메인 불일치: ${domainMismatchDetails?.reason || "hostname이 null입니다"}. ${domainMismatchDetails?.suggestion || "Google Console에서 도메인을 확인하세요."}`
        } else {
          errorMessage = "토큰이 유효하지 않습니다. 가능한 원인: 1) 토큰 만료 (2분 초과), 2) 토큰 재사용, 3) Site Key와 Secret Key 불일치, 4) 토큰 형식 오류"
        }
      } else if (errorCodes.includes("invalid-input-secret")) {
        errorMessage = "Secret Key가 유효하지 않습니다."
      } else if (errorCodes.includes("timeout-or-duplicate")) {
        errorMessage = "토큰이 만료되었거나 이미 사용되었습니다 (재사용 불가)."
      } else {
        errorMessage = "알 수 없는 오류"
      }

      // 상세 정보를 console.log로도 출력 (PM2 로그에서 확인 가능)
      const detailInfo = {
        errorCodes,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 30) + "...",
        score: response.data.score,
        action: response.data.action,
        hostname: apiHostname,
        challenge_ts: apiChallengeTs,
        siteKey: siteKey ? siteKey.substring(0, 20) + "..." : "not set",
        secretKey: secret.substring(0, 20) + "...",
        errorMessage,
        tokenAge: apiChallengeTs 
          ? `${Math.round((Date.now() / 1000 - new Date(apiChallengeTs).getTime() / 1000))}초 경과`
          : "알 수 없음",
        domainMismatch: domainMismatch,
        domainMismatchDetails: domainMismatchDetails,
        registeredDomains: registeredDomains,
        fullApiResponse: response.data, // 전체 API 응답 추가
      }
      
      console.error("❌ [reCAPTCHA] 검증 실패 - 상세 정보:", JSON.stringify(detailInfo, null, 2))
      
      // 도메인 불일치가 확인된 경우 추가 경고
      if (domainMismatch) {
        console.error("⚠️ [reCAPTCHA] 도메인 불일치 감지:", JSON.stringify(domainMismatchDetails, null, 2))
        logger.error("reCAPTCHA 도메인 불일치 감지:", domainMismatchDetails)
      }
      
      logger.error("reCAPTCHA 검증 실패 - 상세 정보:", detailInfo)
      
      writeRecaptchaLog("error", "reCAPTCHA v3 검증 실패", {
        requestId,
        expectedAction,
        errorCodes,
        score: response.data.score,
        action: response.data.action,
        hostname: apiHostname,
        challenge_ts: apiChallengeTs,
        duration: `${duration}ms`,
        userAgent,
        userIpAddress,
        requestUrl,
        requestHost: host || xForwardedHost, // 요청 Host 헤더 추가
        xForwardedHost,
        xForwardedProto,
        errorMessage,
        domainMismatch,
        domainMismatchDetails,
        registeredDomains,
        fullApiResponse: response.data, // 전체 API 응답 추가
      })
      
      return false
    }

    // action 검증 (v3의 경우)
    // 대소문자 무시 비교 (Google API는 소문자로 반환하지만, expectedAction은 대문자일 수 있음)
    if (expectedAction && response.data.action) {
      const normalizedExpected = expectedAction.toLowerCase().trim()
      const normalizedActual = response.data.action.toLowerCase().trim()
      
      if (normalizedActual !== normalizedExpected) {
        logger.warn("reCAPTCHA action 불일치:", {
          expected: expectedAction,
          actual: response.data.action,
          normalizedExpected,
          normalizedActual,
        })
        
        writeRecaptchaLog("warn", "reCAPTCHA action 불일치", {
          requestId,
          expectedAction,
          actualAction: response.data.action,
          normalizedExpected,
          normalizedActual,
          score: response.data.score,
          hostname: response.data.hostname,
          challenge_ts: response.data.challenge_ts,
          duration: `${duration}ms`,
          userAgent,
          userIpAddress,
          requestUrl,
        })
        
        return false
      }
      
      logger.info("reCAPTCHA action 검증 통과:", {
        expected: expectedAction,
        actual: response.data.action,
        normalizedExpected,
        normalizedActual,
      })
    }

    // 점수 기반 검증 (v3의 경우)
    // Google reCAPTCHA v3는 검증 성공 시 자동으로 점수를 반환합니다
    // 점수가 없으면 v2이거나 설정 오류일 수 있으므로 경고 로그 기록
    if (response.data.score !== undefined && response.data.score !== null) {
      const score = parseFloat(String(response.data.score))
      const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5")
      
      // 점수 유효성 검증 (0.0 ~ 1.0 범위)
      if (isNaN(score) || score < 0 || score > 1) {
        logger.error("reCAPTCHA 점수가 유효하지 않습니다:", { 
          score, 
          minScore,
          rawScore: response.data.score,
        })
        writeRecaptchaLog("error", "reCAPTCHA 점수 유효성 오류", {
          requestId,
          expectedAction,
          score,
          rawScore: response.data.score,
          minScore,
        })
        return false
      }

      logger.info("reCAPTCHA 점수 수신:", { 
        score, 
        minScore, 
        action: response.data.action,
        threshold: score >= minScore ? "통과" : "실패",
        margin: (score - minScore).toFixed(3)
      })

      // 점수 검증 (경계값 포함: score >= minScore)
      if (score < minScore) {
        logger.warn("reCAPTCHA 점수가 너무 낮습니다:", { 
          score, 
          minScore,
          margin: (score - minScore).toFixed(3),
        })
        
        writeRecaptchaLog("warn", "reCAPTCHA 점수 낮음", {
          requestId,
          expectedAction,
          score,
          minScore,
          margin: (score - minScore).toFixed(3),
          action: response.data.action,
          hostname: response.data.hostname,
          challenge_ts: response.data.challenge_ts,
          tokenAge: tokenAge !== null ? `${tokenAge}초` : "알 수 없음",
          duration: `${duration}ms`,
          userAgent,
          userIpAddress: userIp,
          requestUrl,
          requestHost: host || xForwardedHost,
          xForwardedHost,
          xForwardedProto,
        })
        
        return false
      }

      logger.info("reCAPTCHA 검증 성공 (점수 확인됨):", { 
        score, 
        minScore, 
        action: response.data.action,
        margin: (score - minScore).toFixed(3),
      })
      
      // 검증 성공 시 토큰을 캐시에 저장 (재사용 방지)
      tokenCache.set(tokenHash, Date.now())
      
      writeRecaptchaLog("info", "reCAPTCHA v3 검증 성공", {
        requestId,
        expectedAction,
        score,
        minScore,
        margin: (score - minScore).toFixed(3),
        action: response.data.action,
        hostname: response.data.hostname,
        challenge_ts: response.data.challenge_ts,
        tokenAge: tokenAge !== null ? `${tokenAge}초` : "알 수 없음",
        duration: `${duration}ms`,
        userAgent,
        userIpAddress: userIp,
        requestUrl,
        requestHost: host || xForwardedHost,
        xForwardedHost,
        xForwardedProto,
      })
    } else {
      // v3인데 점수가 없는 경우 경고 (v2이거나 설정 오류)
      // 단, 프로덕션 환경에서는 점수가 필수이므로 실패 처리
      if (process.env.NODE_ENV === "production") {
        logger.error("reCAPTCHA v3 검증 성공했지만 점수가 반환되지 않았습니다 (프로덕션):", {
          action: response.data.action,
          hostname: response.data.hostname,
          challenge_ts: response.data.challenge_ts,
        })
        writeRecaptchaLog("error", "reCAPTCHA 점수 없음 (프로덕션)", {
          requestId,
          expectedAction,
          action: response.data.action,
          hostname: response.data.hostname,
          challenge_ts: response.data.challenge_ts,
          duration: `${duration}ms`,
          userAgent,
          userIpAddress: userIp,
          requestUrl,
          note: "프로덕션 환경에서는 점수가 필수입니다. v2이거나 v3 설정이 올바르지 않을 수 있습니다.",
        })
        return false
      }
      
      logger.warn("reCAPTCHA v3 검증 성공했지만 점수가 반환되지 않았습니다:", {
        action: response.data.action,
        hostname: response.data.hostname,
        challenge_ts: response.data.challenge_ts,
      })
      
      logger.info("reCAPTCHA 검증 성공 (점수 없음 - v2이거나 설정 오류 가능)")
      
      // 검증 성공 시 토큰을 캐시에 저장 (재사용 방지)
      tokenCache.set(tokenHash, Date.now())
      
      writeRecaptchaLog("warn", "reCAPTCHA 검증 성공 (점수 없음)", {
        requestId,
        expectedAction,
        action: response.data.action,
        hostname: response.data.hostname,
        challenge_ts: response.data.challenge_ts,
        tokenAge: tokenAge !== null ? `${tokenAge}초` : "알 수 없음",
        duration: `${duration}ms`,
        userAgent,
        userIpAddress: userIp,
        requestUrl,
        requestHost: host || xForwardedHost,
        xForwardedHost,
        xForwardedProto,
        note: "점수가 반환되지 않았습니다. v2이거나 v3 설정이 올바르지 않을 수 있습니다.",
      })
    }

    return true
  } catch (error) {
    const duration = Date.now() - startTime
    const verificationContext = extractContext(context)
    const { userAgent, userIpAddress, requestUrl, host, xForwardedHost, xForwardedProto } = verificationContext
    
    // 에러 타입 분석
    const isNetworkError = axios.isAxiosError(error) && (
      error.code === 'ECONNABORTED' || // 타임아웃
      error.code === 'ENOTFOUND' || // DNS 오류
      error.code === 'ECONNREFUSED' || // 연결 거부
      error.code === 'ETIMEDOUT' // 타임아웃
    )
    
    const isTimeoutError = axios.isAxiosError(error) && error.code === 'ECONNABORTED'
    
    logger.error("reCAPTCHA 인증 실패:", {
      error: error instanceof Error ? error.message : String(error),
      errorType: isNetworkError ? 'network' : isTimeoutError ? 'timeout' : 'unknown',
      isAxiosError: axios.isAxiosError(error),
      errorCode: axios.isAxiosError(error) ? error.code : undefined,
      errorStatus: axios.isAxiosError(error) ? error.response?.status : undefined,
    })

    writeRecaptchaLog("error", "reCAPTCHA 검증 오류", {
      requestId,
      expectedAction,
      error: error instanceof Error ? error.message : String(error),
      errorType: isNetworkError ? 'network' : isTimeoutError ? 'timeout' : 'unknown',
      errorCode: axios.isAxiosError(error) ? error.code : undefined,
      errorStatus: axios.isAxiosError(error) ? error.response?.status : undefined,
      duration: `${duration}ms`,
      userAgent,
      userIpAddress,
      requestUrl,
      requestHost: host || xForwardedHost,
      xForwardedHost,
      xForwardedProto,
    })

    // 개발 환경에서는 네트워크 오류 시에도 더미 토큰 허용 (단, 타임아웃은 제외)
    if (process.env.NODE_ENV === "development" && isNetworkError && !isTimeoutError) {
      logger.warn("개발 환경에서 네트워크 오류 시 더미 토큰 허용 (타임아웃 제외)")
      return true
    }

    // 프로덕션 환경에서는 모든 오류를 실패로 처리
    // 네트워크 오류는 일시적일 수 있으므로, 클라이언트에 재시도 권장 메시지 전달
    return false
  }
}

// reCAPTCHA 설정 검증
export function validateRecaptchaConfig(): boolean {
  const secret =
    process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET

  if (!secret || secret === "") {
    if (process.env.NODE_ENV === "development") {
      logger.warn(
        "개발 환경: reCAPTCHA 시크릿 키가 설정되지 않음 (더미 토큰 사용)"
      )
      return true
    }
    logger.error("프로덕션 환경: reCAPTCHA 시크릿 키가 설정되지 않음")
    return false
  }

  return true
}
