# 데이터베이스 연결 실패 원인 분석

## 🔍 문제 상황

### 발생한 오류
```
❌ Database initialization failed: connect ECONNREFUSED 127.0.0.1:3306
⚠️ Database not connected, starting server in limited mode
```

### 확인 결과

1. **MySQL/MariaDB 서비스 미설치**
   - `systemctl status mariadb` → 서비스 없음
   - `systemctl status mysql` → 서비스 없음
   - 포트 3306이 열려있지 않음

2. **환경 변수 미설정**
   - `.env` 파일 없음
   - PM2 환경 변수에 데이터베이스 설정 없음

3. **기본 설정 사용**
   - `DB_HOST: localhost`
   - `DB_PORT: 3306`
   - `DB_USERNAME: root`
   - `DB_PASSWORD: ""` (빈 문자열)
   - `DB_DATABASE: deukgeun_db`

## ✅ 해결 방법

### 옵션 1: 로컬 MySQL/MariaDB 설치 (개발/테스트용)

**Amazon Linux 2023에서 설치:**

```bash
# MariaDB 설치
sudo yum install -y mariadb-server mariadb

# MariaDB 시작 및 부팅 시 자동 시작
sudo systemctl start mariadb
sudo systemctl enable mariadb

# 보안 설정 (초기 비밀번호 설정)
sudo mysql_secure_installation

# 데이터베이스 및 사용자 생성
sudo mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS deukgeun_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'deukgeun'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON deukgeun_db.* TO 'deukgeun'@'localhost';
FLUSH PRIVILEGES;
EOF
```

**환경 변수 설정:**

```bash
# .env 파일 생성
cat > .env << EOF
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=deukgeun
DB_PASSWORD=your_password
DB_DATABASE=deukgeun_db
JWT_SECRET=your_jwt_secret
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CORS_ORIGIN=https://www.devtrail.net,https://devtrail.net
EOF
```

### 옵션 2: AWS RDS 사용 (프로덕션 권장)

**RDS 인스턴스 생성 후:**

```bash
# .env 파일 생성
cat > .env << EOF
NODE_ENV=production
PORT=5000
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=your_rds_password
DB_DATABASE=deukgeun_db
JWT_SECRET=your_jwt_secret
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CORS_ORIGIN=https://www.devtrail.net,https://devtrail.net
EOF
```

### 옵션 3: 데이터베이스 없이 실행 (현재 상태 유지)

**현재 상태:**
- 데이터베이스 연결 실패 시 기본값 반환
- 홈페이지 설정 API는 기본값으로 동작
- 다른 API는 제한된 기능만 제공

**장점:**
- 빠른 시작 가능
- 데이터베이스 설정 없이도 서비스 동작

**단점:**
- 데이터 저장 불가
- 사용자 인증, 게시글 등 기능 제한

## 🔄 권장 사항

### 프로덕션 환경
1. **AWS RDS 사용** (권장)
   - 자동 백업
   - 고가용성
   - 보안 강화
   - 확장성

2. **환경 변수 설정**
   - `.env` 파일 생성
   - PM2 ecosystem 파일에 환경 변수 정의
   - 보안을 위해 `.env`를 `.gitignore`에 추가

### 개발 환경
1. **로컬 MySQL/MariaDB 설치**
   - 빠른 개발
   - 테스트 용이

2. **환경 변수 설정**
   - `.env` 파일 생성
   - 개발용 설정

## 📋 다음 단계

1. **데이터베이스 설치/설정 결정**
   - 로컬 설치 (개발/테스트)
   - RDS 사용 (프로덕션)
   - 데이터베이스 없이 실행 (현재 상태 유지)

2. **환경 변수 설정**
   - `.env` 파일 생성
   - PM2 ecosystem 파일 업데이트

3. **백엔드 재시작**
   ```bash
   pm2 restart deukgeun-backend
   ```

4. **연결 확인**
   ```bash
   pm2 logs deukgeun-backend --lines 50
   # "✅ Database connection established" 확인
   ```

## 🧪 테스트 방법

### 데이터베이스 연결 테스트

```bash
# 로컬 MySQL 연결 테스트
mysql -h localhost -P 3306 -u root -p

# 또는 환경 변수 사용
mysql -h $DB_HOST -P $DB_PORT -u $DB_USERNAME -p$DB_PASSWORD $DB_DATABASE
```

### 백엔드 연결 확인

```bash
# 백엔드 로그 확인
pm2 logs deukgeun-backend --lines 50 | grep -i "database\|connection"

# API 테스트
curl http://localhost:5000/api/homepage/config
# 데이터베이스 연결 성공 시: 데이터베이스 값 반환
# 데이터베이스 연결 실패 시: 기본값 반환
```

