# SSH 연결 테스트 스크립트 (Windows PowerShell)
# 사용법: .\scripts\ssh-connection-test.ps1

$ErrorActionPreference = "Stop"

# 설정
$keyPath = "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\deukgeun_ReactProject.pem"
$host = "43.203.30.167"
$users = @("ec2-user", "ubuntu", "admin")

Write-Host "`n🔍 SSH 연결 진단을 시작합니다...`n" -ForegroundColor Cyan

# 1. 키 파일 확인
Write-Host "1️⃣ SSH 키 파일 확인 중..." -ForegroundColor Yellow
if (-not (Test-Path $keyPath)) {
    Write-Host "❌ SSH 키 파일을 찾을 수 없습니다: $keyPath" -ForegroundColor Red
    Write-Host "📝 키 파일 경로를 확인하고 수정하세요." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ SSH 키 파일 확인: $keyPath" -ForegroundColor Green

# 2. 키 파일 권한 확인 및 수정
Write-Host "`n2️⃣ SSH 키 파일 권한 확인 중..." -ForegroundColor Yellow
try {
    $acl = Get-Acl $keyPath
    $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $isCorrect = $acl.Access | Where-Object {
        $_.IdentityReference -eq $currentUser -and
        $_.FileSystemRights -eq "Read" -and
        $_.AccessControlType -eq "Allow"
    }
    
    if ($isCorrect) {
        Write-Host "✅ SSH 키 파일 권한이 올바릅니다." -ForegroundColor Green
    } else {
        Write-Host "⚠️ SSH 키 파일 권한 수정 중..." -ForegroundColor Yellow
        icacls $keyPath /inheritance:r /grant:r "${env:USERNAME}:R" 2>&1 | Out-Null
        Write-Host "✅ SSH 키 파일 권한 수정 완료" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ 권한 확인 실패: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 3. 네트워크 연결 확인
Write-Host "`n3️⃣ 네트워크 연결 확인 중..." -ForegroundColor Yellow
try {
    $pingResult = Test-Connection -ComputerName $host -Count 2 -Quiet
    if ($pingResult) {
        Write-Host "✅ Ping 연결 성공 ($host)" -ForegroundColor Green
    } else {
        Write-Host "❌ Ping 연결 실패 ($host)" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️ Ping 테스트 실패: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. 포트 22 연결 확인
Write-Host "`n4️⃣ 포트 22 연결 확인 중..." -ForegroundColor Yellow
try {
    $portTest = Test-NetConnection -ComputerName $host -Port 22 -WarningAction SilentlyContinue
    if ($portTest.TcpTestSucceeded) {
        Write-Host "✅ 포트 22 연결 성공" -ForegroundColor Green
    } else {
        Write-Host "❌ 포트 22 연결 실패" -ForegroundColor Red
        Write-Host "📝 보안 그룹에서 SSH 규칙(포트 22)을 확인하세요." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ 포트 테스트 실패: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 5. SSH 연결 테스트 (각 사용자)
Write-Host "`n5️⃣ SSH 연결 테스트 중..." -ForegroundColor Yellow
$successUser = $null

foreach ($user in $users) {
    Write-Host "`n   🔍 $user 사용자로 시도 중..." -ForegroundColor Cyan
    
    # Git Bash가 있는 경우 사용, 없으면 직접 ssh 명령 실행
    $gitBashPath = "C:\Program Files\Git\bin\bash.exe"
    
    if (Test-Path $gitBashPath) {
        $sshCommand = "ssh -i `"$keyPath`" -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o LogLevel=ERROR $user@$host `"echo 'SSH 연결 성공'`" 2>&1"
        $command = "& `"$gitBashPath`" -c `"$sshCommand`""
        
        try {
            $result = Invoke-Expression $command 2>&1
            if ($LASTEXITCODE -eq 0 -or $result -match "SSH 연결 성공") {
                Write-Host "   ✅ $user 사용자로 SSH 연결 성공!" -ForegroundColor Green
                $successUser = $user
                break
            } else {
                Write-Host "   ❌ $user 사용자로 SSH 연결 실패" -ForegroundColor Red
                if ($result) {
                    Write-Host "   📝 에러: $result" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "   ❌ $user 사용자로 SSH 연결 실패: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⚠️ Git Bash를 찾을 수 없습니다. 수동으로 테스트하세요:" -ForegroundColor Yellow
        Write-Host "   ssh -i `"$keyPath`" $user@$host" -ForegroundColor White
    }
}

# 6. 결과 요약
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 진단 결과 요약" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

if ($successUser) {
    Write-Host "✅ SSH 연결 성공!" -ForegroundColor Green
    Write-Host "올바른 사용자 이름: $successUser" -ForegroundColor Cyan
    Write-Host "`n📝 ssh-config 파일에서 User를 '$successUser'로 변경하세요." -ForegroundColor Yellow
    
    # ssh-config 파일 업데이트 제안
    $sshConfigPath = "ssh-config"
    if (Test-Path $sshConfigPath) {
        Write-Host "`n💡 ssh-config 파일 업데이트 명령어:" -ForegroundColor Yellow
        Write-Host "(Get-Content $sshConfigPath) -replace 'User ec2-user', 'User $successUser' | Set-Content $sshConfigPath" -ForegroundColor White
    }
} else {
    Write-Host "❌ SSH 연결 실패" -ForegroundColor Red
    Write-Host "`n다음 사항을 확인하세요:" -ForegroundColor Yellow
    Write-Host "1. EC2 인스턴스 상태 (running)" -ForegroundColor White
    Write-Host "2. 보안 그룹 SSH 규칙 (포트 22, Source: 0.0.0.0/0)" -ForegroundColor White
    Write-Host "3. SSH 키 파일 경로 및 권한" -ForegroundColor White
    Write-Host "4. 인스턴스의 AMI 유형 (ec2-user 또는 ubuntu)" -ForegroundColor White
    Write-Host "`n📚 상세 가이드: docs/08_deployment/SSH_CONNECTION_TROUBLESHOOTING.md" -ForegroundColor Cyan
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan

