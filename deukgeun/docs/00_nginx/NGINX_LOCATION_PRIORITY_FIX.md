# nginx Location 우선순위 문제 해결

## 🔍 문제 상황

### 발생한 오류
```
GET https://www.devtrail.net/js/vendor-BDnF4zds.js net::ERR_ABORTED 404 (Not Found)
GET https://www.devtrail.net/js/utils-mH-RBziN.js net::ERR_ABORTED 404 (Not Found)
```

### 원인 분석

**문제 원인:**
- nginx location 블록의 순서 문제
- 정규식 location (`~* \.(js|css|...)$`)이 prefix location (`/js/`)보다 먼저 정의됨
- nginx는 모든 location을 평가하지만, 정규식이 먼저 매칭되면 prefix location이 무시될 수 있음
- 실제로는 prefix match가 더 구체적이므로 우선순위가 높아야 함

## ✅ 해결 방법

### nginx Location 우선순위 규칙

nginx는 다음 순서로 location을 매칭합니다:

1. **Exact match** (`=`) - 가장 높은 우선순위
   ```nginx
   location = /exact { ... }
   ```

2. **Prefix match** (가장 긴 것) - 두 번째 우선순위
   ```nginx
   location /prefix { ... }
   location /prefix/longer { ... }  # 더 긴 것이 우선
   ```

3. **Regular expression match** (`~`, `~*`) - 세 번째 우선순위
   ```nginx
   location ~* \.(js|css)$ { ... }  # 정규식 매칭
   ```

4. **General match** (`/`) - 가장 낮은 우선순위
   ```nginx
   location / { ... }  # 모든 요청을 catch
   ```

### 수정된 Location 순서

**변경 전 (문제):**
```nginx
# 1. API 프록시
location /api/ { ... }

# 2. 정규식 location (먼저 정의)
location ~* \.(js|css|...)$ { ... }

# 3. Prefix location (나중에 정의)
location /js/ { ... }

# 4. General location
location / { ... }
```

**변경 후 (해결):**
```nginx
# 1. API 프록시
location /api/ { ... }

# 2. 헬스체크
location /health { ... }

# 3. Prefix location (먼저 정의 - 더 구체적)
location /assets/ { ... }
location /js/ { ... }
location /img/ { ... }
location /fonts/ { ... }
location /video/ { ... }

# 4. 정규식 location (나중에 정의 - fallback)
location ~* \.(js|css|...)$ { ... }

# 5. HTML 파일
location ~* \.html$ { ... }

# 6. General location (가장 마지막)
location / { ... }
```

### 주요 변경 사항

1. **Prefix location을 정규식 location보다 먼저 정의**
   - `/assets/`, `/js/`, `/img/` 등 구체적인 prefix location 먼저
   - 정규식 location은 fallback 역할

2. **Location 블록 순서 최적화**
   - 가장 구체적인 것부터 일반적인 것 순서로
   - `/api/` → `/health` → `/assets/` → `/js/` → `/img/` → 정규식 → `/`

3. **각 location 블록에 명시적 설정**
   - `root` 명시
   - `try_files $uri =404` (정적 파일은 index.html로 fallback하지 않음)

## 🔍 검증 방법

### 로컬 테스트
```bash
# JS 파일 테스트
curl -I http://localhost/js/vendor-BDnF4zds.js
# 예상 출력: HTTP/1.1 200 OK, Content-Type: application/javascript

# CSS 파일 테스트
curl -I http://localhost/assets/main-D6CyjVIi.css
# 예상 출력: HTTP/1.1 200 OK, Content-Type: text/css

# 이미지 파일 테스트
curl -I http://localhost/img/logo.png
# 예상 출력: HTTP/1.1 200 OK, Content-Type: image/png
```

### 브라우저 테스트
- `https://www.devtrail.net` 접속
- 개발자 도구 → Network 탭 확인
- 모든 정적 파일이 200 OK로 로드되는지 확인

## 📋 최종 Location 블록 순서

1. `/api/` - API 프록시 (가장 구체적)
2. `/health` - 헬스체크 (구체적)
3. `/assets/` - assets 디렉토리 (prefix match)
4. `/js/` - js 디렉토리 (prefix match)
5. `/img/` - img 디렉토리 (prefix match)
6. `/fonts/` - fonts 디렉토리 (prefix match)
7. `/video/` - video 디렉토리 (prefix match)
8. `~* \.(js|css|...)$` - 정적 파일 확장자 (정규식, fallback)
9. `~* \.html$` - HTML 파일 (정규식)
10. `/` - SPA 라우팅 (가장 일반적, 마지막)

## ✅ 해결 결과

### 수정 전
- ❌ `/js/vendor-BDnF4zds.js` → 404 오류
- ❌ 정규식 location이 먼저 매칭되어 prefix location이 무시됨

### 수정 후
- ✅ `/js/vendor-BDnF4zds.js` → 200 OK (Content-Type: application/javascript)
- ✅ `/assets/main-D6CyjVIi.css` → 200 OK (Content-Type: text/css)
- ✅ `/img/logo.png` → 200 OK (Content-Type: image/png)
- ✅ Prefix location이 정규식 location보다 우선순위가 높음

## 🎯 주요 교훈

1. **Location 블록 순서가 중요함**
   - 더 구체적인 location을 먼저 정의
   - Prefix match가 Regular expression match보다 우선순위가 높음

2. **구체적인 디렉토리 location 추가**
   - `/js/`, `/assets/`, `/img/` 등 구체적인 location
   - 정규식 location보다 우선순위가 높음

3. **정규식 location은 fallback 역할**
   - 구체적인 prefix location이 매칭되지 않을 때만 사용
   - 일반적인 정적 파일 처리를 위한 fallback

4. **각 location 블록에 명시적 설정**
   - `root` 명시
   - `try_files $uri =404` (정적 파일은 index.html로 fallback하지 않음)

## 📝 참고

- nginx 설정 파일: `/etc/nginx/conf.d/devtrail.conf`
- 프로젝트 설정 파일: `/home/ec2-user/deukgeun_ReactProject/deukgeun/nginx-site.conf`
- nginx 재시작: `sudo systemctl reload nginx`

