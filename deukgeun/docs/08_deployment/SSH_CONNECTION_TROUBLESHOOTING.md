# SSH 연결 문제 해결 가이드

## 📋 문제 상황

"Failed to connect to the remote server after 2 attempts; retrying connection in 5 seconds" 에러가 발생하는 경우

## 🔍 원인 분석

SSH 연결 실패의 주요 원인:
1. **EC2 인스턴스 상태**: 인스턴스가 실행 중이지 않음
2. **보안 그룹 설정**: SSH 포트(22)가 열려있지 않음
3. **SSH 키 파일 문제**: 키 파일 경로 오류 또는 권한 문제
4. **사용자 이름 오류**: ec2-user vs ubuntu vs root
5. **네트워크 문제**: 방화벽 또는 네트워크 연결 문제

## ✅ 해결 방법

### 1. EC2 인스턴스 상태 확인

#### AWS 콘솔에서 확인
1. AWS EC2 콘솔 접속
2. 인스턴스 목록에서 `43.203.30.167` IP 확인
3. 인스턴스 상태가 **"running"**인지 확인
4. 상태 검사가 **"2/2 checks passed"**인지 확인

#### AWS CLI로 확인
```bash
# AWS CLI 설치 확인
aws --version

# 인스턴스 상태 확인
aws ec2 describe-instances \
  --filters "Name=ip-address,Values=43.203.30.167" \
  --query "Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]" \
  --output table

# 인스턴스가 실행 중이 아니면 시작
aws ec2 start-instances --instance-ids <INSTANCE_ID>
```

### 2. 보안 그룹 설정 확인

#### AWS 콘솔에서 확인
1. EC2 인스턴스 선택
2. **Security** 탭 클릭
3. 보안 그룹 선택
4. **Inbound rules** 확인:
   - **Type**: SSH
   - **Protocol**: TCP
   - **Port**: 22
   - **Source**: `0.0.0.0/0` 또는 본인 IP

#### 보안 그룹 수정
```bash
# 보안 그룹에 SSH 규칙 추가 (AWS CLI)
aws ec2 authorize-security-group-ingress \
  --group-id <SECURITY_GROUP_ID> \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0
```

### 3. SSH 키 파일 확인

#### 키 파일 존재 확인
```bash
# Windows (PowerShell)
Test-Path "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"

# Linux/Mac
ls -la deukgeun_ReactProject.pem
```

#### 키 파일 권한 설정 (Windows)
```powershell
# PowerShell 관리자 권한으로 실행
icacls "deukgeun_ReactProject.pem" /inheritance:r /grant:r "%USERNAME%:R"
```

#### 키 파일 권한 설정 (Linux/Mac)
```bash
chmod 600 deukgeun_ReactProject.pem
```

### 4. 사용자 이름 확인

EC2 인스턴스의 AMI 유형에 따라 사용자 이름이 다릅니다:

| AMI 유형 | 사용자 이름 |
|---------|------------|
| Amazon Linux 2 | `ec2-user` |
| Ubuntu | `ubuntu` |
| Debian | `admin` |
| CentOS | `centos` |

**현재 설정**: `ec2-user` (Amazon Linux 2 기준)
**다른 AMI 사용 시**: `ubuntu`로 변경 필요

### 5. SSH 연결 테스트

#### 방법 1: 직접 SSH 연결 (Git Bash)
```bash
# Git Bash 실행
cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun

# SSH 키 권한 설정
chmod 600 deukgeun_ReactProject.pem

# SSH 연결 테스트 (ec2-user)
ssh -i deukgeun_ReactProject.pem -o StrictHostKeyChecking=no -o ConnectTimeout=10 ec2-user@43.203.30.167 "echo 'SSH 연결 성공'"

# SSH 연결 테스트 (ubuntu)
ssh -i deukgeun_ReactProject.pem -o StrictHostKeyChecking=no -o ConnectTimeout=10 ubuntu@43.203.30.167 "echo 'SSH 연결 성공'"
```

#### 방법 2: SSH 설정 파일 사용
```bash
# ssh-config 파일 사용
ssh -F ssh-config deukgeun-ec2

# 또는
ssh -F ssh-config deukgeun-test
```

#### 방법 3: 상세 로그로 디버깅
```bash
# 상세 로그와 함께 연결 시도
ssh -v -i deukgeun_ReactProject.pem ec2-user@43.203.30.167

# 매우 상세한 로그
ssh -vvv -i deukgeun_ReactProject.pem ec2-user@43.203.30.167
```

### 6. 네트워크 연결 확인

