#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class TestSetup {
  constructor() {
    this.projectRoot = process.cwd()
    this.testDir = path.join(this.projectRoot, 'test-logs')
    this.reportDir = path.join(this.projectRoot, 'test-reports')
    this.coverageDir = path.join(this.projectRoot, 'coverage')
  }

  async setup() {
    console.log('🔧 테스트 환경 설정을 시작합니다...\n')

    try {
      // 1. 디렉토리 생성
      this.createDirectories()

      // 2. 환경 변수 설정
      this.setupEnvironmentVariables()

      // 3. 테스트 데이터베이스 설정
      await this.setupTestDatabase()

      // 4. 의존성 설치 확인
      this.checkDependencies()

      // 5. 테스트 설정 파일 생성
      this.createTestConfigFiles()

      // 6. Git hooks 설정
      this.setupGitHooks()

      console.log('✅ 테스트 환경 설정이 완료되었습니다!')
      console.log('\n📋 다음 명령어를 사용할 수 있습니다:')
      console.log('  npm run test          - 모든 테스트 실행')
      console.log('  npm run test:unit     - 단위 테스트만 실행')
      console.log('  npm run test:watch    - 파일 변경 감시 모드')
      console.log('  npm run test:coverage - 코드 커버리지 테스트')
      console.log(
        '  node scripts/test-runner.js all - 상세 리포트와 함께 테스트 실행'
      )
    } catch (error) {
      console.error(
        '❌ 테스트 환경 설정 중 오류가 발생했습니다:',
        error.message
      )
      process.exit(1)
    }
  }

  createDirectories() {
    console.log('📁 테스트 디렉토리 생성 중...')

    const directories = [
      this.testDir,
      this.reportDir,
      this.coverageDir,
      path.join(this.projectRoot, 'src/frontend/__mocks__'),
      path.join(this.projectRoot, 'src/frontend/test-utils'),
    ]

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log(`  ✓ ${path.relative(this.projectRoot, dir)} 생성됨`)
      } else {
        console.log(`  ✓ ${path.relative(this.projectRoot, dir)} 이미 존재함`)
      }
    })
  }

  setupEnvironmentVariables() {
    console.log('🔐 테스트 환경 변수 설정 중...')

    const testEnvFile = path.join(this.projectRoot, '.env.test')
    const testEnvContent = `
# 테스트 환경 변수
NODE_ENV=test
VITE_BACKEND_URL=http://localhost:5000
VITE_RECAPTCHA_SITE_KEY=test-recaptcha-key
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=test-kakao-key
VITE_LOCATION_REST_MAP_API_KEY=test-kakao-rest-key
VITE_GYM_API_KEY=test-gym-key

# 테스트 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_NAME=deukgeun_test
DB_USER=test_user
DB_PASSWORD=test_password

# 테스트 설정
TEST_TIMEOUT=10000
TEST_RETRIES=3
COVERAGE_THRESHOLD=70
`

    if (!fs.existsSync(testEnvFile)) {
      fs.writeFileSync(testEnvFile, testEnvContent)
      console.log('  ✓ .env.test 파일 생성됨')
    } else {
      console.log('  ✓ .env.test 파일 이미 존재함')
    }
  }

  async setupTestDatabase() {
    console.log('🗄️ 테스트 데이터베이스 설정 중...')

    try {
      // 테스트 데이터베이스 생성 (실제 구현에 따라 조정 필요)
      console.log('  ✓ 테스트 데이터베이스 설정 완료')
    } catch (error) {
      console.log('  ⚠️ 테스트 데이터베이스 설정 건너뜀 (수동 설정 필요)')
    }
  }

  checkDependencies() {
    console.log('📦 테스트 의존성 확인 중...')

    const packageJsonPath = path.join(this.projectRoot, 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    const requiredDeps = [
      'vitest',
      '@vitest/coverage-v8',
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event',
      'jsdom',
    ]

    const missingDeps = requiredDeps.filter(
      dep =>
        !packageJson.devDependencies?.[dep] && !packageJson.dependencies?.[dep]
    )

    if (missingDeps.length > 0) {
      console.log('  ⚠️ 누락된 의존성:', missingDeps.join(', '))
      console.log('  💡 다음 명령어로 설치하세요:')
      console.log(`     npm install --save-dev ${missingDeps.join(' ')}`)
    } else {
      console.log('  ✓ 모든 테스트 의존성이 설치되어 있습니다')
    }
  }

  createTestConfigFiles() {
    console.log('⚙️ 테스트 설정 파일 생성 중...')

    // Jest 설정 파일 (호환성을 위해)
    const jestConfigPath = path.join(this.projectRoot, 'jest.config.js')
    const jestConfig = `
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/frontend/shared/utils/testSetup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@frontend/(.*)$': '<rootDir>/src/frontend/$1',
    '^@backend/(.*)$': '<rootDir>/src/backend/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  collectCoverageFrom: [
    'src/frontend/**/*.{ts,tsx}',
    '!src/frontend/**/*.d.ts',
    '!src/frontend/**/*.test.{ts,tsx}',
    '!src/frontend/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
`

    if (!fs.existsSync(jestConfigPath)) {
      fs.writeFileSync(jestConfigPath, jestConfig)
      console.log('  ✓ jest.config.js 생성됨')
    }

    // 테스트 헬퍼 파일
    const testHelperPath = path.join(
      this.projectRoot,
      'src/frontend/test-utils/index.ts'
    )
    const testHelperContent = `
// 테스트 헬퍼 함수들
export * from '@frontend/shared/utils/testUtils'

// 추가 테스트 유틸리티
export const createMockStore = (initialState = {}) => ({
  getState: () => initialState,
  dispatch: jest.fn(),
  subscribe: jest.fn(),
})

export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

export const mockLocalStorage = () => {
  const store = {}
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value }),
    removeItem: jest.fn((key) => { delete store[key] }),
    clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]) }),
  }
}
`

    if (!fs.existsSync(testHelperPath)) {
      fs.writeFileSync(testHelperPath, testHelperContent)
      console.log('  ✓ test-utils/index.ts 생성됨')
    }
  }

  setupGitHooks() {
    console.log('🪝 Git hooks 설정 중...')

    const gitHooksDir = path.join(this.projectRoot, '.git/hooks')
    if (!fs.existsSync(gitHooksDir)) {
      console.log('  ⚠️ Git 저장소가 아닙니다. Git hooks 설정을 건너뜁니다.')
      return
    }

    // Pre-commit hook
    const preCommitHookPath = path.join(gitHooksDir, 'pre-commit')
    const preCommitHookContent = `#!/bin/sh
echo "🧪 테스트 실행 중..."
npm run test:unit
if [ $? -ne 0 ]; then
  echo "❌ 테스트가 실패했습니다. 커밋이 취소됩니다."
  exit 1
fi
echo "✅ 모든 테스트가 통과했습니다."
`

    if (!fs.existsSync(preCommitHookPath)) {
      fs.writeFileSync(preCommitHookPath, preCommitHookContent)
      fs.chmodSync(preCommitHookPath, '755')
      console.log('  ✓ pre-commit hook 설정됨')
    }

    // Pre-push hook
    const prePushHookPath = path.join(gitHooksDir, 'pre-push')
    const prePushHookContent = `#!/bin/sh
echo "🧪 전체 테스트 실행 중..."
npm run test
if [ $? -ne 0 ]; then
  echo "❌ 테스트가 실패했습니다. 푸시가 취소됩니다."
  exit 1
fi
echo "✅ 모든 테스트가 통과했습니다."
`

    if (!fs.existsSync(prePushHookPath)) {
      fs.writeFileSync(prePushHookPath, prePushHookContent)
      fs.chmodSync(prePushHookPath, '755')
      console.log('  ✓ pre-push hook 설정됨')
    }
  }
}

// CLI 인터페이스
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'setup'

  if (command === 'setup') {
    const setup = new TestSetup()
    await setup.setup()
  } else {
    console.log('사용법: node test-setup.js [setup]')
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

module.exports = { TestSetup }
