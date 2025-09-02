#!/bin/bash

# ============================================================================
# Simple Deploy Script for Deukgeun
# ============================================================================

echo "🚀 Deukgeun 배포를 시작합니다..."

# 1. 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 2. 백엔드 빌드
echo "🔨 백엔드 빌드 중..."
npm run build:backend:production

# 3. 프론트엔드 빌드
echo "🎨 프론트엔드 빌드 중..."
npm run build:production

# 4. PM2로 서비스 시작
echo "🚀 PM2로 서비스 시작 중..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js --env production

# 5. 상태 확인
echo "✅ 배포 완료! 서비스 상태:"
pm2 status

echo ""
echo "🌐 접속 정보:"
echo "프론트엔드: http://localhost:80"
echo "백엔드 API: http://localhost:5000"
echo "헬스체크: http://localhost:5000/health"
echo ""
echo "📋 PM2 명령어:"
echo "  상태 확인: pm2 status"
echo "  로그 확인: pm2 logs"
echo "  재시작: pm2 restart all"