#### 포트 연결 테스트
```bash
# Windows (PowerShell)
Test-NetConnection -ComputerName 43.203.30.167 -Port 22

# Linux/Mac
nc -zv 43.203.30.167 22
# 또는
telnet 43.203.30.167 22
```

#### ping 테스트
```bash
# Windows
ping 43.203.30.167

# Linux/Mac
ping -c 4 43.203.30.167
```

### 7. SSH 설정 파일 수정

`ssh-config` 파일을 다음과 같이 수정:

```bash
# SSH 설정 파일 수정
Host deukgeun-ec2
    HostName 43.203.30.167
    User ubuntu                    # ec2-user에서 ubuntu로 변경 시도
    Port 22
    IdentityFile "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 30
    TCPKeepAlive yes
    Compression yes
    LogLevel DEBUG                 # QUIET에서 DEBUG로 변경하여 상세 로그 확인
```

## 🔧 단계별 해결 체크리스트

### 1단계: 기본 확인
- [ ] EC2 인스턴스가 실행 중인가?
- [ ] 인스턴스의 공용 IP 주소가 `43.203.30.167`인가?
- [ ] SSH 키 파일이 존재하는가?
- [ ] SSH 키 파일 경로가 올바른가?

### 2단계: 보안 그룹 확인
- [ ] 보안 그룹에 SSH 규칙이 있는가?
- [ ] SSH 포트(22)가 열려있는가?
- [ ] Source가 `0.0.0.0/0` 또는 본인 IP인가?

### 3단계: SSH 키 확인
- [ ] SSH 키 파일 권한이 올바른가? (600)
- [ ] SSH 키 파일이 손상되지 않았는가?
- [ ] 올바른 키 파일을 사용하고 있는가?

### 4단계: 사용자 이름 확인
- [ ] EC2 인스턴스의 AMI 유형 확인
- [ ] 올바른 사용자 이름 사용 (ec2-user 또는 ubuntu)
- [ ] 사용자 이름 변경 후 재시도

### 5단계: 네트워크 확인
- [ ] 포트 22가 열려있는가?
- [ ] 방화벽이 SSH 연결을 차단하지 않는가?
- [ ] 네트워크 연결이 정상인가?

## 🚀 빠른 해결 스크립트

### Windows PowerShell 스크립트
```powershell
# SSH 연결 테스트 스크립트
$keyPath = "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
$host = "43.203.30.167"
$users = @("ec2-user", "ubuntu", "admin")

# 키 파일 확인
if (-not (Test-Path $keyPath)) {
    Write-Host "❌ SSH 키 파일을 찾을 수 없습니다: $keyPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SSH 키 파일 확인: $keyPath" -ForegroundColor Green

# 네트워크 연결 확인
Write-Host "🔍 포트 22 연결 확인 중..." -ForegroundColor Yellow
$portTest = Test-NetConnection -ComputerName $host -Port 22 -WarningAction SilentlyContinue
if ($portTest.TcpTestSucceeded) {
    Write-Host "✅ 포트 22 연결 성공" -ForegroundColor Green
} else {
    Write-Host "❌ 포트 22 연결 실패" -ForegroundColor Red
    Write-Host "보안 그룹 설정을 확인하세요." -ForegroundColor Yellow
}

# 각 사용자로 SSH 연결 시도
foreach ($user in $users) {
    Write-Host "`n🔍 $user 사용자로 SSH 연결 시도 중..." -ForegroundColor Yellow
    $command = "ssh -i `"$keyPath`" -o StrictHostKeyChecking=no -o ConnectTimeout=10 $user@$host `"echo 'SSH 연결 성공'`" 2>&1"
    $result = & cmd /c $command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $user 사용자로 SSH 연결 성공!" -ForegroundColor Green
        Write-Host "올바른 사용자 이름: $user" -ForegroundColor Cyan
        exit 0
    } else {
        Write-Host "❌ $user 사용자로 SSH 연결 실패" -ForegroundColor Red
    }
}

Write-Host "`n❌ 모든 사용자로 SSH 연결 실패" -ForegroundColor Red
Write-Host "다음 사항을 확인하세요:" -ForegroundColor Yellow
Write-Host "1. EC2 인스턴스 상태 (running)" -ForegroundColor White
Write-Host "2. 보안 그룹 SSH 규칙 (포트 22)" -ForegroundColor White
Write-Host "3. SSH 키 파일 경로 및 권한" -ForegroundColor White
```

### Linux/Mac Bash 스크립트
```bash
#!/bin/bash

KEY_PATH="./deukgeun_ReactProject.pem"
HOST="43.203.30.167"
USERS=("ec2-user" "ubuntu" "admin")

# 키 파일 확인
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ SSH 키 파일을 찾을 수 없습니다: $KEY_PATH"
    exit 1
