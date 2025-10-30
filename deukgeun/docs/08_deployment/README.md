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

### [완전 통합 가이드](../DEUKGEUN_COMPLETE_GUIDE.md)
프로젝트의 모든 설정, 배포, 관리 방법
- EC2 배포 가이드
- PM2 관리
- Nginx 관리
- 통합 실행 스크립트
- 자동 컴파일 시스템

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

