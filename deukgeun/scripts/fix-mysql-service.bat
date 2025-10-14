@echo off
echo ============================================================================
echo MySQL 서비스 문제 해결 스크립트
echo ============================================================================

echo 🔍 MySQL 서비스 상태 확인 중...
sc query MySQL80

echo.
echo 🔧 MySQL 서비스 중지 중...
net stop MySQL80

echo.
echo 🔍 MySQL 프로세스 확인 및 종료...
taskkill /f /im mysqld.exe >nul 2>&1

echo.
echo 🔧 MySQL 데이터 디렉토리 권한 확인...
icacls "C:\ProgramData\MySQL\MySQL Server 8.4\Data" /grant "NT AUTHORITY\NetworkService:(OI)(CI)F" >nul 2>&1

echo.
echo 🔧 MySQL 설정 파일 확인...
if exist "C:\ProgramData\MySQL\MySQL Server 8.4\my.ini" (
    echo ✅ MySQL 설정 파일이 존재합니다.
) else (
    echo ❌ MySQL 설정 파일이 없습니다.
    echo MySQL 재설치가 필요할 수 있습니다.
)

echo.
echo 🔧 MySQL 서비스 재시작 시도...
net start MySQL80

if %errorlevel% equ 0 (
    echo ✅ MySQL 서비스가 성공적으로 시작되었습니다!
    echo.
    echo 🧪 MySQL 연결 테스트...
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pDeukgeun6204_DB25 -e "SELECT 1;" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ MySQL 연결이 성공했습니다!
    ) else (
        echo ⚠️ MySQL 연결에 실패했습니다. 비밀번호 재설정이 필요할 수 있습니다.
    )
) else (
    echo ❌ MySQL 서비스 시작에 실패했습니다.
    echo.
    echo 🔍 추가 진단 정보:
    echo - 서비스 상태:
    sc query MySQL80
    echo.
    echo - Windows 이벤트 로그 확인이 필요할 수 있습니다.
    echo - MySQL 재설치를 고려해보세요.
)

echo.
echo 스크립트 실행이 완료되었습니다.
pause
