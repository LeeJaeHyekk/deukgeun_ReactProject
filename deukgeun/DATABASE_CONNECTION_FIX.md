# 데이터베이스 연결 실패 해결

## 🔍 문제 분석

### 근본 원인

1. **MySQL/MariaDB 서비스 미설치**
   - `systemctl status mariadb` → 서비스 없음
   - `systemctl status mysql` → 서비스 없음
   - 포트 3306이 열려있지 않음

2. **환경 변수 미설정**
   - `.env` 파일 없음
   - `ecosystem.config.cjs`의 `env_production`에 데이터베이스 환경 변수 없음
   - PM2가 데이터베이스 연결 정보를 모름

3. **기본 설정 사용**
   - `DB_HOST: localhost` (환경 변수 없음)
   - `DB_PORT: 3306` (환경 변수 없음)
   - `DB_USERNAME: root` (환경 변수 없음)
   - `DB_PASSWORD: ""` (환경 변수 없음)
   - `DB_DATABASE: deukgeun_db` (환경 변수 없음)

### 현재 상태

**백엔드 로그:**
```
❌ Database initialization failed: connect ECONNREFUSED 127.0.0.1:3306
🔄 Using fallback for module: database
⚠️ Database not initialized, returning default homepage config
```

**서비스 동작:**
- ✅ 데이터베이스 연결 실패 시 기본값 반환
- ✅ 홈페이지 설정 API 정상 동작 (기본값 사용)
- ✅ 서비스는 계속 실행됨

## ✅ 해결 방법

### 방법 1: MariaDB 설치 및 설정 (로컬 개발/테스트)

**Amazon Linux 2023에서 MariaDB 설치:**

```bash
# MariaDB 10.5 설치
sudo yum install -y mariadb105-server mariadb105

# MariaDB 시작 및 부팅 시 자동 시작
sudo systemctl start mariadb105
sudo systemctl enable mariadb105

# MariaDB 상태 확인
sudo systemctl status mariadb105

# 보안 설정 (초기 비밀번호 설정)
sudo mysql_secure_installation
```

**데이터베이스 및 사용자 생성:**

```bash
# MariaDB에 접속 (root 비밀번호 없이)
sudo mysql

# 또는 비밀번호가 있는 경우
# mysql -u root -p
```

**MySQL 프롬프트에서 실행:**

```sql
-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS deukgeun_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 사용자 생성
CREATE USER IF NOT EXISTS 'deukgeun'@'localhost' 
  IDENTIFIED BY 'your_secure_password';

-- 권한 부여
GRANT ALL PRIVILEGES ON deukgeun_db.* TO 'deukgeun'@'localhost';

-- 권한 새로고침
FLUSH PRIVILEGES;

-- 확인
SHOW DATABASES;
SELECT user, host FROM mysql.user WHERE user = 'deukgeun';

-- 종료
EXIT;
```

**환경 변수 설정:**

```bash
# .env 파일 생성
cat > .env << 'EOF'
NODE_ENV=production
MODE=production
PORT=5000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=deukgeun
DB_PASSWORD=your_secure_password
DB_DATABASE=deukgeun_db

# JWT 설정 (실제 값으로 변경 필요)
JWT_SECRET=your_jwt_secret_change_this_in_production
JWT_ACCESS_SECRET=your_access_secret_change_this_in_production
JWT_REFRESH_SECRET=your_refresh_secret_change_this_in_production

# CORS 설정
CORS_ORIGIN=https://www.devtrail.net,https://devtrail.net

# reCAPTCHA 설정
RECAPTCHA_SITE_KEY=6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P
RECAPTCHA_SECRET=your_recaptcha_secret
EOF

# 파일 권한 설정 (보안)
chmod 600 .env
```

**ecosystem.config.cjs 업데이트:**

```javascript
env_production: {
  NODE_ENV: 'production',
  MODE: 'production',
  PORT: 5000,
  CORS_ORIGIN: 'https://devtrail.net,https://www.devtrail.net,http://43.203.30.167:3000,http://43.203.30.167:5000',
  VITE_BACKEND_URL: 'http://43.203.30.167:5000',
  VITE_FRONTEND_URL: 'https://www.devtrail.net',
  VITE_RECAPTCHA_SITE_KEY: '6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P',
  RECAPTCHA_SITE_KEY: '6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P',
  NODE_PATH: './dist/backend/backend',
  // 데이터베이스 설정 추가
  DB_HOST: 'localhost',
  DB_PORT: '3306',
  DB_USERNAME: 'deukgeun',
  DB_PASSWORD: 'your_secure_password',
  DB_DATABASE: 'deukgeun_db',
}
```

