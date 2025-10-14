@echo off
echo ============================================================================
echo MySQL 초기화 및 설정 스크립트
echo ============================================================================

REM MySQL 설정 변수
set MYSQL_BIN="C:\Program Files\MySQL\MySQL Server 8.4\bin"
set NEW_ROOT_PASSWORD=Deukgeun6204_DB25
set MYSQL_SERVICE_NAME=MySQL80
set DATABASE_NAME=deukgeun_db

echo 🚀 MySQL 초기화 및 설정을 시작합니다...
echo 📋 설정 정보:
echo    - MySQL 경로: %MYSQL_BIN%
echo    - 새 루트 비밀번호: %NEW_ROOT_PASSWORD%
echo    - 서비스 이름: %MYSQL_SERVICE_NAME%
echo    - 데이터베이스 이름: %DATABASE_NAME%
echo.

REM 1. MySQL 서비스 시작
echo 1️⃣ MySQL 서비스 시작 중...
net start %MYSQL_SERVICE_NAME%
if %errorlevel% neq 0 (
    echo ❌ MySQL 서비스 시작에 실패했습니다.
    echo 관리자 권한으로 실행해주세요.
    pause
    exit /b 1
)
echo ✅ MySQL 서비스가 성공적으로 시작되었습니다.
timeout /t 5 /nobreak >nul

REM 2. MySQL 연결 테스트
echo 2️⃣ MySQL 연결 테스트 중...
%MYSQL_BIN%\mysql.exe -u root -p%NEW_ROOT_PASSWORD% -e "SELECT 1;" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MySQL 연결이 성공했습니다.
    goto :create_database
) else (
    echo ⚠️ 기존 비밀번호로 연결 실패, 새 비밀번호 설정을 시도합니다...
    goto :reset_password
)

:reset_password
echo 3️⃣ MySQL 루트 비밀번호 재설정 중...
echo    - MySQL 안전 모드로 시작 중...

REM MySQL 서비스 중지
net stop %MYSQL_SERVICE_NAME%
timeout /t 3 /nobreak >nul

REM 임시 설정 파일 생성
echo ALTER USER 'root'@'localhost' IDENTIFIED BY '%NEW_ROOT_PASSWORD%'; > %TEMP%\mysql-init.sql
echo FLUSH PRIVILEGES; >> %TEMP%\mysql-init.sql

REM MySQL 안전 모드로 시작
start /wait %MYSQL_BIN%\mysqld.exe --init-file=%TEMP%\mysql-init.sql --console
timeout /t 10 /nobreak >nul

REM MySQL 서비스 재시작
taskkill /f /im mysqld.exe >nul 2>&1
timeout /t 3 /nobreak >nul
net start %MYSQL_SERVICE_NAME%
timeout /t 5 /nobreak >nul

REM 임시 파일 삭제
del %TEMP%\mysql-init.sql >nul 2>&1

echo ✅ MySQL 루트 비밀번호가 재설정되었습니다.

:create_database
echo 4️⃣ 데이터베이스 생성 중...
echo CREATE DATABASE IF NOT EXISTS %DATABASE_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; | %MYSQL_BIN%\mysql.exe -u root -p%NEW_ROOT_PASSWORD%
if %errorlevel% equ 0 (
    echo ✅ 데이터베이스 '%DATABASE_NAME%'가 성공적으로 생성되었습니다.
) else (
    echo ❌ 데이터베이스 생성에 실패했습니다.
)

echo 5️⃣ 사용자 권한 설정 중...
echo CREATE USER IF NOT EXISTS 'deukgeun_user'@'localhost' IDENTIFIED BY '%NEW_ROOT_PASSWORD%'; | %MYSQL_BIN%\mysql.exe -u root -p%NEW_ROOT_PASSWORD%
echo GRANT ALL PRIVILEGES ON %DATABASE_NAME%.* TO 'deukgeun_user'@'localhost'; | %MYSQL_BIN%\mysql.exe -u root -p%NEW_ROOT_PASSWORD%
echo FLUSH PRIVILEGES; | %MYSQL_BIN%\mysql.exe -u root -p%NEW_ROOT_PASSWORD%

if %errorlevel% equ 0 (
    echo ✅ 사용자 권한이 성공적으로 설정되었습니다.
) else (
    echo ❌ 사용자 권한 설정에 실패했습니다.
)

echo 6️⃣ 최종 연결 테스트 중...
echo USE %DATABASE_NAME%; SELECT 'Database connection successful!' as status; | %MYSQL_BIN%\mysql.exe -u root -p%NEW_ROOT_PASSWORD%
if %errorlevel% equ 0 (
    echo ✅ 모든 설정이 완료되었습니다!
    echo.
    echo 📋 설정 요약:
    echo    - MySQL 서비스: 실행 중
    echo    - 루트 비밀번호: %NEW_ROOT_PASSWORD%
    echo    - 데이터베이스: %DATABASE_NAME%
    echo    - 사용자: deukgeun_user
    echo.
    echo 🎉 MySQL 초기화가 완료되었습니다!
) else (
    echo ❌ 최종 연결 테스트에 실패했습니다.
)

echo.
echo 스크립트 실행이 완료되었습니다.
pause
