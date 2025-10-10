#!/usr/bin/env ts-node

/**
 * 로컬 빌드 및 실행 스크립트
 * 로컬 환경에서 전체 프로젝트를 빌드하고 실행합니다.
 */

import { execSync, spawn } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

interface BuildOptions {
  skipBackend?: boolean
  skipFrontend?: boolean
  skipDatabase?: boolean
  production?: boolean
  watch?: boolean
}

class LocalBuildManager {
  private isWindows = process.platform === 'win32'
  private isProduction = false

  constructor() {
    console.log('🏗️  로컬 빌드 매니저를 초기화합니다...\n')
  }

  /**
   * 환경 변수 파일 존재 여부 확인
   */
  private checkEnvironmentFiles(): boolean {
    const requiredFiles = [
      '.env',
      'src/backend/.env'
    ]

    const missingFiles = requiredFiles.filter(file => !existsSync(file))
    
    if (missingFiles.length > 0) {
      console.log('❌ 다음 환경 변수 파일들이 없습니다:')
      missingFiles.forEach(file => console.log(`   - ${file}`))
      console.log('\n💡 다음 명령어로 환경을 설정하세요:')
      console.log('   npm run setup:local')
      return false
    }

    return true
  }

  /**
   * 의존성 설치 확인 및 설치
   */
  private async installDependencies(): Promise<void> {
    console.log('📦 의존성을 확인하고 설치합니다...')

    try {
      // 루트 의존성 설치
      console.log('   - 루트 의존성 설치 중...')
      execSync('npm install', { stdio: 'inherit' })

      // 백엔드 의존성 설치
      console.log('   - 백엔드 의존성 설치 중...')
      execSync('npm install', { 
        cwd: 'src/backend', 
        stdio: 'inherit' 
      })

      console.log('✅ 모든 의존성이 설치되었습니다.\n')
    } catch (error) {
      console.error('❌ 의존성 설치 중 오류가 발생했습니다:', error)
      throw error
    }
  }

  /**
   * JS to CJS 변환 (프로덕션과 동일한 방식)
   */
  private async convertJsToCjs(): Promise<void> {
    console.log('🔄 JS를 CJS로 변환합니다...')

    try {
      // convert:guard 스크립트 실행 (프로덕션과 동일)
      console.log('   - convert:guard 실행 중...')
      execSync('npm run convert:guard', { stdio: 'inherit' })

      console.log('✅ JS to CJS 변환이 완료되었습니다.\n')
    } catch (error) {
      console.error('❌ JS to CJS 변환 중 오류가 발생했습니다:', error)
      throw error
    }
  }

  /**
   * TypeScript 컴파일
   */
  private async compileTypeScript(): Promise<void> {
    console.log('🔨 TypeScript를 컴파일합니다...')

    try {
      // 루트 TypeScript 컴파일
      console.log('   - 루트 TypeScript 컴파일 중...')
      execSync('npx tsc --noEmit', { stdio: 'inherit' })

      // 백엔드 TypeScript 컴파일
      console.log('   - 백엔드 TypeScript 컴파일 중...')
      execSync('npx tsc', { 
        cwd: 'src/backend', 
        stdio: 'inherit' 
      })

      console.log('✅ TypeScript 컴파일이 완료되었습니다.\n')
    } catch (error) {
      console.error('❌ TypeScript 컴파일 중 오류가 발생했습니다:', error)
      throw error
    }
  }

  /**
   * 프론트엔드 빌드
   */
  private async buildFrontend(): Promise<void> {
    console.log('🎨 프론트엔드를 빌드합니다...')

    try {
      const buildCommand = this.isProduction ? 'npm run build' : 'npm run build'
      execSync(buildCommand, { stdio: 'inherit' })
      console.log('✅ 프론트엔드 빌드가 완료되었습니다.\n')
    } catch (error) {
      console.error('❌ 프론트엔드 빌드 중 오류가 발생했습니다:', error)
      throw error
    }
  }

  /**
   * 데이터베이스 설정
   */
  private async setupDatabase(): Promise<void> {
    console.log('🗄️  데이터베이스 설정을 확인합니다...')

    try {
      // 데이터베이스 동기화
      console.log('   - 데이터베이스 동기화 중...')
      execSync('npm run db:sync', { 
        cwd: 'src/backend', 
        stdio: 'inherit' 
      })

      // 초기 데이터 시드
      console.log('   - 초기 데이터 시드 중...')
      execSync('npm run db:seed', { 
        cwd: 'src/backend', 
        stdio: 'inherit' 
      })

      console.log('✅ 데이터베이스 설정이 완료되었습니다.\n')
    } catch (error) {
      console.error('❌ 데이터베이스 설정 중 오류가 발생했습니다:', error)
      console.log('💡 MySQL이 실행 중인지 확인하고, 데이터베이스가 존재하는지 확인하세요.')
      throw error
    }
  }

  /**
   * 개발 서버 시작
   */
  private async startDevelopmentServers(): Promise<void> {
    console.log('🚀 개발 서버를 시작합니다...\n')

    try {
      if (this.isWindows) {
        // Windows에서는 concurrently 사용
        const concurrently = spawn('npx', ['concurrently', 'npm run dev:backend', 'wait-on http://localhost:5000 && npm run dev'], {
          stdio: 'inherit',
          shell: true
        })

        concurrently.on('error', (error) => {
          console.error('❌ 개발 서버 시작 중 오류:', error)
        })

        // 프로세스 종료 처리
        process.on('SIGINT', () => {
          console.log('\n🛑 개발 서버를 종료합니다...')
          concurrently.kill('SIGINT')
          process.exit(0)
        })

      } else {
        // Unix 계열에서는 직접 실행
        const backendProcess = spawn('npm', ['run', 'dev'], {
          cwd: 'src/backend',
          stdio: 'inherit'
        })

        // 백엔드가 시작될 때까지 대기
        await new Promise(resolve => setTimeout(resolve, 3000))

        const frontendProcess = spawn('npm', ['run', 'dev'], {
          stdio: 'inherit'
        })

        // 프로세스 종료 처리
        process.on('SIGINT', () => {
          console.log('\n🛑 개발 서버를 종료합니다...')
          backendProcess.kill('SIGINT')
          frontendProcess.kill('SIGINT')
          process.exit(0)
        })
      }

    } catch (error) {
      console.error('❌ 개발 서버 시작 중 오류가 발생했습니다:', error)
      throw error
    }
  }

  /**
   * 프로덕션 빌드 및 실행
   */
  private async buildAndStartProduction(): Promise<void> {
    console.log('🏭 프로덕션 빌드를 시작합니다...\n')

    try {
      // 전체 프로덕션 빌드 (프로덕션과 동일한 방식)
      console.log('   - 전체 프로덕션 빌드 중...')
      execSync('npm run build:production', { stdio: 'inherit' })

      console.log('✅ 프로덕션 빌드가 완료되었습니다.')
      console.log('\n🚀 프로덕션 서버를 시작하려면:')
      console.log('   npm run pm2:start')
      console.log('\n📊 PM2 상태 확인:')
      console.log('   npm run pm2:status')

    } catch (error) {
      console.error('❌ 프로덕션 빌드 중 오류가 발생했습니다:', error)
      throw error
    }
  }

  /**
   * 메인 빌드 프로세스
   */
  async build(options: BuildOptions = {}): Promise<void> {
    this.isProduction = options.production || false

    console.log(`🎯 ${this.isProduction ? '프로덕션' : '개발'} 빌드를 시작합니다...\n`)

    try {
      // 1. 환경 파일 확인
      if (!this.checkEnvironmentFiles()) {
        return
      }

      // 2. 의존성 설치
      await this.installDependencies()

      // 3. JS to CJS 변환 (프로덕션과 동일한 방식)
      await this.convertJsToCjs()

      // 4. TypeScript 컴파일
      await this.compileTypeScript()

      if (this.isProduction) {
        // 프로덕션 빌드
        await this.buildAndStartProduction()
      } else {
        // 개발 빌드
        if (!options.skipDatabase) {
          await this.setupDatabase()
        }

        if (!options.skipFrontend) {
          await this.buildFrontend()
        }

        if (options.watch) {
          await this.startDevelopmentServers()
        }
      }

      console.log('\n🎉 빌드가 성공적으로 완료되었습니다!')
      
      if (!this.isProduction && !options.watch) {
        console.log('\n💡 개발 서버를 시작하려면:')
        console.log('   npm run dev:full')
      }

    } catch (error) {
      console.error('\n❌ 빌드 중 오류가 발생했습니다:', error)
      process.exit(1)
    }
  }
}

// CLI 실행
if (require.main === module) {
  const args = process.argv.slice(2)
  const options: BuildOptions = {
    skipBackend: args.includes('--skip-backend'),
    skipFrontend: args.includes('--skip-frontend'),
    skipDatabase: args.includes('--skip-database'),
    production: args.includes('--production'),
    watch: args.includes('--watch')
  }

  const buildManager = new LocalBuildManager()
  buildManager.build(options)
}

export { LocalBuildManager }