fi

echo "✅ SSH 키 파일 확인: $KEY_PATH"

# 키 파일 권한 설정
chmod 600 "$KEY_PATH"
echo "✅ SSH 키 파일 권한 설정 완료"

# 네트워크 연결 확인
echo "🔍 포트 22 연결 확인 중..."
if nc -zv "$HOST" 22 2>&1 | grep -q "succeeded"; then
    echo "✅ 포트 22 연결 성공"
else
    echo "❌ 포트 22 연결 실패"
    echo "보안 그룹 설정을 확인하세요."
fi

# 각 사용자로 SSH 연결 시도
for user in "${USERS[@]}"; do
    echo ""
    echo "🔍 $user 사용자로 SSH 연결 시도 중..."
    if ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$user@$HOST" "echo 'SSH 연결 성공'" 2>/dev/null; then
        echo "✅ $user 사용자로 SSH 연결 성공!"
        echo "올바른 사용자 이름: $user"
        exit 0
    else
        echo "❌ $user 사용자로 SSH 연결 실패"
    fi
done

echo ""
echo "❌ 모든 사용자로 SSH 연결 실패"
echo "다음 사항을 확인하세요:"
echo "1. EC2 인스턴스 상태 (running)"
echo "2. 보안 그룹 SSH 규칙 (포트 22)"
echo "3. SSH 키 파일 경로 및 권한"
```

## 📝 ssh-config 파일 수정

### Windows용 ssh-config (수정)
```bash
Host deukgeun-ec2
    HostName 43.203.30.167
    User ubuntu                    # ec2-user에서 ubuntu로 변경
    Port 22
    IdentityFile "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 30
    TCPKeepAlive yes
    Compression yes
    LogLevel DEBUG                 # 디버깅을 위해 DEBUG로 변경
```

### Linux/Mac용 ssh-config (변환)
```bash
Host deukgeun-ec2
    HostName 43.203.30.167
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/deukgeun_ReactProject.pem
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 30
    TCPKeepAlive yes
    Compression yes
    LogLevel DEBUG
```

## 🆘 응급 조치

### AWS Systems Manager (SSM) 사용

SSH 연결이 불가능한 경우 AWS SSM을 사용하여 인스턴스에 접근:

```bash
# AWS CLI로 SSM 세션 시작
aws ssm start-session --target <INSTANCE_ID>

# 인스턴스 ID 확인
aws ec2 describe-instances \
  --filters "Name=ip-address,Values=43.203.30.167" \
  --query "Reservations[*].Instances[*].InstanceId" \
  --output text
```

**필수 조건:**
- SSM Agent가 인스턴스에 설치되어 있어야 함
- IAM 역할에 SSM 권한이 있어야 함

## 🚀 빠른 해결 가이드

### 즉시 시도할 수 있는 해결 방법

#### 1. 사용자 이름 변경 (가장 흔한 원인)

**문제**: `ec2-user`가 아닌 `ubuntu`를 사용해야 할 수 있습니다.

**해결**:
```bash
# Git Bash에서 실행
ssh -i deukgeun_ReactProject.pem ubuntu@43.203.30.167
```

#### 2. SSH 연결 진단 스크립트 실행

**Windows PowerShell**:
```powershell
# PowerShell 관리자 권한으로 실행
.\scripts\ssh-connection-test.ps1
```

**Git Bash**:
```bash
chmod +x scripts/ssh-connection-test.sh
./scripts/ssh-connection-test.sh
```

#### 3. 직접 SSH 연결 테스트

**Git Bash에서 실행**:
```bash
# 1. 키 파일 권한 설정
chmod 600 deukgeun_ReactProject.pem

# 2. ubuntu 사용자로 연결 시도
ssh -i deukgeun_ReactProject.pem -v ubuntu@43.203.30.167

# 3. ec2-user로 시도 (실패하면)
ssh -i deukgeun_ReactProject.pem -v ec2-user@43.203.30.167
```

#### 4. ssh-config 파일 사용

수정된 `ssh-config` 파일을 사용하여 연결:

```bash
# Git Bash에서
ssh -F ssh-config deukgeun-ec2

# 또는 Windows PowerShell에서
ssh -F ssh-config deukgeun-ec2
```

## 📞 추가 지원

문제가 계속되면 다음을 확인하세요:
1. AWS 콘솔에서 EC2 인스턴스 상태 확인
2. CloudWatch 로그 확인
3. AWS Support 케이스 생성

## 📚 관련 문서

- [Cursor Remote SSH 설정 가이드](./CURSOR_REMOTE_SSH_SETUP.md)
- [Cursor SSH 빠른 해결](./CURSOR_SSH_FIX.md)

