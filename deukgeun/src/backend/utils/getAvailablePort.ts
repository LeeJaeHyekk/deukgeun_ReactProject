// src/utils/getAvailablePort.ts
import net from "net"

export async function getAvailablePort(defaultPort: number): Promise<number> {
  return new Promise(resolve => {
    const server = net.createServer()

    server.once("error", () => {
      // 기본 포트가 이미 사용 중일 경우, 다음 포트로 시도
      resolve(defaultPort + 1)
    })

    server.once("listening", () => {
      server.close()
      resolve(defaultPort)
    })

    server.listen(defaultPort)
  })
}
