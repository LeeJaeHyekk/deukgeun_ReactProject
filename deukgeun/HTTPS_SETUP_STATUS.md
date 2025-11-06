# HTTPS 설정 상태 및 다음 단계

## ✅ 완료된 작업 (EC2 서버)

### 1. nginx 설정 완료
- ✅ HTTP(포트 80)만 리스닝하도록 설정
- ✅ SSL 관련 설정 제거 (443 포트, SSL 인증서 경로)
- ✅ X-Forwarded-Proto 헤더 전달 설정
- ✅ 설정 파일 적용 완료 (`/etc/nginx/conf.d/devtrail.conf`)
- ✅ nginx 서비스 정상 실행 중

### 2. 백엔드 상태
- ✅ PM2로 백엔드 실행 중 (포트 5000)
- ✅ API 프록시 설정 완료

## ⚠️ 확인 필요 사항 (AWS 콘솔)

### 1. ALB 리스너 설정 확인
현재 ALB에서 잘못된 인증서가 연결되어 있는 것으로 보입니다:
- **현재 인증서**: `*.pipeline.datarize.io`
- **필요한 인증서**: `devtrail.net`, `www.devtrail.net`

**해결 방법**:
1. AWS 콘솔 → EC2 → Load Balancers
2. `devtrail-alb` 선택
3. Listeners 탭 → 443 리스너 확인
4. ACM 인증서가 올바르게 연결되어 있는지 확인
5. 잘못된 인증서가 연결되어 있다면:
   - "Edit listener" 클릭
   - "Default SSL/TLS certificate"에서 올바른 ACM 인증서 선택
   - ACM 인증서 ARN: `b8583643-fb13-46c0-a5da-5fedcfcbc509` (사용자가 언급한 인증서)
   - "Save changes" 클릭

### 2. ACM 인증서 확인
1. AWS 콘솔 → Certificate Manager (ACM)
2. 인증서 ARN: `b8583643-fb13-46c0-a5da-5fedcfcbc509` 확인
3. 인증서가 다음 도메인을 포함하는지 확인:
   - `devtrail.net`
   - `www.devtrail.net`
4. 인증서 상태가 "Issued"인지 확인

### 3. ALB 리스너 규칙 확인
1. ALB 리스너 443 (HTTPS) 확인
2. 기본 규칙: "Forward to" → 대상 그룹 (`devtrail-targets`)
3. 대상 그룹이 EC2 인스턴스를 포함하는지 확인
4. 대상 그룹 포트: 80 (HTTP)

## 🔍 현재 상태 확인

### nginx 설정 확인
```bash
sudo nginx -t
sudo systemctl status nginx
```

### 로컬 HTTP 테스트
```bash
curl -I http://localhost
curl -I http://localhost/api/health
```

### 외부 HTTPS 테스트
```bash
curl -k -I https://devtrail.net
```

## 📋 필요한 작업

### AWS 콘솔에서 수행해야 할 작업:

1. **ALB 리스너 수정**
   - 443 리스너에서 ACM 인증서 연결 확인
   - 올바른 인증서 (devtrail.net) 연결 확인
   - 잘못된 인증서가 연결되어 있다면 수정

2. **대상 그룹 확인**
   - EC2 인스턴스가 등록되어 있는지 확인
   - 헬스 체크가 통과하는지 확인
   - 포트 80으로 설정되어 있는지 확인

3. **보안 그룹 확인**
   - ALB 보안 그룹: 443 인바운드 허용
   - EC2 보안 그룹: 80 인바운드 (ALB에서만 허용)

## ✅ 완료 후 확인

ALB 설정이 올바르게 완료되면:

1. **브라우저에서 확인**
   - `https://devtrail.net` 접속
   - 인증서 정보 확인 (Amazon 발급)
   - 페이지 정상 로드 확인

2. **curl로 확인**
   ```bash
   curl -I https://devtrail.net
   # HTTP/2 200 응답 확인
   ```

3. **인증서 확인**
   ```bash
   echo | openssl s_client -connect devtrail.net:443 -servername devtrail.net 2>/dev/null | openssl x509 -noout -subject -dates
   # subject=CN=devtrail.net 또는 subject=CN=*.devtrail.net 확인
   ```

## 🔧 문제 해결

### 현재 문제: 잘못된 인증서 연결
- **증상**: SSL 인증서 검증 실패
- **원인**: ALB에서 `*.pipeline.datarize.io` 인증서 사용 중
- **해결**: ALB 리스너에서 올바른 ACM 인증서 연결

### 예상 결과
ALB 설정이 올바르게 완료되면:
- ✅ HTTPS 연결 정상 작동
- ✅ 인증서 검증 통과
- ✅ HTTP/2 응답
- ✅ 프론트엔드 정상 로드

## 📝 참고

- EC2 서버의 nginx 설정은 이미 완료되었습니다
- ALB에서 ACM 인증서를 올바르게 연결하면 HTTPS가 작동합니다
- EC2는 HTTP만 처리하므로 추가 설정이 필요하지 않습니다

