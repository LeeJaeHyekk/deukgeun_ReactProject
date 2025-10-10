#!/bin/bash

# ============================================================================
# 프로덕션환경 설정 스크립트
# ============================================================================

echo "🚀 프로덕션환경 설정을 시작합니다..."

# 통합 환경 변수 파일을 .env로 복사
cp env.unified .env

# 프로덕션환경 설정으로 변경
echo "📝 프로덕션환경 설정으로 변경 중..."

# NODE_ENV와 MODE를 production으로 설정
sed -i 's/^NODE_ENV=.*/NODE_ENV=production/' .env
sed -i 's/^MODE=.*/MODE=production/' .env

# 프로덕션환경 URL 설정
sed -i 's/^VITE_FRONTEND_URL=.*/VITE_FRONTEND_URL=https:\/\/devtrail.net/' .env
sed -i 's/^VITE_BACKEND_URL=.*/VITE_BACKEND_URL=https:\/\/api.devtrail.net/' .env

# 프로덕션환경 CORS 설정
sed -i 's/^CORS_ORIGIN=.*/CORS_ORIGIN=https:\/\/devtrail.net,https:\/\/www.devtrail.net,http:\/\/43.203.30.167:3000,http:\/\/43.203.30.167:5000/' .env

# 프로덕션환경 로깅 설정
sed -i 's/^LOG_LEVEL=.*/LOG_LEVEL=info/' .env

# 프로덕션환경 모니터링 설정
sed -i 's/^ENABLE_MONITORING=.*/ENABLE_MONITORING=true/' .env

# 프로덕션환경 스케줄러 설정
sed -i 's/^AUTO_UPDATE_ENABLED=.*/AUTO_UPDATE_ENABLED=true/' .env

# 프로덕션환경 JWT 설정 (실제 값으로 변경 필요)
echo "⚠️  프로덕션 JWT 시크릿을 실제 값으로 변경해주세요:"
echo "   - JWT_SECRET=your_production_jwt_secret_key"
echo "   - JWT_ACCESS_SECRET=your_production_access_secret"
echo "   - JWT_REFRESH_SECRET=your_production_refresh_secret"

echo "✅ 프로덕션환경 설정이 완료되었습니다!"
echo ""
echo "📋 현재 설정:"
echo "   - NODE_ENV: production"
echo "   - VITE_BACKEND_URL: https://api.devtrail.net"
echo "   - VITE_FRONTEND_URL: https://devtrail.net"
echo "   - LOG_LEVEL: info"
echo "   - ENABLE_MONITORING: true"
echo ""
echo "⚠️  배포 전 확인사항:"
echo "   1. JWT 시크릿을 실제 값으로 변경"
echo "   2. 데이터베이스 비밀번호 확인"
echo "   3. API 키 설정 확인"
echo "   4. 이메일 설정 확인"
echo ""
echo "🚀 빌드 및 배포:"
echo "   npm run build"
echo "   npm run start:prod"
