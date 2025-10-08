# SSH 연결 문제 해결 가이드 (AWS 공식 문서 기반)

## 🔑 AWS 키 페어 구조 이해

### 키 페어 작동 원리
```
로컬 컴퓨터                    AWS EC2 인스턴스
┌─────────────────┐           ┌─────────────────┐
│ 개인키 (.pem)   │  ──────►  │ 공개키          │
│ - ZEV_AWS_KEY   │           │ - ~/.ssh/       │
│ - 보안 저장     │           │   authorized_keys│
└─────────────────┘           └─────────────────┘
```

**핵심 포인트:**
- AWS는 공개키를 인스턴스의 `~/.ssh/authorized_keys`에 저장
- 로컬의 개인키(.pem)와 매칭되어야 SSH 연결 성공
- **AWS는 개인키를 저장하지 않음** - 분실 시 복구 불가

## 🚨 현재 상황 분석
SSH 연결 실패의 근본 원인을 AWS 공식 구조에 따라 진단합니다.

## ✅ 해결된 문제들
- [x] PEM 파일 권한 문제 (Windows icacls로 해결)
- [x] SSH 키 파일 형식 (올바른 RSA 형식)
- [x] SSH 설정 최적화 (ssh-config 파일 생성)
- [x] Windows 권한 설정 (현재 사용자만 읽기 권한)

## ❌ 남은 핵심 문제 (우선순위별)
1. **AWS EC2 인스턴스 상태 문제** (최우선)
2. **키 페어 불일치 문제** (공개키/개인키 매칭 실패)
3. **네트워크 연결 실패** (Ping 테스트 실패)
4. **authorized_keys 파일 문제** (인스턴스 내부)

## 🔧 AWS 공식 진단 및 해결 방법

### 1단계: AWS EC2 인스턴스 상태 확인 (최우선)

#### 1-1. 인스턴스 기본 상태 확인
```bash
# AWS 콘솔에서 확인
AWS 콘솔 → EC2 → 인스턴스 → deukgeun 인스턴스
```

**필수 확인 사항:**
- [ ] **인스턴스 상태**: "running" (중지된 경우 시작 필요)
- [ ] **공개 IP 주소**: `3.36.230.117` (변경된 경우 새 IP 사용)
- [ ] **인스턴스 타입**: t2.micro 이상 (충분한 리소스)
- [ ] **부팅 상태**: "2/2 checks passed" (시스템 상태 정상)

#### 1-2. 보안 그룹 설정 확인
```bash
# AWS 콘솔에서 확인
AWS 콘솔 → EC2 → 보안 그룹 → deukgeun 보안 그룹
```

**필수 확인 사항:**
- [ ] **SSH 포트(22)**: 열림 상태
- [ ] **소스**: `0.0.0.0/0` (모든 IP 허용) 또는 현재 IP
- [ ] **프로토콜**: TCP
- [ ] **인바운드 규칙**: SSH 규칙 존재

### 2단계: 키 페어 검증 및 복구

#### 2-1. 키 페어 연결 상태 확인
```bash
# AWS 콘솔에서 확인
AWS 콘솔 → EC2 → 키 페어 → ZEV_AWS_KEY
```

**확인 사항:**
- [ ] **키 페어 이름**: ZEV_AWS_KEY 존재
- [ ] **키 타입**: RSA
- [ ] **지문**: 올바른 형식 (예: aa:bb:cc:dd...)
- [ ] **생성 날짜**: 최근 생성 또는 수정

#### 2-2. 키 페어 불일치 문제 해결

**문제 진단:**
```bash
# 로컬 키와 AWS 키 비교
ssh-keygen -y -f "./ZEV_AWS_KEY.pem" > local_public_key.pub
```

**해결 방법 A: 새 키 페어 생성 (권장)**
```bash
# AWS 콘솔에서 새 키 페어 생성
1. EC2 → 키 페어 → 키 페어 생성
2. 이름: ZEV_AWS_KEY_NEW
3. 키 페어 유형: RSA
4. 프라이빗 키 파일 형식: .pem
5. 다운로드 후 기존 키 교체
```

