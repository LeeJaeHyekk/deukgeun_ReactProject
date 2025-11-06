# ALB 연결 타임아웃 문제 분석

## 🔍 현재 상황

### ✅ 확인된 사항
1. **DNS 설정**: 정상 - ALB IP를 가리킴
   - `www.devtrail.net` → `15.164.146.43`, `52.79.229.31`
   - `devtrail.net` → `15.164.146.43`, `52.79.229.31`

2. **EC2 서버**: 정상 작동
   - nginx 실행 중 (포트 80)
   - 백엔드 실행 중 (포트 5000)
   - ALB 헬스체크 통과 (200 응답)

3. **ALB 헬스체크**: 정상
   - ALB에서 EC2로 헬스체크 요청 성공
   - 내부 IP: `172.31.44.235`, `172.31.2.51`

### ❌ 문제점
1. **ALB 외부 연결**: 실패
   - `15.164.146.43:443` → Connection timeout
   - `15.164.146.43:80` → Connection timeout
   - `52.79.229.31:443` → Connection timeout
   - `52.79.229.31:80` → Connection timeout

2. **오류 메시지**: `ERR_CONNECTION_TIMED_OUT`

## 🎯 문제 원인 분석

ALB가 외부에서 접근 불가능한 상태입니다. 가능한 원인:

### 1. ALB 리스너 설정 문제 ⚠️ (가장 가능성 높음)

**확인 필요:**
- ALB에 443 포트 리스너가 설정되어 있는지
- ALB에 80 포트 리스너가 설정되어 있는지
- 리스너가 활성 상태인지

**AWS 콘솔에서 확인:**
1. EC2 → Load Balancers → `devtrail-alb` 선택
2. **Listeners** 탭 확인
   - **443 (HTTPS) 리스너가 있는지**
   - **80 (HTTP) 리스너가 있는지**
   - 각 리스너의 **Status**가 **Active**인지

### 2. ALB 보안 그룹 설정 문제 ⚠️

**확인 필요:**
- ALB 보안 그룹이 443 포트 인바운드를 허용하는지
- ALB 보안 그룹이 80 포트 인바운드를 허용하는지
- 소스가 `0.0.0.0/0` (모든 IP) 또는 적절한 범위인지

**AWS 콘솔에서 확인:**
1. EC2 → Load Balancers → `devtrail-alb` 선택
2. **Security** 탭 → 보안 그룹 클릭
3. **Inbound rules** 확인:
   - **Type**: HTTPS (443)
   - **Source**: 0.0.0.0/0 또는 적절한 범위
   - **Type**: HTTP (80) - 선택사항
   - **Source**: 0.0.0.0/0 또는 적절한 범위

### 3. ALB 상태 문제

**확인 필요:**
- ALB가 Active 상태인지
- ALB가 올바른 서브넷에 배치되어 있는지

**AWS 콘솔에서 확인:**
1. EC2 → Load Balancers → `devtrail-alb` 선택
2. **Description** 탭 확인:
   - **State**: Active
   - **Subnets**: Public 서브넷에 배치되어 있는지

### 4. 대상 그룹 상태

**확인 필요:**
- EC2 인스턴스가 healthy 상태인지
- 대상 그룹이 ALB 리스너에 연결되어 있는지

**AWS 콘솔에서 확인:**
1. EC2 → Target Groups → `devtrail-targets` 선택
2. **Targets** 탭 확인:
   - EC2 인스턴스 상태가 **healthy**인지
   - **Port**: 80 (HTTP)

## ✅ 해결 방법

### 1단계: ALB 리스너 확인 및 생성

**443 포트 리스너가 없는 경우:**

1. **EC2 → Load Balancers → `devtrail-alb` 선택**
2. **Listeners** 탭 → **Add listener** 클릭
3. **Listener details**:
   - **Protocol**: HTTPS
   - **Port**: 443
   - **Default action**: Forward to → 대상 그룹 선택 (`devtrail-targets`)
4. **Default SSL/TLS certificate**:
   - **From ACM** 선택
   - 인증서 ARN: `arn:aws:acm:ap-northeast-2:756811050863:certificate/b8583643-fb13-46c0-a5da-5fedcfcbc509`
   - 또는 인증서 목록에서 `devtrail.net` 선택
5. **Save** 클릭

**80 포트 리스너 (선택사항 - HTTP 리다이렉트용):**

1. **Listeners** 탭 → **Add listener** 클릭
2. **Listener details**:
   - **Protocol**: HTTP
   - **Port**: 80
   - **Default action**: Redirect to HTTPS → 443 포트
3. **Save** 클릭

### 2단계: ALB 보안 그룹 확인 및 수정

1. **EC2 → Load Balancers → `devtrail-alb` 선택**
2. **Security** 탭 → 보안 그룹 이름 클릭
3. **Inbound rules** → **Edit inbound rules** 클릭
4. **Add rule**:
   - **Type**: HTTPS
   - **Protocol**: TCP
   - **Port range**: 443
   - **Source**: 0.0.0.0/0
   - **Description**: Allow HTTPS from internet
5. **Save rules** 클릭

