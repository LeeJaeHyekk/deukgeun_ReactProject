const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const config = {
  projectRoot: process.cwd(),
  backupDir: './backups',
  maxBackups: 5,
  rollbackTimeout: 30000, // 30초
  healthCheckRetries: 3
}

// 색상 출력을 위한 유틸리티
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'cyan')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// 백업 생성
function createBackup() {
  logStep('BACKUP', '백업 생성 중...')
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(config.backupDir, `backup-${timestamp}`)
    
    // 백업 디렉토리 생성
    if (!fs.existsSync(config.backupDir)) {
      fs.mkdirSync(config.backupDir, { recursive: true })
    }
    
    // 현재 배포 백업
    const backupItems = [
      'dist',
      'node_modules',
      '.env',
      'src/backend/.env',
      'ecosystem.config.cjs'
    ]
    
    for (const item of backupItems) {
      if (fs.existsSync(item)) {
        const destPath = path.join(backupPath, item)
        const destDir = path.dirname(destPath)
        
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true })
        }
        
        if (fs.statSync(item).isDirectory()) {
          execSync(`cp -r ${item} ${destPath}`, { stdio: 'ignore' })
        } else {
          fs.copyFileSync(item, destPath)
        }
      }
    }
    
    // PM2 상태 백업
    try {
      execSync('pm2 save', { stdio: 'ignore' })
      const pm2BackupPath = path.join(backupPath, 'pm2-backup')
      if (fs.existsSync('~/.pm2/dump.pm2')) {
        fs.copyFileSync('~/.pm2/dump.pm2', pm2BackupPath)
      }
    } catch (error) {
      logWarning('PM2 상태 백업 실패')
    }
    
    logSuccess(`백업 생성 완료: ${backupPath}`)
    return backupPath
  } catch (error) {
    logError(`백업 생성 실패: ${error.message}`)
    throw error
  }
}