**PM2 재시작:**

```bash
# 환경 변수 업데이트하여 재시작
pm2 restart deukgeun-backend --update-env

# 또는 PM2 완전 재시작
pm2 delete deukgeun-backend
pm2 start ecosystem.config.cjs --env production
pm2 save
```

### 방법 2: AWS RDS 사용 (프로덕션 권장)

**RDS 인스턴스 생성 후:**

```bash
# .env 파일 생성
cat > .env << 'EOF'
NODE_ENV=production
MODE=production
PORT=5000

# 데이터베이스 설정 (RDS 엔드포인트 사용)
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=your_rds_password
DB_DATABASE=deukgeun_db

# JWT 설정
JWT_SECRET=your_jwt_secret
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# CORS 설정
CORS_ORIGIN=https://www.devtrail.net,https://devtrail.net

# reCAPTCHA 설정
RECAPTCHA_SITE_KEY=6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P
RECAPTCHA_SECRET=your_recaptcha_secret
EOF

# ecosystem.config.cjs 업데이트
# env_production에 DB_* 환경 변수 추가

# PM2 재시작
pm2 restart deukgeun-backend --update-env
```

### 방법 3: 데이터베이스 없이 실행 (현재 상태 유지)

**현재 상태:**
- ✅ 데이터베이스 연결 실패 시 기본값 반환
- ✅ 홈페이지 설정 API 정상 동작
- ✅ 서비스는 계속 실행됨

**추가 작업 불필요:**
- 이미 컨트롤러에서 기본값 반환 로직 구현됨
- 데이터베이스 없이도 서비스 동작

## 🧪 검증 방법

### 1. 데이터베이스 연결 테스트

```bash
# MariaDB 설치 확인
sudo systemctl status mariadb105

# 포트 확인
sudo netstat -tlnp | grep 3306
# 또는
sudo ss -tlnp | grep 3306

# MySQL 클라이언트로 연결 테스트
mysql -h localhost -P 3306 -u deukgeun -p deukgeun_db
```

### 2. 백엔드 로그 확인

```bash
# 백엔드 재시작 후 로그 확인
pm2 restart deukgeun-backend --update-env
pm2 logs deukgeun-backend --lines 50 | grep -i "database\|connection"
```

**연결 성공 시:**
```
✅ Database connection established
✅ Module loaded: database (XXXms)
```

**연결 실패 시:**
```
❌ Database initialization failed: connect ECONNREFUSED 127.0.0.1:3306
🔄 Using fallback for module: database
⚠️ Database not initialized, returning default homepage config
```

### 3. API 테스트

```bash
# 데이터베이스 연결 성공 시: 데이터베이스 값 반환
# 데이터베이스 연결 실패 시: 기본값 반환
curl http://localhost:5000/api/homepage/config | jq .

# nginx를 통한 테스트
curl http://localhost/api/homepage/config | jq .

# 외부 HTTPS 접근 테스트
curl https://www.devtrail.net/api/homepage/config | jq .
```

## 📋 요약

**문제:**
- MySQL/MariaDB 서비스 미설치
- 환경 변수 미설정
- 데이터베이스 연결 실패

**해결:**
1. ✅ MariaDB 설치 및 설정 (방법 1)
2. ✅ AWS RDS 사용 (방법 2)
3. ✅ 데이터베이스 없이 실행 (방법 3 - 현재 상태 유지)

**현재 상태:**
- ✅ 서비스 정상 동작 (기본값 사용)
- ✅ 데이터베이스 연결 실패해도 서비스 계속 실행
- ✅ 홈페이지 설정 API 정상 동작

**권장 사항:**
- **프로덕션**: AWS RDS 사용 (방법 2)
- **개발/테스트**: 로컬 MariaDB 설치 (방법 1)
- **빠른 시작**: 데이터베이스 없이 실행 (방법 3)

