@echo off
REM PM2 배포 스크립트 (상세 로그 포함) - Windows 버전
REM PM2로 배포할 때 정확한 오류 정보를 확인할 수 있도록 구성

setlocal enabledelayedexpansion

echo [INFO] 🚀 PM2 배포 시작 (상세 로그 포함)

REM 프로젝트 루트 디렉토리로 이동
cd /d "%~dp0.."

REM 1. 로그 디렉토리 생성
echo [INFO] 📁 로그 디렉토리 생성 중...
if not exist "logs" mkdir logs
echo [SUCCESS] 로그 디렉토리 생성 완료

REM 2. PM2 로그 매니저 초기화
echo [INFO] 🔧 PM2 로그 파일 초기화 중...
node scripts/pm2-log-manager.js init
echo [SUCCESS] PM2 로그 파일 초기화 완료

REM 3. 기존 PM2 프로세스 정리
echo [INFO] 🧹 기존 PM2 프로세스 정리 중...
pm2 delete all >nul 2>&1
echo [SUCCESS] 기존 PM2 프로세스 정리 완료

REM 4. 빌드 확인 (최적화된 빌드 사용)
if not exist "dist" (
    echo [WARNING] dist 디렉토리가 없습니다. 최적화된 빌드를 실행합니다...
    set NODE_ENV=production
    npm run build:full:production:optimized
    echo [SUCCESS] 최적화된 빌드 완료
)

REM 5. PM2로 앱 시작
echo [INFO] 🚀 PM2로 앱 시작 중...
pm2 start ecosystem.config.js --env production
echo [SUCCESS] PM2 앱 시작 완료

REM 6. PM2 상태 확인
echo [INFO] 📊 PM2 상태 확인 중...
pm2 status

REM 7. 로그 파일 확인
echo [INFO] 📋 로그 파일 확인 중...
dir logs\pm2-*-detailed.log >nul 2>&1
if errorlevel 1 (
    echo [WARNING] 상세 로그 파일이 아직 생성되지 않았습니다.
) else (
    echo [SUCCESS] 상세 로그 파일이 생성되었습니다.
)

REM 8. 최근 오류 로그 확인
echo [INFO] 🔍 최근 오류 로그 확인 중...
node scripts/pm2-log-manager.js errors all 20

REM 9. 로그 분석
echo [INFO] 📊 로그 분석 중...
node scripts/pm2-log-manager.js analyze all

REM 10. 유용한 명령어 안내
echo [SUCCESS] ✅ PM2 배포 완료!
echo.
echo [INFO] 📋 유용한 명령어들:
echo   • PM2 상태 확인: pm2 status
echo   • 실시간 로그: pm2 logs
echo   • 백엔드 로그만: pm2 logs deukgeun-backend
echo   • 프론트엔드 로그만: pm2 logs deukgeun-frontend
echo   • 오류 로그 조회: node scripts/pm2-log-manager.js errors all 50
echo   • 로그 분석: node scripts/pm2-log-manager.js analyze all
echo   • 실시간 모니터링: node scripts/pm2-log-manager.js monitor backend error
echo   • 로그 정리: node scripts/pm2-log-manager.js cleanup 7
echo.
echo [INFO] 📁 상세 로그 파일 위치:
echo   • 백엔드 오류: logs\pm2-backend-error-detailed.log
echo   • 백엔드 출력: logs\pm2-backend-out-detailed.log
echo   • 프론트엔드 오류: logs\pm2-frontend-error-detailed.log
echo   • 프론트엔드 출력: logs\pm2-frontend-out-detailed.log
echo.

REM 11. 배포 후 상태 확인
echo [INFO] 🔍 배포 후 상태 확인 중...
timeout /t 3 /nobreak >nul

REM 백엔드 상태 확인
pm2 list | findstr "deukgeun-backend.*online" >nul
if errorlevel 1 (
    echo [ERROR] ❌ 백엔드 실행에 문제가 있습니다.
    echo [INFO] 백엔드 오류 로그를 확인하세요:
    node scripts/pm2-log-manager.js errors backend 30
) else (
    echo [SUCCESS] ✅ 백엔드가 정상적으로 실행 중입니다.
)

REM 프론트엔드 상태 확인
pm2 list | findstr "deukgeun-frontend.*online" >nul
if errorlevel 1 (
    echo [ERROR] ❌ 프론트엔드 실행에 문제가 있습니다.
    echo [INFO] 프론트엔드 오류 로그를 확인하세요:
    node scripts/pm2-log-manager.js errors frontend 30
) else (
    echo [SUCCESS] ✅ 프론트엔드가 정상적으로 실행 중입니다.
)

echo.
echo [SUCCESS] 🎉 PM2 배포 및 로그 설정 완료!
echo [INFO] 문제가 발생하면 위의 명령어들을 사용하여 상세한 로그를 확인하세요.

pause
