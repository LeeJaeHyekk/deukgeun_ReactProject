@echo off
echo ============================================================================
echo MySQL 완전 복구 스크립트
echo ============================================================================

echo 🔍 MySQL 설치 상태 확인 중...
if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" (
    echo ✅ MySQL 서버 실행 파일이 존재합니다.
) else (
    echo ❌ MySQL 서버 실행 파일이 없습니다. 재설치가 필요합니다.
    goto :reinstall_mysql
)

if exist "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini" (
    echo ✅ MySQL 설정 파일이 존재합니다.
) else (
    echo ❌ MySQL 설정 파일이 없습니다.
    goto :create_config
)

echo.
echo 🔧 MySQL 서비스 완전 정리...
net stop MySQL80 >nul 2>&1
taskkill /f /im mysqld.exe >nul 2>&1
sc delete MySQL80 >nul 2>&1

echo.
echo 🔧 MySQL 데이터 디렉토리 권한 설정...
icacls "C:\ProgramData\MySQL\MySQL Server 8.4\Data" /reset /T >nul 2>&1
icacls "C:\ProgramData\MySQL\MySQL Server 8.4\Data" /grant "NT AUTHORITY\NetworkService:(OI)(CI)F" >nul 2>&1
icacls "C:\ProgramData\MySQL\MySQL Server 8.4\Data" /grant "Everyone:(OI)(CI)F" >nul 2>&1

echo.
echo 🔧 MySQL 서비스 재등록...
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --install MySQL80 --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"

echo.
echo 🔧 MySQL 서비스 시작...
net start MySQL80

if %errorlevel% equ 0 (
    echo ✅ MySQL 서비스가 성공적으로 시작되었습니다!
    goto :test_connection
) else (
    echo ❌ MySQL 서비스 시작에 실패했습니다.
    goto :diagnose_error
)

:create_config
echo.
echo 🔧 MySQL 설정 파일 생성 중...
if not exist "C:\ProgramData\MySQL\MySQL Server 8.4" mkdir "C:\ProgramData\MySQL\MySQL Server 8.4"

echo [mysqld] > "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"
echo port=3306 >> "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"
echo basedir="C:/Program Files/MySQL/MySQL Server 8.4" >> "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"
echo datadir="C:/ProgramData/MySQL/MySQL Server 8.4/Data" >> "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"
echo max_connections=200 >> "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"
echo character-set-server=utf8mb4 >> "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"
echo collation-server=utf8mb4_unicode_ci >> "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"
echo default_authentication_plugin=mysql_native_password >> "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"
echo.
echo ✅ MySQL 설정 파일이 생성되었습니다.
goto :restart_service

:restart_service
echo.
echo 🔧 MySQL 서비스 재시작...
net stop MySQL80 >nul 2>&1
net start MySQL80

if %errorlevel% equ 0 (
    echo ✅ MySQL 서비스가 성공적으로 시작되었습니다!
    goto :test_connection
) else (
    echo ❌ MySQL 서비스 시작에 실패했습니다.
    goto :diagnose_error
)

:test_connection
echo.
echo 🧪 MySQL 연결 테스트...
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pDeukgeun6204_DB25 -e "SELECT 1;" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MySQL 연결이 성공했습니다!
    goto :create_database
) else (
    echo ⚠️ MySQL 연결에 실패했습니다. 비밀번호 재설정을 시도합니다...
    goto :reset_password
)

:reset_password
echo.
echo 🔧 MySQL 루트 비밀번호 재설정...
net stop MySQL80
timeout /t 3 /nobreak >nul

echo ALTER USER 'root'@'localhost' IDENTIFIED BY 'Deukgeun6204_DB25'; > %TEMP%\mysql-reset.sql
echo FLUSH PRIVILEGES; >> %TEMP%\mysql-reset.sql

start /wait "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --init-file=%TEMP%\mysql-reset.sql --console
timeout /t 10 /nobreak >nul

taskkill /f /im mysqld.exe >nul 2>&1
timeout /t 3 /nobreak >nul
net start MySQL80
timeout /t 5 /nobreak >nul

del %TEMP%\mysql-reset.sql >nul 2>&1

echo ✅ MySQL 루트 비밀번호가 재설정되었습니다.

:create_database
echo.
echo 🗄️ 데이터베이스 생성 중...
echo CREATE DATABASE IF NOT EXISTS deukgeun_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; | "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pDeukgeun6204_DB25

if %errorlevel% equ 0 (
    echo ✅ 데이터베이스 'deukgeun_db'가 성공적으로 생성되었습니다!
    goto :success
) else (
    echo ❌ 데이터베이스 생성에 실패했습니다.
    goto :diagnose_error
)

:diagnose_error
echo.
echo 🔍 오류 진단 중...
echo - MySQL 에러 로그 확인:
if exist "C:\ProgramData\MySQL\MySQL Server 8.4\Data\*.err" (
    echo 최근 에러 로그:
    type "C:\ProgramData\MySQL\MySQL Server 8.4\Data\*.err" | findstr /i "error"
) else (
    echo 에러 로그 파일이 없습니다.
)

echo.
echo - Windows 이벤트 로그 확인:
wevtutil qe System /c:5 /rd:true /f:text | findstr /i "mysql"

echo.
echo ❌ MySQL 복구에 실패했습니다.
echo 다음 방법을 시도해보세요:
echo 1. Windows 재부팅
echo 2. MySQL 완전 재설치
echo 3. 다른 포트 사용 (3307 등)
goto :end

:reinstall_mysql
echo.
echo 🔄 MySQL 재설치가 필요합니다.
echo 1. MySQL 8.0을 완전히 제거하세요.
echo 2. https://dev.mysql.com/downloads/mysql/ 에서 MySQL 8.0을 다운로드하세요.
echo 3. 설치 시 루트 비밀번호를 'Deukgeun6204_DB25'로 설정하세요.
echo 4. 이 스크립트를 다시 실행하세요.
goto :end

:success
echo.
echo 🎉 MySQL 복구가 완료되었습니다!
echo.
echo 📋 설정 요약:
echo    - MySQL 서비스: 실행 중
echo    - 루트 비밀번호: Deukgeun6204_DB25
echo    - 데이터베이스: deukgeun_db
echo    - 포트: 3306
echo.
echo 🚀 이제 백엔드 서버를 실행할 수 있습니다!

:end
echo.
echo 스크립트 실행이 완료되었습니다.
pause
