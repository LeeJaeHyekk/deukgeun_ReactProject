# 통계 API 문서

## 개요

이 문서는 플랫폼의 통계 데이터를 제공하는 API에 대한 설명입니다.

## 엔드포인트

### 1. 플랫폼 기본 통계

**GET** `/api/stats/platform`

플랫폼의 기본 통계 정보를 제공합니다.

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "activeUsers": 150,
    "totalGyms": 45,
    "totalPosts": 320,
    "achievements": 25
  }
}
```

#### 응답 필드

- `activeUsers`: 최근 30일 내 활동한 사용자 수
- `totalGyms`: 등록된 헬스장 총 수
- `totalPosts`: 전체 게시글 수
- `achievements`: 레벨 5 이상 달성한 사용자 수

---

### 2. 상세 통계 (관리자용)

**GET** `/api/stats/detailed`

관리자만 접근 가능한 상세한 통계 정보를 제공합니다.

#### 헤더

```
Authorization: Bearer <admin_token>
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "monthlyUsers": [
      {
        "month": "2024-01",
        "count": 45
      }
    ],
    "gymDistribution": [
      {
        "district": "강남구",
        "count": 12
      }
    ],
    "levelDistribution": [
      {
        "level": 1,
        "count": 80
      }
    ]
  }
}
```

---

### 3. 사용자 개인 통계

**GET** `/api/stats/user`

인증된 사용자의 개인 통계 정보를 제공합니다.

#### 헤더

```
Authorization: Bearer <user_token>
```

#### 응답 예시

```json
{
  "success": true,
  "data": {
    "level": 3,
    "currentExp": 450,
    "totalExp": 1200,
    "totalPosts": 15,
    "recentPosts": 3
  }
}
```

## 에러 응답

모든 API는 에러 발생 시 다음과 같은 형식으로 응답합니다:

```json
{
  "success": false,
  "message": "에러 메시지"
}
```

## 성능 최적화

1. **인덱스**: `createdAt`, `updatedAt`, `userId` 필드에 인덱스 적용
2. **캐싱**: 자주 조회되는 통계는 Redis 캐싱 고려
3. **페이지네이션**: 대용량 데이터의 경우 페이지네이션 적용

## 보안

- 플랫폼 통계: 공개 접근 가능
- 상세 통계: 관리자 권한 필요
- 사용자 통계: 인증된 사용자만 접근 가능

## 테스트

통계 API 테스트는 다음 스크립트를 사용하세요:

```bash
cd src/backend
npm run ts-node scripts/testStats.ts
```
