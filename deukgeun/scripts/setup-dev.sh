#!/bin/bash

# ============================================================================
# 개발환경 설정 스크립트
# ============================================================================

echo "🚀 개발환경 설정을 시작합니다..."

# 통합 환경 변수 파일을 .env로 복사
cp env.unified .env

# 개발환경 설정으로 변경
echo "📝 개발환경 설정으로 변경 중..."

# NODE_ENV와 MODE를 development로 설정
sed -i 's/^NODE_ENV=.*/NODE_ENV=development/' .env
sed -i 's/^MODE=.*/MODE=development/' .env

# 개발환경 URL 설정
sed -i 's/^VITE_FRONTEND_URL=.*/VITE_FRONTEND_URL=http:\/\/localhost:5173/' .env
sed -i 's/^VITE_BACKEND_URL=.*/VITE_BACKEND_URL=http:\/\/localhost:5000/' .env

# 개발환경 CORS 설정
sed -i 's/^CORS_ORIGIN=.*/CORS_ORIGIN=http:\/\/localhost:3000,http:\/\/localhost:5173,http:\/\/localhost:5000,http:\/\/localhost:5001,http:\/\/127.0.0.1:3000,http:\/\/127.0.0.1:5173,http:\/\/127.0.0.1:5000,http:\/\/127.0.0.1:5001/' .env

# 개발환경 로깅 설정
sed -i 's/^LOG_LEVEL=.*/LOG_LEVEL=debug/' .env

# 개발환경 모니터링 설정
sed -i 's/^ENABLE_MONITORING=.*/ENABLE_MONITORING=false/' .env

# 개발환경 스케줄러 설정
sed -i 's/^AUTO_UPDATE_ENABLED=.*/AUTO_UPDATE_ENABLED=false/' .env

# 개발환경 JWT 설정
sed -i 's/^JWT_SECRET=.*/JWT_SECRET=dev_jwt_secret_key_2024/' .env
sed -i 's/^JWT_ACCESS_SECRET=.*/JWT_ACCESS_SECRET=dev_access_secret_2024/' .env
sed -i 's/^JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=dev_refresh_secret_2024/' .env

echo "✅ 개발환경 설정이 완료되었습니다!"
echo ""
echo "📋 현재 설정:"
echo "   - NODE_ENV: development"
echo "   - VITE_BACKEND_URL: http://localhost:5000"
echo "   - VITE_FRONTEND_URL: http://localhost:5173"
echo "   - LOG_LEVEL: debug"
echo "   - ENABLE_MONITORING: false"
echo ""
echo "🚀 개발 서버를 시작하려면: npm run dev"
