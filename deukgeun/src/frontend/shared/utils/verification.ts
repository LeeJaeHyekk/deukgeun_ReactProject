/**
 * 커뮤니티 페이지 기능 검증 헬퍼
 * 브라우저 콘솔에서 직접 사용할 수 있는 검증 함수들
 */

interface VerificationResult {
  test: string
  passed: boolean
  message: string
  details?: any
}

/**
 * 네트워크 요청 모니터링을 위한 저장소
 */
const requestLog: {
  url: string
  method: string
  timestamp: number
  headers?: Record<string, string>
  status?: number
}[] = []

/**
 * 네트워크 모니터링 활성화 여부
 */
let isMonitoringActive = false

/**
 * 네트워크 요청 추적 시작
 */
export function startNetworkMonitoring() {
  if (isMonitoringActive) {
    console.log('⚠️ 네트워크 모니터링이 이미 활성화되어 있습니다.')
    // 기존 성능 엔트리도 확인
    loadExistingPerformanceEntries()
    return
  }

  isMonitoringActive = true
  
  // 이미 발생한 요청도 로드 (PerformanceObserver는 미래 요청만 추적)
  loadExistingPerformanceEntries()
  
  // Performance Observer로 네트워크 요청 추적 (향후 요청)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const entryName = entry.name || (entry as any).url || ''
          if (entryName.includes('/api/')) {
            // 중복 체크
            const entryTime = entry.startTime || entry.fetchStart || Date.now()
            const alreadyLogged = requestLog.some(log => {
              const timeDiff = Math.abs(log.timestamp - entryTime)
              return log.url === entryName && timeDiff < 1000
            })
            
            if (!alreadyLogged) {
              requestLog.push({
                url: entryName,
                method: (entry as any).method || (entry as any).initiatorType === 'xmlhttprequest' ? 'GET' : 'GET',
                timestamp: entryTime,
              })
              console.log(`📡 [PerformanceObserver] API 요청 캡처: ${entryName}`)
            }
          }
        }
      })
      
      // resource 타입만 관찰 (navigation은 페이지 로드 관련)
      try {
        // buffered 플래그는 entryTypes와 함께 사용할 수 없음
        observer.observe({ entryTypes: ['resource'] })
      } catch {
        // 일부 브라우저에서 entryTypes 배열 지원 안 함
        try {
          observer.observe({ type: 'resource', buffered: true })
        } catch {
          // 모든 방법 실패 시 기본 설정
          console.warn('⚠️ PerformanceObserver 설정 실패')
        }
      }
      
      console.log('✅ 네트워크 모니터링 시작됨 (PerformanceObserver)')
    } catch (error) {
      console.warn('⚠️ Performance Observer 사용 불가:', error)
    }
  } else {
    console.warn('⚠️ PerformanceObserver를 지원하지 않는 브라우저입니다.')
  }
}

/**
 * 이미 발생한 성능 엔트리 로드 (모니터링 시작 전 요청 캡처)
 */
function loadExistingPerformanceEntries() {
  if (typeof window === 'undefined' || !window.performance) {
    return
  }
  
  try {
    const entries = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    let loadedCount = 0
    const apiEntries: string[] = []
    
    for (const entry of entries) {
      const entryName = entry.name || ''
      if (entryName.includes('/api/')) {
        apiEntries.push(entryName)
        
        // 중복 체크 (URL과 시간 기준)
        const entryTime = entry.startTime || entry.fetchStart || Date.now()
        const alreadyLogged = requestLog.some(log => {
          const timeDiff = Math.abs(log.timestamp - entryTime)
          return log.url === entryName && timeDiff < 2000 // 2초 내 중복 체크
        })
        
        if (!alreadyLogged) {
          // HTTP 메서드 추정 (성능 엔트리에서는 직접 알 수 없으므로 URL 패턴으로 추정)
          let method = 'GET'
          if (entryName.includes('POST')) method = 'POST'
          else if (entryName.includes('PUT')) method = 'PUT'
          else if (entryName.includes('DELETE')) method = 'DELETE'
          
          requestLog.push({
            url: entryName,
            method: (entry as any).initiatorType === 'xmlhttprequest' ? method : method,
            timestamp: entryTime,
          })
          loadedCount++
          console.log(`📦 [PerformanceEntries] API 요청 발견: ${method} ${entryName}`)
        }
      }
    }
    
    if (loadedCount > 0) {
      console.log(`📦 기존 성능 엔트리 ${loadedCount}개 로드됨 (총 ${requestLog.length}개 요청)`)
      // /api/posts 관련 엔트리 확인
      const postsEntries = apiEntries.filter(e => e.includes('/api/posts') && !e.includes('/api/posts/'))
      if (postsEntries.length > 0) {
        console.log(`📦 /api/posts 관련 엔트리 발견:`, postsEntries)
      }
    } else if (entries.length > 0) {
      console.log(`📦 성능 엔트리 ${entries.length}개 확인됨`)
      if (apiEntries.length > 0) {
        console.log(`📦 API 엔트리 ${apiEntries.length}개 발견됨 (중복 제외):`, apiEntries)
      } else {
        console.log(`📦 API 요청이 성능 엔트리에 없습니다. (페이지 새로고침 필요)`)
      }
    } else {
      console.log(`📦 성능 엔트리가 없습니다. (페이지 새로고침 필요)`)
    }
  } catch (error) {
    console.warn('⚠️ 기존 성능 엔트리 로드 실패:', error)
  }
}

/**
 * 네트워크 요청 수동 추가 (Axios 인터셉터에서 호출 가능)
 */
export function addRequestToLog(url: string, method: string = 'GET', headers?: Record<string, string>) {
  if (!isMonitoringActive) return
  
  // 중복 체크 (같은 URL과 메서드 기준)
  const now = Date.now()
  const methodUpper = method.toUpperCase()
  const alreadyLogged = requestLog.some(log => {
    const timeDiff = Math.abs(log.timestamp - now)
    return log.url === url && (log.method || 'GET').toUpperCase() === methodUpper && timeDiff < 500 // 0.5초 내 중복 체크
  })
  
  if (!alreadyLogged) {
    requestLog.push({
      url,
      method: methodUpper,
      timestamp: now,
      headers,
    })
    console.log(`📡 [Verification] 요청 로깅: ${methodUpper} ${url}`)
  }
}

/**
 * 요청 로그 초기화
 */
export function clearRequestLog() {
  requestLog.length = 0
  console.log('✅ 요청 로그 초기화됨')
}

/**
 * 네트워크 요청 로그 가져오기
 */
export function getRequestLog(): typeof requestLog {
  return requestLog
}

/**
 * GET /api/posts 호출 횟수 확인
 */
