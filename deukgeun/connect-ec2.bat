@echo off
echo ========================================
echo    EC2 연결 스크립트 (Windows)
echo ========================================
echo.

REM 현재 디렉토리 확인
cd /d "%~dp0"
echo 현재 디렉토리: %CD%

REM SSH 키 파일 확인
if not exist "deukgeun_ReactProject.pem" (
    echo ❌ SSH 키 파일을 찾을 수 없습니다: deukgeun_ReactProject.pem
    echo 해결책: SSH 키 파일을 프로젝트 디렉토리에 복사하세요.
    pause
    exit /b 1
)

echo ✅ SSH 키 파일 확인됨: deukgeun_ReactProject.pem

REM SSH 키 권한 설정 (Windows)
echo SSH 키 권한 설정 중...
icacls "deukgeun_ReactProject.pem" /inheritance:r /grant:r "%USERNAME%:R" >nul 2>&1

echo.
echo ========================================
echo    연결 방법 선택
echo ========================================
echo.
echo 1. Git Bash 사용 (권장)
echo 2. WSL 사용
echo 3. SSH 설정 파일 사용
echo 4. 진단 스크립트 실행
echo 5. 종료
echo.

set /p choice="선택하세요 (1-5): "

if "%choice%"=="1" goto gitbash
if "%choice%"=="2" goto wsl
if "%choice%"=="3" goto sshconfig
if "%choice%"=="4" goto diagnostic
if "%choice%"=="5" goto exit
goto invalid

:gitbash
echo.
echo ========================================
echo    Git Bash 사용 방법
echo ========================================
echo.
echo 1. Git Bash 실행
echo 2. 다음 명령어들을 순서대로 실행하세요:
echo.
echo    cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    chmod 600 deukgeun_ReactProject.pem
echo    ssh -i deukgeun_ReactProject.pem ubuntu@3.36.230.117
echo.
echo 3. 연결 성공 시 EC2 환경 설정을 시작하세요.
echo.
pause
goto menu

:wsl
echo.
echo ========================================
echo    WSL 사용 방법
echo ========================================
echo.
echo 1. WSL 실행
echo 2. 다음 명령어들을 순서대로 실행하세요:
echo.
echo    cd /mnt/c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    chmod 600 deukgeun_ReactProject.pem
echo    ssh -i deukgeun_ReactProject.pem ubuntu@3.36.230.117
echo.
echo 3. 연결 성공 시 EC2 환경 설정을 시작하세요.
echo.
pause
goto menu

:sshconfig
echo.
echo ========================================
echo    SSH 설정 파일 사용
echo ========================================
echo.
echo SSH 설정 파일을 사용하여 연결합니다...
echo.

REM SSH 설정 파일 확인
if not exist "ssh-config" (
    echo ❌ SSH 설정 파일을 찾을 수 없습니다: ssh-config
    echo 해결책: SSH 설정 파일을 생성하세요.
    pause
    goto menu
)

echo ✅ SSH 설정 파일 확인됨
echo.
echo 연결 시도 중...
ssh -F ssh-config deukgeun-ec2

if %errorlevel% neq 0 (
    echo.
    echo ❌ SSH 연결 실패
    echo 해결책: Git Bash 또는 WSL을 사용하세요.
    pause
)

goto menu

:diagnostic
echo.
echo ========================================
echo    SSH 진단 스크립트 실행
echo ========================================
echo.

REM Node.js 확인
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo 해결책: Node.js를 설치하세요.
    pause
    goto menu
)

echo ✅ Node.js 확인됨
echo.
echo SSH 진단 스크립트를 실행합니다...
node scripts/ssh-diagnostic.cjs

echo.
echo 진단 완료. 결과를 확인하세요.
pause
goto menu

:invalid
echo.
echo ❌ 잘못된 선택입니다. 1-5 중에서 선택하세요.
pause
goto menu

:menu
echo.
echo ========================================
echo    메뉴로 돌아가기
echo ========================================
echo.
echo 1. 다시 시도
echo 2. 종료
echo.

set /p retry="선택하세요 (1-2): "

if "%retry%"=="1" goto start
if "%retry%"=="2" goto exit
goto invalid

:exit
echo.
echo 프로그램을 종료합니다.
exit /b 0

:start
cls
goto :eof
