# 🚀 AWS EC2 배포 가이드

## 📋 개요

이 문서는 Deukgeun 프로젝트를 AWS EC2에 배포하는 방법을 설명합니다.

## 🎯 배포 아키텍처

```
Internet → EC2 Instance (Port 80, 443, 5000)
                ↓
    ┌─────────────────────────────────┐
    │  Frontend (Port 80)            │
    │  - React SPA                   │
    │  - Nginx/Serve                 │
    └─────────────────────────────────┘
                ↓
    ┌─────────────────────────────────┐
    │  Backend API (Port 5000)       │
    │  - Node.js + Express           │
    │  - TypeORM + MySQL             │
    └─────────────────────────────────┘
                ↓
    ┌─────────────────────────────────┐
    │  MySQL Database (Port 3306)    │
    │  - Local MySQL Instance        │
    └─────────────────────────────────┘
```

## 🔧 사전 요구사항

### 1. AWS 계정 및 EC2 인스턴스

- AWS 계정
- EC2 인스턴스 (Ubuntu 20.04+ 권장)
- 보안 그룹 설정 (SSH, HTTP, HTTPS, Custom TCP 5000)

### 2. 도메인 및 SSL (선택사항)

- 도메인 이름
- SSL 인증서

## 🚀 배포 단계

### 1단계: EC2 인스턴스 준비

#### 1.1 보안 그룹 설정

```
Inbound Rules:
- SSH (22) - 0.0.0.0/0
- HTTP (80) - 0.0.0.0/0
- HTTPS (443) - 0.0.0.0/0
- Custom TCP (5000) - 0.0.0.0/0
```

#### 1.2 EC2 인스턴스에 연결

```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### 2단계: 시스템 업데이트 및 기본 도구 설치

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 도구 설치
sudo apt install -y curl wget git build-essential

# Node.js 18.x 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 버전 확인
node --version
npm --version
```

### 3단계: 프로젝트 클론 및 설정

```bash
# 프로젝트 클론
git clone https://github.com/your-username/deukgeun.git
cd deukgeun

# 환경 변수 파일 생성
cp .env.production.example .env.production
nano .env.production
```

#### 3.1 환경 변수 설정 (.env.production)

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=deukgeun_user
DB_PASSWORD=your_secure_password_here
DB_NAME=deukgeun_production
DB_ROOT_PASSWORD=your_root_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_production
JWT_ACCESS_SECRET=your_access_secret_here_production
JWT_REFRESH_SECRET=your_refresh_secret_here_production

# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_PORT=80
```

### 4단계: 자동 배포 스크립트 실행

```bash
# 스크립트 실행 권한 부여
chmod +x scripts/deploy-ec2.sh

# 배포 실행
./scripts/deploy-ec2.sh
```

## 🔍 배포 확인

### 1. 서비스 상태 확인

```bash
# PM2 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 서비스별 로그
pm2 logs deukgeun-backend
pm2 logs deukgeun-frontend
```

### 2. 헬스체크

```bash
# 백엔드 헬스체크
curl http://localhost:5000/health

# 프론트엔드 헬스체크
curl http://localhost:80/
```

### 3. 외부 접근 확인

```bash
# EC2 퍼블릭 IP로 접근
curl http://your-ec2-public-ip:80/
curl http://your-ec2-public-ip:5000/health
```

## 🛠️ 유지보수 명령어

### PM2 관리

```bash
# 서비스 상태 확인
pm2 status

# 서비스 재시작
pm2 restart all
pm2 restart deukgeun-backend
pm2 restart deukgeun-frontend

# 서비스 중지
pm2 stop all

# 서비스 삭제
pm2 delete all

# 로그 확인
pm2 logs
pm2 logs --lines 100
```

### 로그 확인

```bash
# PM2 로그
pm2 logs

# 시스템 로그
sudo journalctl -u pm2-ubuntu -f

# 애플리케이션 로그
tail -f logs/combined.log
tail -f logs/err.log
```

### 데이터베이스 관리

```bash
# MySQL 접속
sudo mysql -u root -p

# 데이터베이스 확인
SHOW DATABASES;
USE deukgeun_production;
SHOW TABLES;

# 백업 생성
mysqldump -u root -p deukgeun_production > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🔒 보안 설정

### 1. 방화벽 설정

```bash
# UFW 상태 확인
sudo ufw status

# UFW 활성화
sudo ufw enable

# 필요한 포트만 허용
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5000/tcp  # Backend API
```

### 2. SSH 보안 강화

```bash
# SSH 설정 파일 편집
sudo nano /etc/ssh/sshd_config

# 권장 설정
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2

# SSH 서비스 재시작
sudo systemctl restart sshd
```

## 📊 모니터링

### 1. 시스템 리소스 모니터링

```bash
# 시스템 상태 확인
htop
iotop
nethogs

# 디스크 사용량
df -h
du -sh /var/log/*

# 메모리 사용량
free -h
```

### 2. 애플리케이션 모니터링

```bash
# PM2 모니터링
pm2 monit

# 실시간 로그 모니터링
pm2 logs --lines 0 -f
```

## 🚨 문제 해결

### 1. 일반적인 문제들

#### 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :5000

# 프로세스 종료
sudo kill -9 <PID>
```

#### 메모리 부족

```bash
# 메모리 사용량 확인
free -h

# 스왑 메모리 생성
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 디스크 공간 부족

```bash
# 디스크 사용량 확인
df -h

# 로그 파일 정리
sudo find /var/log -name "*.log" -mtime +7 -delete
sudo find /var/log -name "*.gz" -mtime +30 -delete
```

### 2. 로그 분석

```bash
# 에러 로그 확인
grep -i error logs/combined.log
grep -i error logs/err.log

# 특정 시간대 로그 확인
grep "$(date '+%Y-%m-%d')" logs/combined.log
```

## 🔄 업데이트 및 배포

### 1. 코드 업데이트

```bash
# 최신 코드 가져오기
git pull origin main

# 의존성 업데이트
npm install

# 재배포
./scripts/deploy-ec2.sh
```

### 2. 롤백

```bash
# 이전 버전으로 되돌리기
git checkout HEAD~1

# 재배포
./scripts/deploy-ec2.sh
```

## 📞 지원 및 문의

문제가 발생하거나 추가 지원이 필요한 경우:

1. 로그 파일 확인
2. 시스템 리소스 상태 확인
3. 네트워크 연결 상태 확인
4. GitHub Issues에 문제 보고

## 📚 추가 리소스

- [PM2 공식 문서](https://pm2.keymetrics.io/docs/)
- [Node.js 프로덕션 모범 사례](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [AWS EC2 사용자 가이드](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/)
- [MySQL 8.0 참조 매뉴얼](https://dev.mysql.com/doc/refman/8.0/en/)
