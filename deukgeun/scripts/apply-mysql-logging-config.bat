@echo off
echo ============================================================================
echo MySQL 로깅 설정 적용 스크립트
echo ============================================================================

echo 🔍 MySQL 서비스 상태 확인...
sc query MySQL80 | findstr "RUNNING" >nul
if %errorlevel% neq 0 (
    echo ❌ MySQL 서비스가 실행되지 않았습니다. 서비스를 시작합니다...
    net start MySQL80
    if %errorlevel% neq 0 (
        echo ❌ MySQL 서비스 시작에 실패했습니다.
        pause
        exit /b 1
    )
)

echo ✅ MySQL 서비스가 실행 중입니다.

echo.
echo 🔧 MySQL 서비스 중지...
net stop MySQL80

echo.
echo 🔧 기존 설정 파일 백업...
if exist "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini" (
    copy "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini" "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini.backup.%date:~0,10%"
    echo ✅ 기존 설정 파일이 백업되었습니다.
)

echo.
echo 🔧 로깅 설정 파일 적용...
copy "scripts\mysql-logging-config.ini" "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"

echo.
echo 🔧 로그 디렉토리 권한 설정...
icacls "C:\ProgramData\MySQL\MySQL Server 8.4\Data" /grant "NT AUTHORITY\NetworkService:(OI)(CI)F" >nul 2>&1
icacls "C:\ProgramData\MySQL\MySQL Server 8.4\Data" /grant "Administrators:(OI)(CI)F" >nul 2>&1

echo.
echo 🔧 MySQL 서비스 시작...
net start MySQL80

if %errorlevel% equ 0 (
    echo ✅ MySQL 서비스가 성공적으로 시작되었습니다!
    goto :test_logging
) else (
    echo ❌ MySQL 서비스 시작에 실패했습니다.
    echo 백업된 설정 파일을 복원합니다...
    copy "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini.backup.%date:~0,10%" "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini"
    net start MySQL80
    goto :end
)

:test_logging
echo.
echo 🧪 로깅 설정 테스트...

echo 1. MySQL 연결 테스트...
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pDeukgeun6204_DB25 -e "SELECT 'Logging test successful!' as status;" >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ MySQL 연결 성공
) else (
    echo ❌ MySQL 연결 실패
    goto :end
)

echo.
echo 2. 로그 파일 생성 확인...

echo 에러 로그 확인:
if exist "C:\ProgramData\MySQL\MySQL Server 8.4\Data\mysql-error.log" (
    echo ✅ 에러 로그 파일이 생성되었습니다.
) else (
    echo ⚠️ 에러 로그 파일이 아직 생성되지 않았습니다.
)

echo.
echo 슬로우 쿼리 로그 확인:
if exist "C:\ProgramData\MySQL\MySQL Server 8.4\Data\mysql-slow.log" (
    echo ✅ 슬로우 쿼리 로그 파일이 생성되었습니다.
) else (
    echo ⚠️ 슬로우 쿼리 로그 파일이 아직 생성되지 않았습니다.
)

echo.
echo 바이너리 로그 확인:
if exist "C:\ProgramData\MySQL\MySQL Server 8.4\Data\mysql-bin.000001" (
    echo ✅ 바이너리 로그 파일이 생성되었습니다.
) else (
    echo ⚠️ 바이너리 로그 파일이 아직 생성되지 않았습니다.
)

echo.
echo 3. 로깅 설정 확인...
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pDeukgeun6204_DB25 -e "SHOW VARIABLES LIKE '%log%';" | findstr /i "log"

echo.
echo 🎉 MySQL 로깅 설정이 완료되었습니다!
echo.
echo 📋 설정 요약:
echo    - 에러 로그: mysql-error.log
echo    - 일반 로그: 비활성화 (성능상 권장)
echo    - 슬로우 쿼리 로그: 활성화 (2초 이상)
echo    - 바이너리 로그: 활성화 (백업/복제용)
echo    - 로그 만료: 7일
echo.
echo 📁 로그 파일 위치:
echo    - C:\ProgramData\MySQL\MySQL Server 8.4\Data\mysql-error.log
echo    - C:\ProgramData\MySQL\MySQL Server 8.4\Data\mysql-slow.log
echo    - C:\ProgramData\MySQL\MySQL Server 8.4\Data\mysql-bin.000001
echo.
echo 🚀 이제 성능 모니터링과 백업이 가능합니다!

:end
echo.
echo 스크립트 실행이 완료되었습니다.
pause
