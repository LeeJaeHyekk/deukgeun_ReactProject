#!/usr/bin/env node

/**
 * SSH 연결 진단 스크립트 (AWS 공식 문서 기반)
 * AWS 키 페어 구조에 따른 SSH 연결 실패 원인을 체계적으로 진단
 * 
 * AWS 공식 문서 참조:
 * - EC2 키 페어 관리: https://docs.aws.amazon.com/ec2/latest/userguide/ec2-key-pairs.html
 * - SSH 연결: https://docs.aws.amazon.com/ec2/latest/userguide/AccessingInstancesLinux.html
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// AWS 공식 구조 기반 진단 설정
const config = {
  keyPath: './deukgeun_ReactProject.pem',
  keyName: 'deukgeun_ReactProject',
  ec2Host: '3.36.230.117',
  ec2User: 'ubuntu',
  ec2Port: 22,
  projectRoot: process.cwd(),
  // AWS 공식 문서 기반 추가 설정
  awsRegion: 'ap-northeast-2',
  instanceId: null, // 런타임에 확인
  securityGroupId: null // 런타임에 확인
}

console.log('🔍 SSH 연결 진단을 시작합니다 (AWS 공식 문서 기반)...')
console.log('=' * 60)
console.log('AWS 키 페어 구조 진단:')
console.log(`  - 로컬 개인키: ${config.keyPath}`)
console.log(`  - AWS 키 페어: ${config.keyName}`)
console.log(`  - EC2 호스트: ${config.ec2Host}`)
console.log(`  - 사용자: ${config.ec2User}`)
console.log(`  - 포트: ${config.ec2Port}`)
console.log('=' * 60)

/**
 * 1. AWS 키 페어 구조 검증 (AWS 공식 문서 기반)
 */
function checkKeyPairStructure() {
  console.log('\n1. AWS 키 페어 구조 검증 중...')
  
  try {
    // 1-1. 로컬 개인키 파일 확인
    console.log('  1-1. 로컬 개인키 파일 확인 중...')
    
    if (!fs.existsSync(config.keyPath)) {
      console.log('❌ 로컬 개인키 파일이 존재하지 않습니다.')
      console.log('   해결책: AWS 콘솔에서 키 페어를 다시 다운로드하세요.')
      return false
    }
    
    console.log('✅ 로컬 개인키 파일 존재 확인')
    
    // 파일 크기 및 형식 확인
    const stats = fs.statSync(config.keyPath)
    console.log(`   파일 크기: ${stats.size} bytes`)
    
    if (stats.size < 100) {
      console.log('⚠️ 파일 크기가 너무 작습니다. 올바른 키 파일인지 확인하세요.')
      return false
    }
    
    // 1-2. 개인키 형식 검증
    console.log('  1-2. 개인키 형식 검증 중...')
    
    const keyContent = fs.readFileSync(config.keyPath, 'utf8')
    
    if (!keyContent.includes('BEGIN PRIVATE KEY') && !keyContent.includes('BEGIN RSA PRIVATE KEY')) {
      console.log('❌ 올바른 개인키 형식이 아닙니다.')
      console.log('   해결책: AWS 콘솔에서 올바른 .pem 파일을 다운로드하세요.')
      return false
    }
    
    console.log('✅ 개인키 형식 검증 완료')
    
    // 1-3. 공개키 추출 및 검증
    console.log('  1-3. 공개키 추출 및 검증 중...')
    
    try {
      const publicKey = execSync(`ssh-keygen -y -f "${config.keyPath}"`, { encoding: 'utf8' }).trim()
      
      if (publicKey && publicKey.startsWith('ssh-rsa')) {
        console.log('✅ 공개키 추출 성공')
        console.log(`   공개키 지문: ${publicKey.substring(0, 50)}...`)
        
        // 공개키를 임시 파일로 저장 (나중에 AWS 키와 비교용)
        fs.writeFileSync('./temp_public_key.pub', publicKey)
        console.log('   공개키가 temp_public_key.pub에 저장되었습니다.')
        
        return true
      } else {
        console.log('❌ 공개키 추출 실패')
        return false
      }
    } catch (error) {
      console.log('❌ 공개키 추출 중 오류 발생:')
      console.log(`   ${error.message}`)
      return false
    }
    
    return true
    
  } catch (error) {
    console.log(`❌ 키 페어 구조 검증 실패: ${error.message}`)
    return false
  }
}

