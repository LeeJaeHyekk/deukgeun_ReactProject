# DNS 설정 수정 필요

## 🔍 문제 상황

**현재 상태:**
- `www.devtrail.net` → `43.203.30.167` (EC2 IP 직접)
- `devtrail.net` → `43.203.30.167` (EC2 IP 직접)
- **결과**: HTTPS(443) 연결 실패 - `ERR_CONNECTION_REFUSED`

**원인:**
- DNS가 ALB가 아닌 EC2 인스턴스 IP를 직접 가리키고 있음
- EC2는 HTTP(80)만 리스닝하므로 HTTPS(443) 연결 불가
- ALB 구조에서는 DNS가 ALB DNS를 가리켜야 함

## 📋 현재 트래픽 흐름 (잘못된 구조)

```
[Client] ─HTTPS(443)─> [EC2 직접] ❌ (443 포트 없음)
```

**올바른 구조:**
```
[Client] ─HTTPS(443)─> [AWS ALB] ─HTTP(80)─> [EC2 nginx] ─HTTP(80)─> [Backend:5000]
```

## ✅ 해결 방법

### 1. ALB DNS 이름 확인

**AWS 콘솔에서 확인:**
1. **EC2 콘솔 → Load Balancers**
2. `devtrail-alb` (또는 해당 ALB 이름) 선택
3. **Description 탭**에서 **DNS name** 확인
   - 예: `devtrail-alb-1234567890.ap-northeast-2.elb.amazonaws.com`

### 2. DNS 레코드 수정

**도메인 DNS 설정 (Route 53 또는 도메인 등록업체)에서:**

#### A 레코드 (Alias) 사용 (Route 53 권장)

1. **Route 53 → Hosted Zones → devtrail.net**
2. `www.devtrail.net` A 레코드:
   - **Type**: A
   - **Alias**: Yes
   - **Alias Target**: ALB 선택 (devtrail-alb)
   - **Save**

3. `devtrail.net` A 레코드:
   - **Type**: A
   - **Alias**: Yes
   - **Alias Target**: ALB 선택 (devtrail-alb)
   - **Save**

#### CNAME 레코드 사용 (다른 DNS 제공업체)

1. **도메인 관리 콘솔**에서 DNS 설정
2. `www.devtrail.net` CNAME 레코드:
   - **Type**: CNAME
   - **Name**: `www` 또는 `www.devtrail.net`
   - **Value**: ALB DNS 이름 (예: `devtrail-alb-1234567890.ap-northeast-2.elb.amazonaws.com`)
   - **TTL**: 300 (5분) 또는 기본값

3. `devtrail.net` A 레코드 또는 CNAME:
   - **Type**: A (Alias) 또는 CNAME
   - **Name**: `@` 또는 `devtrail.net`
   - **Value**: ALB DNS 이름
   - **TTL**: 300 (5분) 또는 기본값

**참고**: 루트 도메인(`devtrail.net`)은 일부 DNS 제공업체에서 CNAME을 지원하지 않을 수 있습니다. 이 경우:
- Route 53의 Alias A 레코드 사용 (권장)
- 또는 ALB의 IP 주소를 A 레코드로 설정 (권장하지 않음 - ALB IP는 변경될 수 있음)

## 🔍 검증 방법

### 1. DNS 변경 확인

```bash
# DNS 변경 전
dig +short www.devtrail.net A
# 출력: 43.203.30.167 (EC2 IP)

# DNS 변경 후 (5-10분 후)
dig +short www.devtrail.net A
# 출력: ALB IP 또는 여러 IP (ALB는 여러 IP를 가질 수 있음)
```

### 2. HTTPS 연결 테스트

```bash
# DNS 변경 후 (5-10분 후)
curl -I https://www.devtrail.net
# 예상 출력: HTTP/2 200
```

### 3. 브라우저에서 확인

- `https://www.devtrail.net` 접속
- 주소창의 자물쇠 아이콘 확인
- 인증서 정보 확인 (발급자: Amazon)

## ⏱️ DNS 전파 시간

- **일반적인 전파 시간**: 5-10분
- **최대 전파 시간**: 최대 48시간 (TTL에 따라)
- **빠른 확인**: `dig` 명령어로 실시간 확인 가능

## 📝 체크리스트

### DNS 설정
- [ ] ALB DNS 이름 확인
- [ ] `www.devtrail.net` DNS 레코드를 ALB로 변경
- [ ] `devtrail.net` DNS 레코드를 ALB로 변경
- [ ] DNS 변경 후 5-10분 대기

### ALB 설정 (이미 확인됨)
- [x] ALB 리스너 443 (HTTPS) 설정 확인 필요
- [x] ACM 인증서 연결 확인 필요
- [x] 대상 그룹 헬스체크 통과 (로그 확인됨)

### EC2 설정 (정상)
- [x] nginx 실행 중 (포트 80)
- [x] 백엔드 실행 중 (포트 5000)
- [x] ALB 헬스체크 통과 (로그 확인됨)

## 🎯 예상 결과

DNS 변경 후:

1. ✅ `www.devtrail.net` → ALB DNS로 연결
2. ✅ ALB가 HTTPS(443) 요청 수신
3. ✅ ALB가 ACM 인증서로 SSL 종료
4. ✅ ALB가 HTTP(80)로 EC2로 전달
5. ✅ EC2 nginx가 요청 처리
6. ✅ 프론트엔드 정상 로드
7. ✅ API 요청 정상 작동

## ⚠️ 중요 사항

1. **DNS 변경 후 즉시 반영되지 않을 수 있음**
   - 브라우저 DNS 캐시
   - 로컬 DNS 캐시
   - TTL 설정에 따른 전파 시간

2. **ALB 리스너 확인 필요**
   - AWS 콘솔에서 ALB 443 리스너 확인
   - ACM 인증서가 올바르게 연결되어 있는지 확인
   - 리스너 규칙이 대상 그룹으로 전달하도록 설정되어 있는지 확인

3. **보안 그룹 확인**
   - ALB 보안 그룹: 443 인바운드 허용
   - EC2 보안 그룹: 80 인바운드 (ALB에서만 허용)

## 📚 참고 문서

- `ALB_ACM_SETUP_COMPLETE.md`: ALB 구조 설명
- `ALB_ISSUE_FIX.md`: ALB 리스너 설정 가이드
- `HTTPS_SETUP_STATUS.md`: HTTPS 설정 상태

