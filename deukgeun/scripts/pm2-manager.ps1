# PM2 관리 PowerShell 스크립트
# Windows에서 CMD 창이 반복 열리는 문제를 해결하기 위한 스크립트

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "delete", "clean", "monitor")]
    [string]$Command = "help"
)

# 색상 함수
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success($message) { Write-ColorOutput Green "✅ $message" }
function Write-Error($message) { Write-ColorOutput Red "❌ $message" }
function Write-Warning($message) { Write-ColorOutput Yellow "⚠️  $message" }
function Write-Info($message) { Write-ColorOutput Cyan "ℹ️  $message" }

# 헤더 출력
Write-ColorOutput Blue "========================================"
Write-ColorOutput Blue "        Deukgeun PM2 Manager          "
Write-ColorOutput Blue "========================================"
Write-Output ""

# PM2 설치 확인
try {
    $pm2Version = pm2 --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "PM2 not found"
    }
    Write-Info "PM2 버전: $pm2Version"
} catch {
    Write-Error "PM2가 설치되어 있지 않습니다. 다음 명령어를 실행해주세요:"
    Write-Output "npm install -g pm2"
    exit 1
}

# 명령어 실행 함수
function Start-Processes {
    Write-Info "프로세스 시작 중..."
    try {
        pm2 start ecosystem.config.cjs
        if ($LASTEXITCODE -eq 0) {
            Write-Success "모든 프로세스가 성공적으로 시작되었습니다."
        } else {
            throw "프로세스 시작 실패"
        }
    } catch {
        Write-Error "프로세스 시작에 실패했습니다: $_"
    }
}

function Stop-Processes {
    Write-Warning "프로세스 중지 중..."
    try {
        pm2 stop ecosystem.config.cjs
        if ($LASTEXITCODE -eq 0) {
            Write-Success "모든 프로세스가 중지되었습니다."
        } else {
            throw "프로세스 중지 실패"
        }
    } catch {
        Write-Error "프로세스 중지에 실패했습니다: $_"
    }
}

function Restart-Processes {
    Write-Warning "프로세스 재시작 중..."
    try {
        pm2 restart ecosystem.config.cjs
        if ($LASTEXITCODE -eq 0) {
            Write-Success "모든 프로세스가 재시작되었습니다."
        } else {
            throw "프로세스 재시작 실패"
        }
    } catch {
        Write-Error "프로세스 재시작에 실패했습니다: $_"
    }
}

function Show-Status {
    Write-Info "프로세스 상태 확인 중..."
    pm2 status
}

function Show-Logs {
    Write-Info "로그 확인 중... (최근 50줄)"
    pm2 logs --lines 50
}

function Remove-Processes {
    Write-Error "경고: 모든 프로세스가 삭제됩니다."
    $confirm = Read-Host "계속하시겠습니까? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        try {
            pm2 delete ecosystem.config.cjs
            if ($LASTEXITCODE -eq 0) {
                Write-Success "모든 프로세스가 삭제되었습니다."
            } else {
                throw "프로세스 삭제 실패"
            }
        } catch {
            Write-Error "프로세스 삭제에 실패했습니다: $_"
        }
    } else {
        Write-Warning "작업이 취소되었습니다."
    }
}

function Clean-Logs {
    Write-Info "로그 파일 정리 중..."
    if (Test-Path "logs") {
        try {
            # 7일 이상 된 로그 파일 삭제
            Get-ChildItem -Path "logs" -Filter "*.log" | 
                Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | 
                Remove-Item -Force
            Write-Success "7일 이상 된 로그 파일이 정리되었습니다."
        } catch {
            Write-Error "로그 정리에 실패했습니다: $_"
        }
    } else {
        Write-Warning "로그 디렉토리가 존재하지 않습니다."
    }
}

function Start-Monitor {
    Write-Info "실시간 모니터링 시작 중..."
    pm2 monit
}

function Show-Help {
    Write-ColorOutput Blue "사용법: .\pm2-manager.ps1 [명령어]"
    Write-Output ""
    Write-ColorOutput Blue "사용 가능한 명령어:"
    Write-Output "  start   - 모든 프로세스 시작"
    Write-Output "  stop    - 모든 프로세스 중지"
    Write-Output "  restart - 모든 프로세스 재시작"
    Write-Output "  status  - 프로세스 상태 확인"
    Write-Output "  logs    - 로그 확인"
    Write-Output "  delete  - 모든 프로세스 삭제"
    Write-Output "  clean   - 로그 파일 정리"
    Write-Output "  monitor - 실시간 모니터링"
    Write-Output ""
    Write-ColorOutput Yellow "예시:"
    Write-Output "  .\pm2-manager.ps1 start"
    Write-Output "  .\pm2-manager.ps1 status"
}

# 명령어 실행
switch ($Command) {
    "start" { Start-Processes }
    "stop" { Stop-Processes }
    "restart" { Restart-Processes }
    "status" { Show-Status }
    "logs" { Show-Logs }
    "delete" { Remove-Processes }
    "clean" { Clean-Logs }
    "monitor" { Start-Monitor }
    "help" { Show-Help }
    default { 
        Write-Error "알 수 없는 명령어: $Command"
        Show-Help
    }
}

Write-Output ""
Write-ColorOutput Blue "작업이 완료되었습니다."
