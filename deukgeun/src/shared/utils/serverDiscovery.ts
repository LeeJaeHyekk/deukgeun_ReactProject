// ============================================================================
// 백엔드 서버 자동 발견 유틸리티
// ============================================================================

export interface BackendServerInfo {
  url: string
  port: number
  isAvailable: boolean
  healthCheck: boolean
}

/**
 * 백엔드 서버 상태 확인
 */
async function checkServerHealth(url: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)

    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * 여러 포트에서 백엔드 서버 찾기
 */
export async function discoverBackendServer(): Promise<BackendServerInfo | null> {
  const commonPorts = [5000, 5001, 5002, 5003, 5004, 5005]

  console.log('🔍 Discovering backend server...')

  for (const port of commonPorts) {
    const url = `http://localhost:${port}`

    try {
      console.log(`🔍 Checking port ${port}...`)
      const isHealthy = await checkServerHealth(url)

      if (isHealthy) {
        console.log(`✅ Backend server found on port ${port}`)
        return {
          url,
          port,
          isAvailable: true,
          healthCheck: true,
        }
      }
    } catch (error) {
      console.log(`❌ Port ${port} not responding`)
      continue
    }
  }

  console.log('❌ No backend server found')
  return null
}

/**
 * 백엔드 서버 URL 동적 설정
 */
export async function getBackendUrl(): Promise<string> {
  // 환경 변수에서 설정된 URL이 있으면 우선 사용
  const envUrl = import.meta.env.VITE_BACKEND_URL
  if (envUrl) {
    console.log(`🔧 Using environment backend URL: ${envUrl}`)
    return envUrl
  }

  // 서버 자동 발견
  const serverInfo = await discoverBackendServer()
  if (serverInfo) {
    console.log(`🎯 Auto-discovered backend URL: ${serverInfo.url}`)
    return serverInfo.url
  }

  // 기본값 사용
  const defaultUrl = 'http://localhost:5000'
  console.log(`⚠️ Using default backend URL: ${defaultUrl}`)
  return defaultUrl
}

/**
 * 백엔드 서버 상태 모니터링
 */
export class BackendServerMonitor {
  private currentUrl: string | null = null
  private checkInterval: NodeJS.Timeout | null = null
  private onStatusChange?: (isOnline: boolean, url: string) => void

  constructor(onStatusChange?: (isOnline: boolean, url: string) => void) {
    this.onStatusChange = onStatusChange
  }

  async startMonitoring(intervalMs: number = 30000) {
    console.log('🔄 Starting backend server monitoring...')

    // 초기 상태 확인
    await this.checkStatus()

    // 주기적 상태 확인
    this.checkInterval = setInterval(async () => {
      await this.checkStatus()
    }, intervalMs)
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
      console.log('⏹️ Backend server monitoring stopped')
    }
  }

  private async checkStatus() {
    const serverInfo = await discoverBackendServer()
    const isOnline = serverInfo !== null
    const url = serverInfo?.url || 'unknown'

    if (this.currentUrl !== url) {
      this.currentUrl = url
      this.onStatusChange?.(isOnline, url)

      if (isOnline) {
        console.log(`✅ Backend server is online: ${url}`)
      } else {
        console.log('❌ Backend server is offline')
      }
    }
  }

  getCurrentUrl(): string | null {
    return this.currentUrl
  }
}
