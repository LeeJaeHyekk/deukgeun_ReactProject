# EC2 Amazon Linux 2023 배포 명령어 가이드

## 📋 빠른 시작

### 1️⃣ SSH 연결
```bash
# Amazon Linux 2023 사용자: ec2-user
ssh -i deukgeun_ReactProject.pem ec2-user@43.203.30.167

# 또는 이미 설정된 SSH config 사용
ssh deukgeun-ec2-amazon
```

### 2️⃣ 프로젝트 디렉토리로 이동
```bash
cd ~/deukgeun_ReactProject/deukgeun
# 또는 프로젝트가 다른 위치에 있다면 해당 경로로 이동
```

### 3️⃣ 통합 배포 스크립트 실행 (권장)
```bash
# 전체 배포 자동 실행 (모든 단계 포함)
npm run deploy:ec2
```

또는 직접 스크립트 실행:
```bash
bash scripts/ec2-integrated-deploy.sh
```

---

## 🔧 단계별 명령어

### 1. 시스템 환경 확인 및 필수 패키지 설치
```bash
# 배포 스크립트가 자동으로 수행하지만, 수동으로 확인하려면:

# OS 확인
cat /etc/os-release

# Node.js 확인
node --version  # 18.x 이상 필요

# npm 확인
npm --version

# PM2 확인
pm2 --version

# nginx 확인
nginx -v

# Git 확인
git --version
```

### 2. 프로젝트 의존성 설치
```bash
# package.json 확인
cat package.json

# 의존성 설치
npm install
```

### 3. 환경 변수 설정
```bash
# .env 파일 확인/생성
nano .env
```

**.env 파일 내용 예시:**
```env
NODE_ENV=production
MODE=production
PORT=5000
FRONTEND_PORT=80
DATABASE_URL=postgresql://localhost:5432/deukgeun
JWT_SECRET=your-jwt-secret-here
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
VITE_BACKEND_URL=http://43.203.30.167:5000
VITE_FRONTEND_URL=https://devtrail.net
CORS_ORIGIN=https://devtrail.net,https://www.devtrail.net,http://43.203.30.167:3000,http://43.203.30.167:5000
```

### 4. 빌드 실행
```bash
# 전체 빌드 (프론트엔드 + 백엔드)
npm run build

# 또는 백엔드만 빌드
npm run build:backend

# 또는 프론트엔드만 빌드
npm run build:frontend
```

### 5. PM2 서비스 시작
```bash
# PM2로 백엔드 시작
pm2 start ecosystem.config.cjs --env production

# PM2 상태 확인
pm2 status

# PM2 로그 확인
pm2 logs

# PM2 모니터링
pm2 monit
```

### 6. Nginx 설정 및 시작
```bash
# nginx 설정 파일 확인
sudo nginx -t

# nginx 시작
sudo systemctl start nginx

# nginx 상태 확인
sudo systemctl status nginx

# nginx 자동 시작 설정
sudo systemctl enable nginx
```

### 7. 방화벽 설정 (Amazon Linux 2023 - firewalld)
```bash
# firewalld 상태 확인
sudo systemctl status firewalld

# firewalld 시작
sudo systemctl start firewalld

# firewalld 자동 시작 설정
sudo systemctl enable firewalld

# 필수 포트 허용
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=5000/tcp

# 방화벽 규칙 적용
sudo firewall-cmd --reload

# 방화벽 규칙 확인
sudo firewall-cmd --list-all
```

---

## 🚀 통합 배포 스크립트 (권장)

### 전체 배포 자동 실행
```bash
# EC2 인스턴스에서 실행
npm run deploy:ec2
```

