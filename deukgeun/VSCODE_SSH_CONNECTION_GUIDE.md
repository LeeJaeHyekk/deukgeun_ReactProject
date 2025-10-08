# 🔗 VS Code Remote-SSH 연결 가이드

## 📋 사전 준비사항

### ✅ 필요한 것들
1. **VS Code** 설치
2. **Remote-SSH 확장** 설치
3. **SSH 키 파일**: `deukgeun_ReactProject.pem`
4. **EC2 인스턴스 정보**:
   - IP 주소: `43.203.30.167` (기존)
   - 새 IP 주소: `YOUR_NEW_IP_ADDRESS` (새 인스턴스)
   - 사용자: `ubuntu`
   - 포트: `22`

## 🚀 VS Code Remote-SSH 연결 방법

### 1️⃣ Remote-SSH 확장 설치

1. VS Code 열기
2. 확장 탭 (Ctrl + Shift + X) 클릭
3. "Remote - SSH" 검색
4. **Remote - SSH** 확장 설치
5. **Remote - SSH: Editing Configuration Files** 확장도 설치

### 2️⃣ SSH 설정 파일 확인

SSH 설정 파일이 다음 위치에 있는지 확인:
```
C:\Users\jaehyuok\.ssh\config
```

**현재 설정 내용:**
```
Host deukgeun-ec2
    HostName 43.203.30.167
    User ubuntu
    Port 22
    IdentityFile "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 30
    TCPKeepAlive yes
    Compression yes
    LogLevel QUIET

Host deukgeun-ec2-new
    HostName YOUR_NEW_IP_ADDRESS
    User ubuntu
    Port 22
    IdentityFile "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 30
    TCPKeepAlive yes
    Compression yes
    LogLevel QUIET
```

### 3️⃣ 새 인스턴스 IP 주소 설정

**새로운 EC2 인스턴스의 IP 주소를 확인하고 설정하세요:**

1. AWS 콘솔에서 새 인스턴스의 **퍼블릭 IP 주소** 확인
2. SSH 설정 파일에서 `YOUR_NEW_IP_ADDRESS`를 실제 IP로 변경

**예시:**
```
Host deukgeun-ec2-new
    HostName 54.123.45.67  # 실제 새 인스턴스 IP
    User ubuntu
    Port 22
    IdentityFile "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
    # ... 나머지 설정
```

### 4️⃣ VS Code에서 연결

#### 방법 1: Command Palette 사용 (권장)

1. **Ctrl + Shift + P** 누르기
2. **"Remote-SSH: Connect to Host..."** 입력
3. 다음 중 하나 선택:
   - `deukgeun-ec2` (기존 인스턴스)
   - `deukgeun-ec2-new` (새 인스턴스)
4. 새 VS Code 창이 열리면서 연결 시작

#### 방법 2: Remote Explorer 사용

1. **Remote Explorer** 아이콘 클릭 (왼쪽 사이드바)
2. **"+"** 버튼 클릭
3. SSH 명령어 입력:
   ```
   ssh deukgeun-ec2-new
   ```
4. 또는 설정된 호스트 선택

#### 방법 3: 직접 SSH 명령어

1. **Ctrl + Shift + P** 누르기
2. **"Remote-SSH: Connect to Host..."** 입력
3. 다음 명령어 입력:
   ```
   ssh -i "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem" ubuntu@YOUR_NEW_IP_ADDRESS
   ```

### 5️⃣ 연결 후 작업

연결 성공 후:

1. **터미널 열기**: `Ctrl + `` (백틱)
2. **프로젝트 디렉토리로 이동**:
   ```bash
   cd /home/ubuntu
   ```
3. **프로젝트 클론** (필요한 경우):
   ```bash
   git clone https://github.com/jaehyeokZEV/deukgeun_ReactProject.git
   cd deukgeun_ReactProject/deukgeun
   ```

## 🔧 문제 해결

### SSH 연결 실패 시

#### 1. SSH 키 권한 확인
```bash
# Windows에서
icacls "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem" /inheritance:r /grant:r "jaehyuok:R"
```

#### 2. SSH 설정 파일 권한 확인
```bash
# Windows에서
icacls "C:\Users\jaehyuok\.ssh\config" /inheritance:r /grant:r "jaehyuok:F"
```

#### 3. EC2 인스턴스 상태 확인
- AWS 콘솔에서 인스턴스가 "running" 상태인지 확인
- 보안 그룹에서 SSH 포트(22)가 열려있는지 확인
- 키 페어가 올바르게 연결되어 있는지 확인

#### 4. 네트워크 연결 확인
```bash
# PowerShell에서
ping YOUR_NEW_IP_ADDRESS
```

### VS Code 연결 문제 해결

#### 1. Remote-SSH 확장 재설치
1. VS Code에서 확장 제거
2. VS Code 재시작
3. 확장 다시 설치

#### 2. SSH 설정 파일 수정
1. **Ctrl + Shift + P** → **"Remote-SSH: Open SSH Configuration File..."**
2. 설정 파일 편집
3. 저장 후 다시 연결 시도

#### 3. 연결 로그 확인
1. **Ctrl + Shift + P** → **"Remote-SSH: Show Log"**
2. 오류 메시지 확인
3. 문제 해결

## 📝 추가 설정

### 자동 연결 설정

SSH 설정 파일에 다음 추가:
```
Host deukgeun-ec2-new
    # ... 기존 설정 ...
    ServerAliveInterval 60
    ServerAliveCountMax 3
    TCPKeepAlive yes
```

### 포트 포워딩 설정

VS Code에서 포트 포워딩:
1. **Ctrl + Shift + P** → **"Remote-SSH: Forward Port from Active Host..."**
2. 포트 번호 입력 (예: 4000, 3000)
3. 로컬에서 `localhost:4000`으로 접근 가능

## 🎯 사용 팁

### 1. 여러 인스턴스 관리
- 각 인스턴스마다 다른 Host 이름 사용
- IP 주소 변경 시 SSH 설정 파일만 수정

### 2. 프로젝트 동기화
- Git을 사용하여 코드 동기화
- VS Code의 Sync 기능 활용

### 3. 확장 프로그램 동기화
- Remote-SSH 연결 시 로컬 확장 프로그램이 자동 설치됨
- 필요한 확장 프로그램 미리 설치

## 📞 지원

문제가 발생하면:

1. **SSH 연결 테스트**: Git Bash에서 `ssh deukgeun-ec2-new` 실행
2. **VS Code 로그 확인**: Remote-SSH 로그 확인
3. **네트워크 확인**: 방화벽, VPN 설정 확인
4. **AWS 콘솔 확인**: EC2 인스턴스 상태 및 보안 그룹

---

**생성일**: 2024년 12월 19일  
**마지막 업데이트**: 2024년 12월 19일
