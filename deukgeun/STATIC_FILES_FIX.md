# 정적 파일 404/MIME Type 오류 해결

## 🔍 문제 상황

### 발생한 오류
1. **CSS 파일 MIME type 오류**:
   ```
   Refused to apply style from 'https://www.devtrail.net/assets/main-D6CyjVIi.css' 
   because its MIME type ('text/html') is not a supported stylesheet MIME type
   ```

2. **JS 파일 404 오류**:
   ```
   GET https://www.devtrail.net/js/vendor-BDnF4zds.js net::ERR_ABORTED 404 (Not Found)
   GET https://www.devtrail.net/js/utils-mH-RBziN.js net::ERR_ABORTED 404 (Not Found)
   ```

3. **이미지 파일 404 오류**:
   ```
   GET https://www.devtrail.net/img/logo.png 404 (Not Found)
   ```

### 원인 분석

**문제 원인:**
- nginx location 블록 순서 문제
- 정적 파일 location이 `/` location보다 나중에 정의되어 우선순위가 낮음
- 정적 파일 location에 `root`가 명시되지 않아 상위 설정을 상속
- 정적 파일 location에 `try_files`가 없어 파일이 없을 때 `/` location의 `try_files $uri $uri/ /index.html`이 실행됨
- 결과적으로 정적 파일이 없으면 index.html이 반환되어 MIME type이 'text/html'로 인식됨

## ✅ 해결 방법

### 1. nginx location 블록 순서 최적화

**변경 전:**
```nginx
# 정적 파일 location (확장자 기반)
location ~* \.(js|css|...)$ {
    expires 1y;
    # root 없음
    # try_files 없음
}

# SPA 라우팅 (모든 요청 catch)
location / {
    try_files $uri $uri/ /index.html;
}
```

**변경 후:**
```nginx
# 1. API 프록시 (가장 먼저)
location /api/ { ... }

# 2. 정적 파일 location (확장자 기반) - root 명시, try_files =404
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif|mp4|webm)$ {
    root /home/ec2-user/deukgeun_ReactProject/deukgeun/dist/frontend;
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;  # index.html로 fallback하지 않음
}

# 3. 구체적인 디렉토리 location (더 구체적)
location /assets/ {
    root /home/ec2-user/deukgeun_ReactProject/deukgeun/dist/frontend;
    expires 1y;
    try_files $uri =404;
}

location /js/ {
    root /home/ec2-user/deukgeun_ReactProject/deukgeun/dist/frontend;
    expires 1y;
    try_files $uri =404;
}

location /img/ {
    root /home/ec2-user/deukgeun_ReactProject/deukgeun/dist/frontend;
    expires 1y;
    try_files $uri =404;
}

# 4. SPA 라우팅 (가장 마지막)
location / {
    root /home/ec2-user/deukgeun_ReactProject/deukgeun/dist/frontend;
    try_files $uri $uri/ /index.html;
}
```

### 2. 주요 변경 사항

#### A. 정적 파일 location에 `root` 명시
- 각 location 블록에 명시적으로 `root` 설정
- 상위 설정 의존성 제거

#### B. 정적 파일 location에 `try_files $uri =404` 추가
- 파일이 없으면 404 반환
- index.html로 fallback하지 않음

#### C. 구체적인 디렉토리 location 추가
- `/assets/`, `/js/`, `/img/`, `/fonts/`, `/video/` 디렉토리별 location
- 더 구체적인 location이 우선순위가 높음

#### D. Location 블록 순서 최적화
1. `/api/` - API 프록시 (가장 구체적)
2. 정적 파일 확장자 매칭 - `~* \.(js|css|...)`
3. 구체적인 디렉토리 매칭 - `/assets/`, `/js/`, `/img/`
4. HTML 파일 매칭 - `~* \.html$`
5. `/` - SPA 라우팅 (가장 일반적, 마지막)

## 🔍 검증 방법

### 1. 로컬 테스트
```bash
# CSS 파일 테스트
curl -I http://localhost/assets/main-D6CyjVIi.css
# 예상 출력: Content-Type: text/css

# JS 파일 테스트
curl -I http://localhost/js/vendor-BDnF4zds.js
# 예상 출력: Content-Type: application/javascript

# 이미지 파일 테스트
curl -I http://localhost/img/logo.png
# 예상 출력: Content-Type: image/png
```

### 2. 브라우저 테스트
- `https://www.devtrail.net` 접속
- 개발자 도구 → Network 탭 확인
- 모든 정적 파일이 200 OK로 로드되는지 확인
- Content-Type이 올바른지 확인

## 📋 nginx Location 우선순위 규칙

nginx는 다음 순서로 location을 매칭합니다:

1. **Exact match** (`=`)
   ```nginx
   location = /exact { ... }
   ```

2. **Prefix match** (가장 긴 매칭)
   ```nginx
   location /prefix { ... }
   location /prefix/longer { ... }  # 더 긴 것이 우선
   ```

3. **Regular expression match** (`~`, `~*`)
   ```nginx
   location ~* \.(js|css)$ { ... }  # 정규식 매칭
   ```

4. **General match** (`/`)
   ```nginx
   location / { ... }  # 모든 요청을 catch
   ```

**우리 설정:**
- `/api/` → Prefix match (가장 구체적)
- `~* \.(js|css|...)$` → Regular expression match
- `/assets/`, `/js/`, `/img/` → Prefix match (구체적)
- `/` → General match (가장 일반적, 마지막)

## ✅ 해결 결과

### 수정 전
- ❌ CSS 파일: MIME type 'text/html' (index.html 반환)
- ❌ JS 파일: 404 또는 MIME type 'text/html'
- ❌ 이미지 파일: 404

### 수정 후
- ✅ CSS 파일: `Content-Type: text/css` (200 OK)
- ✅ JS 파일: `Content-Type: application/javascript` (200 OK)
- ✅ 이미지 파일: `Content-Type: image/png` (200 OK)

## 🎯 주요 교훈

1. **Location 블록 순서가 중요함**
   - 더 구체적인 location을 먼저 정의
   - 일반적인 location(`/`)은 마지막에 정의

2. **정적 파일 location에 `try_files =404` 사용**
   - 정적 파일이 없으면 404 반환
   - index.html로 fallback하지 않음

3. **각 location 블록에 `root` 명시**
   - 상위 설정 의존성 제거
   - 명확한 경로 설정

4. **구체적인 디렉토리 location 추가**
   - `/assets/`, `/js/`, `/img/` 등 구체적인 location
   - 더 높은 우선순위 보장

## 📝 참고

- nginx 설정 파일: `/etc/nginx/conf.d/devtrail.conf`
- 프론트엔드 빌드 경로: `/home/ec2-user/deukgeun_ReactProject/deukgeun/dist/frontend`
- nginx 재시작: `sudo systemctl reload nginx`