이 명령어는 다음을 자동으로 수행합니다:
1. ✅ 시스템 환경 확인 (OS, 패키지 매니저 자동 감지)
2. ✅ Node.js, npm, PM2, nginx, Git 설치 확인
3. ✅ 프로젝트 의존성 설치
4. ✅ 환경 변수 설정
5. ✅ 백업 생성
6. ✅ TypeScript 컴파일
7. ✅ 프로젝트 빌드
8. ✅ 데이터베이스 설정 (선택)
9. ✅ 방화벽 설정 (firewalld)
10. ✅ Nginx 설정
11. ✅ PM2 서비스 시작
12. ✅ 서비스 상태 확인
13. ✅ 로그 모니터링 설정

---

## 📊 서비스 관리 명령어

### PM2 관리
```bash
# 서비스 시작
pm2 start ecosystem.config.cjs --env production

# 서비스 중지
pm2 stop ecosystem.config.cjs

# 서비스 재시작
pm2 restart ecosystem.config.cjs

# 서비스 삭제
pm2 delete ecosystem.config.cjs

# 서비스 상태 확인
pm2 status

# 서비스 로그 확인
pm2 logs

# 서비스 모니터링
pm2 monit

# PM2 자동 시작 설정
pm2 startup
pm2 save
```

### Nginx 관리
```bash
# nginx 시작
sudo systemctl start nginx

# nginx 중지
sudo systemctl stop nginx

# nginx 재시작
sudo systemctl restart nginx

# nginx 상태 확인
sudo systemctl status nginx

# nginx 설정 테스트
sudo nginx -t

# nginx 로그 확인
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 방화벽 관리 (firewalld)
```bash
# 방화벽 상태 확인
sudo firewall-cmd --state

# 방화벽 규칙 확인
sudo firewall-cmd --list-all

# 특정 포트 열기
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload

# 특정 포트 닫기
sudo firewall-cmd --permanent --remove-port=5000/tcp
sudo firewall-cmd --reload

# 방화벽 중지 (주의!)
sudo systemctl stop firewalld
```

---

## 🔍 문제 해결 명령어

### 로그 확인
```bash
# PM2 로그
pm2 logs

# Nginx 로그
sudo tail -f /var/log/nginx/error.log

# 시스템 로그
sudo journalctl -u nginx
sudo journalctl -u firewalld
```

### 서비스 상태 확인
```bash
# 모든 서비스 상태 확인
pm2 status
sudo systemctl status nginx
sudo systemctl status firewalld

# 포트 사용 확인
sudo netstat -tlnp | grep -E ':(80|443|5000)'
# 또는
sudo ss -tlnp | grep -E ':(80|443|5000)'
```

### 프로세스 확인
```bash
# Node.js 프로세스 확인
ps aux | grep node

# PM2 프로세스 확인
pm2 list

# Nginx 프로세스 확인
ps aux | grep nginx
```

---

## 📝 주요 디렉토리 경로

```bash
# 프로젝트 루트
~/deukgeun_ReactProject/deukgeun

# 빌드 결과
~/deukgeun_ReactProject/deukgeun/dist

# 로그 파일
~/deukgeun_ReactProject/deukgeun/logs

# 백업 파일
~/deukgeun_ReactProject/deukgeun/backups

# Nginx 설정
/etc/nginx/nginx.conf

# Nginx 로그
/var/log/nginx/
```

---

## ⚠️ 주의사항

1. **사용자 이름**: Amazon Linux 2023은 `ec2-user` 사용 (Ubuntu는 `ubuntu`)
2. **패키지 매니저**: Amazon Linux 2023은 `dnf` 또는 `yum` 사용 (Ubuntu는 `apt-get`)
3. **방화벽**: Amazon Linux 2023은 `firewalld` 사용 (Ubuntu는 `ufw`)
4. **PostgreSQL 서비스**: 서비스 이름이 `postgresql-15` 또는 `postgresql15`일 수 있음

---

## 🎯 빠른 참조

```bash
# 전체 배포 (한 번에)
npm run deploy:ec2

# 서비스 상태 확인
pm2 status && sudo systemctl status nginx

# 서비스 재시작
pm2 restart ecosystem.config.cjs && sudo systemctl restart nginx

# 로그 확인
pm2 logs && sudo tail -f /var/log/nginx/error.log
```

