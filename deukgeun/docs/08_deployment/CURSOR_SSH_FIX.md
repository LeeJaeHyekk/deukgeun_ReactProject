# Cursor Remote SSH 연결 문제 해결

## 🔥 즉시 해결 방법

### 문제: "Failed to install server within the timeout" 또는 "Connection timed out during banner exchange"

### 해결 방법 1: SSH Config 파일 수동 수정 (권장)

**파일 위치**: `C:\Users\jaehyuok\.ssh\config`

**수정 내용**:
1. 파일을 관리자 권한으로 열기 (메모장 등)
2. `deukgeun-ec2` 호스트 설정을 다음으로 교체:

```bash
# Deukgeun EC2 Server - Cursor Remote SSH (Ubuntu)
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
    IdentitiesOnly yes
```

**주의사항**:
- `IdentityFile` 경로에 **따옴표**가 있어야 합니다
- `ConnectTimeout`을 120초로 증가했습니다
- `IdentitiesOnly yes` 추가 (키 파일만 사용)

### 해결 방법 2: PowerShell에서 직접 수정

```powershell
# PowerShell 관리자 권한으로 실행
$configPath = "$env:USERPROFILE\.ssh\config"
$config = Get-Content $configPath -Raw

# 기존 deukgeun-ec2 설정 제거 (정규식으로)
$config = $config -replace "(?s)Host deukgeun-ec2.*?(?=Host |$)", ""

# 새 설정 추가
$newConfig = @"

# Deukgeun EC2 Server - Cursor Remote SSH (Ubuntu)
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
    IdentitiesOnly yes

"@

Add-Content -Path $configPath -Value $newConfig
```

### 해결 방법 3: Cursor 설정 확인

1. **Cursor 설정 열기**: `Ctrl+,`
2. **"remote.SSH"** 검색
3. 다음 설정 확인:
   - `remote.SSH.connectTimeout`: `120` (기본값보다 증가)
   - `remote.SSH.configFile`: `C:\Users\jaehyuok\.ssh\config`
   - `remote.SSH.showLoginTerminal`: `true`

### 해결 방법 4: SSH 키 파일 권한 확인

```powershell
# PowerShell 관리자 권한으로 실행
$keyPath = "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"

# 권한 확인
icacls $keyPath

# 권한 수정
icacls $keyPath /inheritance:r /grant:r "${env:USERNAME}:R"
```

### 해결 방법 5: EC2 인스턴스 상태 확인

1. **AWS 콘솔** 접속
2. **EC2 → 인스턴스**
3. IP 주소 `43.203.30.167` 확인
4. **상태**: "running"
5. **상태 검사**: "2/2 checks passed"
6. **보안 그룹**: SSH (포트 22) 규칙 확인

### 해결 방법 6: 타임아웃 증가

Cursor의 Remote SSH 설정에서 타임아웃 증가:

```json
{
  "remote.SSH.connectTimeout": 120,
  "remote.SSH.serverInstallTimeout": 300,
  "remote.SSH.showLoginTerminal": true
}
```

### 해결 방법 7: 직접 SSH 연결 테스트

Git Bash에서 직접 연결 테스트:

```bash
# Git Bash에서
ssh -v -i deukgeun_ReactProject.pem ubuntu@43.203.30.167

# 또는
ssh -v -F "$HOME/.ssh/config" deukgeun-ec2
```

**성공하면**: Cursor 설정 문제
**실패하면**: 네트워크 또는 EC2 인스턴스 문제

## 📝 체크리스트

- [ ] Windows SSH Config 파일 (`C:\Users\jaehyuok\.ssh\config`)에 `deukgeun-ec2` 호스트 추가
- [ ] `IdentityFile` 경로에 따옴표 추가
- [ ] `ConnectTimeout` 120초로 설정
- [ ] `IdentitiesOnly yes` 추가
- [ ] SSH 키 파일 권한 설정 (icacls)
- [ ] EC2 인스턴스 상태 확인 (running)
- [ ] 보안 그룹 SSH 규칙 확인 (포트 22)
- [ ] Cursor Remote SSH 타임아웃 설정 증가

## 🚀 빠른 수정 명령어

### PowerShell (관리자 권한)
```powershell
# 1. SSH Config 파일 열기
notepad "$env:USERPROFILE\.ssh\config"

# 2. SSH 키 파일 권한 수정
icacls "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem" /inheritance:r /grant:r "${env:USERNAME}:R"
```

### Git Bash
```bash
# SSH 연결 테스트
ssh -v -i deukgeun_ReactProject.pem ubuntu@43.203.30.167
```

## 🔥 즉시 해결 방법 (빠른 참조)

### SSH Config 파일 수정

**파일 위치**: `C:\Users\jaehyuok\.ssh\config`

**메모장으로 열기** (관리자 권한):
```powershell
notepad "$env:USERPROFILE\.ssh\config"
```

**다음 내용으로 교체 또는 추가**:

```bash
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
    IdentitiesOnly yes
```

**중요**: `IdentityFile` 경로에 **따옴표**가 있어야 합니다!

### SSH 키 파일 권한 설정

**PowerShell 관리자 권한으로 실행**:
```powershell
icacls "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem" /inheritance:r /grant:r "${env:USERNAME}:R"
```

### Cursor 설정 확인

1. **Cursor 설정**: `Ctrl+,`
2. **"remote.SSH.connectTimeout"** 검색
3. 값 변경: `30` → `120`

### Cursor에서 다시 연결

1. **명령 팔레트**: `Ctrl+Shift+P`
2. **"Remote-SSH: Connect to Host"** 선택
3. **"deukgeun-ec2"** 선택

## 🆘 여전히 실패하는 경우

### EC2 인스턴스 상태 확인

1. AWS 콘솔 → EC2 → 인스턴스
2. 상태가 "running"인지 확인
3. 보안 그룹에서 SSH (포트 22) 규칙 확인

### 직접 SSH 연결 테스트

**Git Bash에서**:
```bash
ssh -v -i deukgeun_ReactProject.pem ubuntu@43.203.30.167
```

**성공하면**: Cursor 설정 문제
**실패하면**: EC2 인스턴스 또는 네트워크 문제

## 📚 상세 가이드

- [Cursor Remote SSH 설정 가이드](./CURSOR_REMOTE_SSH_SETUP.md)
- [SSH 연결 문제 해결 가이드](./SSH_CONNECTION_TROUBLESHOOTING.md)

