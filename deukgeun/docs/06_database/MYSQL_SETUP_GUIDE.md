# 🗄️ MySQL 데이터베이스 설정 가이드

## 📋 현재 상황
- MySQL 서비스가 중지되어 있음
- 새로운 루트 비밀번호: `your_mysql_root_password` (환경 변수에서 설정)
- 데이터베이스 이름: `deukgeun_db`

## 🔧 수동 설정 방법

### 1단계: MySQL 서비스 시작
1. **관리자 권한으로 명령 프롬프트 실행**
   - Windows 키 + R → `cmd` → Ctrl + Shift + Enter
   - 또는 PowerShell을 관리자 권한으로 실행

2. **MySQL 서비스 시작**
   ```cmd
   net start MySQL80
   ```

### 2단계: MySQL 연결 테스트
```cmd
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p
```
> 비밀번호 입력 프롬프트가 나타나면 환경 변수에 설정한 비밀번호를 입력하세요.

### 3단계: 데이터베이스 생성
MySQL에 연결된 후 다음 명령어 실행:
```sql
CREATE DATABASE IF NOT EXISTS deukgeun_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE deukgeun_db;

SHOW DATABASES;
```

### 4단계: 사용자 권한 설정
```sql
CREATE USER IF NOT EXISTS 'deukgeun_user'@'localhost' IDENTIFIED BY 'your_database_user_password';
GRANT ALL PRIVILEGES ON deukgeun_db.* TO 'deukgeun_user'@'localhost';
FLUSH PRIVILEGES;

SHOW GRANTS FOR 'deukgeun_user'@'localhost';
```
> `your_database_user_password`는 환경 변수에 설정한 사용자 비밀번호로 변경하세요.

### 5단계: 연결 테스트
```sql
USE deukgeun_db;
SELECT 'Database connection successful!' as status;
SHOW TABLES;
```

## 🚀 백엔드 서버 실행

### 환경 변수 설정 후 실행
```cmd
set DB_PASSWORD=your_database_password_here
set DB_HOST=localhost
set DB_PORT=3306
set DB_USERNAME=root
set DB_NAME=deukgeun_db
set NODE_ENV=development

cd src/backend
npm run dev
```
> `your_database_password_here`는 실제 데이터베이스 비밀번호로 변경하세요.

## 🔍 문제 해결

### MySQL 서비스가 시작되지 않는 경우
1. **서비스 상태 확인**
   ```cmd
   sc query MySQL80
   ```

2. **서비스 수동 시작**
   ```cmd
   net start MySQL80
   ```

3. **MySQL 재설치가 필요한 경우**
   - MySQL 8.4 재설치
   - 루트 비밀번호를 강력한 비밀번호로 설정 (환경 변수에 저장)

### 연결 오류가 발생하는 경우
1. **방화벽 확인**
   - Windows 방화벽에서 MySQL 포트 3306 허용

2. **MySQL 설정 확인**
   ```cmd
   "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" --version
   ```

3. **포트 사용 확인**
   ```cmd
   netstat -an | findstr 3306
   ```

## 📊 설정 확인

### 환경 변수 확인
```cmd
echo %DB_PASSWORD%
echo %DB_HOST%
echo %DB_PORT%
echo %DB_USERNAME%
echo %DB_NAME%
```

### 서버 상태 확인
```cmd
curl http://localhost:5000/health
```

## 🎯 완료 후 확인사항

✅ MySQL 서비스가 실행 중인가?  
✅ 데이터베이스 `deukgeun_db`가 생성되었는가?  
✅ 사용자 `deukgeun_user`가 생성되었는가?  
✅ 백엔드 서버가 정상적으로 시작되는가?  
✅ `/health` 엔드포인트가 응답하는가?  

## 📞 추가 도움이 필요한 경우

위 단계를 따라해도 문제가 해결되지 않으면:
1. MySQL 에러 로그 확인: `C:\ProgramData\MySQL\MySQL Server 8.4\Data\*.err`
2. Windows 이벤트 뷰어에서 MySQL 관련 오류 확인
3. MySQL 서비스 종속성 확인