/**
 * 2. AWS CLI를 통한 EC2 인스턴스 상태 확인
 */
function checkEC2InstanceStatus() {
  console.log('\n2. AWS EC2 인스턴스 상태 확인 중...')
  
  try {
    // 2-1. AWS CLI 설치 확인
    console.log('  2-1. AWS CLI 설치 확인 중...')
    
    try {
      const awsVersion = execSync('aws --version', { encoding: 'utf8' }).trim()
      console.log(`✅ AWS CLI 설치됨: ${awsVersion}`)
    } catch (error) {
      console.log('❌ AWS CLI가 설치되지 않았습니다.')
      console.log('   해결책: https://aws.amazon.com/cli/ 에서 AWS CLI를 설치하세요.')
      return false
    }
    
    // 2-2. AWS 자격 증명 확인
    console.log('  2-2. AWS 자격 증명 확인 중...')
    
    try {
      const identity = execSync('aws sts get-caller-identity', { encoding: 'utf8' })
      const identityObj = JSON.parse(identity)
      console.log(`✅ AWS 자격 증명 확인됨: ${identityObj.Arn}`)
    } catch (error) {
      console.log('❌ AWS 자격 증명이 설정되지 않았습니다.')
      console.log('   해결책: aws configure 명령어로 자격 증명을 설정하세요.')
      return false
    }
    
    // 2-3. EC2 인스턴스 상태 확인
    console.log('  2-3. EC2 인스턴스 상태 확인 중...')
    
    try {
      // IP 주소로 인스턴스 찾기
      const describeCommand = `aws ec2 describe-instances --filters "Name=ip-address,Values=${config.ec2Host}" --query "Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,KeyName]" --output table`
      const instances = execSync(describeCommand, { encoding: 'utf8' })
      
      console.log('EC2 인스턴스 정보:')
      console.log(instances)
      
      if (instances.includes('running')) {
        console.log('✅ EC2 인스턴스가 실행 중입니다.')
        return true
      } else if (instances.includes('stopped')) {
        console.log('❌ EC2 인스턴스가 중지되었습니다.')
        console.log('   해결책: AWS 콘솔에서 인스턴스를 시작하세요.')
        return false
      } else {
        console.log('⚠️ EC2 인스턴스 상태를 확인할 수 없습니다.')
        return false
      }
    } catch (error) {
      console.log('❌ EC2 인스턴스 상태 확인 실패:')
      console.log(`   ${error.message}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ AWS CLI 확인 실패: ${error.message}`)
    return false
  }
}

/**
 * 2. Windows 권한 확인
 */
function checkWindowsPermissions() {
  console.log('\n2. Windows 권한 확인 중...')
  
  try {
    const checkCommand = `icacls "${config.keyPath}"`
    const result = execSync(checkCommand, { encoding: 'utf8', stdio: 'pipe' })
    
    console.log('현재 권한:')
    console.log(result)
    
    // 권한 분석
    if (result.includes('(F)')) {
      console.log('⚠️ Full Control 권한이 있습니다. 보안상 위험할 수 있습니다.')
    }
    
    if (result.includes('(R)') && !result.includes('(F)')) {
      console.log('✅ 권한이 올바르게 설정되었습니다.')
      return true
    } else {
      console.log('⚠️ 권한 설정에 문제가 있을 수 있습니다.')
      return false
    }
    
  } catch (error) {
    console.log(`❌ 권한 확인 실패: ${error.message}`)
    return false
  }
}

/**
 * 3. 네트워크 연결 확인
 */
function checkNetworkConnection() {
  console.log('\n3. 네트워크 연결 확인 중...')
  
  try {
    // ping 테스트
    console.log('  3-1. Ping 테스트 중...')
    const pingCommand = `ping -n 4 ${config.ec2Host}`
    console.log(`     명령어: ${pingCommand}`)
    
    try {
      const pingResult = execSync(pingCommand, { encoding: 'utf8', stdio: 'pipe' })
      console.log('    ✅ Ping 성공')
      
      // 패킷 손실률 확인
      const lossMatch = pingResult.match(/\((\d+)% loss\)/)
      if (lossMatch) {
        const lossRate = parseInt(lossMatch[1])
        if (lossRate > 50) {
          console.log(`    ⚠️ 높은 패킷 손실률: ${lossRate}%`)
        } else {
          console.log(`    ✅ 패킷 손실률: ${lossRate}%`)
        }
      }
      
    } catch (error) {
      console.log(`    ❌ Ping 실패: ${error.message}`)
      return false
    }
    
    // 포트 연결 테스트
    console.log('  3-2. 포트 연결 테스트 중...')
    const telnetCommand = `telnet ${config.ec2Host} ${config.ec2Port}`
    console.log(`     명령어: ${telnetCommand}`)
    
    try {
      // telnet은 Windows에서 기본적으로 설치되지 않을 수 있음
      execSync(telnetCommand, { encoding: 'utf8', stdio: 'pipe', timeout: 5000 })
      console.log('    ✅ 포트 연결 성공')
    } catch (error) {
      console.log(`    ⚠️ Telnet 테스트 실패 (정상일 수 있음): ${error.message}`)
    }
    
    return true
    
  } catch (error) {
    console.log(`❌ 네트워크 연결 확인 실패: ${error.message}`)
    return false
  }
}

/**
 * 4. SSH 클라이언트 확인
 */
function checkSSHClient() {
  console.log('\n4. SSH 클라이언트 확인 중...')
  
  try {
    // SSH 버전 확인
    const versionCommand = 'ssh -V'
    console.log(`   명령어: ${versionCommand}`)
    
    try {
      const versionResult = execSync(versionCommand, { encoding: 'utf8', stdio: 'pipe' })
      console.log(`   ✅ SSH 클라이언트 버전: ${versionResult.trim()}`)
    } catch (error) {
      console.log(`   ❌ SSH 클라이언트 확인 실패: ${error.message}`)
      return false
    }
    
    // SSH 설정 확인
    console.log('  4-1. SSH 설정 확인 중...')
    const sshConfigPath = path.join(process.env.USERPROFILE, '.ssh', 'config')
    
    if (fs.existsSync(sshConfigPath)) {
      console.log(`   SSH 설정 파일 존재: ${sshConfigPath}`)
      const sshConfig = fs.readFileSync(sshConfigPath, 'utf8')
      console.log('   SSH 설정 내용:')
      console.log(sshConfig)
    } else {
      console.log('   SSH 설정 파일이 없습니다.')
    }
    
    return true
    
  } catch (error) {
    console.log(`❌ SSH 클라이언트 확인 실패: ${error.message}`)
    return false
  }
}

/**
 * 5. 상세 SSH 연결 테스트
 */
function detailedSSHTest() {
  console.log('\n5. 상세 SSH 연결 테스트 중...')
  
  const testCommands = [
    {
      name: '기본 연결 테스트',
      command: `ssh -i "${config.keyPath}" -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${config.ec2User}@${config.ec2Host} "echo 'SSH 연결 성공'"`
    },
    {
      name: '상세 로그 연결 테스트',
      command: `ssh -i "${config.keyPath}" -v -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${config.ec2User}@${config.ec2Host} "echo 'SSH 연결 성공'" 2>&1`
    },
    {
      name: 'WSL 연결 테스트',
      command: `wsl ssh -i ~/.ssh/deukgeun_ReactProject.pem -o ConnectTimeout=10 -o StrictHostKeyChecking=no ${config.ec2User}@${config.ec2Host} "echo 'SSH 연결 성공'"`
    }
  ]
  
  for (const test of testCommands) {
    console.log(`\n  5-${testCommands.indexOf(test) + 1}. ${test.name}`)
    console.log(`     명령어: ${test.command}`)
    
    try {
      const result = execSync(test.command, { 
        encoding: 'utf8',
        timeout: 15000,
        stdio: 'pipe'
      })
      
      if (result.includes('SSH 연결 성공')) {
        console.log('    ✅ 연결 성공')
        return true
      } else {
        console.log('    ⚠️ 예상과 다른 결과')
        console.log('    결과:', result)
      }
      
    } catch (error) {
      console.log(`    ❌ 연결 실패: ${error.message}`)
      
      // 상세 로그가 있는 경우 출력
      if (test.name.includes('상세 로그')) {
        console.log('    상세 로그:')
        console.log(error.stdout || error.stderr || '로그 없음')
      }
    }
  }
  
  return false
}

/**
 * 6. 해결책 제시
 */
function provideSolutions() {
  console.log('\n6. 해결책 제시')
  console.log('=' * 40)
  
  console.log('\n🔧 가능한 해결 방법들:')
  
  console.log('\n1. AWS EC2 인스턴스 확인:')
  console.log('   - EC2 인스턴스가 실행 중인지 확인')
  console.log('   - 보안 그룹에서 SSH 포트(22)가 열려있는지 확인')
  console.log('   - 인스턴스의 공개 IP가 변경되었는지 확인')
  
  console.log('\n2. SSH 키 페어 확인:')
  console.log('   - AWS 콘솔에서 올바른 키 페어가 인스턴스에 연결되어 있는지 확인')
  console.log('   - 키 페어가 올바른 형식인지 확인')
  console.log('   - 새 키 페어를 생성하여 테스트')
  
  console.log('\n3. Windows 환경 해결책:')
  console.log('   - WSL 사용: wsl ssh -i ~/.ssh/deukgeun_ReactProject.pem ubuntu@3.36.230.117')
  console.log('   - Git Bash 사용: Git Bash에서 SSH 명령어 실행')
  console.log('   - PowerShell 관리자 권한으로 실행')
  
  console.log('\n4. 네트워크 문제 해결:')
  console.log('   - 방화벽 설정 확인')
  console.log('   - VPN 연결 상태 확인')
  console.log('   - 다른 네트워크에서 테스트')
  
  console.log('\n5. SSH 설정 최적화:')
  console.log('   - SSH 설정 파일 생성')
  console.log('   - 연결 타임아웃 조정')
  console.log('   - 호스트 키 확인 비활성화')
}

/**
 * 7. 자동 해결 시도
 */
function attemptAutoFix() {
  console.log('\n7. 자동 해결 시도 중...')
  
  try {
    // SSH 설정 파일 생성
    console.log('  7-1. SSH 설정 파일 생성 중...')
    const sshConfigPath = path.join(config.projectRoot, 'ssh-config')
    const sshConfigContent = `# SSH 설정 파일 - deukgeun 프로젝트
# 자동 생성: ${new Date().toISOString()}

Host deukgeun-ec2
    HostName ${config.ec2Host}
    User ${config.ec2User}
    Port ${config.ec2Port}
    IdentityFile "${path.resolve(config.keyPath)}"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 30
    TCPKeepAlive yes
    Compression yes
    LogLevel QUIET

# 테스트용 별칭
Host deukgeun-test
    HostName ${config.ec2Host}
    User ${config.ec2User}
    Port ${config.ec2Port}
    IdentityFile "${path.resolve(config.keyPath)}"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 30
    ServerAliveCountMax 2
    ConnectTimeout 30
    TCPKeepAlive yes
    Compression yes
    LogLevel QUIET
`

    fs.writeFileSync(sshConfigPath, sshConfigContent)
    console.log('    ✅ SSH 설정 파일 생성 완료')
    
    // SSH 설정 파일을 사용한 연결 테스트
    console.log('  7-2. SSH 설정 파일을 사용한 연결 테스트...')
    const configTestCommand = `ssh -F "${sshConfigPath}" deukgeun-test "echo 'SSH 연결 성공'"`
    console.log(`     명령어: ${configTestCommand}`)
    
    try {
      const result = execSync(configTestCommand, { 
        encoding: 'utf8',
        timeout: 15000,
        stdio: 'pipe'
      })
      
      if (result.includes('SSH 연결 성공')) {
        console.log('    ✅ SSH 설정 파일을 사용한 연결 성공')
        return true
      }
    } catch (error) {
      console.log(`    ❌ SSH 설정 파일을 사용한 연결 실패: ${error.message}`)
    }
    
    return false
    
  } catch (error) {
    console.log(`❌ 자동 해결 시도 실패: ${error.message}`)
    return false
  }
}

/**
 * 3. authorized_keys 파일 확인 (AWS Systems Manager 사용)
 */
function checkAuthorizedKeys() {
  console.log('\n3. 인스턴스 내부 authorized_keys 확인 중...')
  
  try {
    // 3-1. AWS Systems Manager Session Manager 확인
    console.log('  3-1. AWS Systems Manager Session Manager 확인 중...')
    
    try {
      const ssmVersion = execSync('aws ssm --version', { encoding: 'utf8' }).trim()
      console.log(`✅ AWS Systems Manager 사용 가능: ${ssmVersion}`)
    } catch (error) {
      console.log('❌ AWS Systems Manager를 사용할 수 없습니다.')
      console.log('   해결책: AWS CLI를 최신 버전으로 업데이트하세요.')
      return false
    }
    
    // 3-2. 인스턴스 ID 확인
    console.log('  3-2. 인스턴스 ID 확인 중...')
    
    try {
      const describeCommand = `aws ec2 describe-instances --filters "Name=ip-address,Values=${config.ec2Host}" --query "Reservations[*].Instances[*].InstanceId" --output text`
      const instanceId = execSync(describeCommand, { encoding: 'utf8' }).trim()
      
      if (instanceId && instanceId !== 'None') {
        console.log(`✅ 인스턴스 ID 확인됨: ${instanceId}`)
        config.instanceId = instanceId
      } else {
        console.log('❌ 인스턴스 ID를 찾을 수 없습니다.')
        return false
      }
    } catch (error) {
      console.log('❌ 인스턴스 ID 확인 실패:')
      console.log(`   ${error.message}`)
      return false
    }
    
    // 3-3. Systems Manager를 통한 authorized_keys 확인
    console.log('  3-3. Systems Manager를 통한 authorized_keys 확인 중...')
    
    try {
      const checkAuthorizedKeysCommand = `aws ssm send-command --instance-ids ${config.instanceId} --document-name "AWS-RunShellScript" --parameters 'commands=["cat ~/.ssh/authorized_keys"]' --query "CommandId" --output text`
      const commandId = execSync(checkAuthorizedKeysCommand, { encoding: 'utf8' }).trim()
      
      console.log(`✅ authorized_keys 확인 명령 실행됨: ${commandId}`)
      console.log('   잠시 후 결과를 확인하세요...')
      
      // 명령 실행 결과 확인 (5초 대기)
      setTimeout(() => {
        try {
          const getCommandResult = `aws ssm get-command-invocation --command-id ${commandId} --instance-id ${config.instanceId} --query "StandardOutputContent" --output text`
          const result = execSync(getCommandResult, { encoding: 'utf8' })
          
          if (result && result.trim()) {
            console.log('✅ authorized_keys 파일 내용:')
            console.log(result)
            return true
          } else {
            console.log('❌ authorized_keys 파일이 비어있거나 존재하지 않습니다.')
            return false
          }
        } catch (error) {
          console.log('❌ authorized_keys 확인 결과 조회 실패:')
          console.log(`   ${error.message}`)
          return false
        }
      }, 5000)
      
    } catch (error) {
      console.log('❌ authorized_keys 확인 명령 실행 실패:')
      console.log(`   ${error.message}`)
      return false
    }
    
  } catch (error) {
    console.log(`❌ authorized_keys 확인 실패: ${error.message}`)
    return false
  }
}

/**
 * 메인 진단 함수 (AWS 공식 문서 기반)
 */
async function main() {
  try {
    const results = {
      keyPairStructure: false,
      ec2InstanceStatus: false,
      authorizedKeys: false,
      network: false,
      sshClient: false,
      connection: false,
      autoFix: false
    }
    
    // 1. AWS 키 페어 구조 검증
    results.keyPairStructure = checkKeyPairStructure()
    
    // 2. AWS EC2 인스턴스 상태 확인
    results.ec2InstanceStatus = checkEC2InstanceStatus()
    
    // 3. authorized_keys 파일 확인
    results.authorizedKeys = checkAuthorizedKeys()
    
    // 4. 네트워크 연결 확인
    results.network = checkNetworkConnection()
    
    // 5. SSH 클라이언트 확인
    results.sshClient = checkSSHClient()
    
    // 6. 상세 SSH 연결 테스트
    results.connection = detailedSSHTest()
    
    // 7. 자동 해결 시도
    if (!results.connection) {
      results.autoFix = attemptAutoFix()
    }
    
    // 7. 해결책 제시
    provideSolutions()
    
    // 결과 요약 (AWS 공식 문서 기반)
    console.log('\n' + '=' * 60)
    console.log('🎯 AWS 키 페어 구조 진단 결과 요약')
    console.log('=' * 60)
    
    console.log(`1. 키 페어 구조 검증: ${results.keyPairStructure ? '✅' : '❌'}`)
    console.log(`2. EC2 인스턴스 상태: ${results.ec2InstanceStatus ? '✅' : '❌'}`)
    console.log(`3. authorized_keys 확인: ${results.authorizedKeys ? '✅' : '❌'}`)
    console.log(`4. 네트워크 연결: ${results.network ? '✅' : '❌'}`)
    console.log(`5. SSH 클라이언트: ${results.sshClient ? '✅' : '❌'}`)
    console.log(`6. SSH 연결: ${results.connection ? '✅' : '❌'}`)
    console.log(`7. 자동 해결: ${results.autoFix ? '✅' : '❌'}`)
    
    // AWS 공식 문서 기반 해결책 제시
    console.log('\n📚 AWS 공식 문서 기반 해결책:')
    
    if (!results.keyPairStructure) {
      console.log('   - AWS 콘솔에서 키 페어를 다시 다운로드하세요.')
      console.log('   - 개인키와 공개키가 올바르게 매칭되는지 확인하세요.')
    }
    
    if (!results.ec2InstanceStatus) {
      console.log('   - AWS 콘솔에서 EC2 인스턴스 상태를 확인하세요.')
      console.log('   - 인스턴스가 "running" 상태인지 확인하세요.')
      console.log('   - 보안 그룹에서 SSH 포트(22)가 열려있는지 확인하세요.')
    }
    
    if (!results.authorizedKeys) {
      console.log('   - AWS Systems Manager Session Manager를 사용하세요.')
      console.log('   - EC2 Instance Connect를 사용하세요.')
      console.log('   - authorized_keys 파일을 수동으로 복구하세요.')
    }
    
    if (results.connection || results.autoFix) {
      console.log('\n🎉 SSH 연결 문제가 해결되었습니다!')
      console.log('이제 프로젝트 배포를 진행할 수 있습니다.')
    } else {
      console.log('\n⚠️ SSH 연결 문제가 지속되고 있습니다.')
      console.log('AWS 공식 문서를 참고하여 수동으로 문제를 해결해주세요.')
      console.log('참조: https://docs.aws.amazon.com/ec2/latest/userguide/ec2-key-pairs.html')
    }
    
  } catch (error) {
    console.error(`❌ 진단 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

module.exports = {
  checkKeyPairStructure,
  checkEC2InstanceStatus,
  checkAuthorizedKeys,
  checkWindowsPermissions,
  checkNetworkConnection,
  checkSSHClient,
  detailedSSHTest,
  provideSolutions,
  attemptAutoFix
}
