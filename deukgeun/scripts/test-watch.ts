#!/usr/bin/env node

import { spawn, ChildProcess } from 'child_process'
import * as chokidar from 'chokidar'
import * as path from 'path'

class TestWatcher {
  private isRunning: boolean = false
  private testProcess: ChildProcess | null = null
  private watchedFiles: Set<string> = new Set()
  private debounceTimer: NodeJS.Timeout | null = null
  private debounceDelay: number = 1000 // 1초

  start(): void {
    console.log('🔍 테스트 감시 모드 시작...')
    console.log('파일 변경 시 자동으로 테스트가 실행됩니다.')
    console.log('종료하려면 Ctrl+C를 누르세요.\n')

    // 테스트 파일 감시
    const testPattern = path.join(
      process.cwd(),
      'src/frontend/**/*.test.{ts,tsx}'
    )
    const watcher = chokidar.watch(testPattern, {
      ignored: /node_modules/,
      persistent: true,
    })

    // 소스 파일 감시
    const sourcePattern = path.join(process.cwd(), 'src/frontend/**/*.{ts,tsx}')
    const sourceWatcher = chokidar.watch(sourcePattern, {
      ignored: /node_modules|\.test\./,
      persistent: true,
    })

    watcher.on('change', (filePath: string) => {
      this.handleFileChange(filePath, 'test')
    })

    watcher.on('add', (filePath: string) => {
      this.handleFileChange(filePath, 'test')
    })

    sourceWatcher.on('change', (filePath: string) => {
      this.handleFileChange(filePath, 'source')
    })

    // 초기 테스트 실행
    this.runTests()

    // 종료 처리
    process.on('SIGINT', () => {
      console.log('\n👋 테스트 감시 모드를 종료합니다...')
      this.cleanup()
      process.exit(0)
    })
  }

  private handleFileChange(filePath: string, type: 'test' | 'source'): void {
    const relativePath = path.relative(process.cwd(), filePath)

    if (type === 'test') {
      console.log(`🧪 테스트 파일 변경: ${relativePath}`)
    } else {
      console.log(`📝 소스 파일 변경: ${relativePath}`)
    }

    // 디바운스 처리
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      this.runTests()
    }, this.debounceDelay)
  }

  private runTests(): void {
    if (this.isRunning) {
      console.log('⏳ 이전 테스트가 실행 중입니다. 대기 중...')
      return
    }

    this.isRunning = true
    console.log('\n🚀 테스트 실행 중...')

    // 이전 프로세스 종료
    if (this.testProcess) {
      this.testProcess.kill()
    }

    // 새 테스트 프로세스 시작
    this.testProcess = spawn('npx', ['vitest', 'run', '--reporter=verbose'], {
      stdio: 'inherit',
      shell: true,
    })

    this.testProcess.on('close', (code: number | null) => {
      this.isRunning = false

      if (code === 0) {
        console.log('✅ 테스트 통과!')
      } else {
        console.log('❌ 테스트 실패!')
      }

      console.log('👀 파일 변경을 감시 중...\n')
    })

    this.testProcess.on('error', (error: Error) => {
      this.isRunning = false
      console.error('❌ 테스트 실행 오류:', error.message)
    })
  }

  private cleanup(): void {
    if (this.testProcess) {
      this.testProcess.kill()
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
  }
}

// CLI 인터페이스
function main(): void {
  const args = process.argv.slice(2)
  const command = args[0] || 'watch'

  if (command === 'watch') {
    const watcher = new TestWatcher()
    watcher.start()
  } else {
    console.log('사용법: node test-watch.js [watch]')
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export { TestWatcher }