export function verifyPostsRequestCount(): VerificationResult {
  // GET 요청만 필터링 (POST, PUT, DELETE 제외)
  // /api/posts로 시작하지만 /api/posts/123 같은 특정 ID가 없는 경우
  const postsRequests = requestLog.filter((req) => {
    const url = req.url || ''
    const method = (req.method || 'GET').toUpperCase()
    
    // GET 요청인지 확인
    if (method !== 'GET') {
      return false
    }
    
    // /api/posts 포함 여부 확인
    if (!url.includes('/api/posts')) {
      return false
    }
    
    // /api/posts로 끝나는지 또는 쿼리 파라미터가 있는지 확인
    // 예: /api/posts, /api/posts?page=1, /api/posts?category=all
    // 하지만 /api/posts/123 같은 특정 ID는 제외
    const urlWithoutQuery = url.split('?')[0]
    const urlPath = urlWithoutQuery.split('#')[0]
    
    // 정확히 /api/posts이거나 /api/posts? 로 시작
    return urlPath === '/api/posts' || 
           urlPath.endsWith('/api/posts') ||
           (urlPath.includes('/api/posts') && 
            !urlPath.match(/\/api\/posts\/\d+/) && // /api/posts/123 제외
            !urlPath.match(/\/api\/posts\/[^?]+$/)) // /api/posts/category 같은 패턴 제외 (필요시 수정)
  })
  
  const count = postsRequests.length
  
  // 요청이 없는 경우는 아직 로드되지 않았거나 모니터링이 시작되지 않음
  if (count === 0) {
    // 모니터링이 시작되지 않았으면 기존 성능 엔트리 로드 시도
    if (!isMonitoringActive) {
      loadExistingPerformanceEntries()
      // 다시 확인
      const retryRequests = requestLog.filter((req) => {
        const url = req.url || ''
        const method = (req.method || 'GET').toUpperCase()
        if (method !== 'GET') return false
        if (!url.includes('/api/posts')) return false
        const urlWithoutQuery = url.split('?')[0]
        const urlPath = urlWithoutQuery.split('#')[0]
        return urlPath === '/api/posts' || 
               urlPath.endsWith('/api/posts') ||
               (urlPath.includes('/api/posts') && 
                !urlPath.match(/\/api\/posts\/\d+/) && 
                !urlPath.match(/\/api\/posts\/[^?]+$/))
      })
      
      if (retryRequests.length > 0) {
        const retryCount = retryRequests.length
        return {
          test: 'GET /api/posts 호출 횟수',
          passed: retryCount === 1,
          message: retryCount === 1
            ? `✅ GET /api/posts가 1회만 호출됨 (기존 엔트리에서 발견)`
            : `❌ GET /api/posts가 ${retryCount}회 호출됨 (기존 엔트리에서 발견, 예상: 1회)`,
          details: {
            count: retryCount,
            requests: retryRequests.map(r => ({
              url: r.url,
              method: r.method,
              timestamp: new Date(r.timestamp).toISOString(),
            })),
            isMonitoringActive: false,
            source: 'existing performance entries',
          },
        }
      }
      
      return {
        test: 'GET /api/posts 호출 횟수',
        passed: false,
        message: '⚠️ GET /api/posts가 호출되지 않았습니다. (페이지를 로드하거나 새로고침한 후 다시 시도하세요)',
        details: { 
          count: 0, 
          isMonitoringActive: false,
          suggestion: '페이지를 새로고침(F5)하거나 verification.start()를 먼저 실행하세요.'
        },
      }
    }
    
    // 모니터링은 시작되었지만 요청이 없는 경우
    return {
      test: 'GET /api/posts 호출 횟수',
      passed: false,
      message: '⚠️ GET /api/posts가 호출되지 않았습니다. (페이지를 로드하거나 새로고침하세요)',
      details: { 
        count: 0, 
        isMonitoringActive: true,
        suggestion: '페이지를 새로고침(F5)하면 기존 요청을 캡처할 수 있습니다.'
      },
    }
  }

  const passed = count === 1

  return {
    test: 'GET /api/posts 호출 횟수',
    passed,
    message: passed
      ? `✅ GET /api/posts가 1회만 호출됨`
      : count === 0
      ? `⚠️ GET /api/posts가 호출되지 않았습니다. (페이지를 로드하거나 새로고침하세요)`
      : `❌ GET /api/posts가 ${count}회 호출됨 (예상: 1회)`,
    details: {
      count,
      requests: postsRequests.map(r => ({
        url: r.url,
        method: r.method,
        timestamp: new Date(r.timestamp).toISOString(),
      })),
      isMonitoringActive,
    },
  }
}

/**
 * GET /api/comments/:postId 호출 횟수 확인
 */
