# 🔧 MySQL 서비스 문제 해결 가이드

## 🚨 현재 문제 상황
1. **MySQL 서비스 시작 실패**: `net start MySQL80` 실행 시 오류 발생
2. **PowerShell 구문 오류**: MySQL 클라이언트 연결 명령어 구문 문제

## 🔍 문제 진단

### 1. MySQL 서비스 상태 확인
```powershell
# PowerShell에서 실행
Get-Service MySQL80
```

### 2. 서비스 상세 정보 확인
```powershell
# PowerShell에서 실행
sc query MySQL80
```

### 3. MySQL 에러 로그 확인
```powershell
# PowerShell에서 실행
Get-Content "C:\ProgramData\MySQL\MySQL Server 8.4\Data\*.err" -Tail 20
```

## 🛠️ 해결 방법

### 방법 1: 관리자 권한으로 배치 파일 실행
1. **관리자 권한으로 명령 프롬프트 실행**
   - Windows 키 + R → `cmd` → Ctrl + Shift + Enter

2. **수정된 배치 파일 실행**
   ```cmd
   cd "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun"
   scripts\fix-mysql-service.bat
   ```

### 방법 2: PowerShell에서 올바른 구문 사용

#### MySQL 서비스 시작
```powershell
# PowerShell에서 실행
Start-Service MySQL80
```

#### MySQL 연결 (PowerShell 구문)
```powershell
# PowerShell에서 실행 - 올바른 구문
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pDeukgeun6204_DB25
```

또는

```powershell
# 환경 변수 사용
$env:DB_PASSWORD = "Deukgeun6204_DB25"
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p$env:DB_PASSWORD
```

### 방법 3: MySQL 재설치 (최후의 수단)

#### 1. MySQL 완전 제거
```powershell
# PowerShell 관리자 권한으로 실행
Stop-Service MySQL80 -Force
Remove-Service MySQL80
```

#### 2. MySQL 8.4 재설치
- [MySQL 8.4 다운로드](https://dev.mysql.com/downloads/mysql/)
- 설치 시 루트 비밀번호를 `Deukgeun6204_DB25`로 설정

## 🔧 단계별 해결 과정

### 1단계: 서비스 문제 해결
```powershell
# PowerShell 관리자 권한으로 실행
Stop-Service MySQL80 -Force
Start-Service MySQL80
```

### 2단계: 연결 테스트
```powershell
# PowerShell에서 실행
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pDeukgeun6204_DB25 -e "SELECT 1;"
```

### 3단계: 데이터베이스 생성
```powershell
# MySQL에 연결된 후 실행할 SQL
$sql = @"
CREATE DATABASE IF NOT EXISTS deukgeun_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
USE deukgeun_db;
SHOW DATABASES;
"@

$sql | & "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -pDeukgeun6204_DB25
```

## 🚀 백엔드 서버 실행

### 환경 변수 설정 (PowerShell)
```powershell
$env:DB_PASSWORD = "Deukgeun6204_DB25"
$env:DB_HOST = "localhost"
$env:DB_PORT = "3306"
$env:DB_USERNAME = "root"
$env:DB_NAME = "deukgeun_db"
$env:NODE_ENV = "development"
```

### 서버 실행
```powershell
cd "C:\Users\jaehyuok\Documents\GitHub\deukgeun_ReactProject\deukgeun\src\backend"
npm run dev
```

## 🔍 추가 진단 명령어

### Windows 이벤트 로그 확인
```powershell
# PowerShell 관리자 권한으로 실행
Get-WinEvent -LogName System | Where-Object {$_.ProviderName -like "*MySQL*"} | Select-Object -First 10
```

### 포트 사용 확인
```powershell
# PowerShell에서 실행
netstat -an | Select-String "3306"
```

### MySQL 프로세스 확인
```powershell
# PowerShell에서 실행
Get-Process | Where-Object {$_.ProcessName -like "*mysql*"}
```

## 📞 문제가 지속되는 경우

1. **MySQL 완전 재설치**
2. **Windows 재부팅**
3. **방화벽 및 안티바이러스 확인**
4. **디스크 공간 확인**

## ✅ 성공 확인 체크리스트

- [ ] MySQL 서비스가 실행 중인가?
- [ ] MySQL 클라이언트 연결이 성공하는가?
- [ ] `deukgeun_db` 데이터베이스가 생성되었는가?
- [ ] 백엔드 서버가 정상적으로 시작되는가?
- [ ] `/health` 엔드포인트가 응답하는가?