**해결 방법 B: 기존 키 페어 재연결**
```bash
# 인스턴스 중지 → 키 페어 변경 → 재시작
1. 인스턴스 중지 (Stop Instance)
2. 인스턴스 → 작업 → 보안 → 키 페어 수정
3. 새 키 페어 선택
4. 인스턴스 재시작
```

#### 2-3. 개인키 분실 시 복구 방법

**AWS Systems Manager Session Manager 사용 (권장)**
```bash
# AWS CLI 설치 후
aws ssm start-session --target i-1234567890abcdef0
```

**EC2 Instance Connect 사용**
```bash
# AWS 콘솔에서
EC2 → 인스턴스 → 연결 → EC2 Instance Connect
```

### 3단계: 네트워크 연결 진단

#### 3-1. 기본 네트워크 연결 테스트
```bash
# 1. Ping 테스트 (ICMP)
ping 3.36.230.117

# 2. 포트 연결 테스트 (SSH)
telnet 3.36.230.117 22
# 또는
nc -zv 3.36.230.117 22
```

#### 3-2. Windows 방화벽 및 보안 소프트웨어 확인
```bash
# Windows 방화벽 확인
제어판 → 시스템 및 보안 → Windows Defender 방화벽
```

**확인 사항:**
- [ ] **방화벽**: SSH 연결 허용
- [ ] **바이러스 백신**: 네트워크 차단 없음
- [ ] **VPN**: EC2 접근 차단 여부 확인
- [ ] **프록시**: 회사/학교 네트워크 제한

#### 3-3. 네트워크 환경별 해결책

**회사/학교 네트워크**
```bash
# 방화벽 우회 방법
1. 모바일 핫스팟 사용
2. 다른 네트워크에서 테스트
3. VPN 연결 해제 후 재시도
```

**가정 네트워크**
```bash
# 라우터 설정 확인
1. 포트 포워딩 설정
2. UPnP 활성화
3. DMZ 설정 (임시)
```

### 4단계: Windows 환경 최적화

#### 4-1. WSL 사용 (가장 권장)
```bash
# WSL 설치 후
wsl --install
wsl ssh -i ~/.ssh/ZEV_AWS_KEY.pem ubuntu@3.36.230.117
```

#### 4-2. Git Bash 사용
```bash
# Git Bash에서 SSH 연결
ssh -i "./ZEV_AWS_KEY.pem" ubuntu@3.36.230.117
```

#### 4-3. PowerShell 관리자 권한
```bash
# PowerShell을 관리자 권한으로 실행 후
ssh -i "./ZEV_AWS_KEY.pem" ubuntu@3.36.230.117
```

#### 4-4. SSH 클라이언트 대안
```bash
# PuTTY 사용
puttygen ZEV_AWS_KEY.pem -O private -o ZEV_AWS_KEY.ppk
putty -i ZEV_AWS_KEY.ppk ubuntu@3.36.230.117
```

### 5단계: 인스턴스 내부 authorized_keys 확인

#### 5-1. AWS Systems Manager로 인스턴스 접근
```bash
# AWS CLI 설치 후
aws configure
aws ssm start-session --target i-인스턴스ID
```

#### 5-2. authorized_keys 파일 확인
```bash
# 인스턴스 내부에서 실행
cat ~/.ssh/authorized_keys
ls -la ~/.ssh/
```

**확인 사항:**
- [ ] **authorized_keys 파일 존재**: `~/.ssh/authorized_keys`
- [ ] **권한 설정**: `600` (소유자만 읽기/쓰기)
- [ ] **공개키 내용**: 올바른 RSA 공개키 형식
- [ ] **디렉토리 권한**: `~/.ssh/` 디렉토리 권한 `700`

#### 5-3. authorized_keys 수동 복구
```bash
# 로컬에서 공개키 추출
ssh-keygen -y -f "./ZEV_AWS_KEY.pem" > public_key.pub

# 인스턴스에 공개키 추가 (Systems Manager 사용)
echo "추출된_공개키_내용" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 6단계: 프로젝트 배포 실행

#### 6-1. SSH 연결 최종 테스트
```bash
# 상세 로그와 함께 연결 테스트
ssh -v -i "./ZEV_AWS_KEY.pem" ubuntu@3.36.230.117
```

#### 6-2. 프로젝트 배포 스크립트 실행
```bash
# 1. 연결 테스트
./deploy-ssh-commands.sh test

# 2. 프로젝트 파일 전송
./deploy-ssh-commands.sh upload

# 3. 전체 배포 실행
./deploy-ssh-commands.sh deploy

# 4. 서비스 상태 확인
./deploy-ssh-commands.sh status
./deploy-ssh-commands.sh logs
```

## 🚀 사용 가능한 스크립트들

### 1. SSH 권한 수정 스크립트
```bash
# Windows 권한 수정
node scripts/ssh-permission-fixer.cjs
```

### 2. SSH 진단 스크립트
```bash
# SSH 연결 진단
node scripts/ssh-diagnostic.cjs
```

### 3. SSH 완전 해결 스크립트
```bash
# 종합 SSH 문제 해결
node scripts/ssh-complete-solution.cjs
```

### 4. 간단한 SSH 설정 스크립트
```bash
# 기본 SSH 설정
node scripts/simple-ssh-setup.cjs
```

## 📋 AWS 공식 체크리스트 (우선순위별)

### 1단계: AWS EC2 인스턴스 (최우선)
- [ ] **인스턴스 상태**: "running" (중지 시 시작)
- [ ] **시스템 상태**: "2/2 checks passed"
- [ ] **공개 IP**: `3.36.230.117` (변경 시 새 IP 사용)
- [ ] **보안 그룹**: SSH 포트(22) 열림, 소스 `0.0.0.0/0`
- [ ] **키 페어**: ZEV_AWS_KEY 연결됨

### 2단계: 키 페어 검증
- [ ] **로컬 개인키**: ZEV_AWS_KEY.pem 존재
- [ ] **키 형식**: 올바른 RSA 형식
- [ ] **키 권한**: 현재 사용자만 읽기 (600)
- [ ] **AWS 키 페어**: ZEV_AWS_KEY 존재, 올바른 지문
- [ ] **키 매칭**: 로컬 개인키 ↔ AWS 공개키 일치

### 3단계: 네트워크 연결
- [ ] **Ping 테스트**: `ping 3.36.230.117` 성공
- [ ] **포트 테스트**: `telnet 3.36.230.117 22` 성공
- [ ] **방화벽**: Windows 방화벽 SSH 허용
- [ ] **VPN/프록시**: EC2 접근 차단 없음
- [ ] **네트워크 환경**: 회사/학교 제한 없음

### 4단계: 인스턴스 내부 (Systems Manager 사용)
- [ ] **authorized_keys**: `~/.ssh/authorized_keys` 존재
- [ ] **파일 권한**: `600` (소유자만 읽기/쓰기)
- [ ] **디렉토리 권한**: `~/.ssh/` 권한 `700`
- [ ] **공개키 내용**: 올바른 RSA 공개키 형식
- [ ] **SSH 서비스**: `systemctl status ssh` 활성

### 5단계: 최종 연결 테스트
- [ ] **SSH 연결**: `ssh -v -i "./ZEV_AWS_KEY.pem" ubuntu@3.36.230.117`
- [ ] **파일 전송**: `scp` 명령어 성공
- [ ] **배포 스크립트**: `./deploy-ssh-commands.sh test` 성공
- [ ] **서비스 실행**: 프로젝트 정상 배포

## 🔍 고급 진단 및 해결 방법

### 1. 상세 SSH 로그 분석
```bash
# 가장 상세한 로그 (디버깅용)
ssh -vvv -i "./ZEV_AWS_KEY.pem" ubuntu@3.36.230.117

