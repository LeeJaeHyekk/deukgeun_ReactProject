# Cursor Remote SSH 설정 가이드

## 📋 문제 상황

Cursor Remote SSH 확장에서 "Failed to install server within the timeout" 또는 "Connection timed out during banner exchange" 에러가 발생하는 경우

## 🔍 원인 분석

1. **SSH Config 파일 위치**: Cursor는 Windows의 `~/.ssh/config` 파일을 사용합니다 (프로젝트 루트의 `ssh-config`가 아님)
2. **키 파일 권한**: Windows에서 SSH 키 파일 권한이 올바르지 않을 수 있음
3. **사용자 이름**: EC2 인스턴스의 AMI 유형에 따라 `ubuntu` 또는 `ec2-user` 사용
4. **네트워크 타임아웃**: 방화벽 또는 네트워크 문제로 연결이 느림

## ✅ 해결 방법

### 1. Windows SSH Config 파일 설정 (완료)

스크립트를 실행하여 Windows SSH config 파일에 설정을 추가했습니다:

```powershell
.\scripts\setup-windows-ssh-config.ps1
```

**설정 파일 위치**: `C:\Users\jaehyuok\.ssh\config`

**추가된 호스트**:
- `deukgeun-ec2` (ubuntu 사용자)
- `deukgeun-ec2-amazon` (ec2-user 사용자)

### 2. SSH 키 파일 확인

#### 키 파일 경로 확인
```powershell
# PowerShell에서
Test-Path "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
```

#### 키 파일 권한 설정
```powershell
# PowerShell 관리자 권한으로 실행
icacls "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem" /inheritance:r /grant:r "${env:USERNAME}:R"
```

### 3. Cursor에서 SSH 연결

1. **Cursor 명령 팔레트 열기**: `Ctrl+Shift+P` (또는 `F1`)
2. **"Remote-SSH: Connect to Host"** 선택
3. **"deukgeun-ec2"** 선택
4. 연결 대기

### 4. 연결 실패 시 대안

#### 방법 1: 다른 호스트 시도
Cursor에서 다음 호스트를 시도:
- `deukgeun-ec2` (ubuntu 사용자)
- `deukgeun-ec2-amazon` (ec2-user 사용자)

#### 방법 2: 직접 SSH 연결로 확인
```bash
# Git Bash에서
ssh deukgeun-ec2
```

#### 방법 3: EC2 인스턴스 상태 확인
AWS 콘솔에서:
1. EC2 → 인스턴스
2. 인스턴스 상태: "running"
3. 상태 검사: "2/2 checks passed"
4. 보안 그룹: SSH (포트 22) 규칙 확인

### 5. 타임아웃 문제 해결

SSH Config 파일에 타임아웃 설정 추가:

```bash
# C:\Users\jaehyuok\.ssh\config 파일 수정

Host deukgeun-ec2
    HostName 43.203.30.167
    User ubuntu
    Port 22
    IdentityFile "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 120        # 타임아웃 증가 (기본 30초 → 120초)
    TCPKeepAlive yes
    Compression yes
    LogLevel DEBUG
```

### 6. Permission Denied 에러 해결

"Permission denied (publickey)" 에러가 발생하는 경우:

#### 키 파일 확인
```bash
# Git Bash에서
ssh-keygen -y -f deukgeun_ReactProject.pem
```

#### 공개키 확인 및 등록
```bash
# 공개키 추출
ssh-keygen -y -f deukgeun_ReactProject.pem > public_key.pub

# EC2 인스턴스에 공개키 등록 (AWS Systems Manager 사용)
aws ssm start-session --target <INSTANCE_ID>
# 그 다음 인스턴스 내부에서:
# echo "public_key_content" >> ~/.ssh/authorized_keys
```

#### AWS 콘솔에서 키 페어 확인
1. EC2 → 키 페어
2. 인스턴스에 연결된 키 페어 확인
3. 로컬 키 파일과 일치하는지 확인

### 7. Cursor 설정 확인

Cursor의 Remote SSH 설정 확인:

1. **Cursor 설정**: `Ctrl+,` (또는 `File > Preferences > Settings`)
2. **"remote.SSH"** 검색
3. 다음 설정 확인:
   - `remote.SSH.connectTimeout`: 120 (기본값보다 증가)
   - `remote.SSH.configFile`: `C:\Users\jaehyuok\.ssh\config`
   - `remote.SSH.showLoginTerminal`: true (로그인 터미널 표시)

### 8. 로그 확인

Cursor의 Remote SSH 로그 확인:

1. **명령 팔레트**: `Ctrl+Shift+P`
2. **"Remote-SSH: Show Log"** 선택
3. 로그에서 에러 메시지 확인

## 🔧 SSH Config 파일 수동 수정

필요한 경우 `C:\Users\jaehyuok\.ssh\config` 파일을 직접 수정:

```bash
# Deukgeun EC2 Server - Cursor Remote SSH
Host deukgeun-ec2
    HostName 43.203.30.167
    User ubuntu
    Port 22
    IdentityFile "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 120
    TCPKeepAlive yes
    Compression yes
    LogLevel DEBUG
    ForwardAgent yes
    RequestTTY no
```

## 🆘 응급 조치

### AWS Systems Manager (SSM) 사용

SSH 연결이 불가능한 경우 SSM을 사용하여 인스턴스에 접근:

```bash
# 1. 인스턴스 ID 확인
aws ec2 describe-instances \
  --filters "Name=ip-address,Values=43.203.30.167" \
  --query "Reservations[*].Instances[*].InstanceId" \
  --output text

# 2. SSM 세션 시작
aws ssm start-session --target <INSTANCE_ID>

# 3. 인스턴스 내부에서 SSH 설정 확인
cat ~/.ssh/authorized_keys
```

## 📝 체크리스트

- [ ] Windows SSH Config 파일에 `deukgeun-ec2` 호스트 추가됨
- [ ] SSH 키 파일 경로가 올바른가?
- [ ] SSH 키 파일 권한이 올바른가? (600 또는 Windows에서 권한 제한)
- [ ] EC2 인스턴스 상태가 "running"인가?
- [ ] 보안 그룹에 SSH 규칙이 있는가?
- [ ] 올바른 사용자 이름을 사용하는가? (ubuntu 또는 ec2-user)
- [ ] Cursor Remote SSH 설정에서 타임아웃이 충분한가?

## 📚 관련 문서

- [SSH 연결 문제 해결 가이드](./SSH_CONNECTION_TROUBLESHOOTING.md)
- [빠른 해결 가이드](../../SSH_QUICK_FIX.md)

