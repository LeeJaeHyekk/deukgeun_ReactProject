# 정적 파일 404 오류 분석 및 해결

## 🔍 문제 상황

### 발생한 오류
```
GET https://www.devtrail.net/js/vendor-BDnF4zds.js net::ERR_ABORTED 404 (Not Found)
```

### 확인 사항

1. **파일 존재 확인**
   - ✅ 파일 존재: `/home/ec2-user/deukgeun_ReactProject/deukgeun/dist/frontend/js/vendor-BDnF4zds.js`
   - ✅ 파일 크기: 160,845 bytes

2. **로컬 nginx 테스트**
   - ✅ 로컬: `curl -I http://localhost/js/vendor-BDnF4zds.js` → 200 OK
   - ❌ 외부: `curl -I https://www.devtrail.net/js/vendor-BDnF4zds.js` → 404

3. **PM2 로그 확인**
   - ⚠️ 백엔드가 `/js/vendor-BDnF4zds.js` 요청을 받고 있음
   - ❌ 백엔드가 404 응답 반환

4. **nginx 로그 확인**
   - ⚠️ nginx access.log에 `/js/vendor-BDnF4zds.js` 요청이 보이지 않음
   - ✅ ALB 헬스체크만 보임

## 📋 원인 분석

### 근본 원인

**PM2 로그에서 백엔드가 정적 파일 요청을 받고 있다는 것은:**
- nginx가 정적 파일 요청을 백엔드로 프록시하고 있음
- nginx의 `/js/` location 블록이 제대로 작동하지 않음
- 또는 nginx 설정이 제대로 로드되지 않음

### 가능한 원인

1. **nginx 설정 캐시 문제**
   - nginx가 이전 설정을 사용하고 있을 수 있음
   - nginx 재시작이 필요할 수 있음

2. **location 블록 우선순위 문제**
   - `/js/` location이 `/api/` location보다 먼저 평가되어야 함
   - 하지만 실제로는 다른 location이 먼저 매칭될 수 있음

3. **nginx 설정 파일 로드 문제**
   - `/etc/nginx/conf.d/devtrail.conf` 파일이 제대로 로드되지 않음
   - nginx 메인 설정 파일에서 include가 누락되었을 수 있음

4. **ALB 설정 문제**
   - ALB가 직접 백엔드로 요청을 전달하고 있을 수 있음
   - ALB 타겟 그룹 설정이 잘못되었을 수 있음

## ✅ 해결 방법

### 1. nginx 완전 재시작

```bash
# nginx 완전 재시작 (reload가 아닌 restart)
sudo systemctl restart nginx

# nginx 상태 확인
sudo systemctl status nginx

# nginx 설정 테스트
sudo nginx -t
```

### 2. nginx 설정 확인

```bash
# 실제 로드된 nginx 설정 확인
sudo nginx -T | grep -A 10 "location /js/"

# nginx 설정 파일 확인
cat /etc/nginx/conf.d/devtrail.conf | grep -A 10 "location /js/"
```

### 3. nginx 로그 확인

```bash
# nginx access 로그 확인
sudo tail -f /var/log/nginx/access.log

# nginx error 로그 확인
sudo tail -f /var/log/nginx/error.log
```

### 4. 백엔드 라우팅 확인

**백엔드가 정적 파일 요청을 처리하지 않도록 확인:**
- 백엔드는 `/api/` 경로만 처리해야 함
- 정적 파일 요청은 nginx가 처리해야 함

## 🔧 검증

### 1. 로컬 테스트

```bash
# 로컬에서 정적 파일 요청 테스트
curl -I http://localhost/js/vendor-BDnF4zds.js
# 예상 출력: HTTP/1.1 200 OK, Content-Type: application/javascript

# 로컬에서 백엔드 직접 요청 테스트
curl -I http://localhost:5000/js/vendor-BDnF4zds.js
# 예상 출력: HTTP/1.1 404 Not Found (정상)
```

### 2. 외부 테스트

```bash
# 외부에서 정적 파일 요청 테스트
curl -I https://www.devtrail.net/js/vendor-BDnF4zds.js
# 예상 출력: HTTP/2 200, Content-Type: application/javascript
```

### 3. PM2 로그 확인

```bash
# PM2 로그에서 정적 파일 요청이 보이지 않아야 함
pm2 logs --lines 50 | grep "js/vendor"
# 예상 출력: 없음 (nginx가 처리하므로)
```

## 📝 요약

**문제:**
- 외부에서 `/js/vendor-BDnF4zds.js` 요청 시 404 오류
- PM2 로그에서 백엔드가 정적 파일 요청을 받고 있음
- nginx가 정적 파일 요청을 백엔드로 프록시하고 있음

**해결:**
1. nginx 완전 재시작
2. nginx 설정 확인 및 검증
3. nginx 로그 확인
4. 백엔드 라우팅 확인

**검증:**
- 로컬 및 외부에서 정적 파일 요청 테스트
- PM2 로그에서 정적 파일 요청이 보이지 않는지 확인

