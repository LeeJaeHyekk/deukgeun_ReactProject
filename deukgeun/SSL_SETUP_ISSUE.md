# SSL 인증서 생성 문제 분석 및 해결 방법

## 현재 상황

### 확인된 사항
1. ✅ DNS 설정: `devtrail.net`과 `www.devtrail.net` 모두 `3.36.230.117`을 가리킴
2. ✅ 서버 IP: `43.203.30.167` (외부 IP), `172.31.40.214` (내부 IP)
3. ✅ nginx 실행 중: 포트 80에서 정상 작동
4. ✅ certbot 설치 완료
5. ❌ SSL 인증서: 생성 실패

### 문제점
1. **ELB 사용 중**: AWS Elastic Load Balancer가 앞에 있어서 Let's Encrypt 검증이 실패
   - 외부 접근 시 `awselb/2.0` 응답
   - `/.well-known/acme-challenge` 경로가 ELB에서 404 반환
   - ELB가 이 경로를 백엔드 서버로 포워딩하지 않음

## 해결 방법

### 방법 1: AWS ACM 사용 (권장) ⭐

ELB를 사용하는 경우, AWS Certificate Manager(ACM)를 사용하는 것이 더 적합합니다.

#### 장점:
- ELB에서 SSL/TLS 종료
- 무료 SSL 인증서
- 자동 갱신
- ELB와 통합되어 설정 간단

#### 설정 단계:
1. AWS 콘솔에서 ACM(AWS Certificate Manager) 접속
2. 인증서 요청:
   - 도메인: `devtrail.net`, `www.devtrail.net`
   - DNS 검증 선택
3. DNS 레코드 추가 (DNS 설정에서 확인된 값 입력)
4. ELB에 인증서 연결:
   - ELB 리스너 설정에서 HTTPS(443) 포트 추가
   - ACM 인증서 선택
   - HTTP(80) → HTTPS(443) 리다이렉트 설정

### 방법 2: ELB 타겟 그룹 설정 수정

ELB가 `/.well-known/acme-challenge` 경로를 백엔드로 포워딩하도록 설정:

1. **ELB 리스너 규칙 추가**:
   - 경로: `/.well-known/acme-challenge/*`
   - 타겟: 현재 서버 (포트 80)
   - 우선순위: 높게 설정

2. **타겟 그룹 헬스 체크 설정**:
   - 경로: `/.well-known/acme-challenge/`
   - 포트: 80

3. **인증서 생성 재시도**:
   ```bash
   sudo certbot --nginx -d devtrail.net -d www.devtrail.net --non-interactive --agree-tos --email admin@devtrail.net --redirect
   ```

### 방법 3: 도메인을 서버 IP로 직접 연결

ELB를 우회하고 도메인이 서버 IP를 직접 가리키도록 설정:

1. **DNS 설정 변경**:
   - `devtrail.net` → `43.203.30.167` (A 레코드)
   - `www.devtrail.net` → `43.203.30.167` (A 레코드)

2. **DNS 전파 대기** (보통 5-30분)

3. **인증서 생성**:
   ```bash
   sudo certbot --nginx -d devtrail.net -d www.devtrail.net --non-interactive --agree-tos --email admin@devtrail.net --redirect
   ```

⚠️ **주의**: 이 방법은 ELB를 사용하지 않게 되므로, 로드 밸런싱 기능이 필요하면 방법 1을 권장합니다.

## 현재 nginx 설정 상태

### HTTP 서버 블록
- ✅ 포트 80 리스닝
- ✅ `devtrail.net`, `www.devtrail.net` 서버 네임 설정
- ✅ 프론트엔드 경로: `/home/ec2-user/deukgeun_ReactProject/deukgeun/dist/frontend`
- ✅ API 프록시: `http://127.0.0.1:5000`
- ✅ `/.well-known/acme-challenge/` 경로 설정 완료

### HTTPS 서버 블록
- ⏳ SSL 인증서 대기 중 (주석 처리됨)
- 인증서 생성 후 자동 활성화 예정

## 권장 사항

**ELB를 사용하는 경우** → **방법 1 (AWS ACM)** 강력 권장
- ELB와 통합되어 관리가 쉬움
- 자동 갱신
- 무료 SSL 인증서
- 고가용성 보장

## 참고 명령어

### 현재 상태 확인
```bash
# DNS 확인
dig devtrail.net
dig www.devtrail.net

# nginx 상태
sudo systemctl status nginx

# 인증서 확인
sudo certbot certificates

# 포트 확인
sudo netstat -tlnp | grep -E ":80 |:443 "
```

### 인증서 생성 (방법 2 또는 3 사용 시)
```bash
sudo certbot --nginx -d devtrail.net -d www.devtrail.net --non-interactive --agree-tos --email admin@devtrail.net --redirect
```

### 인증서 자동 갱신 테스트
```bash
sudo certbot renew --dry-run
```

