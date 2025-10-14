# ============================================================================
# MySQL 초기화 및 설정 스크립트
# ============================================================================

# 관리자 권한 확인
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ 이 스크립트는 관리자 권한으로 실행되어야 합니다." -ForegroundColor Red
    Write-Host "PowerShell을 관리자 권한으로 실행한 후 다시 시도해주세요." -ForegroundColor Yellow
    pause
    exit 1
}

# MySQL 설정 변수
$mysqlBin = "C:\Program Files\MySQL\MySQL Server 8.4\bin"
$newRootPassword = "Deukgeun6204_DB25"
$mysqlServiceName = "MySQL80"
$databaseName = "deukgeun_db"

Write-Host "🚀 MySQL 초기화 및 설정을 시작합니다..." -ForegroundColor Green
Write-Host "📋 설정 정보:" -ForegroundColor Cyan
Write-Host "   - MySQL 경로: $mysqlBin" -ForegroundColor White
Write-Host "   - 새 루트 비밀번호: $newRootPassword" -ForegroundColor White
Write-Host "   - 서비스 이름: $mysqlServiceName" -ForegroundColor White
Write-Host "   - 데이터베이스 이름: $databaseName" -ForegroundColor White
Write-Host ""

# 1. MySQL 서비스 시작
Write-Host "1️⃣ MySQL 서비스 시작 중..." -ForegroundColor Yellow
try {
    Start-Service -Name $mysqlServiceName -ErrorAction Stop
    Write-Host "✅ MySQL 서비스가 성공적으로 시작되었습니다." -ForegroundColor Green
    
    # 서비스 시작 대기
    Start-Sleep -Seconds 5
    
    # 서비스 상태 확인
    $serviceStatus = Get-Service -Name $mysqlServiceName
    if ($serviceStatus.Status -eq "Running") {
        Write-Host "✅ MySQL 서비스가 정상적으로 실행 중입니다." -ForegroundColor Green
    } else {
        Write-Host "❌ MySQL 서비스 시작에 실패했습니다." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ MySQL 서비스 시작 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. MySQL 연결 테스트
Write-Host "2️⃣ MySQL 연결 테스트 중..." -ForegroundColor Yellow
try {
    $testConnection = & "$mysqlBin\mysql.exe" -u root -p"$newRootPassword" -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MySQL 연결이 성공했습니다." -ForegroundColor Green
    } else {
        Write-Host "⚠️ 기존 비밀번호로 연결 실패, 새 비밀번호 설정을 시도합니다..." -ForegroundColor Yellow
        
        # 3. 루트 비밀번호 재설정
        Write-Host "3️⃣ MySQL 루트 비밀번호 재설정 중..." -ForegroundColor Yellow
        
        # MySQL 안전 모드로 시작 (비밀번호 없이)
        Write-Host "   - MySQL 안전 모드로 시작 중..." -ForegroundColor White
        Stop-Service -Name $mysqlServiceName -Force
        Start-Sleep -Seconds 3
        
        # 임시 설정 파일 생성
        $tempConfigFile = "$env:TEMP\mysql-init.sql"
        $initSQL = @"
ALTER USER 'root'@'localhost' IDENTIFIED BY '$newRootPassword';
FLUSH PRIVILEGES;
"@
        $initSQL | Out-File -FilePath $tempConfigFile -Encoding UTF8
        
        # MySQL 안전 모드로 시작
        & "$mysqlBin\mysqld.exe" --init-file="$tempConfigFile" --console
        Start-Sleep -Seconds 10
        
        # MySQL 서비스 재시작
        Stop-Process -Name "mysqld" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        Start-Service -Name $mysqlServiceName
        Start-Sleep -Seconds 5
        
        # 임시 파일 삭제
        Remove-Item -Path $tempConfigFile -Force -ErrorAction SilentlyContinue
        
        Write-Host "✅ MySQL 루트 비밀번호가 재설정되었습니다." -ForegroundColor Green
    }
} catch {
    Write-Host "❌ MySQL 연결 테스트 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. 데이터베이스 생성
Write-Host "4️⃣ 데이터베이스 생성 중..." -ForegroundColor Yellow
try {
    $createDbSQL = @"
CREATE DATABASE IF NOT EXISTS $databaseName 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
"@
    
    $createDbSQL | & "$mysqlBin\mysql.exe" -u root -p"$newRootPassword"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 데이터베이스 '$databaseName'가 성공적으로 생성되었습니다." -ForegroundColor Green
    } else {
        Write-Host "❌ 데이터베이스 생성에 실패했습니다." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 데이터베이스 생성 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. 사용자 권한 설정
Write-Host "5️⃣ 사용자 권한 설정 중..." -ForegroundColor Yellow
try {
    $userSQL = @"
CREATE USER IF NOT EXISTS 'deukgeun_user'@'localhost' IDENTIFIED BY '$newRootPassword';
GRANT ALL PRIVILEGES ON $databaseName.* TO 'deukgeun_user'@'localhost';
FLUSH PRIVILEGES;
SHOW GRANTS FOR 'deukgeun_user'@'localhost';
"@
    
    $userSQL | & "$mysqlBin\mysql.exe" -u root -p"$newRootPassword"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 사용자 권한이 성공적으로 설정되었습니다." -ForegroundColor Green
    } else {
        Write-Host "❌ 사용자 권한 설정에 실패했습니다." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 사용자 권한 설정 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. 연결 테스트
Write-Host "6️⃣ 최종 연결 테스트 중..." -ForegroundColor Yellow
try {
    $testSQL = @"
USE $databaseName;
SELECT 'Database connection successful!' as status;
SHOW TABLES;
"@
    
    $testSQL | & "$mysqlBin\mysql.exe" -u root -p"$newRootPassword"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 모든 설정이 완료되었습니다!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 설정 요약:" -ForegroundColor Cyan
        Write-Host "   - MySQL 서비스: 실행 중" -ForegroundColor White
        Write-Host "   - 루트 비밀번호: $newRootPassword" -ForegroundColor White
        Write-Host "   - 데이터베이스: $databaseName" -ForegroundColor White
        Write-Host "   - 사용자: deukgeun_user" -ForegroundColor White
        Write-Host ""
        Write-Host "🎉 MySQL 초기화가 완료되었습니다!" -ForegroundColor Green
    } else {
        Write-Host "❌ 최종 연결 테스트에 실패했습니다." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 최종 연결 테스트 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "스크립트 실행이 완료되었습니다. 아무 키나 누르면 종료됩니다." -ForegroundColor Yellow
Read-Host "Press Enter to continue"
