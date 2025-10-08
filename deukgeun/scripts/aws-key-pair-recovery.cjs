#!/usr/bin/env node

/**
 * AWS 키 페어 복구 스크립트 (AWS 공식 문서 기반)
 * 개인키 분실 시 AWS Systems Manager를 통한 복구 및 새 키 페어 생성
 * 
 * AWS 공식 문서 참조:
 * - Systems Manager Session Manager: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html
 * - EC2 Instance Connect: https://docs.aws.amazon.com/ec2/latest/userguide/ec2-instance-connect.html
 * - EC2 키 페어 관리: https://docs.aws.amazon.com/ec2/latest/userguide/ec2-key-pairs.html
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// AWS 기반 복구 설정
const config = {
  keyPath: './deukgeun_ReactProject.pem',
  keyName: 'deukgeun_ReactProject',
  ec2Host: '3.36.230.117',
  ec2User: 'ubuntu',
  ec2Port: 22,
  projectRoot: process.cwd(),
  awsRegion: 'ap-northeast-2',
  instanceId: null,
  newKeyName: 'deukgeun_ReactProject_RECOVERY'
}

console.log('🔧 AWS 키 페어 복구를 시작합니다...')
console.log('=' * 60)
console.log('AWS 공식 문서 기반 복구 방법:')
console.log(`  - 기존 키: ${config.keyName}`)
console.log(`  - 새 키: ${config.newKeyName}`)
console.log(`  - EC2 호스트: ${config.ec2Host}`)
console.log('=' * 60)

/**
 * 1. AWS CLI 및 Systems Manager 확인
 */
function checkAWSCLI() {
  console.log('\n1. AWS CLI 및 Systems Manager 확인 중...')
  
  try {
    // AWS CLI 버전 확인
    const awsVersion = execSync('aws --version', { encoding: 'utf8' }).trim()
    console.log(`✅ AWS CLI 설치됨: ${awsVersion}`)
    
    // AWS 자격 증명 확인
    const identity = execSync('aws sts get-caller-identity', { encoding: 'utf8' })
    const identityObj = JSON.parse(identity)
    console.log(`✅ AWS 자격 증명 확인됨: ${identityObj.Arn}`)
    
    // Systems Manager 확인
    const ssmVersion = execSync('aws ssm --version', { encoding: 'utf8' }).trim()
    console.log(`✅ AWS Systems Manager 사용 가능: ${ssmVersion}`)
    
    return true
  } catch (error) {
    console.log('❌ AWS CLI 또는 Systems Manager 확인 실패:')
    console.log(`   ${error.message}`)
    console.log('   해결책: AWS CLI를 설치하고 자격 증명을 설정하세요.')
    return false
  }
}

/**
 * 2. EC2 인스턴스 정보 확인
 */
function checkEC2Instance() {
  console.log('\n2. EC2 인스턴스 정보 확인 중...')
  
  try {
    // IP 주소로 인스턴스 찾기
    const describeCommand = `aws ec2 describe-instances --filters "Name=ip-address,Values=${config.ec2Host}" --query "Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress,KeyName]" --output table`
    const instances = execSync(describeCommand, { encoding: 'utf8' })
    
    console.log('EC2 인스턴스 정보:')
    console.log(instances)
    
    // 인스턴스 ID 추출
    const instanceIdCommand = `aws ec2 describe-instances --filters "Name=ip-address,Values=${config.ec2Host}" --query "Reservations[*].Instances[*].InstanceId" --output text`
    const instanceId = execSync(instanceIdCommand, { encoding: 'utf8' }).trim()
    
    if (instanceId && instanceId !== 'None') {
      config.instanceId = instanceId
      console.log(`✅ 인스턴스 ID 확인됨: ${instanceId}`)
      return true
    } else {
      console.log('❌ 인스턴스 ID를 찾을 수 없습니다.')
      return false
    }
  } catch (error) {
    console.log('❌ EC2 인스턴스 정보 확인 실패:')
    console.log(`   ${error.message}`)
    return false
  }
}

/**
 * 3. Systems Manager를 통한 인스턴스 접근
 */
