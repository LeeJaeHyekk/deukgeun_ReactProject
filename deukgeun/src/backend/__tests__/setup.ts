import { config } from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// ESM에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 환경 변수 로드
config({ path: path.join(__dirname, "../.env") })

// 전역 테스트 설정
beforeAll(async () => {
  // 테스트 환경 초기화
})

afterAll(async () => {
  // 테스트 환경 정리
})

// 각 테스트 전 실행
beforeEach(async () => {
  // 개별 테스트 초기화
})

// 각 테스트 후 실행
afterEach(async () => {
  // 개별 테스트 정리
})
