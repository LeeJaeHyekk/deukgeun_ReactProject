// ============================================================================
// 서버 상태 확인 유틸리티
// ============================================================================

import { createConnection, Socket } from 'net'

export interface ServerStatus {
  isRunning: boolean
  port: number
  pid?: number
  url: string
}

/**
 * 특정 포트에서 서버가 실행 중인지 확인
 */
export async function checkServerStatus(port: number): Promise<ServerStatus> {
  return new Promise(resolve => {
    const socket = new Socket()
    const timeout = 1000 // 1초 타임아웃

    socket.setTimeout(timeout)

    socket.on('connect', () => {
      socket.destroy()
      resolve({
        isRunning: true,
        port,
        url: `http://localhost:${port}`,
      })
    })

    socket.on('timeout', () => {
      socket.destroy()
      resolve({
        isRunning: false,
        port,
        url: `http://localhost:${port}`,
      })
    })

    socket.on('error', () => {
      socket.destroy()
      resolve({
        isRunning: false,
        port,
        url: `http://localhost:${port}`,
      })
    })

    socket.connect(port, 'localhost')
  })
}

/**
 * 여러 포트 중에서 사용 가능한 포트 찾기
 */
export async function findAvailablePort(
  startPort: number = 5000,
  maxPort: number = 5010
): Promise<number> {
  for (let port = startPort; port <= maxPort; port++) {
    const status = await checkServerStatus(port)
    if (!status.isRunning) {
      return port
    }
  }
  throw new Error(
    `No available ports found between ${startPort} and ${maxPort}`
  )
}

/**
 * 백엔드 서버가 실행 중인지 확인하고 포트 반환
 */
export async function getBackendServerInfo(): Promise<ServerStatus | null> {
  const commonPorts = [5000, 5001, 5002, 5003]

  for (const port of commonPorts) {
    const status = await checkServerStatus(port)
    if (status.isRunning) {
      // 실제로 백엔드 API 엔드포인트가 응답하는지 확인
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000)

        const response = await fetch(`${status.url}/health`, {
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        if (response.ok) {
          return status
        }
      } catch (error) {
        // API 엔드포인트가 응답하지 않으면 다른 포트 확인
        continue
      }
    }
  }

  return null
}

/**
 * 백엔드 서버 시작 전 상태 확인
 */
export async function checkBeforeStart(): Promise<{
  shouldStart: boolean
  existingPort?: number
  recommendedPort?: number
}> {
  const existingServer = await getBackendServerInfo()

  if (existingServer) {
    return {
      shouldStart: false,
      existingPort: existingServer.port,
    }
  }

  const availablePort = await findAvailablePort()
  return {
    shouldStart: true,
    recommendedPort: availablePort,
  }
}
