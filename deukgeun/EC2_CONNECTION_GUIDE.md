# 🚀 EC2 연결 및 배포 완전 가이드

## 📋 현재 상황
- ✅ SSH 키 파일: `deukgeun_ReactProject.pem` (프로젝트 내부에 있음)
- ✅ EC2 호스트: `3.36.230.117`
- ✅ 사용자: `ubuntu`
- ✅ 자동화 스크립트: 완전 준비됨

## 🎯 EC2 연결 방법 (3가지 옵션)

### 방법 1: Git Bash 사용 (권장)

```bash
# 1. Git Bash 실행
# 2. 프로젝트 디렉토리로 이동
cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun

# 3. SSH 키 권한 설정
chmod 600 deukgeun_ReactProject.pem

# 4. SSH 연결 테스트
ssh -i deukgeun_ReactProject.pem ubuntu@3.36.230.117

# 5. 연결 성공 시 EC2 환경 설정 시작
```

### 방법 2: WSL 사용

```bash
# 1. WSL 실행
wsl

# 2. 프로젝트 디렉토리로 이동
cd /mnt/c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun

# 3. SSH 키 권한 설정
chmod 600 deukgeun_ReactProject.pem

# 4. SSH 연결
ssh -i deukgeun_ReactProject.pem ubuntu@3.36.230.117
```

### 방법 3: PowerShell + SSH 설정 파일 사용

```powershell
# 1. PowerShell 실행
# 2. 프로젝트 디렉토리로 이동
cd C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun

# 3. SSH 설정 파일 사용
ssh -F ssh-config deukgeun-ec2
```

## 🔧 EC2 환경 설정 (연결 후 실행)

### 1️⃣ 기본 시스템 업데이트
```bash
sudo apt update && sudo apt upgrade -y
```

### 2️⃣ Node.js 설치
```bash
# Node.js 22.x 설치
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 버전 확인
node -v  # v22.14.0
npm -v   # 10.9.2
```

### 3️⃣ Git 설치 및 프로젝트 클론
```bash
sudo apt install -y git
git clone https://github.com/jaehyeokZEV/deukgeun_ReactProject.git
cd deukgeun_ReactProject/deukgeun
```

### 4️⃣ 백엔드 환경 설정
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
DB_PASSWORD=your_password
DB_NAME=deukgeun
JWT_SECRET=your_jwt_secret
```

### 5️⃣ MySQL 설치 (로컬 DB 사용 시)
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

### 6️⃣ 백엔드 빌드 및 실행
```bash
# 개발 테스트
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

### 7️⃣ 프론트엔드 환경 설정
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

### 8️⃣ 프론트엔드 빌드
```bash
npm run build
```

### 9️⃣ Nginx 설치 및 설정
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
    server_name 3.36.230.117;

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

### 🔟 PM2로 프로세스 관리
```bash
# PM2 설치
sudo npm install -g pm2

# 백엔드 시작
pm2 start dist/app.js --name deukgeun-backend

# 자동 시작 설정
pm2 startup
pm2 save
```

### 1️⃣1️⃣ 방화벽 설정
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 🚀 자동화 스크립트 사용법

### Windows에서 배포 스크립트 실행
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

## 🔍 문제 해결

### SSH 연결 실패 시
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

### Windows 권한 문제 해결
```bash
# 1. WSL 사용
wsl ssh -i ~/.ssh/deukgeun_ReactProject.pem ubuntu@3.36.230.117

# 2. Git Bash 사용
# Git Bash에서 SSH 명령어 실행

# 3. PowerShell 관리자 권한으로 실행
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. **SSH 키 파일**: `deukgeun_ReactProject.pem`이 올바른 위치에 있는지
2. **EC2 인스턴스**: 실행 중인지, 보안 그룹에서 SSH 포트(22)가 열려있는지
3. **네트워크**: 방화벽이나 VPN이 SSH 연결을 차단하지 않는지
4. **키 권한**: SSH 키 파일의 권한이 올바른지

## 🎯 최종 체크리스트

- [ ] SSH 접속 성공
- [ ] Node.js/npm 설치
- [ ] Git clone 완료
- [ ] 백엔드 .env 작성
- [ ] DB 연결 확인
- [ ] 프론트엔드 .env 작성
- [ ] Nginx 리버스 프록시 설정
- [ ] PM2 실행
- [ ] HTTP/HTTPS 접근 가능

---

**생성일**: 2024년 12월 19일  
**마지막 업데이트**: 2024년 12월 19일
