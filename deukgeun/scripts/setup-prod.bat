@echo off
REM ============================================================================
REM 프로덕션환경 설정 스크립트 (Windows)
REM ============================================================================

echo 🚀 프로덕션환경 설정을 시작합니다...

REM 통합 환경 변수 파일을 .env로 복사
copy env.unified .env

REM 프로덕션환경 설정으로 변경
echo 📝 프로덕션환경 설정으로 변경 중...

REM PowerShell을 사용하여 sed 대신 문자열 치환
powershell -Command "(Get-Content .env) -replace '^NODE_ENV=.*', 'NODE_ENV=production' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^MODE=.*', 'MODE=production' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^VITE_FRONTEND_URL=.*', 'VITE_FRONTEND_URL=https://devtrail.net' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^VITE_BACKEND_URL=.*', 'VITE_BACKEND_URL=https://api.devtrail.net' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^CORS_ORIGIN=.*', 'CORS_ORIGIN=https://devtrail.net,https://www.devtrail.net,http://43.203.30.167:3000,http://43.203.30.167:5000' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^LOG_LEVEL=.*', 'LOG_LEVEL=info' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^ENABLE_MONITORING=.*', 'ENABLE_MONITORING=true' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^AUTO_UPDATE_ENABLED=.*', 'AUTO_UPDATE_ENABLED=true' | Set-Content .env"

echo ✅ 프로덕션환경 설정이 완료되었습니다!
echo.
echo 📋 현재 설정:
echo    - NODE_ENV: production
echo    - VITE_BACKEND_URL: https://api.devtrail.net
echo    - VITE_FRONTEND_URL: https://devtrail.net
echo    - LOG_LEVEL: info
echo    - ENABLE_MONITORING: true
echo.
echo ⚠️  배포 전 확인사항:
echo    1. JWT 시크릿을 실제 값으로 변경
echo    2. 데이터베이스 비밀번호 확인
echo    3. API 키 설정 확인
echo    4. 이메일 설정 확인
echo.
echo 🚀 빌드 및 배포:
echo    npm run build
echo    npm run start:prod

pause
