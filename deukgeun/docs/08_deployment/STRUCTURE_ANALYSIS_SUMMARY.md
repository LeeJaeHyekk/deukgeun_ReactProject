# 구조 분석 및 문제 해결 요약

## 📊 현재 구조 분석

### ✅ 정상 작동 중인 부분

```
┌─────────────────────────────────────────────────────────┐
│ EC2 인스턴스 (172.31.40.214)                            │
│                                                          │
│  ✅ nginx (포트 80) - 정상 작동                         │
│  ✅ Backend (포트 5000) - 정상 작동                     │
│  ✅ ALB 헬스체크 통과 (200 응답)                        │
└─────────────────────────────────────────────────────────┘
         ▲
         │ HTTP (포트 80)
         │
┌────────┴───────────────────────────────────────────────┐
│ ALB 내부 통신 (172.31.44.235, 172.31.2.51)           │
│ ✅ 헬스체크 성공                                        │
└────────────────────────────────────────────────────────┘
```

### ❌ 문제가 있는 부분

```
[Client] ─HTTPS(443)─> [ALB] ❌ Connection Timeout
         ─HTTP(80)─>   [ALB] ❌ Connection Timeout
```

**ALB 외부 IP:**
- `15.164.146.43`
- `52.79.229.31`

**문제:**
- ALB가 외부 트래픽을 받지 못함
- 포트 443, 80 모두 타임아웃

## 🔍 문제 원인 (확률 순)

### 1. ALB 리스너 미설정 ⚠️ (90% 가능성)

**증상:**
- ALB가 외부에서 접근 불가
- 타임아웃 발생

**확인 방법:**
AWS 콘솔 → EC2 → Load Balancers → `devtrail-alb` → Listeners 탭

**예상 결과:**
- 리스너가 없거나
- 443 포트 리스너가 없거나
- 리스너가 비활성 상태

### 2. ALB 보안 그룹 설정 문제 (8% 가능성)

**확인 방법:**
AWS 콘솔 → EC2 → Load Balancers → `devtrail-alb` → Security 탭

**확인 사항:**
- 443 포트 인바운드 규칙이 있는지
- 소스가 `0.0.0.0/0` 또는 적절한 범위인지

### 3. ALB 서브넷 설정 문제 (2% 가능성)

**확인 방법:**
AWS 콘솔 → EC2 → Load Balancers → `devtrail-alb` → Description 탭

**확인 사항:**
- ALB가 Public 서브넷에 배치되어 있는지
- ALB State가 Active인지

## ✅ 해결 방법 (AWS 콘솔에서 수행)

### 1단계: ALB 리스너 확인 및 생성

#### A. 리스너 확인
1. **EC2 콘솔** → **Load Balancers**
2. `devtrail-alb` 선택
3. **Listeners** 탭 확인
   - **443 포트 리스너가 있는지 확인**
   - 없으면 다음 단계로 진행

#### B. 443 포트 리스너 생성
1. **Listeners** 탭 → **Add listener** 클릭
2. **Listener details**:
   ```
   Protocol: HTTPS
   Port: 443
   Default action: Forward to → devtrail-targets (대상 그룹 선택)
   ```
3. **Default SSL/TLS certificate**:
   ```
   From ACM 선택
   Certificate: devtrail.net 인증서 선택
   또는 ARN 입력: arn:aws:acm:ap-northeast-2:756811050863:certificate/b8583643-fb13-46c0-a5da-5fedcfcbc509
   ```
4. **Save changes** 클릭

#### C. 80 포트 리스너 (선택사항 - HTTP → HTTPS 리다이렉트)
1. **Listeners** 탭 → **Add listener** 클릭
2. **Listener details**:
   ```
   Protocol: HTTP
   Port: 80
   Default action: Redirect to HTTPS → 443
   ```
3. **Save changes** 클릭

### 2단계: ALB 보안 그룹 확인

1. **EC2 콘솔** → **Load Balancers** → `devtrail-alb` 선택
2. **Security** 탭 → 보안 그룹 이름 클릭
3. **Inbound rules** 확인:
   - **Type**: HTTPS (443)
   - **Source**: `0.0.0.0/0` 또는 적절한 범위
   
   **없으면 추가:**
   - **Edit inbound rules** 클릭
   - **Add rule**:
     ```
     Type: HTTPS
     Protocol: TCP
     Port range: 443
     Source: 0.0.0.0/0
     Description: Allow HTTPS from internet
     ```
   - **Save rules** 클릭

### 3단계: 대상 그룹 확인

1. **EC2 콘솔** → **Target Groups** → `devtrail-targets` 선택
2. **Targets** 탭 확인:
   - EC2 인스턴스가 등록되어 있는지
   - 상태가 **healthy**인지
   - 포트가 **80**인지

3. **Health checks** 탭 확인:
   - **Health check path**: `/` 또는 `/health`
   - **Port**: 80
   - **Protocol**: HTTP

## 🔍 검증 방법

### 수정 후 테스트

```bash
# 1. HTTPS 연결 테스트
curl -I https://www.devtrail.net
# 예상 출력: HTTP/2 200

# 2. 브라우저에서 확인
# https://www.devtrail.net 접속
# 주소창의 자물쇠 아이콘 확인

# 3. DNS 확인 (이미 정상)
dig +short www.devtrail.net A
# 출력: 15.164.146.43, 52.79.229.31 (ALB IP)
```

## 📋 체크리스트

### ALB 설정
- [ ] 443 포트 리스너가 존재하고 Active 상태
- [ ] 443 리스너가 ACM 인증서와 연결됨
- [ ] 443 리스너가 대상 그룹으로 요청 전달
- [ ] ALB 보안 그룹에서 443 포트 인바운드 허용 (0.0.0.0/0)

### 대상 그룹
- [ ] EC2 인스턴스가 등록되어 있음
- [ ] 대상 상태가 healthy
- [ ] 포트가 80 (HTTP)로 설정됨

### EC2 설정 (이미 확인됨)
- [x] nginx 실행 중 (포트 80)
- [x] 백엔드 실행 중 (포트 5000)
- [x] ALB 헬스체크 통과

## 🎯 예상 결과

설정 완료 후:
1. ✅ `https://www.devtrail.net` 정상 접속
2. ✅ HTTP/2 200 응답
3. ✅ 프론트엔드 정상 로드
4. ✅ API 요청 정상 작동

## ⚠️ 중요 사항

**가장 가능성 높은 원인: ALB 리스너가 없음**

- ALB가 리스너 없이는 외부 트래픽을 받을 수 없음
- 리스너가 ALB의 "문" 역할을 함
- 리스너가 없으면 타임아웃 발생

**다음 단계:**
1. AWS 콘솔에서 ALB 리스너 확인
2. 443 포트 리스너가 없으면 생성
3. 보안 그룹 확인
4. 외부 연결 테스트

