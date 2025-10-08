@echo off
echo ========================================
echo    빠른 배포 스크립트 (Windows)
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

REM SSH 키 권한 설정
echo SSH 키 권한 설정 중...
icacls "deukgeun_ReactProject.pem" /inheritance:r /grant:r "%USERNAME%:R" >nul 2>&1

echo.
echo ========================================
echo    배포 옵션 선택
echo ========================================
echo.
echo 1. SSH 연결 테스트
echo 2. 프로젝트 파일 전송
echo 3. 전체 배포 실행
echo 4. 서비스 상태 확인
echo 5. 서비스 재시작
echo 6. 로그 확인
echo 7. AWS 인스턴스 상태 확인
echo 8. 종료
echo.

set /p choice="선택하세요 (1-8): "

if "%choice%"=="1" goto test
if "%choice%"=="2" goto upload
if "%choice%"=="3" goto deploy
if "%choice%"=="4" goto status
if "%choice%"=="5" goto restart
if "%choice%"=="6" goto logs
if "%choice%"=="7" goto aws-status
if "%choice%"=="8" goto exit
goto invalid

:test
echo.
echo ========================================
echo    SSH 연결 테스트
echo ========================================
echo.

echo Git Bash에서 다음 명령어를 실행하세요:
echo.
echo    cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh test
echo.
echo 또는 WSL에서:
echo.
echo    cd /mnt/c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh test
echo.
pause
goto menu

:upload
echo.
echo ========================================
echo    프로젝트 파일 전송
echo ========================================
echo.

echo Git Bash에서 다음 명령어를 실행하세요:
echo.
echo    cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh upload
echo.
echo 또는 WSL에서:
echo.
echo    cd /mnt/c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh upload
echo.
pause
goto menu

:deploy
echo.
echo ========================================
echo    전체 배포 실행
echo ========================================
echo.

echo Git Bash에서 다음 명령어를 실행하세요:
echo.
echo    cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh deploy
echo.
echo 또는 WSL에서:
echo.
echo    cd /mnt/c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh deploy
echo.
pause
goto menu

:status
echo.
echo ========================================
echo    서비스 상태 확인
echo ========================================
echo.

echo Git Bash에서 다음 명령어를 실행하세요:
echo.
echo    cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh status
echo.
echo 또는 WSL에서:
echo.
echo    cd /mnt/c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh status
echo.
pause
goto menu

:restart
echo.
echo ========================================
echo    서비스 재시작
echo ========================================
echo.

echo Git Bash에서 다음 명령어를 실행하세요:
echo.
echo    cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh restart
echo.
echo 또는 WSL에서:
echo.
echo    cd /mnt/c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh restart
echo.
pause
goto menu

:logs
echo.
echo ========================================
echo    로그 확인
echo ========================================
echo.

echo Git Bash에서 다음 명령어를 실행하세요:
echo.
echo    cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh logs
echo.
echo 또는 WSL에서:
echo.
echo    cd /mnt/c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh logs
echo.
pause
goto menu

:aws-status
echo.
echo ========================================
echo    AWS 인스턴스 상태 확인
echo ========================================
echo.

echo Git Bash에서 다음 명령어를 실행하세요:
echo.
echo    cd /c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh aws-status
echo.
echo 또는 WSL에서:
echo.
echo    cd /mnt/c/Users/jaehyuok/Documents/GitHub/deukgeun_ReactProject/deukgeun
echo    ./deploy-ssh-commands.sh aws-status
echo.
pause
goto menu

:invalid
echo.
echo ❌ 잘못된 선택입니다. 1-8 중에서 선택하세요.
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