**HTTP 리다이렉트를 위한 80 포트 (선택사항):**
- **Type**: HTTP
- **Protocol**: TCP
- **Port range**: 80
- **Source**: 0.0.0.0/0

### 3단계: 대상 그룹 확인

1. **EC2 → Target Groups → `devtrail-targets` 선택**
2. **Targets** 탭 확인:
   - EC2 인스턴스가 등록되어 있는지
   - 상태가 **healthy**인지
   - 상태가 **unhealthy**라면:
     - 헬스체크 경로 확인 (`/` 또는 `/health`)
     - EC2 보안 그룹 확인 (ALB에서 접근 허용)
     - nginx 로그 확인

3. **Health checks** 탭 확인:
   - **Health check path**: `/` 또는 `/health`
   - **Port**: 80
   - **Protocol**: HTTP
   - **Success codes**: 200-399

### 4단계: ALB 리스너 규칙 확인

1. **EC2 → Load Balancers → `devtrail-alb` 선택**
2. **Listeners** 탭 → **443 리스너** 선택
3. **Rules** 탭 확인:
   - 기본 규칙이 **Forward to** → 대상 그룹으로 설정되어 있는지
   - 대상 그룹이 올바른지 (`devtrail-targets`)

## 🔍 검증 방법

### 1. ALB 리스너 확인
```bash
# AWS CLI로 확인 (권한 필요)
aws elbv2 describe-listeners --load-balancer-arn <ALB-ARN> \
  --query 'Listeners[*].{Port:Port,Protocol:Protocol,State:State}' \
  --output table
```

**예상 결과:**
```
Port  Protocol  State
443   HTTPS     Active
80    HTTP      Active (선택사항)
```

### 2. ALB 보안 그룹 확인
```bash
# AWS CLI로 확인 (권한 필요)
aws ec2 describe-security-groups --group-ids <ALB-SG-ID> \
  --query 'SecurityGroups[0].IpPermissions[*].{Port:FromPort,Protocol:IpProtocol,Source:IpRanges[*].CidrIp}' \
  --output table
```

**예상 결과:**
```
Port  Protocol  Source
443   tcp       0.0.0.0/0
80    tcp       0.0.0.0/0 (선택사항)
```

### 3. 외부 연결 테스트 (수정 후)
```bash
# HTTPS 연결 테스트
curl -I https://www.devtrail.net
# 예상 출력: HTTP/2 200

# HTTP 연결 테스트 (리다이렉트 설정 시)
curl -I http://www.devtrail.net
# 예상 출력: HTTP/1.1 301 또는 302 (리다이렉트)
```

## 📋 체크리스트

### ALB 설정
- [ ] 443 포트 리스너가 존재하고 Active 상태
- [ ] 443 리스너가 ACM 인증서와 연결됨
- [ ] 443 리스너가 대상 그룹으로 요청 전달
- [ ] 80 포트 리스너 설정 (선택사항 - HTTP 리다이렉트)

### ALB 보안 그룹
- [ ] 443 포트 인바운드 허용 (0.0.0.0/0)
- [ ] 80 포트 인바운드 허용 (선택사항)
- [ ] 아웃바운드 규칙 확인 (EC2 보안 그룹으로 80 포트 허용)

### 대상 그룹
- [ ] EC2 인스턴스가 등록되어 있음
- [ ] 대상 상태가 healthy
- [ ] 포트가 80 (HTTP)로 설정됨
- [ ] 헬스체크 경로가 올바름 (`/` 또는 `/health`)

### EC2 설정 (이미 확인됨)
- [x] nginx 실행 중 (포트 80)
- [x] 백엔드 실행 중 (포트 5000)
- [x] ALB 헬스체크 통과

## ⚠️ 중요 사항

1. **ALB 리스너가 없으면 외부 접근 불가**
   - 리스너가 없으면 ALB가 트래픽을 받지 않음
   - 가장 가능성 높은 원인

2. **보안 그룹 설정 확인**
   - ALB 보안 그룹이 외부 트래픽을 허용해야 함
   - EC2 보안 그룹은 ALB에서만 접근 허용 권장

3. **변경 후 전파 시간**
   - ALB 설정 변경 후 즉시 반영됨
   - DNS 캐시로 인해 5-10분 소요될 수 있음

## 🎯 예상 결과

설정이 올바르게 완료되면:

1. ✅ `https://www.devtrail.net` 정상 접속
2. ✅ HTTP/2 200 응답
3. ✅ 프론트엔드 정상 로드
4. ✅ API 요청 정상 작동
5. ✅ SSL 인증서 정상 작동

## 📝 다음 단계

1. **AWS 콘솔에서 ALB 리스너 확인**
   - 443 포트 리스너가 있는지 확인
   - 없으면 생성

2. **ALB 보안 그룹 확인**
   - 443 포트 인바운드 허용 확인
   - 필요시 수정

3. **대상 그룹 상태 확인**
   - EC2 인스턴스가 healthy인지 확인

4. **외부 연결 테스트**
   - `curl -I https://www.devtrail.net` 실행
   - 브라우저에서 접속 테스트

