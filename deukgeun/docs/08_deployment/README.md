# 📦 Deployment - 배포 및 운영

Deukgeun 프로젝트의 배포 및 운영 관련 문서입니다.

## 📚 문서 목록

### [보안 가이드](../SECURITY_GUIDE.md)
보안 강화 조치 및 베스트 프랙티스
- 긴급 보안 수정 완료
- 환경변수 검증 시스템
- 하드코딩 제거
- API 키 보안
- JWT 시크릿 키 보안
- 보안 강화 조치

### [완전 통합 가이드](./DEUKGEUN_COMPLETE_GUIDE.md)
프로젝트의 모든 설정, 배포, 관리 방법을 통합한 완전한 가이드
- 프로젝트 개요 및 주요 기능
- 빠른 시작
- 빌드 시스템
- 환경 설정
- SSH 및 AWS 설정
- EC2 배포 가이드
- PM2 관리
- Nginx 관리
- 통합 실행 스크립트
- 자동 컴파일 시스템
- 테스트
- 문제 해결
- 보안

### [SSH 연결 문제 해결](./SSH_CONNECTION_TROUBLESHOOTING.md)
SSH 연결 실패 문제 해결 가이드
- EC2 인스턴스 상태 확인
- 보안 그룹 설정
- SSH 키 파일 권한
- 사용자 이름 확인
- 빠른 해결 방법

### [Cursor Remote SSH 설정](./CURSOR_REMOTE_SSH_SETUP.md)
Cursor Remote SSH 확장 설정 가이드
- Windows SSH Config 파일 설정
- SSH 키 파일 권한
- Cursor 설정 확인
- 연결 문제 해결

### [Cursor SSH 빠른 해결](./CURSOR_SSH_FIX.md)
Cursor Remote SSH 연결 문제 즉시 해결 방법
- SSH Config 파일 수정
- SSH 키 파일 권한 설정
- Cursor 설정 확인
- EC2 인스턴스 상태 확인

### [EC2 환경 문제 해결](./EC2_ENVIRONMENT_FIXES.md)
EC2 환경에서 발생할 수 있는 문제 및 해결 방법
- Windows 전용 빌드 명령어 문제
- 경로 구분자 문제
- 환경 변수 설정 문제
- 로그 디렉토리 권한 문제

## 🔧 배포 프로세스

### 빌드
- TypeScript 컴파일
- 프론트엔드 빌드
- ES Modules → CommonJS 변환

### 배포
- EC2 서버 설정
- PM2 프로세스 관리
- Nginx 설정
- 환경 변수 설정

### 모니터링
- 로그 확인
- 헬스 체크
- 성능 모니터링

## 📖 다음 단계

- [개발 환경 설정](../02_DEVELOPMENT_ENVIRONMENT.md) 확인
- [문제 해결 가이드](../07_troubleshooting/README.md) 확인
- [보안 가이드](../SECURITY_GUIDE.md) 확인