# 일반적인 상세 로그
ssh -v -i "./ZEV_AWS_KEY.pem" ubuntu@3.36.230.117
```

**로그에서 확인할 사항:**
- `Offering public key` → 키 인증 시도
- `Permission denied (publickey)` → 키 불일치
- `Connection refused` → 네트워크/포트 문제
- `Host key verification failed` → 호스트 키 문제

### 2. 네트워크 연결 종합 테스트
```bash
# 1. Ping 테스트 (ICMP)
ping -c 4 3.36.230.117

# 2. 포트 연결 테스트 (SSH)
telnet 3.36.230.117 22
# 또는
nc -zv 3.36.230.117 22

# 3. 라우팅 테스트
tracert 3.36.230.117
```

### 3. SSH 설정 파일 최적화
```bash
# SSH 설정 파일 사용
ssh -F ssh-config deukgeun-ec2

# SSH 설정 파일 내용 확인
cat ssh-config
```

### 4. AWS CLI를 통한 인스턴스 관리
```bash
# AWS CLI 설치 및 설정
aws configure

# 인스턴스 상태 확인
aws ec2 describe-instances --instance-ids i-인스턴스ID

# 보안 그룹 확인
aws ec2 describe-security-groups --group-ids sg-보안그룹ID

# 키 페어 확인
aws ec2 describe-key-pairs --key-names ZEV_AWS_KEY
```

## 🚨 긴급 복구 방법

### 개인키 완전 분실 시
```bash
# 1. AWS Systems Manager Session Manager
aws ssm start-session --target i-인스턴스ID

# 2. EC2 Instance Connect (브라우저)
# AWS 콘솔 → EC2 → 인스턴스 → 연결 → EC2 Instance Connect

# 3. 새 키 페어 생성 및 교체
# 인스턴스 중지 → 키 페어 변경 → 재시작
```

### 인스턴스 완전 접근 불가 시
```bash
# 1. 인스턴스 재시작
aws ec2 reboot-instances --instance-ids i-인스턴스ID

# 2. 새 인스턴스 생성 (최후 수단)
# AMI 생성 → 새 인스턴스 시작 → 데이터 마이그레이션
```

## 📞 문제 지속 시 대안

### 1. AWS 지원 티켓 생성
- AWS 콘솔 → 지원 → 지원 센터 → 케이스 생성
- 기술 지원 요청 (유료 서비스)

### 2. 다른 네트워크 환경에서 테스트
```bash
# 모바일 핫스팟 사용
# 다른 인터넷 연결로 테스트
# VPN 연결 해제 후 재시도
```

### 3. 대안 SSH 클라이언트 사용
```bash
# PuTTY (Windows)
putty -i ZEV_AWS_KEY.ppk ubuntu@3.36.230.117

# MobaXterm (Windows)
# WinSCP (Windows)
```

## 🎯 최종 성공 확인

SSH 연결이 성공하면 다음 명령어로 프로젝트를 배포할 수 있습니다:

```bash
# 1. 연결 테스트
./deploy-ssh-commands.sh test

# 2. 프로젝트 전송
./deploy-ssh-commands.sh upload

# 3. 전체 배포
./deploy-ssh-commands.sh deploy

# 4. 서비스 관리
./deploy-ssh-commands.sh status
./deploy-ssh-commands.sh logs
```

---

## 📚 AWS 공식 문서 참조

- [EC2 키 페어 관리](https://docs.aws.amazon.com/ec2/latest/userguide/ec2-key-pairs.html)
- [SSH를 사용한 EC2 인스턴스 연결](https://docs.aws.amazon.com/ec2/latest/userguide/AccessingInstancesLinux.html)
- [Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
- [EC2 Instance Connect](https://docs.aws.amazon.com/ec2/latest/userguide/ec2-instance-connect.html)

**참고**: 이 가이드는 AWS 공식 문서를 기반으로 deukgeun 프로젝트의 SSH 연결 문제를 체계적으로 해결하기 위해 작성되었습니다. 문제가 지속되면 AWS 콘솔에서 EC2 인스턴스 상태를 확인하는 것이 가장 중요합니다.
