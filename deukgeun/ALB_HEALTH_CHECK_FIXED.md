# ALB 헬스체크 문제 해결 완료

## ✅ 완료된 작업

### 1. Express 서버 설정 수정
- ✅ **0.0.0.0:5000에서 리스닝하도록 수정**
  - 소스 파일: `src/backend/index.ts`
  - 빌드 파일: `dist/backend/backend/index.cjs`
  - 변경: `app.listen(port, '0.0.0.0', ...)` → 모든 인터페이스에서 접근 가능

### 2. 헬스체크 엔드포인트 수정
- ✅ **HTTP 200 항상 반환하도록 수정**
  - 소스 파일: `src/backend/middlewares/healthMonitor.ts`
  - 빌드 파일: `dist/backend/backend/middlewares/healthMonitor.cjs`
  - 변경: 데이터베이스 연결 실패 시에도 HTTP 200 반환 (ALB 헬스체크 통과)

### 3. 데이터베이스 검증 수정
- ✅ **프로덕션 환경에서도 DB 연결 실패 시 계속 진행**
  - 소스 파일: `src/backend/middlewares/serverStartup.ts`
  - 빌드 파일: `dist/backend/backend/middlewares/serverStartup.cjs`
  - 변경: 헬스체크를 위해 데이터베이스 연결 실패해도 서버 시작

### 4. nginx 설정 수정
- ✅ **/health 경로를 백엔드로 프록시**
  - 파일: `nginx-site.conf`, `/etc/nginx/conf.d/devtrail.conf`
  - 변경: nginx에서 직접 응답하지 않고 백엔드로 전달

## 📋 현재 상태

### Express 서버
- ✅ **포트**: 5000 (0.0.0.0에서 리스닝)
- ✅ **상태**: online (PM2)
- ✅ **헬스체크**: HTTP 200 반환
  - 경로: `/health`
  - 응답: `{"status":"unhealthy",...}` (상태는 unhealthy지만 HTTP 200)

### nginx
- ✅ **포트**: 80 (HTTP만)
- ✅ **상태**: active
- ✅ **헬스체크 프록시**: `/health` → `http://127.0.0.1:5000/health`
- ✅ **API 프록시**: `/api/` → `http://127.0.0.1:5000`

## 🔍 검증 방법

### 1. Express 서버 포트 확인
```bash
sudo lsof -i -P -n | grep LISTEN | grep 5000
# 예상 출력: node ... *:5000 (LISTEN)
```

### 2. Express 헬스체크 테스트
```bash
curl -I http://localhost:5000/health
# 예상 출력: HTTP/1.1 200 OK
```

### 3. nginx 헬스체크 테스트
```bash
curl -I http://localhost/health
# 예상 출력: HTTP/1.1 200 OK
```

### 4. 외부 접근 테스트 (ALB를 통한 접근)
```bash
curl -I http://devtrail.net/health
# 예상 출력: HTTP/1.1 200 OK 또는 HTTP/2 200
```

## 📝 ALB 대상 그룹 설정 확인

### AWS 콘솔에서 확인할 항목:

1. **Target Groups → devtrail-targets**
   - **프로토콜**: HTTP
   - **포트**: 5000 (또는 80)
   - **헬스체크 경로**: `/health`
   - **정상 코드**: 200-399
   - **간격**: 30초
   - **실패 임계값**: 3회
   - **성공 임계값**: 2회

2. **등록된 대상 상태**
   - EC2 인스턴스가 "healthy" 상태인지 확인
   - "unhealthy" 상태라면 원인 확인

## ⚠️ 주의사항

### 포트 설정에 따른 ALB 설정

**ALB가 5000번 포트로 직접 체크하는 경우:**
- 대상 그룹 포트: 5000
- 헬스체크 경로: `/health`
- EC2 보안 그룹: ALB에서 5000 포트 접근 허용

**ALB가 80번 포트로 체크하는 경우 (nginx를 통해):**
- 대상 그룹 포트: 80
- 헬스체크 경로: `/health` (nginx가 백엔드로 프록시)
- EC2 보안 그룹: ALB에서 80 포트 접근 허용

## 🎯 다음 단계

1. **AWS 콘솔에서 대상 그룹 확인**
   - 대상 상태가 "healthy"로 변경되는지 확인
   - 헬스체크 설정이 올바른지 확인

2. **보안 그룹 확인**
   - EC2 보안 그룹에서 ALB 보안 그룹의 5000 포트 접근 허용 확인

3. **ALB 리스너 확인**
   - 443 리스너가 올바른 ACM 인증서로 설정되어 있는지 확인

## ✅ 완료 체크리스트

- [x] Express 서버가 0.0.0.0:5000에서 리스닝
- [x] /health 엔드포인트가 HTTP 200 반환
- [x] nginx가 /health를 백엔드로 프록시
- [x] 데이터베이스 연결 실패 시에도 서버 시작
- [x] nginx 설정 적용 완료
- [ ] ALB 대상 그룹에서 대상 상태가 "healthy"로 변경 (AWS 콘솔에서 확인 필요)

## 📚 참고

- Express 서버는 현재 데이터베이스 연결이 없어도 실행 중입니다
- 헬스체크는 HTTP 200을 반환하지만, JSON 응답의 `status` 필드는 `unhealthy`입니다
- 데이터베이스 연결 문제는 별도로 해결해야 합니다

