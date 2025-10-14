# 🏋️ Deukgeun - 완전 통합 가이드

> **Deukgeun**은 헬스장에서 운동하는 사람들을 위한 종합적인 운동 가이드 플랫폼입니다. 이 문서는 프로젝트의 모든 설정, 배포, 관리 방법을 통합한 완전한 가이드입니다.

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [빠른 시작](#빠른-시작)
- [빌드 시스템](#빌드-시스템)
- [환경 설정](#환경-설정)
- [SSH 및 AWS 설정](#ssh-및-aws-설정)
- [EC2 배포 가이드](#ec2-배포-가이드)
- [PM2 관리](#pm2-관리)
- [Nginx 관리](#nginx-관리)
- [통합 실행 스크립트](#통합-실행-스크립트)
- [자동 컴파일 시스템](#자동-컴파일-시스템)
- [테스트](#테스트)
- [문제 해결](#문제-해결)
- [보안](#보안)
- [기여하기](#기여하기)

---

## 🎯 프로젝트 개요

Deukgeun은 다음과 같은 문제를 해결합니다:

- **헬스장 초보자의 어려움**: 머신 사용법을 모르는 사용자를 위한 상세한 가이드
- **운동 목표 관리**: 개인별 운동 목표 설정 및 진행 상황 추적
- **커뮤니티 형성**: 운동 애호가들이 정보를 공유하고 소통할 수 있는 공간
- **위치 기반 서비스**: 주변 헬스장 찾기 및 정보 제공
- **레벨 시스템**: 운동 활동에 따른 경험치 및 레벨업 시스템

## ✨ 주요 기능

### 🏋️ 머신 가이드
- **상세한 머신 설명**: 각 운동 머신의 사용법과 효과 설명
- **이미지 및 동영상**: 시각적 학습 자료 제공
- **난이도별 분류**: 초급, 중급, 고급 난이도 구분
- **카테고리별 분류**: 유산소, 근력, 유연성 등 카테고리별 정리

### 🎯 운동 목표 관리
- **목표 설정**: 체중, 횟수, 시간 등 다양한 목표 유형 지원
- **진행 상황 추적**: 실시간 목표 달성률 확인
- **데드라인 설정**: 목표 완료 기한 설정 및 알림
- **성취 기록**: 목표 달성 시 성취감을 위한 기록 시스템

### 🌍 커뮤니티
- **운동 팁 공유**: 사용자들의 운동 경험과 팁 공유
- **질문과 답변**: 운동 관련 질문과 답변 게시판
- **카테고리별 게시판**: 운동루틴, 팁, 다이어트 등 주제별 분류
- **좋아요 및 댓글**: 상호작용 기능

### 📍 위치 기반 서비스
- **헬스장 찾기**: 주변 헬스장 검색 및 정보 제공
- **카카오맵 연동**: 정확한 위치 정보와 길찾기 기능
- **헬스장 정보**: 운영시간, 시설 정보 등 상세 정보

### 🏆 레벨 시스템
- **경험치 시스템**: 운동 활동에 따른 경험치 획득
- **레벨업**: 경험치에 따른 레벨 상승
- **업적 시스템**: 다양한 업적 달성 및 보상
- **스트릭 시스템**: 연속 활동 추적
- **시즌 시스템**: 정기적인 시즌 리셋으로 지속적인 동기부여

### 🔐 계정 복구 시스템
- **다단계 인증**: 이름, 전화번호, 이메일을 통한 단계별 인증
- **보안 토큰**: 시간 제한이 있는 일회용 토큰
- **이메일 알림**: 보안 코드 이메일 발송
- **속도 제한**: 무차별 대입 공격 방지

### 🔄 자동 업데이트 스케줄러
- **자동 실행**: 설정된 시간에 3일마다 헬스장 데이터 업데이트
- **API + 크롤링**: API 우선 시도, 실패 시 크롤링으로 대체
- **스마트 스케줄링**: 업데이트가 필요한 경우에만 실행
- **다양한 업데이트 방식**: enhanced, basic, multisource, advanced

## 🛠 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스 구축
- **TypeScript** - 타입 안정성 확보
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **React Router** - 클라이언트 사이드 라우팅
- **Tailwind CSS** - 유틸리티 기반 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리
- **Axios** - HTTP 클라이언트
- **Zustand** - 상태 관리
- **React Hook Form** - 폼 관리

### Backend
- **Node.js** - 서버 런타임
- **Express.js** - 웹 프레임워크
- **TypeScript** - 타입 안정성 확보
- **TypeORM** - 객체 관계 매핑
- **MySQL** - 관계형 데이터베이스
- **JWT** - 인증 토큰 관리
- **bcrypt** - 비밀번호 해싱
- **Nodemailer** - 이메일 발송

### DevOps & Tools
- **PM2** - 프로세스 관리
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **Jest** - 테스트 프레임워크
- **Vitest** - 프론트엔드 테스트
- **Docker** - 컨테이너화 (준비 중)

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18.0.0 이상
- MySQL 8.4 이상
- Git

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/deukgeun_ReactProject.git
cd deukgeun_ReactProject/deukgeun

# 2. 의존성 설치
npm install
cd src/backend && npm install && cd ../..

# 3. 환경 변수 설정
npm run setup:env

# 4. 데이터베이스 설정
npm run db:sync
npm run db:seed

# 5. 개발 서버 실행
npm run dev:full
```

### 접속 정보
- **프론트엔드**: http://localhost:5173
- **백엔드 API**: http://localhost:5000
- **테스트 계정**: 이메일: `user1@test.com` / 비밀번호: `user123!`

---

## 🏗️ 빌드 시스템

### 새로운 모듈화된 빌드 시스템

ES 모듈과 CommonJS 충돌 문제를 해결하고, 구조화된 빌드 결과물을 생성하는 시스템입니다.

#### 빌드 결과물 구조
```
dist/
├── frontend/     # 프론트엔드 빌드 결과물
├── backend/      # 백엔드 빌드 결과물
├── shared/       # 공유 모듈
└── data/         # 데이터 파일
```

#### 주요 빌드 명령어

```bash
# 통합 빌드 (권장)
npm run build:integrated

# 구조화된 빌드
npm run build:structured

# 모듈 분석
npm run analyze:modules

# 스마트 변환
npm run convert:smart
```

#### 빌드 단계별 설명

1. **모듈 분석**: 프로젝트의 ES 모듈과 CommonJS 모듈을 자동 감지
2. **모듈 변환**: ES 모듈을 CommonJS로 지능적 변환
3. **구조화된 빌드**: 올바른 dist 폴더 구조 생성
4. **빌드 검증**: 빌드 결과물 검증

---

## 🔧 환경 설정

### 환경 변수 설정

#### 프론트엔드 환경 변수 (.env)
```bash
# Frontend Environment Variables
VITE_FRONTEND_PORT=5173
VITE_BACKEND_URL=http://localhost:5000

# Kakao Map API Keys
VITE_LOCATION_JAVASCRIPT_MAP_API_KEY=your_kakao_javascript_api_key
VITE_LOCATION_REST_MAP_API_KEY=your_kakao_rest_api_key

# Gym API Key
VITE_GYM_API_KEY=your_gym_api_key

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

#### 백엔드 환경 변수 (src/backend/.env)
```bash
# 애플리케이션 기본 설정
NODE_ENV=development
PORT=5000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=deukgeun_db

# JWT 인증 설정
JWT_SECRET=your-jwt-secret-key-for-development
JWT_ACCESS_SECRET=your-jwt-access-secret-for-development
JWT_REFRESH_SECRET=your-jwt-refresh-secret-for-development

# 이메일 설정
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 데이터베이스 설정

```bash
# 데이터베이스 동기화
npm run db:sync

# 초기 데이터 시드
npm run db:seed

# 레벨 시스템 테이블 생성
npm run setup:level-tables

# 계정 복구 테이블 생성
npm run setup:account-recovery
```

---

## 🔑 SSH 및 AWS 설정

### AWS 키 페어 구조 이해

```
로컬 컴퓨터                    AWS EC2 인스턴스
┌─────────────────┐           ┌─────────────────┐
│ 개인키 (.pem)   │  ──────►  │ 공개키          │
│ - deukgeun_ReactProject   │           │ - ~/.ssh/       │
│ - 보안 저장     │           │   authorized_keys│
└─────────────────┘           └─────────────────┘
```

**핵심 포인트:**
- AWS는 공개키를 인스턴스의 `~/.ssh/authorized_keys`에 저장
- 로컬의 개인키(.pem)와 매칭되어야 SSH 연결 성공
- **AWS는 개인키를 저장하지 않음** - 분실 시 복구 불가

### SSH 연결 방법

#### 방법 1: Git Bash 사용 (권장)
```bash
# 1. Git Bash 실행
# 2. 프로젝트 디렉토리로 이동
cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun

# 3. SSH 키 권한 설정
chmod 600 deukgeun_ReactProject.pem

# 4. SSH 연결 테스트
ssh -i deukgeun_ReactProject.pem ubuntu@43.203.30.167
```

#### 방법 2: WSL 사용
```bash
# 1. WSL 실행
wsl

# 2. 프로젝트 디렉토리로 이동
cd /mnt/c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun

# 3. SSH 키 권한 설정
chmod 600 deukgeun_ReactProject.pem

# 4. SSH 연결
ssh -i deukgeun_ReactProject.pem ubuntu@43.203.30.167
```

#### 방법 3: PowerShell + SSH 설정 파일 사용
```powershell
# 1. PowerShell 실행
# 2. 프로젝트 디렉토리로 이동
cd C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun

# 3. SSH 설정 파일 사용
ssh -F ssh-config deukgeun-ec2
```

### SSH 문제 해결

#### 1. AWS EC2 인스턴스 상태 확인
```bash
# AWS CLI로 인스턴스 상태 확인
aws ec2 describe-instances --filters "Name=ip-address,Values=43.203.30.167"
```

**확인 사항:**
- 인스턴스 상태가 "running"인지 확인
- 보안 그룹에서 SSH 포트(22)가 열려있는지 확인
- 키 페어가 올바르게 연결되어 있는지 확인

#### 2. 키 페어 검증
```bash
# 로컬 개인키에서 공개키 추출
ssh-keygen -y -f "./deukgeun_ReactProject.pem" > public_key.pub
```

#### 3. 개인키 분실 시 복구 방법

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

### 사용 가능한 SSH 스크립트들

```bash
# SSH 진단 스크립트
node scripts/ssh-diagnostic.cjs

# AWS 키 페어 복구 스크립트
node scripts/aws-key-pair-recovery.cjs

# SSH 완전 해결 스크립트
node scripts/ssh-complete-solution.cjs

# 간단한 SSH 설정 스크립트
node scripts/simple-ssh-setup.cjs
```

---

## 🚀 EC2 배포 가이드

### EC2 환경 설정 (연결 후 실행)

#### 1️⃣ 기본 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2️⃣ Node.js 설치
```bash
# Node.js 22.x 설치
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 버전 확인
node -v  # v22.14.0
npm -v   # 10.9.2
```

#### 3️⃣ Git 설치 및 프로젝트 클론
```bash
sudo apt install -y git
git clone https://github.com/jaehyeokZEV/deukgeun_ReactProject.git
cd deukgeun_ReactProject/deukgeun
```

#### 4️⃣ 백엔드 환경 설정
```bash
# 백엔드 디렉토리로 이동
cd src/backend

# 의존성 설치
npm install

# .env 파일 생성
nano .env
```

**.env 파일 내용:**
```env
NODE_ENV=production
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Deukgeun6204_DB25
DB_NAME=deukgeun
JWT_SECRET=your_jwt_secret
```

#### 5️⃣ MySQL 설치 (로컬 DB 사용 시)
```bash
sudo apt install -y mysql-server
sudo systemctl enable mysql
sudo systemctl start mysql
sudo mysql_secure_installation

# DB 생성
sudo mysql -u root -p
CREATE DATABASE deukgeun CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

#### 6️⃣ 백엔드 빌드 및 실행
```bash
# 개발 테스트
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

#### 7️⃣ 프론트엔드 환경 설정
```bash
# 프론트엔드 디렉토리로 이동
cd ../frontend

# 의존성 설치
npm install

# .env 파일 생성
nano .env
```

**프론트엔드 .env 파일 내용:**
```env
VITE_API_URL=https://api.deukgeun.site
VITE_KAKAO_API_KEY=your_kakao_api_key
```

#### 8️⃣ 프론트엔드 빌드
```bash
npm run build
```

#### 9️⃣ Nginx 설치 및 설정
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# 설정 파일 생성
sudo nano /etc/nginx/sites-available/deukgeun
```

**Nginx 설정 내용:**
```nginx
server {
    listen 80;
    server_name 43.203.30.167;

    location / {
        root /home/ubuntu/deukgeun_ReactProject/deukgeun/src/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Nginx 설정 적용:**
```bash
sudo ln -s /etc/nginx/sites-available/deukgeun /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 🔟 PM2로 프로세스 관리
```bash
# PM2 설치
sudo npm install -g pm2

# 백엔드 시작
pm2 start dist/app.js --name deukgeun-backend

# 자동 시작 설정
pm2 startup
pm2 save
```

#### 1️⃣1️⃣ 방화벽 설정
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 자동화 스크립트 사용법

#### Windows에서 배포 스크립트 실행
```bash
# Git Bash에서 실행
cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun

# SSH 연결 테스트
./deploy-ssh-commands.sh test

# 프로젝트 파일 전송
./deploy-ssh-commands.sh upload

# 전체 배포 실행
./deploy-ssh-commands.sh deploy

# 서비스 상태 확인
./deploy-ssh-commands.sh status

# 서비스 재시작
./deploy-ssh-commands.sh restart

# 로그 확인
./deploy-ssh-commands.sh logs
```

### EC2 통합 배포 스크립트

#### 방법 1: Bash 스크립트 (권장)
```bash
# EC2 인스턴스에서 실행
npm run deploy:ec2:bash
```

#### 방법 2: TypeScript 스크립트
```bash
# EC2 인스턴스에서 실행
npm run deploy:ec2:ts
```

#### TypeScript 스크립트 옵션
```bash
# 기본 실행
npm run deploy:ec2:ts

# 옵션과 함께 실행
npx ts-node scripts/ec2-integrated-runner.ts --environment production --verbose

# 도움말
npx ts-node scripts/ec2-integrated-runner.ts --help
```

**옵션 목록:**
- `--environment <env>`: 환경 설정 (production, staging, development)
- `--skip-tests`: 테스트 건너뛰기
- `--skip-backup`: 백업 건너뛰기
- `--skip-database`: 데이터베이스 설정 건너뛰기
- `--skip-firewall`: 방화벽 설정 건너뛰기
- `--no-parallel`: 병렬 처리 비활성화
- `--max-workers <num>`: 최대 워커 수
- `--timeout <ms>`: 타임아웃 (밀리초)
- `--verbose`: 상세 로그
- `--dry-run`: 실제 실행 없이 시뮬레이션

---

## 🔄 PM2 관리

### 주요 개선사항

#### 1. CMD 창 문제 해결
- `windowsHide: true` 설정으로 Windows에서 CMD 창이 숨겨집니다
- `autorestart: false` 설정으로 개발 중 불필요한 재시작을 방지합니다
- 백그라운드 실행으로 시스템 리소스를 절약합니다

#### 2. 메모리 최적화
- 백엔드: 2GB 메모리 제한
- 프론트엔드: 1GB 메모리 제한
- 헬스 모니터: 512MB 메모리 제한
- Node.js 옵션 최적화 (`--optimize-for-size`)

#### 3. 로그 관리 개선
- 자동 로그 로테이션 (10MB, 5개 파일 유지)
- 압축된 로그 파일
- 날짜별 로그 포맷

### 기본 명령어

```bash
# 프로세스 시작
npm run pm2:start

# 프로세스 중지
npm run pm2:stop

# 프로세스 재시작
npm run pm2:restart

# 프로세스 상태 확인
npm run pm2:status

# 로그 확인
npm run pm2:logs

# 실시간 모니터링
npm run pm2:monitor
```

### Windows 전용 관리 스크립트

#### 1. 배치 스크립트 (CMD)
```cmd
# 프로세스 시작
scripts\pm2-manager.bat start

# 프로세스 상태 확인
scripts\pm2-manager.bat status

# 로그 정리
scripts\pm2-manager.bat clean
```

#### 2. PowerShell 스크립트
```powershell
# 프로세스 시작
.\scripts\pm2-manager.ps1 start

# 프로세스 상태 확인
.\scripts\pm2-manager.ps1 status

# 실시간 모니터링
.\scripts\pm2-manager.ps1 monitor
```

#### 3. Node.js 스크립트
```bash
# 프로세스 시작
npm run pm2:manager start

# 프로세스 상태 확인
npm run pm2:manager status

# 로그 정리
npm run pm2:manager clean
```

### 프로세스 구성

#### 1. 백엔드 (deukgeun-backend)
- **스크립트**: `dist/backend/index.js`
- **포트**: 5000
- **메모리 제한**: 2GB
- **자동 재시작**: 비활성화 (개발 환경)

#### 2. 프론트엔드 (deukgeun-frontend)
- **스크립트**: `scripts/serve-frontend-optimized.cjs`
- **포트**: 3000
- **메모리 제한**: 1GB
- **자동 재시작**: 비활성화 (개발 환경)

#### 3. 헬스 모니터 (deukgeun-health-monitor)
- **스크립트**: `scripts/health-monitor.cjs`
- **메모리 제한**: 512MB
- **자동 재시작**: 활성화
- **주기적 재시작**: 매일 새벽 2시

### 로그 관리

#### 로그 파일 위치
```
logs/
├── backend-error.log
├── backend-out.log
├── backend-combined.log
├── frontend-error.log
├── frontend-out.log
├── frontend-combined.log
├── health-monitor-error.log
├── health-monitor-out.log
└── health-monitor-combined.log
```

#### 로그 로테이션 설정
- **최대 크기**: 10MB
- **유지 파일 수**: 5개
- **압축**: 활성화
- **자동 정리**: 7일 이상 된 파일 삭제

---

## 🌐 Nginx 관리

### 주요 기능

#### 1. 모듈화된 Nginx 설정
- **기본 설정**: 이벤트, HTTP 블록, 로깅 설정
- **성능 최적화**: Gzip 압축, 캐싱, 연결 최적화
- **보안 설정**: 보안 헤더, CSP, XSS 보호
- **프록시 설정**: 백엔드 API 프록시, 헬스체크
- **SSL 지원**: HTTPS 설정 및 인증서 관리

#### 2. 자동화된 관리
- 설정 파일 자동 생성 및 검증
- 서비스 시작/중지/재시작
- 백업 및 복원 기능
- 성능 모니터링
- 로그 관리

#### 3. 통합 배포
- 빌드 + PM2 배포 + Nginx 설정을 통합한 원스톱 배포
- 헬스체크 및 모니터링
- 에러 복구 및 롤백

### 사용법

#### 도메인별 Nginx 설정 (devtrail.net)
```bash
# 도메인 설정 생성
npm run script:nginx:domain

# 개발 환경 설정
npm run nginx:config:dev

# 프로덕션 환경 설정
npm run nginx:config:prod
```

#### 기본 Nginx 관리
```bash
# Nginx 설정 생성
npm run nginx:config

# 서비스 시작
npm run nginx:start

# 서비스 중지
npm run nginx:stop

# 서비스 재시작
npm run nginx:restart

# 상태 확인
npm run nginx:status
```

#### 모니터링
```bash
# 로그 확인
npm run nginx:logs

# 성능 모니터링
npm run nginx:monitor
```

#### 통합 관리
```bash
# 전체 Nginx 관리
npm run script:nginx

# 통합 배포 (빌드 + PM2 + Nginx)
npm run script:nginx:deploy
```

### 생성되는 Nginx 설정

#### 기본 설정
- 이벤트 블록: worker_connections 1024
- HTTP 블록: MIME 타입, 로깅, 성능 최적화
- 서버 블록: 포트 80, SPA 라우팅, API 프록시

#### 성능 최적화
- Gzip 압축 (레벨 6)
- 정적 파일 캐싱 (1년)
- HTML 파일 캐싱 비활성화
- Keep-alive 연결

#### 보안 설정
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer-when-downgrade
- Content-Security-Policy

#### 프록시 설정
- `/api/` 경로를 백엔드로 프록시
- WebSocket 지원
- 헤더 전달
- 타임아웃 설정

### 서비스 URL

#### 도메인 설정 (devtrail.net)
- 메인 도메인: http://devtrail.net
- WWW 도메인: http://www.devtrail.net
- IP 직접 접속: http://43.203.30.167
- 백엔드 API: http://devtrail.net/api
- 헬스체크: http://devtrail.net/health

#### Nginx 비활성화 시
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:5000
- 헬스체크: http://localhost:5000/health

---

## 🚀 통합 실행 스크립트

### 개요

`unified-runner.ts`는 모든 빌드, 변환, 배포, 서비스 관리를 하나의 스크립트로 통합한 통합 실행 스크립트입니다.

### 주요 기능

- **단계별 실행**: 환경 설정 → 안전 검사 → 변환 → 빌드 → 배포 → PM2 관리 → 헬스체크
- **자동 복구**: 실패 시 자동으로 복구 시도
- **백업 생성**: 중요한 작업 전 자동 백업
- **유연한 구성**: 원하는 단계만 실행하거나 특정 단계 건너뛰기
- **상세 로깅**: 각 단계별 진행 상황 및 결과 표시

### 사용법

#### 기본 사용법
```bash
# 전체 프로세스 실행
npm run unified

# 상세 로그와 함께 실행
npm run unified:prod

# 개발 환경으로 실행
npm run unified:dev
```

#### 고급 사용법
```bash
# 특정 단계만 실행
npm run unified:build    # 변환 + 빌드만
npm run unified:deploy   # 배포 + PM2 + 헬스체크만

# 드라이 런 모드 (실제 실행 없이 시뮬레이션)
npm run unified:dry

# 직접 실행
npx ts-node scripts/unified-runner.ts [옵션]
```

### 실행 단계

#### 1. **env** - 환경 설정
- 환경 변수 설정
- .env 파일 확인
- NODE_ENV 설정

#### 2. **safety** - 안전 검사
- 백업 디렉토리 생성
- 중요 파일들 백업
- 안전 검사 실행

#### 3. **convert** - 코드 변환
- ES 모듈을 CommonJS로 변환
- import.meta.env 변환
- 브라우저 API polyfill 추가

#### 4. **build** - 프로젝트 빌드
- 백엔드 빌드 실행
- 프론트엔드 빌드 실행
- 빌드 결과 검증

#### 5. **deploy** - 배포
- dist 디렉토리 확인
- 배포 스크립트 실행
- 배포 결과 검증

#### 6. **pm2** - PM2 서비스 관리
- PM2 설치 확인
- PM2 설정 파일 생성 (없는 경우)
- PM2 프로세스 시작

#### 7. **health** - 헬스체크
- PM2 상태 확인
- 서비스 정상 동작 확인
- 헬스체크 결과 보고

### 명령행 옵션

```bash
# 기본 옵션
npx ts-node scripts/unified-runner.ts

# 프로젝트 루트 지정
npx ts-node scripts/unified-runner.ts --project-root /path/to/project

# 환경 지정
npx ts-node scripts/unified-runner.ts --environment production

# 실행할 단계 지정
npx ts-node scripts/unified-runner.ts --phases env,safety,build

# 건너뛸 단계 지정
npx ts-node scripts/unified-runner.ts --skip-phases safety,health

# 상세 로그 활성화
npx ts-node scripts/unified-runner.ts --verbose

# 드라이 런 모드
npx ts-node scripts/unified-runner.ts --dry-run

# 백업 비활성화
npx ts-node scripts/unified-runner.ts --no-backup

# 자동 복구 비활성화
npx ts-node scripts/unified-runner.ts --no-auto-recovery

# 안전장치 비활성화
npx ts-node scripts/unified-runner.ts --no-safety
```

### package.json 스크립트

```json
{
  "scripts": {
    "unified": "npx ts-node scripts/unified-runner.ts",
    "unified:prod": "npx ts-node scripts/unified-runner.ts --environment production --verbose",
    "unified:dev": "npx ts-node scripts/unified-runner.ts --environment development --verbose",
    "unified:build": "npx ts-node scripts/unified-runner.ts --phases convert,build --verbose",
    "unified:deploy": "npx ts-node scripts/unified-runner.ts --phases deploy,pm2,health --verbose",
    "unified:dry": "npx ts-node scripts/unified-runner.ts --dry-run --verbose"
  }
}
```

### 안전 기능

#### 자동 백업
- 실행 전 자동으로 중요 파일들 백업
- 타임스탬프가 포함된 백업 디렉토리 생성
- 백업 경로: `backups/backup-YYYY-MM-DDTHH-mm-ss-sssZ/`

#### 자동 복구
- 실패 시 자동으로 복구 시도
- 백업에서 복원
- 재시도 로직

#### 안전 검사
- 시스템 요구사항 확인
- 필수 파일 존재 확인
- 권한 검사

---

## ⚡ 자동 컴파일 시스템

### 개요

이 시스템은 TypeScript 스크립트를 자동으로 컴파일하고 실행하는 방법을 제공합니다.

### 빠른 시작

#### 1. js-to-cjs-converter 자동 실행
```bash
# 가장 간단한 방법
npm run quick:js-to-cjs

# 또는 자동화된 방법
npm run script:auto:js-to-cjs
```

#### 2. 다른 스크립트 자동 실행
```bash
# 빌드 스크립트
npm run script:auto:build

# 배포 스크립트
npm run script:auto:deploy

# 헬스 체크 스크립트
npm run script:auto:health
```

### 사용 가능한 명령어

#### 빠른 컴파일 (Quick Compile)
```bash
# js-to-cjs-converter만 컴파일
npm run quick:compile

# 모든 스크립트 컴파일
npm run quick:compile:all

# 컴파일 후 즉시 실행
npm run quick:js-to-cjs
```

#### 자동화된 실행 (Auto Run)
```bash
# 특정 스크립트 자동 실행
npm run script:auto <스크립트명>

# js-to-cjs-converter 자동 실행
npm run script:auto:js-to-cjs

# 빌드 + 배포 자동 실행
npm run script:auto:js-to-cjs:all
```

#### 개별 스크립트 자동 실행
```bash
# 빌드 관련
npm run script:auto:build
npm run script:auto:deploy

# 시스템 관리
npm run script:auto:health
npm run script:auto:pm2
npm run script:auto:nginx

# 개발 도구
npm run script:auto:test
npm run script:auto:env
npm run script:auto:data
```

### 고급 사용법

#### 여러 스크립트 순차 실행
```bash
# 여러 스크립트를 순차적으로 실행
npm run script:auto:multiple js-to-cjs-converter.ts build.ts
```

#### 옵션과 함께 실행
```bash
# 빌드 옵션과 함께
npm run script:auto:js-to-cjs:build

# 배포 옵션과 함께
npm run script:auto:js-to-cjs:deploy

# 모든 옵션과 함께
npm run script:auto:js-to-cjs:all
```

### 파일 구조

```
scripts/
├── auto-compile-runner.ts      # 자동 컴파일 및 실행 메인 스크립트
├── auto-js-to-cjs-converter.ts # js-to-cjs-converter 자동화 스크립트
├── quick-compile.ts            # 빠른 컴파일 스크립트
└── js-to-cjs-converter.ts     # 원본 변환 스크립트

dist/scripts/
├── js-to-cjs-converter.js      # 컴파일된 JavaScript
├── js-to-cjs-converter.cjs     # CommonJS 버전
└── ...                        # 기타 컴파일된 스크립트들
```

### 성능 비교

| 방식 | 명령어 수 | 소요 시간 | 오류 가능성 |
|------|-----------|-----------|-------------|
| 수동 | 3개 | ~30초 | 높음 |
| 자동화 | 1개 | ~15초 | 낮음 |

### 권장 사용법

1. **일반적인 사용**: `npm run quick:js-to-cjs`
2. **개발 중**: `npm run script:auto:js-to-cjs`
3. **배포 전**: `npm run script:auto:js-to-cjs:all`
4. **디버깅**: `npm run quick:compile` 후 수동 실행

---

## 🧪 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
npm run test

# 단위 테스트만 실행
npm run test:unit

# 통합 테스트만 실행
npm run test:integration

# E2E 테스트만 실행
npm run test:e2e

# 코드 커버리지와 함께 실행
npm run test:coverage

# 파일 변경 감시 모드
npm run test:watch
```

### 테스트 환경 설정

```bash
# 테스트 환경 자동 설정
npm run test:setup
```

---

## 🔍 문제 해결

### 일반적인 문제들

#### 1. SSH 연결 실패 시
```bash
# 1. 진단 스크립트 실행
node scripts/ssh-diagnostic.cjs

# 2. AWS 인스턴스 상태 확인
./deploy-ssh-commands.sh aws-status

# 3. Systems Manager로 접근
./deploy-ssh-commands.sh ssm

# 4. 키 페어 복구
./deploy-ssh-commands.sh recover
```

#### 2. PM2가 설치되지 않음
```bash
npm install -g pm2
```

#### 3. 권한 오류
```bash
chmod +x scripts/unified-runner.ts
```

#### 4. 메모리 부족
```bash
node --max-old-space-size=4096 scripts/unified-runner.ts
```

#### 5. 타임아웃 오류
```bash
npx ts-node scripts/unified-runner.ts --timeout 600
```

#### 6. Node.js 버전 문제
```bash
# Node.js 16+ 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 7. 포트 충돌 문제
```bash
# 포트 사용 확인
netstat -tlnp | grep -E ':(80|5000)'

# 프로세스 종료
sudo kill -9 {PID}
```

#### 8. 권한 문제
```bash
# 로그 디렉토리 권한 설정
chmod -R 755 logs/
chown -R $USER:$USER logs/
```

### 디버깅

```bash
# 상세 로그와 함께 실행
npx ts-node scripts/unified-runner.ts --verbose

# 드라이 런으로 시뮬레이션
npx ts-node scripts/unified-runner.ts --dry-run --verbose

# 특정 단계만 실행하여 문제 격리
npx ts-node scripts/unified-runner.ts --phases convert --verbose
```

### 롤백 방법

```bash
# PM2 서비스 중지
pm2 delete all

# 백업에서 복원 (필요한 경우)
cp -r backups/backup-{timestamp}/* ./

# 서비스 재시작
pm2 start ecosystem.config.cjs --env production
```

---

## 🔒 보안

### reCAPTCHA Enterprise 통합

- **사이트 키**: `6Lcf8-ArAAAAAEGpQDCsuecM4e9ZzeJ0LE6bgiMG`
- **프로젝트 ID**: `secure-theme-468004-f1`
- **점수 기반 보안**: 액션별 최소 점수 설정

### 보안 기능

- JWT 기반 인증
- 비밀번호 해싱 (bcrypt)
- 입력 데이터 검증
- SQL 인젝션 방지 (TypeORM)
- CORS 설정
- Rate Limiting
- 다단계 계정 복구

### 보안 고려사항

#### 방화벽 설정
- 필요한 포트만 열기
- SSH 키 기반 인증
- 정기적인 보안 업데이트

#### 환경 변수 보안
- 민감한 정보는 환경 변수로 관리
- .env 파일 권한 설정
- 프로덕션 환경에서의 보안 강화

---

## 📊 프로젝트 구조

```
deukgeun/
├── src/
│   ├── frontend/           # React 프론트엔드
│   │   ├── features/       # 기능별 모듈
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── shared/         # 공통 컴포넌트, 훅, 유틸
│   │   └── widgets/        # 위젯 컴포넌트
│   ├── backend/            # Express 백엔드
│   │   ├── domains/        # 도메인별 비즈니스 로직
│   │   ├── infrastructure/ # 외부 서비스 연동
│   │   ├── config/         # 설정 파일
│   │   └── shared/         # 공통 타입, 유틸
│   └── shared/             # 프론트엔드/백엔드 공통
│       ├── types/          # 공통 타입 정의
│       ├── constants/      # 상수 정의
│       ├── validation/     # 유효성 검사 스키마
│       └── api/            # API 클라이언트
├── scripts/                # 빌드/배포 스크립트
├── dist/                   # 빌드 결과물
└── logs/                   # 로그 파일
```

---

## 🤝 기여하기

### 기여 방법

1. 이 저장소를 Fork합니다
2. 새로운 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 Push합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

### 개발 가이드라인

- TypeScript를 사용하여 타입 안정성을 확보합니다
- ESLint와 Prettier를 사용하여 코드 스타일을 일관되게 유지합니다
- 새로운 기능 추가 시 테스트 코드를 작성합니다
- 커밋 메시지는 명확하고 설명적으로 작성합니다

### 이슈 리포트

버그를 발견하거나 새로운 기능을 제안하고 싶다면 [Issues](https://github.com/your-username/deukgeun_ReactProject/issues) 페이지에서 이슈를 생성해주세요.

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

프로젝트에 대한 문의사항이 있으시면 다음 방법으로 연락해주세요:

- **이메일**: your-email@example.com
- **GitHub Issues**: [Issues](https://github.com/your-username/deukgeun_ReactProject/issues)
- **Discord**: [Deukgeun Community](https://discord.gg/deukgeun)

---

**Deukgeun** - 함께 만들어가는 건강한 운동 문화 🏋️‍♂️

---

*이 문서는 Deukgeun 프로젝트의 모든 설정, 배포, 관리 방법을 통합한 완전한 가이드입니다. 프로젝트의 모든 마크다운 파일들이 이 하나의 문서로 통합되었습니다.*
