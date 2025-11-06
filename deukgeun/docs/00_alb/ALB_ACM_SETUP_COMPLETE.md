# ALB + ACM 구조 설정 완료

## ✅ 완료된 작업

### 1. nginx 설정 수정
- ✅ HTTP(포트 80)만 리스닝하도록 설정
- ✅ SSL 관련 설정 제거 (443 포트, SSL 인증서 경로 등)
- ✅ certbot 관련 설정 제거 (/.well-known/acme-challenge)
- ✅ X-Forwarded-Proto 헤더 전달 설정

### 2. 현재 구조
```
[Client] ─HTTPS(443)─> [AWS ALB (ACM 인증서)] ─HTTP(80)─> [EC2 nginx] ─HTTP(80)─> [Node.js Backend:5000]
```

### 3. nginx 설정 파일
- **프로젝트**: `/home/ec2-user/deukgeun_ReactProject/deukgeun/nginx-site.conf`
- **적용**: `/etc/nginx/conf.d/devtrail.conf`
- **상태**: ✅ 정상 작동 중

## 📋 현재 설정 요약

### nginx 설정
- **포트**: 80 (HTTP만)
- **서버 네임**: `devtrail.net`, `www.devtrail.net`
- **프론트엔드 경로**: `/home/ec2-user/deukgeun_ReactProject/deukgeun/dist/frontend`
- **API 프록시**: `http://127.0.0.1:5000`
- **X-Forwarded-Proto**: ALB에서 설정한 헤더를 그대로 전달

### ALB 설정 (AWS 콘솔에서 확인)
- **리스너 443 (HTTPS)**: ACM 인증서 연결
- **리스너 규칙**: HTTPS 요청 → 대상 그룹 전달
- **대상 그룹**: EC2 인스턴스, 포트 80

### 보안 그룹 권장 설정
- **ALB 보안 그룹**:
  - 인바운드: 443 (0.0.0.0/0) - HTTPS
  - 아웃바운드: 80 (EC2 보안 그룹)
  
- **EC2 보안 그룹**:
  - 인바운드: 80 (ALB 보안 그룹만 허용 권장)
  - 아웃바운드: 전체 허용

## 🔍 검증 방법

### 1. nginx 상태 확인
```bash
sudo systemctl status nginx
sudo nginx -t
```

### 2. 로컬 테스트
```bash
curl -I http://localhost
```

### 3. 외부 접근 테스트
```bash
curl -I https://devtrail.net
```

### 4. 헤더 확인
```bash
curl -I https://devtrail.net -H "Host: devtrail.net"
```

## 📝 주요 변경 사항

### 제거된 설정
1. ❌ HTTPS 서버 블록 (443 포트)
2. ❌ SSL 인증서 경로 설정
3. ❌ certbot 인증서 검증 경로 (/.well-known/acme-challenge)
4. ❌ HTTP → HTTPS 리다이렉트 규칙

### 추가된 설정
1. ✅ X-Forwarded-Proto 헤더 전달 (ALB에서 설정한 값)
2. ✅ ALB 구조에 맞는 프록시 헤더 설정

## 🎯 트래픽 흐름

1. **클라이언트 요청**: `https://devtrail.net`
2. **ALB 처리**: 
   - HTTPS(443) 수신
   - ACM 인증서로 SSL/TLS 종료
   - X-Forwarded-Proto: https 헤더 추가
   - HTTP(80)로 EC2로 전달
3. **EC2 nginx**:
   - HTTP(80) 수신
   - X-Forwarded-Proto 헤더를 백엔드로 전달
   - 프론트엔드 정적 파일 서빙 또는 API 프록시
4. **백엔드**:
   - X-Forwarded-Proto 헤더를 통해 HTTPS 요청 인식
   - CORS 및 보안 정책 적용

## ⚠️ 주의 사항

1. **EC2에서 직접 HTTPS 사용 불가**: ALB에서 SSL 종료하므로 EC2는 HTTP만 처리
2. **X-Forwarded-Proto 헤더 의존**: 백엔드에서 HTTPS 요청을 인식하려면 이 헤더가 필요
3. **보안 그룹 설정**: EC2는 ALB에서만 접근 가능하도록 제한 권장

## 🔄 백엔드 설정 확인

백엔드에서 X-Forwarded-Proto 헤더를 처리하는지 확인:
- Express 앱에서 `req.protocol` 또는 `req.get('X-Forwarded-Proto')` 사용
- CORS 설정에서 `https://devtrail.net` 허용 확인

## 📚 참고 문서

- `nginx-site.conf`: 현재 nginx 설정 파일
- `SSL_SETUP_ISSUE.md`: SSL 설정 관련 이슈 및 해결 방법
- `HTTPS_SETUP_GUIDE.md`: HTTPS 설정 가이드 (이전 버전)

## ✅ 다음 단계

1. **ALB 리스너 확인**: AWS 콘솔에서 443 리스너가 ACM 인증서와 연결되어 있는지 확인
2. **대상 그룹 확인**: EC2 인스턴스가 등록되어 있고 헬스 체크가 통과하는지 확인
3. **외부 접근 테스트**: `https://devtrail.net` 접속하여 HTTPS 연결 확인
4. **백엔드 로그 확인**: X-Forwarded-Proto 헤더가 제대로 전달되는지 확인