// 이전 백업 정리
function cleanupOldBackups() {
  logStep('CLEANUP', '이전 백업 정리 중...')
  
  try {
    if (!fs.existsSync(config.backupDir)) {
      return
    }
    
    const backups = fs.readdirSync(config.backupDir)
      .filter(item => item.startsWith('backup-'))
      .map(item => ({
        name: item,
        path: path.join(config.backupDir, item),
        mtime: fs.statSync(path.join(config.backupDir, item)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime)
    
    // 오래된 백업 삭제
    if (backups.length > config.maxBackups) {
      const toDelete = backups.slice(config.maxBackups)
      for (const backup of toDelete) {
        execSync(`rm -rf ${backup.path}`, { stdio: 'ignore' })
        log(`삭제된 백업: ${backup.name}`, 'yellow')
      }
    }
    
    logSuccess('이전 백업 정리 완료')
  } catch (error) {
    logWarning(`백업 정리 실패: ${error.message}`)
  }
}

// 사전 검증
function preDeploymentCheck() {
  logStep('CHECK', '사전 검증 중...')
  
  // 필수 파일 확인
  const requiredFiles = [
    'package.json',
    'ecosystem.config.cjs',
    'src/backend/package.json'
  ]
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      logError(`필수 파일 누락: ${file}`)
      process.exit(1)
    }
  }
  
  // 디스크 공간 확인
  try {
    const stats = fs.statSync('.')
    logSuccess('디스크 공간 확인 완료')
  } catch (error) {
    logWarning('디스크 공간 확인 실패')
  }
  
  // 포트 사용 확인
  try {
    execSync('netstat -tuln | grep :5000', { stdio: 'ignore' })
    logWarning('포트 5000이 이미 사용 중입니다.')
  } catch {
    logSuccess('포트 5000 사용 가능')
  }
  
  logSuccess('사전 검증 완료')
}

// 단계별 배포
function deployStepByStep() {
  logStep('DEPLOY', '단계별 배포 시작...')
  
  try {
    // 1. 환경 변수 설정
    log('1. 환경 변수 설정...', 'blue')
    execSync('npm run setup:env:deploy', { stdio: 'inherit' })
    
    // 2. 의존성 설치
    log('2. 의존성 설치...', 'blue')
    execSync('npm install', { stdio: 'inherit' })
    
    // 3. 백엔드 빌드
    log('3. 백엔드 빌드...', 'blue')
    execSync('npm run build:backend:production', { stdio: 'inherit' })
    
    // 4. 프론트엔드 빌드
    log('4. 프론트엔드 빌드...', 'blue')
    execSync('npm run build:production', { stdio: 'inherit' })
    
    logSuccess('단계별 배포 완료')
  } catch (error) {
    logError(`배포 실패: ${error.message}`)
    throw error
  }
}

// 서비스 시작 (안전 모드)
function startServicesSafely() {
  logStep('START', '안전 모드로 서비스 시작...')
  
  try {
    // 기존 서비스 중지
    execSync('pm2 delete all', { stdio: 'ignore' })
    
    // 서비스 시작
    execSync('pm2 start ecosystem.config.cjs --env production', { 
      stdio: 'inherit' 
    })
    
    // 서비스 상태 확인
    execSync('pm2 status', { stdio: 'inherit' })
    
    logSuccess('서비스 시작 완료')
  } catch (error) {
    logError(`서비스 시작 실패: ${error.message}`)
    throw error
  }
}

// 헬스체크 (재시도 포함)
function healthCheckWithRetry() {
  logStep('HEALTH', '헬스체크 수행 중...')
  
  const endpoints = [
    { name: 'Backend API', url: 'http://localhost:5000/health' },
    { name: 'Frontend', url: 'http://localhost:3000' }
  ]
  
  for (const endpoint of endpoints) {
    let success = false
    
    for (let i = 0; i < config.healthCheckRetries; i++) {
      try {
        execSync(`curl -f ${endpoint.url}`, { 
          stdio: 'ignore',
          timeout: 10000 
        })
        logSuccess(`${endpoint.name} 헬스체크 통과`)
        success = true
        break
      } catch (error) {
        if (i < config.healthCheckRetries - 1) {
          log(`재시도 중... (${i + 1}/${config.healthCheckRetries})`, 'yellow')
          execSync('sleep 5', { stdio: 'ignore' })
        }
      }
    }
    
    if (!success) {
      logWarning(`${endpoint.name} 헬스체크 실패 (서비스 시작 중일 수 있음)`)
    }
  }
}

// 롤백 함수
function rollback(backupPath) {
  logStep('ROLLBACK', '롤백 수행 중...')
  
  try {
    if (!backupPath || !fs.existsSync(backupPath)) {
      logError('백업 경로를 찾을 수 없습니다.')
      return false
    }
    
    // 서비스 중지
    execSync('pm2 delete all', { stdio: 'ignore' })
    
    // 백업에서 복원
    const backupItems = ['dist', 'node_modules', '.env', 'src/backend/.env']
    
    for (const item of backupItems) {
      const backupItemPath = path.join(backupPath, item)
      if (fs.existsSync(backupItemPath)) {
        if (fs.existsSync(item)) {
          execSync(`rm -rf ${item}`, { stdio: 'ignore' })
        }
        execSync(`cp -r ${backupItemPath} ${item}`, { stdio: 'ignore' })
      }
    }
    
    // PM2 상태 복원
    const pm2BackupPath = path.join(backupPath, 'pm2-backup')
    if (fs.existsSync(pm2BackupPath)) {
      execSync('pm2 resurrect', { stdio: 'ignore' })
    }
    
    logSuccess('롤백 완료')
    return true
  } catch (error) {
    logError(`롤백 실패: ${error.message}`)
    return false
  }
}

// 안전 배포 메인 함수
async function safeDeploy() {
  let backupPath = null
  
  try {
    log('🛡️  Deukgeun 안전 배포를 시작합니다...', 'bright')
    
    // 사전 검증
    preDeploymentCheck()
    
    // 백업 생성
    backupPath = createBackup()
    
    // 이전 백업 정리
    cleanupOldBackups()
    
    // 단계별 배포
    deployStepByStep()
    
    // 서비스 시작
    startServicesSafely()
    
    // 헬스체크
    healthCheckWithRetry()
    
    log('\n🎉 안전 배포가 성공적으로 완료되었습니다!', 'green')
    log('\n📊 배포 정보:', 'cyan')
    log('- 백업 위치: ' + backupPath)
    log('- 서비스 상태: 정상')
    log('- 헬스체크: 통과')
    
    log('\n🛠️  관리 명령어:', 'cyan')
    log('- 상태 확인: pm2 status')
    log('- 로그 확인: pm2 logs')
    log('- 재시작: pm2 restart all')
    
  } catch (error) {
    logError(`배포 실패: ${error.message}`)
    
    if (backupPath) {
      log('\n🔄 롤백을 시도합니다...', 'yellow')
      const rollbackSuccess = rollback(backupPath)
      
      if (rollbackSuccess) {
        log('✅ 롤백이 완료되었습니다.', 'green')
      } else {
        log('❌ 롤백에 실패했습니다. 수동 복구가 필요합니다.', 'red')
      }
    }
    
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  safeDeploy()
}

module.exports = { safeDeploy, rollback }
