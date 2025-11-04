# Windows SSH Config 파일 수정 스크립트
# Cursor Remote SSH 연결 문제 해결

$ErrorActionPreference = "Stop"

$sshConfigPath = "$env:USERPROFILE\.ssh\config"

Write-Host "`n🔧 Windows SSH Config 파일 수정 중...`n" -ForegroundColor Cyan

# 1. Config 파일 읽기
if (-not (Test-Path $sshConfigPath)) {
    Write-Host "❌ SSH Config 파일을 찾을 수 없습니다: $sshConfigPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SSH Config 파일 확인: $sshConfigPath" -ForegroundColor Green

# 2. Config 파일 백업
$backupPath = "$sshConfigPath.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
Copy-Item $sshConfigPath $backupPath
Write-Host "✅ Config 파일 백업: $backupPath" -ForegroundColor Green

# 3. Config 파일 내용 읽기
$configContent = Get-Content $sshConfigPath -Raw

# 4. deukgeun-ec2 호스트 설정 수정
$newConfig = @"
# VS Code Remote-SSH 설정 파일
# deukgeun 프로젝트의 EC2 인스턴스 (현재 사용 중)

# Deukgeun EC2 Server - Cursor Remote SSH (Ubuntu)
Host deukgeun-ec2
    HostName 43.203.30.167
    User ubuntu
    Port 22
    IdentityFile "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 120
    TCPKeepAlive yes
    Compression yes
    LogLevel DEBUG
    ForwardAgent yes
    RequestTTY no
    IdentitiesOnly yes

# Deukgeun EC2 Server - ec2-user (Amazon Linux)
Host deukgeun-ec2-amazon
    HostName 43.203.30.167
    User ec2-user
    Port 22
    IdentityFile "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ConnectTimeout 120
    TCPKeepAlive yes
    Compression yes
    LogLevel DEBUG
    ForwardAgent yes
    RequestTTY no
    IdentitiesOnly yes

"@

# 5. 기존 deukgeun-ec2 설정 제거 및 새 설정 추가
$lines = Get-Content $sshConfigPath
$newLines = @()
$skip = $false
$foundDeukgeun = $false

foreach ($line in $lines) {
    if ($line -match "^Host deukgeun-ec2") {
        $skip = $true
        $foundDeukgeun = $true
    } elseif ($skip -and ($line -match "^Host " -and $line -notmatch "deukgeun")) {
        $skip = $false
        $newLines += $line
    } elseif (-not $skip) {
        $newLines += $line
    }
}

# deukgeun 설정이 없으면 추가
if (-not $foundDeukgeun) {
    $newLines += ""
    $newLines += "# Deukgeun EC2 Server Configuration"
}

# 새 설정 추가
$newLines | Set-Content $sshConfigPath
Add-Content -Path $sshConfigPath -Value $newConfig

Write-Host "✅ SSH Config 파일 수정 완료" -ForegroundColor Green

# 6. 연결 테스트
Write-Host "`n🔍 SSH 연결 테스트 중...`n" -ForegroundColor Yellow

$testCommand = 'ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o LogLevel=ERROR -F "$env:USERPROFILE\.ssh\config" deukgeun-ec2 "echo SSH 연결 성공" 2>&1'

try {
    $result = Invoke-Expression $testCommand
    if ($LASTEXITCODE -eq 0 -or $result -match "SSH 연결 성공") {
        Write-Host "✅ SSH 연결 성공!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ SSH 연결 테스트 실패" -ForegroundColor Yellow
        Write-Host "다음 사항을 확인하세요:" -ForegroundColor Yellow
        Write-Host "1. EC2 인스턴스 상태 (running)" -ForegroundColor White
        Write-Host "2. 보안 그룹 SSH 규칙 (포트 22)" -ForegroundColor White
        Write-Host "3. SSH 키 파일 경로 및 권한" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️ SSH 연결 테스트 실패: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n📝 Cursor에서 'deukgeun-ec2' 또는 'deukgeun-ec2-amazon'으로 연결하세요." -ForegroundColor Cyan
Write-Host "📚 상세 가이드: docs/08_deployment/CURSOR_REMOTE_SSH_SETUP.md" -ForegroundColor Cyan

