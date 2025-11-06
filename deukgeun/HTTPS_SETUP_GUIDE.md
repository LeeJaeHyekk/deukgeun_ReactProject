# HTTPS 설정 가이드

## 현재 상태
- ✅ nginx 설정 파일 업데이트 완료 (`nginx-site.conf`)
- ✅ HTTP 서버 블록 활성화 (포트 80)
- ✅ 프론트엔드 경로 설정 완료 (`/home/ec2-user/deukgeun_ReactProject/deukgeun/dist/frontend`)
- ⚠️ SSL 인증서 생성 대기 중

## SSL 인증서 생성 전 확인 사항

### 1. DNS 설정 확인
도메인 `devtrail.net`과 `www.devtrail.net`이 현재 서버 IP를 가리키는지 확인:
```bash
dig devtrail.net
dig www.devtrail.net
```

### 2. 방화벽 설정 확인
포트 80, 443이 열려있는지 확인:
```bash
sudo firewall-cmd --list-all
# 또는
sudo iptables -L -n
```

포트 80, 443 열기 (Amazon Linux 2023):
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. 보안 그룹 설정 (AWS EC2)
EC2 콘솔에서 보안 그룹 설정 확인:
- 인바운드 규칙에 HTTP (포트 80) 추가
- 인바운드 규칙에 HTTPS (포트 443) 추가

## SSL 인증서 생성 방법

### 방법 1: Certbot 자동 설정 (권장)
DNS 설정이 완료되고 포트 80이 열려있을 때:
```bash
sudo certbot --nginx -d devtrail.net -d www.devtrail.net --non-interactive --agree-tos --email admin@devtrail.net --redirect
```

### 방법 2: 수동 인증서 생성
nginx를 일시 중지하고 standalone 모드 사용:
```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone -d devtrail.net -d www.devtrail.net --non-interactive --agree-tos --email admin@devtrail.net
sudo systemctl start nginx
```

인증서 생성 후 nginx 설정 업데이트:
```bash
# nginx-site.conf 파일에서 HTTPS 블록 주석 해제
sudo nano /etc/nginx/conf.d/devtrail.conf
sudo nginx -t
sudo systemctl reload nginx
```

## SSL 인증서 생성 후 HTTPS 활성화

1. 인증서 생성 확인:
```bash
ls -la /etc/letsencrypt/live/devtrail.net/
```

2. HTTPS 블록 활성화:
`nginx-site.conf` 파일에서 HTTPS 서버 블록의 주석을 제거하고 nginx 설정 파일에 반영:
```bash
sudo cp nginx-site.conf /etc/nginx/conf.d/devtrail.conf
# HTTPS 블록의 주석 제거 필요
sudo nginx -t
sudo systemctl reload nginx
```

3. HTTP → HTTPS 리다이렉트 활성화:
HTTP 서버 블록에서 다음 주석 해제:
```nginx
location / {
    return 301 https://$server_name$request_uri;
}
```

4. nginx 재시작:
```bash
sudo systemctl restart nginx
```

## 인증서 자동 갱신 설정

Let's Encrypt 인증서는 90일마다 갱신 필요:
```bash
# certbot 자동 갱신 설정
sudo certbot renew --dry-run

# 자동 갱신 cron 설정 (이미 설정되어 있을 수 있음)
sudo systemctl status certbot.timer
```

## 현재 nginx 설정 파일 위치

- 프로젝트: `/home/ec2-user/deukgeun_ReactProject/deukgeun/nginx-site.conf`
- nginx 설정: `/etc/nginx/conf.d/devtrail.conf`

## 문제 해결

### 인증서 생성 실패 시
1. DNS 설정 확인: `dig devtrail.net`
2. 포트 80 접근 확인: `curl -I http://devtrail.net`
3. 방화벽/보안 그룹 확인
4. nginx 로그 확인: `sudo tail -f /var/log/nginx/error.log`

### HTTPS 연결 실패 시
1. SSL 인증서 확인: `sudo certbot certificates`
2. nginx 설정 확인: `sudo nginx -t`
3. 포트 443 확인: `sudo netstat -tlnp | grep 443`

