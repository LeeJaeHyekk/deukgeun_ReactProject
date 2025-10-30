# 🧪 Testing - 테스트 가이드

Deukgeun 프로젝트의 테스트 관련 문서입니다.

## 📚 문서 목록

### [테스트 실행 가이드](../TEST_EXECUTION_GUIDE.md)
커뮤니티 페이지 기능 테스트 실행 가이드
- 빠른 시작
- 테스트 항목
- 테스트 실행 방법
- 결과 확인

### [빠른 테스트 가이드](../QUICK_TEST_GUIDE.md)
빠른 테스트 실행 방법
- 간단한 테스트 실행
- 주요 테스트 항목

### [기능 테스트 보고서](../FUNCTIONAL_TEST_REPORT.md)
커뮤니티 페이지 기능 테스트 보고서
- 테스트 항목
- 예상 결과
- 검증 방법

### [검증 도구 사용법](../VERIFICATION_USAGE.md)
커뮤니티 페이지 검증 도구 사용법
- 검증 도구 개요
- 사용 방법
- 테스트 실행

### [검증 테스트 결과](../VERIFICATION_TEST_RESULTS.md)
검증 테스트 실행 결과
- 테스트 결과
- 문제점 및 해결

## 🔧 테스트 도구

### 검증 도구 (verification.ts)
- 네트워크 모니터링
- API 요청 추적
- Authorization 헤더 확인
- 토큰 소스 확인

### 브라우저 콘솔 테스트
- `verification.start()` - 모니터링 시작
- `verification.runAll()` - 모든 테스트 실행
- `verification.testPosts()` - 게시글 요청 확인
- `verification.testComments()` - 댓글 요청 확인

## 📖 다음 단계

- [커뮤니티 기능](../04_community/README.md) 문서 확인
- [문제 해결 가이드](../07_troubleshooting/README.md) 확인
- [개발 가이드](../02_development/README.md) 확인