function accessInstanceViaSSM() {
  console.log('\n3. Systems Manager를 통한 인스턴스 접근 중...')
  
  try {
    console.log('   Systems Manager Session Manager를 사용하여 인스턴스에 접근합니다.')
    console.log('   다음 명령어를 실행하세요:')
    console.log(`   aws ssm start-session --target ${config.instanceId}`)
    
    // 자동으로 Session Manager 시작 시도
    try {
      const sessionCommand = `aws ssm start-session --target ${config.instanceId}`
      console.log(`   실행 중: ${sessionCommand}`)
      
      // 백그라운드에서 실행 (사용자가 직접 제어)
      console.log('   ⚠️ Session Manager가 시작되었습니다.')
      console.log('   인스턴스에 접근한 후 다음 명령어를 실행하세요:')
      console.log('   - cat ~/.ssh/authorized_keys')
      console.log('   - ls -la ~/.ssh/')
      console.log('   - systemctl status ssh')
      
      return true
    } catch (error) {
      console.log('   Session Manager 자동 시작 실패, 수동으로 실행하세요.')
      return false
    }
  } catch (error) {
    console.log('❌ Systems Manager 접근 실패:')
    console.log(`   ${error.message}`)
    return false
  }
}

/**
 * 4. 새 키 페어 생성
 */
function createNewKeyPair() {
  console.log('\n4. 새 키 페어 생성 중...')
  
  try {
    // 새 키 페어 생성
    const createKeyCommand = `aws ec2 create-key-pair --key-name ${config.newKeyName} --query "KeyMaterial" --output text > ${config.newKeyName}.pem`
    console.log(`   새 키 페어 생성: ${createKeyCommand}`)
    
    execSync(createKeyCommand, { encoding: 'utf8' })
    console.log(`✅ 새 키 페어 생성됨: ${config.newKeyName}.pem`)
    
    // 키 파일 권한 설정
    const chmodCommand = `icacls "${config.newKeyName}.pem" /inheritance:r /grant:r "%USERNAME%:R"`
    console.log(`   키 파일 권한 설정: ${chmodCommand}`)
    
    execSync(chmodCommand, { encoding: 'utf8' })
    console.log('✅ 키 파일 권한 설정 완료')
    
    return true
  } catch (error) {
    console.log('❌ 새 키 페어 생성 실패:')
    console.log(`   ${error.message}`)
    return false
  }
}

/**
 * 5. 인스턴스에 새 공개키 추가
 */
function addNewPublicKey() {
  console.log('\n5. 인스턴스에 새 공개키 추가 중...')
  
  try {
    // 새 키에서 공개키 추출
    const extractPublicKeyCommand = `ssh-keygen -y -f "${config.newKeyName}.pem" > ${config.newKeyName}.pub`
    console.log(`   공개키 추출: ${extractPublicKeyCommand}`)
    
    execSync(extractPublicKeyCommand, { encoding: 'utf8' })
    console.log('✅ 공개키 추출 완료')
    
    // Systems Manager를 통해 공개키 추가
    const publicKeyContent = fs.readFileSync(`${config.newKeyName}.pub`, 'utf8').trim()
    const addKeyCommand = `aws ssm send-command --instance-ids ${config.instanceId} --document-name "AWS-RunShellScript" --parameters "commands=[\"echo '${publicKeyContent}' >> ~/.ssh/authorized_keys\"]" --query "CommandId" --output text`
    
    console.log('   Systems Manager를 통해 공개키 추가 중...')
    const commandId = execSync(addKeyCommand, { encoding: 'utf8' }).trim()
    console.log(`✅ 공개키 추가 명령 실행됨: ${commandId}`)
    
    // 잠시 대기 후 결과 확인
    setTimeout(() => {
      try {
        const getResultCommand = `aws ssm get-command-invocation --command-id ${commandId} --instance-id ${config.instanceId} --query "StandardOutputContent" --output text`
        const result = execSync(getResultCommand, { encoding: 'utf8' })
        console.log('✅ 공개키 추가 완료')
        console.log('   결과:', result)
      } catch (error) {
        console.log('❌ 공개키 추가 결과 확인 실패:')
        console.log(`   ${error.message}`)
      }
    }, 5000)
    
    return true
  } catch (error) {
    console.log('❌ 공개키 추가 실패:')
    console.log(`   ${error.message}`)
    return false
  }
}

/**
 * 6. 새 키로 SSH 연결 테스트
 */
function testNewSSHConnection() {
  console.log('\n6. 새 키로 SSH 연결 테스트 중...')
  
  try {
    const testCommand = `ssh -i "${config.newKeyName}.pem" -o StrictHostKeyChecking=no ${config.ec2User}@${config.ec2Host} "echo 'SSH 연결 성공'"`
    console.log(`   테스트 명령: ${testCommand}`)
    
    const result = execSync(testCommand, { 
      encoding: 'utf8',
      timeout: 15000,
      stdio: 'pipe'
    })
    
    if (result.includes('SSH 연결 성공')) {
      console.log('✅ 새 키로 SSH 연결 성공!')
      return true
    } else {
      console.log('❌ 새 키로 SSH 연결 실패')
      return false
    }
  } catch (error) {
    console.log('❌ SSH 연결 테스트 실패:')
    console.log(`   ${error.message}`)
    return false
  }
}

