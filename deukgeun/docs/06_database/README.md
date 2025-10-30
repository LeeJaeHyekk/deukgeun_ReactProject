# 🗄️ Database - 데이터베이스

Deukgeun 프로젝트의 데이터베이스 관련 문서입니다.

## 📚 문서 목록

### [MySQL 설정 가이드](../MYSQL_SETUP_GUIDE.md)
MySQL 데이터베이스 설정 가이드
- MySQL 서비스 시작
- 데이터베이스 생성
- 사용자 생성 및 권한 부여
- 연결 테스트
- TypeORM 마이그레이션

### [MySQL 문제 해결 가이드](../MYSQL_TROUBLESHOOTING_GUIDE.md)
MySQL 관련 문제 해결 방법
- 연결 오류 해결
- 권한 문제 해결
- 데이터베이스 복구
- 성능 최적화

## 🔧 데이터베이스 설정

### 필수 설정
- MySQL 8.0+ 설치
- 데이터베이스 생성 (`deukgeun_db`)
- 사용자 생성 및 권한 부여
- TypeORM 연결 설정

### 연결 정보
- Host: `localhost`
- Port: `3306`
- Database: `deukgeun_db`
- Character Set: `utf8mb4`
- Collation: `utf8mb4_unicode_ci`

## 📖 다음 단계

- [개발 환경 설정](../02_DEVELOPMENT_ENVIRONMENT.md) 확인
- [문제 해결 가이드](../07_troubleshooting/README.md) 확인
- [배포 가이드](../08_deployment/README.md) 확인

