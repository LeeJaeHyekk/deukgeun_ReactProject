@echo off
REM ============================================================================
REM 개발환경 설정 스크립트 (Windows)
REM ============================================================================

echo 🚀 개발환경 설정을 시작합니다...

REM 통합 환경 변수 파일을 .env로 복사
copy env.unified .env

REM 개발환경 설정으로 변경
echo 📝 개발환경 설정으로 변경 중...

REM PowerShell을 사용하여 sed 대신 문자열 치환
powershell -Command "(Get-Content .env) -replace '^NODE_ENV=.*', 'NODE_ENV=development' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^MODE=.*', 'MODE=development' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^VITE_FRONTEND_URL=.*', 'VITE_FRONTEND_URL=http://localhost:5173' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^VITE_BACKEND_URL=.*', 'VITE_BACKEND_URL=http://localhost:5000' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^CORS_ORIGIN=.*', 'CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:5000,http://localhost:5001,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:5000,http://127.0.0.1:5001' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^LOG_LEVEL=.*', 'LOG_LEVEL=debug' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^ENABLE_MONITORING=.*', 'ENABLE_MONITORING=false' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^AUTO_UPDATE_ENABLED=.*', 'AUTO_UPDATE_ENABLED=false' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^JWT_SECRET=.*', 'JWT_SECRET=dev_jwt_secret_key_2024' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^JWT_ACCESS_SECRET=.*', 'JWT_ACCESS_SECRET=dev_access_secret_2024' | Set-Content .env"
powershell -Command "(Get-Content .env) -replace '^JWT_REFRESH_SECRET=.*', 'JWT_REFRESH_SECRET=dev_refresh_secret_2024' | Set-Content .env"

echo ✅ 개발환경 설정이 완료되었습니다!
echo.
echo 📋 현재 설정:
echo    - NODE_ENV: development
echo    - VITE_BACKEND_URL: http://localhost:5000
echo    - VITE_FRONTEND_URL: http://localhost:5173
echo    - LOG_LEVEL: debug
echo    - ENABLE_MONITORING: false
echo.
echo 🚀 개발 서버를 시작하려면: npm run dev

pause
