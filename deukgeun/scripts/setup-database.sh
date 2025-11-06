#!/bin/bash

# 데이터베이스 설정 스크립트
# MySQL/MariaDB 설치 및 설정

set -e

echo "🔧 데이터베이스 설정 시작..."

# MariaDB 설치 확인
if ! command -v mysql &> /dev/null; then
    echo "📦 MariaDB 설치 중..."
    sudo yum install -y mariadb-server mariadb
    
    echo "🚀 MariaDB 시작 중..."
    sudo systemctl start mariadb
    sudo systemctl enable mariadb
    
    echo "✅ MariaDB 설치 및 시작 완료"
else
    echo "✅ MariaDB가 이미 설치되어 있습니다."
    
    # MariaDB가 실행 중인지 확인
    if ! sudo systemctl is-active --quiet mariadb; then
        echo "🚀 MariaDB 시작 중..."
        sudo systemctl start mariadb
        sudo systemctl enable mariadb
    else
        echo "✅ MariaDB가 이미 실행 중입니다."
    fi
fi

# 데이터베이스 및 사용자 생성
echo "📊 데이터베이스 및 사용자 생성 중..."

# 비밀번호 입력 받기
read -sp "데이터베이스 root 비밀번호를 입력하세요 (없으면 Enter): " ROOT_PASSWORD
echo

# 데이터베이스 생성 스크립트
DB_NAME="deukgeun_db"
DB_USER="deukgeun"
read -sp "데이터베이스 사용자 비밀번호를 입력하세요: " DB_PASSWORD
echo

# MySQL/MariaDB에 접속하여 데이터베이스 및 사용자 생성
if [ -z "$ROOT_PASSWORD" ]; then
    sudo mysql << EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Database and user created successfully' AS result;
EOF
else
    mysql -u root -p"${ROOT_PASSWORD}" << EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Database and user created successfully' AS result;
EOF
fi

echo "✅ 데이터베이스 및 사용자 생성 완료"

# .env 파일 생성
echo "📝 .env 파일 생성 중..."

cat > .env << EOF
# 환경 설정
NODE_ENV=production
MODE=production
PORT=5000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_DATABASE=${DB_NAME}

# JWT 설정
JWT_SECRET=your_jwt_secret_change_this_in_production
JWT_ACCESS_SECRET=your_access_secret_change_this_in_production
JWT_REFRESH_SECRET=your_refresh_secret_change_this_in_production

# CORS 설정
CORS_ORIGIN=https://www.devtrail.net,https://devtrail.net

# reCAPTCHA 설정
RECAPTCHA_SITE_KEY=6LeKXgIsAAAAAO_09k3lshBH0jagb2uyNf2kvE8P
RECAPTCHA_SECRET=your_recaptcha_secret
EOF

echo "✅ .env 파일 생성 완료"
echo ""
echo "📋 다음 단계:"
echo "1. ecosystem.config.cjs의 env_production에 데이터베이스 환경 변수 추가"
echo "2. PM2 재시작: pm2 restart deukgeun-backend --update-env"
echo "3. 백엔드 로그 확인: pm2 logs deukgeun-backend --lines 50"