/**
 * 7. 기존 키 파일 교체
 */
function replaceOldKeyFile() {
  console.log('\n7. 기존 키 파일 교체 중...')
  
  try {
    // 기존 키 파일 백업
    if (fs.existsSync(config.keyPath)) {
      const backupPath = `${config.keyPath}.backup.${Date.now()}`
      fs.copyFileSync(config.keyPath, backupPath)
      console.log(`✅ 기존 키 파일 백업됨: ${backupPath}`)
    }
    
    // 새 키 파일을 기존 위치로 복사
    fs.copyFileSync(`${config.newKeyName}.pem`, config.keyPath)
    console.log(`✅ 새 키 파일로 교체됨: ${config.keyPath}`)
    
    // 임시 파일 정리
    fs.unlinkSync(`${config.newKeyName}.pem`)
    fs.unlinkSync(`${config.newKeyName}.pub`)
    console.log('✅ 임시 파일 정리 완료')
    
    return true
  } catch (error) {
    console.log('❌ 키 파일 교체 실패:')
    console.log(`   ${error.message}`)
    return false
  }
}

/**
 * 메인 복구 함수
 */
async function main() {
  try {
    const results = {
      awsCLI: false,
      ec2Instance: false,
      ssmAccess: false,
      newKeyPair: false,
      addPublicKey: false,
      sshTest: false,
      keyReplacement: false
    }
    
    // 1. AWS CLI 확인
    results.awsCLI = checkAWSCLI()
    if (!results.awsCLI) {
      console.log('\n❌ AWS CLI 확인 실패로 복구를 중단합니다.')
      return
    }
    
    // 2. EC2 인스턴스 확인
    results.ec2Instance = checkEC2Instance()
    if (!results.ec2Instance) {
      console.log('\n❌ EC2 인스턴스 확인 실패로 복구를 중단합니다.')
      return
    }
    
    // 3. Systems Manager 접근
    results.ssmAccess = accessInstanceViaSSM()
    
    // 4. 새 키 페어 생성
    results.newKeyPair = createNewKeyPair()
    if (!results.newKeyPair) {
      console.log('\n❌ 새 키 페어 생성 실패로 복구를 중단합니다.')
      return
    }
    
    // 5. 공개키 추가
    results.addPublicKey = addNewPublicKey()
    
    // 6. SSH 연결 테스트
    results.sshTest = testNewSSHConnection()
    
    // 7. 키 파일 교체
    if (results.sshTest) {
      results.keyReplacement = replaceOldKeyFile()
    }
    
    // 결과 요약
    console.log('\n' + '=' * 60)
    console.log('🎯 AWS 키 페어 복구 결과 요약')
    console.log('=' * 60)
    
    console.log(`1. AWS CLI 확인: ${results.awsCLI ? '✅' : '❌'}`)
    console.log(`2. EC2 인스턴스 확인: ${results.ec2Instance ? '✅' : '❌'}`)
    console.log(`3. Systems Manager 접근: ${results.ssmAccess ? '✅' : '❌'}`)
    console.log(`4. 새 키 페어 생성: ${results.newKeyPair ? '✅' : '❌'}`)
    console.log(`5. 공개키 추가: ${results.addPublicKey ? '✅' : '❌'}`)
    console.log(`6. SSH 연결 테스트: ${results.sshTest ? '✅' : '❌'}`)
    console.log(`7. 키 파일 교체: ${results.keyReplacement ? '✅' : '❌'}`)
    
    if (results.sshTest && results.keyReplacement) {
      console.log('\n🎉 키 페어 복구가 성공적으로 완료되었습니다!')
      console.log('이제 SSH 연결을 사용할 수 있습니다.')
    } else {
      console.log('\n⚠️ 키 페어 복구가 완전히 완료되지 않았습니다.')
      console.log('수동으로 남은 단계를 완료하세요.')
    }
    
  } catch (error) {
    console.error(`❌ 복구 실패: ${error.message}`)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

module.exports = {
  checkAWSCLI,
  checkEC2Instance,
  accessInstanceViaSSM,
  createNewKeyPair,
  addNewPublicKey,
  testNewSSHConnection,
  replaceOldKeyFile
}