export function verifyCommentsRequestCount(postId?: number): VerificationResult {
  const allCommentsRequests = requestLog.filter((req) =>
    req.url.match(/\/api\/comments\/\d+/)
  )

  let commentsRequests = allCommentsRequests
  if (postId) {
    commentsRequests = allCommentsRequests.filter((req) =>
      req.url.includes(`/api/comments/${postId}`)
    )
  }

  // 같은 postId에 대해 여러 번 호출되는지 확인
  const postIdCounts = commentsRequests.reduce((acc, req) => {
    const match = req.url.match(/\/api\/comments\/(\d+)/)
    if (match) {
      const id = parseInt(match[1])
      acc[id] = (acc[id] || 0) + 1
    }
    return acc
  }, {} as Record<number, number>)

  const duplicates = Object.entries(postIdCounts).filter(([_, count]) => count > 1)
  const passed = duplicates.length === 0

  return {
    test: 'GET /api/comments/:postId 호출 횟수',
    passed,
    message: passed
      ? `✅ 각 postId당 GET /api/comments/:postId가 1회만 호출됨`
      : `❌ 중복 호출 발견: ${duplicates.map(([id, count]) => `postId ${id}: ${count}회`).join(', ')}`,
    details: {
      totalRequests: commentsRequests.length,
      postIdCounts,
      duplicates,
      requests: commentsRequests,
    },
  }
}

/**
 * Authorization 헤더 형식 확인
 * getCurrentToken()을 사용하여 실제 사용되는 토큰 확인
 */
