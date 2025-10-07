@echo off
REM PM2 관리 스크립트 for Windows
REM CMD 창이 반복 열리는 문제를 해결하기 위한 스크립트

setlocal enabledelayedexpansion

REM 색상 설정
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

echo %BLUE%========================================%RESET%
echo %BLUE%        Deukgeun PM2 Manager          %RESET%
echo %BLUE%========================================%RESET%
echo.

REM PM2가 설치되어 있는지 확인
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo %RED%PM2가 설치되어 있지 않습니다. npm install -g pm2를 실행해주세요.%RESET%
    pause
    exit /b 1
)

REM 명령어 파라미터 확인
if "%1"=="" (
    echo %YELLOW%사용법: pm2-manager.bat [start^|stop^|restart^|status^|logs^|delete]%RESET%
    echo.
    echo %BLUE%사용 가능한 명령어:%RESET%
    echo   start   - 모든 프로세스 시작
    echo   stop    - 모든 프로세스 중지
    echo   restart - 모든 프로세스 재시작
    echo   status  - 프로세스 상태 확인
    echo   logs    - 로그 확인
    echo   delete  - 모든 프로세스 삭제
    echo   clean   - 로그 파일 정리
    pause
    exit /b 0
)

set "COMMAND=%1"

if "%COMMAND%"=="start" (
    echo %GREEN%프로세스 시작 중...%RESET%
    pm2 start ecosystem.config.cjs
    if %errorlevel% equ 0 (
        echo %GREEN%✅ 모든 프로세스가 성공적으로 시작되었습니다.%RESET%
    ) else (
        echo %RED%❌ 프로세스 시작에 실패했습니다.%RESET%
    )
)

if "%COMMAND%"=="stop" (
    echo %YELLOW%프로세스 중지 중...%RESET%
    pm2 stop ecosystem.config.cjs
    if %errorlevel% equ 0 (
        echo %GREEN%✅ 모든 프로세스가 중지되었습니다.%RESET%
    ) else (
        echo %RED%❌ 프로세스 중지에 실패했습니다.%RESET%
    )
)

if "%COMMAND%"=="restart" (
    echo %YELLOW%프로세스 재시작 중...%RESET%
    pm2 restart ecosystem.config.cjs
    if %errorlevel% equ 0 (
        echo %GREEN%✅ 모든 프로세스가 재시작되었습니다.%RESET%
    ) else (
        echo %RED%❌ 프로세스 재시작에 실패했습니다.%RESET%
    )
)

if "%COMMAND%"=="status" (
    echo %BLUE%프로세스 상태 확인 중...%RESET%
    pm2 status
)

if "%COMMAND%"=="logs" (
    echo %BLUE%로그 확인 중...%RESET%
    pm2 logs --lines 50
)

if "%COMMAND%"=="delete" (
    echo %RED%경고: 모든 프로세스가 삭제됩니다. 계속하시겠습니까? (y/N)%RESET%
    set /p "confirm="
    if /i "!confirm!"=="y" (
        pm2 delete ecosystem.config.cjs
        if %errorlevel% equ 0 (
            echo %GREEN%✅ 모든 프로세스가 삭제되었습니다.%RESET%
        ) else (
            echo %RED%❌ 프로세스 삭제에 실패했습니다.%RESET%
        )
    ) else (
        echo %YELLOW%작업이 취소되었습니다.%RESET%
    )
)

if "%COMMAND%"=="clean" (
    echo %BLUE%로그 파일 정리 중...%RESET%
    if exist "logs" (
        forfiles /p logs /s /m *.log /d -7 /c "cmd /c del @path" 2>nul
        echo %GREEN%✅ 7일 이상 된 로그 파일이 정리되었습니다.%RESET%
    ) else (
        echo %YELLOW%로그 디렉토리가 존재하지 않습니다.%RESET%
    )
)

echo.
echo %BLUE%작업이 완료되었습니다.%RESET%
pause
