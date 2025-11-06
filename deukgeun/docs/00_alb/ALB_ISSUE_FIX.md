# ALB 리스너 설정 문제 해결

## 🔍 현재 상황

### 확인된 사항
1. ✅ ACM 인증서가 ALB에 연결되어 있음
   - 인증서 ARN: `arn:aws:acm:ap-northeast-2:756811050863:certificate/b8583643-fb13-46c0-a5da-5fedcfcbc509`
   - 도메인: `devtrail.net`, `*.devtrail.net`
   - 상태: 발급됨

2. ❌ 실제로는 잘못된 인증서가 사용 중
   - 현재 사용 중: `*.pipeline.datarize.io`
   - 필요한 인증서: `devtrail.net`, `*.devtrail.net`

3. ❌ HTTPS 연결 시 404 응답
   - ALB가 EC2로 요청을 전달하지 못함

### 문제 원인
1. **ALB 리스너의 기본 인증서 설정 문제**
   - 443 리스너의 기본 SSL/TLS 인증서가 잘못 설정되어 있음
   - 또는 리스너 규칙에서 다른 인증서를 사용하고 있음

2. **대상 그룹 설정 문제**
   - ALB가 EC2 인스턴스를 찾지 못함
   - 헬스 체크 실패
   - 포트 불일치

## ✅ 해결 방법

### 1. ALB 리스너 기본 인증서 수정

**AWS 콘솔에서 수행:**

1. **EC2 콘솔 → Load Balancers**
   - `devtrail-alb` 선택

2. **Listeners 탭 → 443 리스너 확인**
   - "Edit listener" 클릭

3. **Default SSL/TLS certificate 수정**
   - 현재 인증서 확인 (아마도 `*.pipeline.datarize.io`)
   - "Change" 클릭
   - "From ACM" 선택
   - 인증서 ARN 입력: `arn:aws:acm:ap-northeast-2:756811050863:certificate/b8583643-fb13-46c0-a5da-5fedcfcbc509`
   - 또는 인증서 목록에서 `devtrail.net` 선택
   - "Save changes" 클릭

4. **리스너 규칙 확인**
   - 리스너 규칙이 있다면 각 규칙의 인증서도 확인
   - 호스트 기반 라우팅이 있다면 각 규칙에 올바른 인증서 설정

### 2. 대상 그룹 확인 및 수정

**대상 그룹 설정 확인:**

1. **Target Groups → devtrail-targets 선택**
   - 등록된 대상 확인
   - EC2 인스턴스가 등록되어 있는지 확인
   - 포트: 80 (HTTP) 확인

2. **헬스 체크 설정 확인**
   - 헬스 체크 경로: `/health` 또는 `/`
   - 헬스 체크 포트: 80
   - 정상 임계값: 2 이상
   - 비정상 임계값: 2 이상

3. **대상 상태 확인**
   - 대상이 "healthy" 상태인지 확인
   - "unhealthy" 상태라면 원인 확인

### 3. 보안 그룹 확인

**ALB 보안 그룹:**
- 인바운드 규칙: 443 (0.0.0.0/0) - HTTPS
- 아웃바운드 규칙: 80 (EC2 보안 그룹)

**EC2 보안 그룹:**
- 인바운드 규칙: 80 (ALB 보안 그룹만 허용 권장)
- 아웃바운드 규칙: 전체 허용

### 4. 리스너 규칙 확인

**리스너 규칙 설정:**

1. **443 리스너 → Rules 탭**
   - 기본 규칙 확인
   - "Forward to" → 대상 그룹 (`devtrail-targets`) 확인

2. **호스트 기반 라우팅이 있다면**
   - 각 호스트 규칙에 올바른 인증서 설정
   - `devtrail.net` → 올바른 인증서
   - `www.devtrail.net` → 올바른 인증서

## 🔍 검증 방법

### 1. 인증서 확인
```bash
echo | openssl s_client -connect devtrail.net:443 -servername devtrail.net 2>/dev/null | openssl x509 -noout -subject -dates -ext subjectAltName
```

**예상 결과:**
```
subject=CN=devtrail.net
또는
subject=CN=*.devtrail.net
X509v3 Subject Alternative Name: 
    DNS:devtrail.net, DNS:*.devtrail.net
```

### 2. HTTPS 연결 테스트
```bash
curl -I https://devtrail.net
```

**예상 결과:**
```
HTTP/2 200
Server: nginx/1.28.0
```

### 3. 브라우저에서 확인
- `https://devtrail.net` 접속
- 주소창의 자물쇠 아이콘 클릭
- 인증서 정보 확인
- "발급자: Amazon" 확인
- "주체: devtrail.net" 또는 "*.devtrail.net" 확인

## 📋 체크리스트

### ALB 설정
- [ ] 443 리스너의 기본 SSL/TLS 인증서가 올바른 ACM 인증서로 설정됨
- [ ] 리스너 규칙의 인증서가 올바르게 설정됨
- [ ] 리스너 규칙이 대상 그룹으로 요청을 전달하도록 설정됨

### 대상 그룹 설정
- [ ] EC2 인스턴스가 등록되어 있음
- [ ] 대상 상태가 "healthy"임
- [ ] 포트가 80 (HTTP)로 설정됨
- [ ] 헬스 체크가 통과함

### 보안 그룹
- [ ] ALB 보안 그룹: 443 인바운드 허용
- [ ] EC2 보안 그룹: 80 인바운드 (ALB에서만 허용)

### nginx 설정 (EC2)
- [x] HTTP(포트 80)만 리스닝
- [x] X-Forwarded-Proto 헤더 전달
- [x] 프론트엔드 경로 설정
- [x] API 프록시 설정

## ⚠️ 주의사항

1. **인증서 변경 후 전파 시간**
   - ALB에서 인증서를 변경하면 전파에 몇 분 걸릴 수 있음
   - 변경 후 5-10분 대기 후 다시 확인

2. **대상 그룹 헬스 체크**
   - EC2 인스턴스가 "healthy" 상태가 되어야 트래픽이 전달됨
   - 헬스 체크 경로가 올바른지 확인 (`/health` 또는 `/`)

3. **DNS 캐시**
   - 브라우저나 DNS 캐시로 인해 변경사항이 즉시 반영되지 않을 수 있음
   - 브라우저 캐시 삭제 또는 시크릿 모드로 테스트

## 🎯 예상 결과

설정이 올바르게 완료되면:

1. ✅ HTTPS 연결 정상 작동
2. ✅ 올바른 인증서 사용 (`devtrail.net`)
3. ✅ HTTP/2 200 응답
4. ✅ 프론트엔드 정상 로드
5. ✅ API 요청 정상 작동

## 📝 다음 단계

1. AWS 콘솔에서 ALB 리스너 인증서 수정
2. 대상 그룹 상태 확인
3. 5-10분 대기
4. HTTPS 연결 테스트
5. 브라우저에서 확인