export async function verifyAuthorizationHeader(): Promise<VerificationResult> {
  try {
    // getCurrentToken()을 동적 import로 로드 (브라우저 환경 대응)
    let getCurrentToken: (() => string | null) | null = null
    
    try {
      // 동적 import 시도 (ES 모듈)
      const tokenUtilsModule = await import('./tokenUtils')
      getCurrentToken = tokenUtilsModule.getCurrentToken
    } catch {
      // import 실패 시 직접 함수 접근 시도
      try {
        // window 객체에 함수가 노출되어 있는지 확인
        if (typeof window !== 'undefined' && (window as any).getCurrentToken) {
          getCurrentToken = (window as any).getCurrentToken
        }
      } catch {
        // 모든 방법 실패
      }
    }
    
    let token: string | null = null
    
    if (getCurrentToken && typeof getCurrentToken === 'function') {
      token = getCurrentToken()
    } else {
      // 직접 localStorage 접근 (fallback)
      token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    }
    
    if (!token) {
      return {
        test: 'Authorization 헤더 형식',
        passed: false,
        message: '⚠️ 토큰이 없어 검증 불가 (로그인이 필요할 수 있습니다)',
        details: { token: null, source: 'getCurrentToken()' },
      }
    }

    // 토큰에서 따옴표 제거 (이미 getCurrentToken에서 처리되지만 이중 확인)
    const sanitized = String(token).trim().replace(/^"(.*)"$/, '$1')
    const hasQuotes = token !== sanitized || token.includes('"')
    const isBearerFormat = sanitized.startsWith('eyJ') // JWT 형식 확인
    
    // Bearer 형식 확인
    const bearerHeader = `Bearer ${sanitized}`
    const hasValidBearerFormat = bearerHeader.startsWith('Bearer eyJ') && !bearerHeader.includes('"Bearer')

    const passed = !hasQuotes && isBearerFormat && hasValidBearerFormat

    return {
      test: 'Authorization 헤더 형식',
      passed,
      message: passed
        ? `✅ 토큰 형식 정상: Bearer ${sanitized.substring(0, 20)}... (따옴표 없음)`
        : `❌ 토큰 형식 문제: ${hasQuotes ? '따옴표 포함 ' : ''}${!isBearerFormat ? 'JWT 형식 아님 ' : ''}${!hasValidBearerFormat ? 'Bearer 형식 아님' : ''}`,
      details: {
        originalToken: token.substring(0, 30) + '...',
        sanitizedToken: sanitized.substring(0, 30) + '...',
        bearerHeader: bearerHeader.substring(0, 35) + '...',
        hasQuotes,
        isBearerFormat,
        hasValidBearerFormat,
        tokenLength: sanitized.length,
        source: 'getCurrentToken()',
      },
    }
  } catch (error) {
    // fallback to localStorage 직접 접근
    const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token')
    
    if (!rawToken) {
      return {
        test: 'Authorization 헤더 형식',
        passed: false,
        message: '⚠️ 토큰이 없어 검증 불가 (로그인 필요할 수 있음)',
        details: { token: null, error: error instanceof Error ? error.message : String(error) },
      }
    }

    // 따옴표 제거 및 정제
    const sanitized = String(rawToken).trim().replace(/^"(.*)"$/, '$1').replace(/^'|'$/g, '')
    const hasQuotes = rawToken !== sanitized || rawToken.includes('"') || rawToken.includes("'")
    const isBearerFormat = sanitized.startsWith('eyJ')
    
    // 따옴표가 있으면 localStorage에서 즉시 제거
    if (hasQuotes && sanitized !== rawToken) {
      try {
        localStorage.setItem('accessToken', sanitized)
        console.log('✅ localStorage 토큰에서 따옴표 제거됨')
      } catch {
        // 저장 실패 - 무시
      }
    }

    const passed = !hasQuotes && isBearerFormat

    return {
      test: 'Authorization 헤더 형식',
      passed,
      message: passed
        ? `✅ 토큰 형식 정상 (localStorage): Bearer ${sanitized.substring(0, 20)}... (따옴표 제거됨)`
        : `❌ 토큰 형식 문제: ${hasQuotes ? '따옴표 포함 (제거 시도됨)' : ''} ${!isBearerFormat ? 'JWT 형식 아님' : ''}`,
      details: {
        source: 'localStorage (fallback)',
        originalLength: rawToken.length,
        sanitizedLength: sanitized.length,
        hasQuotes,
        isBearerFormat,
        tokenFixed: hasQuotes && sanitized !== rawToken,
        error: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

/**
 * 토큰 소스 확인 (Redux > memory > localStorage)
 * getCurrentToken()이 사용하는 우선순위와 동일하게 확인
 */
export async function verifyTokenSource(): Promise<VerificationResult> {
  const checkedSources: Array<{ name: string; hasToken: boolean; token?: string; error?: string }> = []
  
  try {
    // getCurrentToken()을 동적 import로 로드
    let getCurrentToken: (() => string | null) | null = null
    
    try {
      const tokenUtilsModule = await import('./tokenUtils')
      getCurrentToken = tokenUtilsModule.getCurrentToken
    } catch (importError) {
      checkedSources.push({ name: 'getCurrentToken import', hasToken: false, error: importError instanceof Error ? importError.message : String(importError) })
    }
    
    let token: string | null = null
    
    if (getCurrentToken && typeof getCurrentToken === 'function') {
      try {
        token = getCurrentToken()
      } catch (callError) {
        checkedSources.push({ name: 'getCurrentToken 호출', hasToken: false, error: callError instanceof Error ? callError.message : String(callError) })
      }
    }
    
    if (token) {
      // getCurrentToken의 내부 로직과 동일하게 각 소스 확인
      // 1. Redux 확인
      try {
        const storeModule = await import('@frontend/shared/store')
        const store = storeModule.store
        if (store && typeof store.getState === 'function') {
          const state = store.getState()
          const reduxToken = state?.auth?.accessToken || state?.auth?.user?.accessToken
          checkedSources.push({ 
            name: 'Redux', 
            hasToken: !!reduxToken, 
            token: reduxToken ? String(reduxToken).substring(0, 20) + '...' : undefined 
          })
          if (reduxToken && token) {
            return {
              test: '토큰 소스 확인',
              passed: true,
              message: '✅ Redux에서 토큰을 읽음 (우선순위 1)',
              details: {
                source: 'Redux',
                sources: ['Redux'],
                tokenPreview: token.substring(0, 20) + '...',
                checkedSources,
              },
            }
          }
        }
      } catch (reduxError) {
        checkedSources.push({ 
          name: 'Redux', 
          hasToken: false, 
          error: reduxError instanceof Error ? reduxError.message : String(reduxError) 
        })
      }

      // 2. Memory 확인
      try {
        const tokenManagerModule = await import('./tokenManager')
        const tokenManager = tokenManagerModule.tokenManager
        if (tokenManager && typeof tokenManager.getAccessToken === 'function') {
          const memoryToken = tokenManager.getAccessToken()
          checkedSources.push({ 
            name: 'Memory', 
            hasToken: !!memoryToken, 
            token: memoryToken ? String(memoryToken).substring(0, 20) + '...' : undefined 
          })
          if (memoryToken && token) {
            return {
              test: '토큰 소스 확인',
              passed: true,
              message: '✅ Memory에서 토큰을 읽음 (우선순위 2)',
              details: {
                source: 'Memory',
                sources: ['Memory'],
                tokenPreview: token.substring(0, 20) + '...',
                checkedSources,
              },
            }
          }
        }
      } catch (memoryError) {
        checkedSources.push({ 
          name: 'Memory', 
          hasToken: false, 
          error: memoryError instanceof Error ? memoryError.message : String(memoryError) 
        })
      }

      // 3. localStorage 확인
      const localToken = localStorage.getItem('accessToken') || localStorage.getItem('token')
      checkedSources.push({ 
        name: 'localStorage', 
        hasToken: !!localToken, 
        token: localToken ? String(localToken).trim().replace(/^"(.*)"$/, '$1').substring(0, 20) + '...' : undefined 
      })
      if (localToken && token) {
        return {
          test: '토큰 소스 확인',
          passed: true,
          message: '✅ localStorage에서 토큰을 읽음 (우선순위 3)',
          details: {
            source: 'localStorage',
            sources: ['localStorage'],
            tokenPreview: token.substring(0, 20) + '...',
            checkedSources,
          },
        }
      }

      // getCurrentToken이 토큰을 반환했지만 소스를 확인할 수 없는 경우
      if (token) {
        return {
          test: '토큰 소스 확인',
          passed: true,
          message: '✅ getCurrentToken()에서 토큰을 읽음 (소스 미확인)',
          details: {
            source: 'getCurrentToken()',
            tokenPreview: token.substring(0, 20) + '...',
            checkedSources,
          },
        }
      }
    } else {
      // getCurrentToken 로드 실패 시 직접 확인
      checkedSources.push({ name: 'getCurrentToken', hasToken: false, error: '함수를 로드할 수 없음' })
    }
  } catch (error) {
    checkedSources.push({ 
      name: 'getCurrentToken', 
      hasToken: false, 
      error: error instanceof Error ? error.message : String(error) 
    })
  }

  // 모든 소스 직접 확인 (fallback)
  try {
    const storeModule = await import('@frontend/shared/store').catch(() => null)
    if (storeModule?.store) {
      const state = storeModule.store.getState()
      checkedSources.push({ 
        name: 'Redux (직접)', 
        hasToken: !!(state?.auth?.accessToken || state?.auth?.user?.accessToken) 
      })
    } else {
      checkedSources.push({ name: 'Redux (직접)', hasToken: false, error: 'store 모듈 로드 실패' })
    }
  } catch (reduxError) {
    checkedSources.push({ 
      name: 'Redux (직접)', 
      hasToken: false, 
      error: reduxError instanceof Error ? reduxError.message : String(reduxError) 
    })
  }

  try {
    const tokenManagerModule = await import('./tokenManager').catch(() => null)
    if (tokenManagerModule?.tokenManager) {
      checkedSources.push({ 
        name: 'Memory (직접)', 
        hasToken: !!tokenManagerModule.tokenManager.getAccessToken() 
      })
    } else {
      checkedSources.push({ name: 'Memory (직접)', hasToken: false, error: 'tokenManager 모듈 로드 실패' })
    }
  } catch (memoryError) {
    checkedSources.push({ 
      name: 'Memory (직접)', 
      hasToken: false, 
      error: memoryError instanceof Error ? memoryError.message : String(memoryError) 
    })
  }

  const localToken = localStorage.getItem('accessToken') || localStorage.getItem('token')
  checkedSources.push({ 
    name: 'localStorage (직접)', 
    hasToken: !!localToken,
    token: localToken ? String(localToken).trim().replace(/^"(.*)"$/, '$1').substring(0, 20) + '...' : undefined
  })

  return {
    test: '토큰 소스 확인',
    passed: false,
    message: '❌ 사용 가능한 토큰 없음',
    details: {
      sources: [],
      checkedSources,
    },
  }
}

/**
 * 모든 검증 테스트 실행
 */
export async function runAllVerificationTests(): Promise<VerificationResult[]> {
  console.log('🧪 커뮤니티 페이지 기능 검증 테스트 시작...\n')

  // 모니터링이 시작되지 않았으면 자동으로 시작
  if (!isMonitoringActive) {
    console.log('⚠️ 모니터링이 시작되지 않았습니다. 자동으로 시작합니다...')
    startNetworkMonitoring()
    // 기존 성능 엔트리 로드를 위해 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const results: VerificationResult[] = []

  // 1. 기본 동작 확인
  results.push(verifyPostsRequestCount())
  results.push(verifyCommentsRequestCount())

  // 2. Authorization 헤더 확인 (비동기)
  try {
    const authHeaderResult = await verifyAuthorizationHeader()
    results.push(authHeaderResult)
  } catch (error) {
    results.push({
      test: 'Authorization 헤더 형식',
      passed: false,
      message: `❌ Authorization 헤더 확인 실패: ${error instanceof Error ? error.message : String(error)}`,
      details: { error: error instanceof Error ? error.message : String(error) },
    })
  }

  // 3. 토큰 소스 확인 (비동기)
  try {
    const tokenSourceResult = await verifyTokenSource()
    results.push(tokenSourceResult)
  } catch (error) {
    results.push({
      test: '토큰 소스 확인',
      passed: false,
      message: `❌ 토큰 소스 확인 실패: ${error instanceof Error ? error.message : String(error)}`,
      details: { error: error instanceof Error ? error.message : String(error) },
    })
  }

  // 결과 요약
  console.log('\n📊 검증 결과 요약:')
  console.log('='.repeat(50))
  results.forEach((result) => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.test}`)
    console.log(`   ${result.message}`)
    if (result.details) {
      console.log(`   상세:`, result.details)
    }
    console.log('')
  })

  const passedCount = results.filter((r) => r.passed).length
  const totalCount = results.length
  console.log(`\n총 ${totalCount}개 테스트 중 ${passedCount}개 통과`)

  return results
}

/**
 * 브라우저 콘솔에서 사용하기 위한 전역 객체
 */
if (typeof window !== 'undefined') {
  ;(window as any).verification = {
    start: startNetworkMonitoring,
    getLog: getRequestLog,
    clearLog: clearRequestLog,
    addRequest: addRequestToLog,
    testPosts: verifyPostsRequestCount,
    testComments: verifyCommentsRequestCount,
    testAuthHeader: async () => await verifyAuthorizationHeader(),
    testTokenSource: async () => await verifyTokenSource(),
    runAll: async () => await runAllVerificationTests(),
  }

  console.log(
    '%c🔍 커뮤니티 페이지 검증 도구가 로드되었습니다.',
    'color: green; font-weight: bold;'
  )
  console.log('사용법:')
  console.log('  verification.start() - 네트워크 모니터링 시작')
  console.log('  verification.runAll() - 모든 테스트 실행 (비동기)')
  console.log('  verification.testPosts() - GET /api/posts 요청 횟수 확인')
  console.log('  verification.testComments() - 댓글 요청 횟수 확인')
  console.log('  verification.testAuthHeader() - Authorization 헤더 확인 (비동기)')
  console.log('  verification.testTokenSource() - 토큰 소스 확인 (비동기)')
  console.log('  verification.getLog() - 요청 로그 확인')
  console.log('  verification.clearLog() - 요청 로그 초기화')
  console.log('')
  console.log('💡 팁: verification.start() 실행 후 페이지를 새로고침하면 기존 요청도 캡처됩니다.')
}

