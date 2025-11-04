# Windows SSH Config 파일 설정 스크립트
# Cursor Remote SSH 확장에서 사용할 SSH 설정을 추가합니다

$ErrorActionPreference = "Stop"

# 설정
$sshConfigPath = "$env:USERPROFILE\.ssh\config"
$keyPath = "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
$hostName = "43.203.30.167"
$users = @("ubuntu", "ec2-user")

Write-Host "`n🔧 Windows SSH Config 파일 설정 중...`n" -ForegroundColor Cyan

# 1. .ssh 디렉토리 생성
Write-Host "1️⃣ .ssh 디렉토리 확인 중..." -ForegroundColor Yellow
$sshDir = "$env:USERPROFILE\.ssh"
if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
    Write-Host "✅ .ssh 디렉토리 생성: $sshDir" -ForegroundColor Green
} else {
    Write-Host "✅ .ssh 디렉토리 확인: $sshDir" -ForegroundColor Green
}

# 2. 키 파일 확인
Write-Host "`n2️⃣ SSH 키 파일 확인 중..." -ForegroundColor Yellow
if (-not (Test-Path $keyPath)) {
    Write-Host "❌ SSH 키 파일을 찾을 수 없습니다: $keyPath" -ForegroundColor Red
    Write-Host "📝 키 파일 경로를 확인하고 수정하세요." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ SSH 키 파일 확인: $keyPath" -ForegroundColor Green

# 3. 키 파일 권한 설정
Write-Host "`n3️⃣ SSH 키 파일 권한 설정 중..." -ForegroundColor Yellow
try {
    icacls $keyPath /inheritance:r /grant:r "${env:USERNAME}:R" 2>&1 | Out-Null
    Write-Host "✅ SSH 키 파일 권한 설정 완료" -ForegroundColor Green
} catch {
    Write-Host "⚠️ 권한 설정 실패: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. SSH Config 파일 확인 및 백업
Write-Host "`n4️⃣ SSH Config 파일 확인 중..." -ForegroundColor Yellow
if (Test-Path $sshConfigPath) {
    $backupPath = "$sshConfigPath.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
    Copy-Item $sshConfigPath $backupPath
    Write-Host "✅ 기존 config 파일 백업: $backupPath" -ForegroundColor Green
} else {
    Write-Host "📝 새 SSH Config 파일 생성 중..." -ForegroundColor Yellow
    New-Item -ItemType File -Path $sshConfigPath -Force | Out-Null
}

# 5. SSH Config 내용 확인
Write-Host "`n5️⃣ SSH Config 내용 확인 중..." -ForegroundColor Yellow
$configContent = Get-Content $sshConfigPath -Raw -ErrorAction SilentlyContinue
$hostExists = $configContent -match "Host deukgeun-ec2"

if ($hostExists) {
    Write-Host "⚠️ 'deukgeun-ec2' 호스트가 이미 존재합니다." -ForegroundColor Yellow
    Write-Host "기존 설정을 업데이트합니다..." -ForegroundColor Yellow
    
    # 기존 설정 제거
    $lines = Get-Content $sshConfigPath
    $newLines = @()
    $skip = $false
    
    foreach ($line in $lines) {
        if ($line -match "^Host deukgeun-ec2") {
            $skip = $true
        } elseif ($skip -and ($line -match "^Host " -or $line.Trim() -eq "")) {
            $skip = $false
            if ($line.Trim() -ne "") {
                $newLines += $line
            }
        } elseif (-not $skip) {
            $newLines += $line
        }
    }
    
    $newLines | Set-Content $sshConfigPath
}

# 6. SSH Config 추가
Write-Host "`n6️⃣ SSH Config 설정 추가 중..." -ForegroundColor Yellow

$sshConfig = @"

# Deukgeun EC2 Server - Cursor Remote SSH
Host deukgeun-ec2
    HostName $hostName
    User ubuntu
    Port 22
    IdentityFile $keyPath
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 60
    TCPKeepAlive yes
    Compression yes
    LogLevel DEBUG

# Deukgeun EC2 Server - ec2-user (Amazon Linux)
Host deukgeun-ec2-amazon
    HostName $hostName
    User ec2-user
    Port 22
    IdentityFile $keyPath
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 60
    TCPKeepAlive yes
    Compression yes
    LogLevel DEBUG

"@

# Config 파일 끝에 추가
Add-Content -Path $sshConfigPath -Value $sshConfig
Write-Host "✅ SSH Config 설정 추가 완료" -ForegroundColor Green

# 7. Config 파일 권한 설정
Write-Host "`n7️⃣ SSH Config 파일 권한 설정 중..." -ForegroundColor Yellow
try {
    icacls $sshConfigPath /inheritance:r /grant:r "${env:USERNAME}:R" 2>&1 | Out-Null
    Write-Host "✅ SSH Config 파일 권한 설정 완료" -ForegroundColor Green
} catch {
    Write-Host "⚠️ 권한 설정 실패: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 8. 연결 테스트
Write-Host "`n8️⃣ SSH 연결 테스트 중..." -ForegroundColor Yellow
$successUser = $null

foreach ($user in $users) {
    Write-Host "`n   🔍 $user 사용자로 시도 중..." -ForegroundColor Cyan
    
    $testCommand = "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o LogLevel=ERROR $user@$hostName `"echo 'SSH 연결 성공'`" 2>&1"
    
    try {
        $result = Invoke-Expression $testCommand 2>&1
        if ($LASTEXITCODE -eq 0 -or $result -match "SSH 연결 성공") {
            Write-Host "   ✅ $user 사용자로 SSH 연결 성공!" -ForegroundColor Green
            $successUser = $user
            break
        } else {
            Write-Host "   ❌ $user 사용자로 SSH 연결 실패" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ $user 사용자로 SSH 연결 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 9. 결과 요약
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 설정 완료 요약" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

Write-Host "✅ SSH Config 파일 위치: $sshConfigPath" -ForegroundColor Green
Write-Host "✅ 호스트 이름: deukgeun-ec2" -ForegroundColor Green
Write-Host "✅ 호스트 IP: $hostName" -ForegroundColor Green

if ($successUser) {
    Write-Host "✅ 올바른 사용자 이름: $successUser" -ForegroundColor Green
    Write-Host "`n📝 Cursor에서 'deukgeun-ec2'로 연결하세요." -ForegroundColor Yellow
} else {
    Write-Host "⚠️ SSH 연결 테스트 실패" -ForegroundColor Yellow
    Write-Host "다음 사항을 확인하세요:" -ForegroundColor Yellow
    Write-Host "1. EC2 인스턴스 상태 (running)" -ForegroundColor White
    Write-Host "2. 보안 그룹 SSH 규칙 (포트 22)" -ForegroundColor White
    Write-Host "3. 네트워크 연결" -ForegroundColor White
}

Write-Host "`n📚 상세 가이드: docs/08_deployment/SSH_CONNECTION_TROUBLESHOOTING.md" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

