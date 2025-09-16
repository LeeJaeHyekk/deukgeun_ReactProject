# Deukgeun EC2 배포 가이드

이 가이드는 Deukgeun 프로젝트를 AWS EC2에 배포하는 방법을 설명합니다.

## 📋 목차

1. [사전 준비](#사전-준비)
2. [EC2 인스턴스 설정](#ec2-인스턴스-설정)
3. [배포 스크립트 사용법](#배포-스크립트-사용법)
4. [문제 해결](#문제-해결)
5. [보안 설정](#보안-설정)

## 🚀 사전 준비

### 1. EC2 인스턴스 생성

- **인스턴스 타입**: t3.medium 이상 권장
- **운영체제**: Ubuntu 20.04 LTS 또는 CentOS 7+
- **보안 그룹**: 다음 포트들을 열어주세요
  - SSH (22)
  - HTTP (80) - Nginx 사용시
  - Custom TCP (3000) - Frontend
  - Custom TCP (5000) - Backend
  - MySQL (3306) - 데이터베이스 연결시

### 2. 프로젝트 업로드

```bash
# Git을 사용한 경우
git clone <your-repository-url>
cd deukgeun

# 또는 SCP를 사용한 경우
scp -i your-key.pem -r ./deukgeun ubuntu@your-ec2-ip:/home/ubuntu/
```

## ⚙️ EC2 인스턴스 설정

### 1. 기본 패키지 설치

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y curl wget git

# CentOS/RHEL
sudo yum update -y
sudo yum install -y curl wget git
```

### 2. 프로젝트 디렉토리로 이동

```bash
cd deukgeun
```

## 🛠️ 배포 스크립트 사용법

### 1. 배포 테스트 (권장)

먼저 배포 테스트를 실행하여 모든 것이 정상적으로 작동하는지 확인합니다:

```bash
# 실행 권한 부여
chmod +x scripts/test-deployment.sh

# 배포 테스트 실행
./scripts/test-deployment.sh
```

**테스트 스크립트 기능:**

- 환경 설정 확인 (.env 파일 생성)
- 의존성 확인 및 설치
- 빌드 테스트 (백엔드 + 프론트엔드)
- PM2 서비스 시작 및 테스트
- 헬스체크 테스트

### 2. 실제 배포

테스트가 성공하면 실제 배포를 진행합니다:

```bash
# 실행 권한 부여
chmod +x scripts/deploy-ec2.sh

# 기본 배포
./scripts/deploy-ec2.sh

# Nginx 프록시와 함께 배포 (권장)
./scripts/deploy-ec2.sh --nginx
```

**배포 스크립트 기능:**

- 시스템 업데이트
- Node.js 설치/확인
- 방화벽 설정
- 프로덕션 빌드
- PM2 서비스 시작
- 부팅시 자동시작 설정
- Nginx 프록시 설정 (선택사항)

## 🔧 환경 변수 설정

### 1. 루트 .env 파일

```bash
# env.example을 복사하여 .env 파일 생성
cp env.example .env

# .env 파일 편집
nano .env
```

### 2. 백엔드 .env 파일

```bash
# 백엔드 환경 변수 설정
cp src/backend/env.sample src/backend/.env

# 백엔드 .env 파일 편집
nano src/backend/.env
```

**중요한 환경 변수들:**

- `DATABASE_HOST`: 데이터베이스 호스트
- `DATABASE_PORT`: 데이터베이스 포트 (기본: 3306)
- `DATABASE_USERNAME`: 데이터베이스 사용자명
- `DATABASE_PASSWORD`: 데이터베이스 비밀번호
- `DATABASE_NAME`: 데이터베이스 이름
- `JWT_SECRET`: JWT 토큰 시크릿
- `NODE_ENV`: production

## 📊 서비스 관리

### PM2 명령어

```bash
# 서비스 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 실시간 로그
pm2 logs --follow

# 서비스 재시작
pm2 restart all

# 서비스 중지
pm2 stop all

# 서비스 삭제
pm2 delete all

# PM2 저장 (부팅시 자동시작용)
pm2 save

# PM2 부팅시 자동시작 설정
pm2 startup
```

### 개별 서비스 관리

```bash
# 백엔드만 재시작
pm2 restart deukgeun-backend

# 프론트엔드만 재시작
pm2 restart deukgeun-frontend

# 백엔드 로그만 확인
pm2 logs deukgeun-backend

# 프론트엔드 로그만 확인
pm2 logs deukgeun-frontend
```

## 🚨 문제 해결

### 1. 빌드 실패

```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 백엔드 의존성 재설치
cd src/backend
rm -rf node_modules package-lock.json
npm install
cd ../..
```

### 2. 서비스 시작 실패

```bash
# PM2 로그 확인
pm2 logs --lines 50

# 환경 변수 확인
cat .env
cat src/backend/.env

# 포트 사용 확인
sudo netstat -tlnp | grep :5000
sudo netstat -tlnp | grep :3000
```

### 3. 데이터베이스 연결 실패

```bash
# 데이터베이스 연결 테스트
cd src/backend
npx ts-node scripts/test-db-connection.ts
```

### 4. 메모리 부족

```bash
# 메모리 사용량 확인
free -h
pm2 monit

# PM2 메모리 제한 설정 (ecosystem.config.js에서)
max_memory_restart: '1G'
```

## 🔒 보안 설정

### 1. SSH 키 설정

```bash
# SSH 키 생성 (로컬에서)
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# 공개키를 EC2에 복사
ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@your-ec2-ip
```

### 2. 방화벽 설정

```bash
# UFW 사용 (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 5000/tcp
sudo ufw enable

# firewalld 사용 (CentOS)
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

### 3. 환경 변수 보안

```bash
# .env 파일 권한 설정
chmod 600 .env
chmod 600 src/backend/.env

# 백업 파일 삭제
rm -f .env.bak
rm -f src/backend/.env.bak
```

## 📈 모니터링

### 1. 시스템 모니터링

```bash
# 시스템 리소스 확인
htop
df -h
free -h

# PM2 모니터링
pm2 monit
```

### 2. 로그 모니터링

```bash
# 실시간 로그 확인
pm2 logs --follow

# 로그 파일 위치
tail -f logs/backend-combined.log
tail -f logs/frontend-combined.log
```

## 🔄 업데이트 및 배포

### 1. 코드 업데이트

```bash
# Git을 사용한 경우
git pull origin main

# 수동 업데이트의 경우
# 새 파일들을 업로드 후
```

### 2. 재배포

```bash
# 서비스 중지
pm2 stop all

# 새 빌드
npm run build:full:production

# 서비스 재시작
pm2 start ecosystem.config.js --env production
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. **로그 확인**: `pm2 logs --lines 50`
2. **환경 변수**: `.env` 파일들이 올바르게 설정되었는지
3. **포트 사용**: 필요한 포트들이 열려있는지
4. **의존성**: 모든 패키지가 올바르게 설치되었는지
5. **권한**: 파일 권한이 올바른지

---

**참고**: 이 가이드는 Ubuntu 20.04 LTS와 CentOS 7+ 환경에서 테스트되었습니다. 다른 운영체제에서는 일부 명령어가 다를 수 있습니다.
