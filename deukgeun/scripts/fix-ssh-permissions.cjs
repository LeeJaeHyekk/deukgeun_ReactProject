#!/usr/bin/env node

/**
 * SSH 키 파일 권한 수정 스크립트
 * Windows에서 SSH 키 파일의 권한을 올바르게 설정
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// SSH 키 파일 경로 (프로젝트 루트 기준)
const keyPath = './ZEV_AWS_KEY.pem'

console.log('🔧 SSH 키 파일 권한 수정 중...')
console.log(`키 파일: ${keyPath}`)

// 1. 키 파일 존재 확인
if (!fs.existsSync(keyPath)) {
  console.error(`❌ SSH 키 파일을 찾을 수 없습니다: ${keyPath}`)
  process.exit(1)
}

console.log('✅ SSH 키 파일 확인 완료')

// 2. Windows에서 SSH 키 파일 권한 수정
console.log('\n2. SSH 키 파일 권한 수정 중...')

try {
  // 2-1. 기존 권한 모두 제거
  console.log('  2-1. 기존 권한 제거 중...')
  const removeInheritanceCommand = `icacls "${keyPath}" /inheritance:r`
  console.log(`     명령어: ${removeInheritanceCommand}`)
  
  try {
    execSync(removeInheritanceCommand, { stdio: 'pipe' })
    console.log('    ✅ 기존 권한 제거 완료')
  } catch (error) {
    console.log(`    ⚠️ 기존 권한 제거 실패: ${error.message}`)
  }
  
  // 2-2. 현재 사용자에게만 읽기 권한 부여
  console.log('  2-2. 현재 사용자에게 읽기 권한 부여 중...')
  const grantReadCommand = `icacls "${keyPath}" /grant:r "${process.env.USERNAME}:(R)"`
  console.log(`     명령어: ${grantReadCommand}`)
  
  try {
    execSync(grantReadCommand, { stdio: 'pipe' })
    console.log('    ✅ 읽기 권한 부여 완료')
  } catch (error) {
    console.log(`    ⚠️ 읽기 권한 부여 실패: ${error.message}`)
  }
  
  // 2-3. 권한 확인
  console.log('  2-3. 권한 확인 중...')
  const checkCommand = `icacls "${keyPath}"`
  console.log(`     명령어: ${checkCommand}`)
  
  try {
    const result = execSync(checkCommand, { encoding: 'utf8', stdio: 'pipe' })
    console.log('    현재 권한:')
    console.log(result)
    
    if (result.includes('(R)') && !result.includes('(F)')) {
      console.log('    ✅ 권한이 올바르게 설정되었습니다')
    } else {
      console.log('    ⚠️ 권한 설정이 완전하지 않을 수 있습니다')
    }
  } catch (error) {
    console.log(`    ⚠️ 권한 확인 실패: ${error.message}`)
  }
  
  console.log('✅ SSH 키 파일 권한 수정 완료')
  
} catch (error) {
  console.log(`⚠️ icacls 명령어 실패: ${error.message}`)
  console.log('수동으로 권한을 수정해주세요.')
}

// 3. SSH 연결 테스트
console.log('\n3. SSH 연결 테스트 중...')

try {
  const sshCommand = `ssh -i "${keyPath}" -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@3.36.230.117 "echo 'SSH 연결 성공'"`
  console.log(`연결 테스트 명령어: ${sshCommand}`)
  
  const result = execSync(sshCommand, { 
    encoding: 'utf8',
    timeout: 15000,
    stdio: 'pipe'
  })

  if (result.includes('SSH 연결 성공')) {
    console.log('✅ SSH 연결 테스트 성공')
  } else {
    console.log('⚠️ SSH 연결 테스트 결과가 예상과 다릅니다.')
  }
} catch (error) {
  console.log(`⚠️ SSH 연결 테스트 실패: ${error.message}`)
  
  // 추가 해결 방법 제시
  console.log('\n🔧 추가 해결 방법:')
  console.log('1. WSL (Windows Subsystem for Linux) 사용:')
  console.log('   - WSL에서 SSH 키 파일을 복사')
  console.log('   - chmod 600 ~/.ssh/ZEV_AWS_KEY.pem')
  console.log('   - ssh -i ~/.ssh/ZEV_AWS_KEY.pem ubuntu@3.36.230.117')
  
  console.log('\n2. Git Bash 사용:')
  console.log('   - Git Bash에서 SSH 명령어 실행')
  
  console.log('\n3. PowerShell에서 권한 수정:')
  console.log('   - 파일 속성 > 보안 > 고급 > 상속 사용 안 함 > 제거')
  console.log('   - 현재 사용자에게만 읽기 권한 부여')
}

console.log('\n📋 생성된 파일들:')
console.log('  - ssh-config (SSH 설정 파일)')
console.log('  - deploy-ssh-commands.sh (배포용 SSH 명령어)')
console.log('  - .env (환경 변수 업데이트)')

console.log('\n🚀 다음 단계:')
console.log('1. WSL 또는 Git Bash에서 SSH 연결 테스트')
console.log('2. 연결 성공 시 배포 스크립트 사용')
console.log('3. Windows에서 직접 SSH 사용 시 권한 문제 해결 필요')
