# 운동 일지 API 문서

## 개요

운동 일지 기능을 위한 REST API 엔드포인트들을 제공합니다. 모든 API는 인증이 필요하며, JWT 토큰을 헤더에 포함해야 합니다.

## 인증

모든 요청에는 다음 헤더가 필요합니다:

```
Authorization: Bearer <JWT_TOKEN>
```

## 엔드포인트

### 1. 운동 세션 관리

#### 1.1 운동 세션 생성

- **POST** `/api/workout-journal/sessions`
- **설명**: 새로운 운동 세션을 생성합니다.

**요청 본문:**

```json
{
  "plan_id": 1,
  "gym_id": 1,
  "session_name": "상체 운동",
  "start_time": "2024-01-15T10:00:00Z",
  "mood_rating": 4,
  "energy_level": 3,
  "notes": "오늘 컨디션이 좋다"
}
```

**응답:**

```json
{
  "success": true,
  "data": {
    "session_id": 1,
    "user_id": 1,
    "session_name": "상체 운동",
    "start_time": "2024-01-15T10:00:00Z",
    "status": "in_progress",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

#### 1.2 운동 세션 목록 조회

- **GET** `/api/workout-journal/sessions?page=1&limit=10`
- **설명**: 사용자의 운동 세션 목록을 조회합니다.

**쿼리 파라미터:**

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)

**응답:**

```json
{
  "success": true,
  "data": {
    "sessions": [...],
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

#### 1.3 운동 세션 상세 조회

- **GET** `/api/workout-journal/sessions/:session_id`
- **설명**: 특정 운동 세션의 상세 정보를 조회합니다.

**응답:**

```json
{
  "success": true,
  "data": {
    "session_id": 1,
    "session_name": "상체 운동",
    "start_time": "2024-01-15T10:00:00Z",
    "end_time": "2024-01-15T11:30:00Z",
    "total_duration_minutes": 90,
    "status": "completed",
    "exercise_sets": [...]
  }
}
```

#### 1.4 운동 세션 완료

- **PUT** `/api/workout-journal/sessions/:session_id/complete`
- **설명**: 운동 세션을 완료 상태로 변경합니다.

**요청 본문:**

```json
{
  "end_time": "2024-01-15T11:30:00Z"
}
```

### 2. 운동 세트 관리

#### 2.1 운동 세트 추가

- **POST** `/api/workout-journal/sets`
- **설명**: 운동 세션에 새로운 세트를 추가합니다.

**요청 본문:**

```json
{
  "session_id": 1,
  "machine_id": 5,
  "set_number": 1,
  "reps_completed": 12,
  "weight_kg": 50.0,
  "rpe_rating": 7,
  "notes": "첫 번째 세트"
}
```

### 3. 운동 목표 관리

#### 3.1 운동 목표 생성

- **POST** `/api/workout-journal/goals`
- **설명**: 새로운 운동 목표를 생성합니다.

**요청 본문:**

```json
{
  "goal_type": "weight_lift",
  "target_value": 100.0,
  "unit": "kg",
  "target_date": "2024-03-15",
  "start_date": "2024-01-15"
}
```

#### 3.2 운동 목표 목록 조회

- **GET** `/api/workout-journal/goals`
- **설명**: 사용자의 운동 목표 목록을 조회합니다.

#### 3.3 운동 목표 업데이트

- **PUT** `/api/workout-journal/goals/:goal_id`
- **설명**: 운동 목표의 현재 진행 상황을 업데이트합니다.

**요청 본문:**

```json
{
  "current_value": 75.0
}
```

### 4. 운동 통계

#### 4.1 운동 통계 조회

- **GET** `/api/workout-journal/stats?start_date=2024-01-01&end_date=2024-01-31`
- **설명**: 기간별 운동 통계를 조회합니다.

**쿼리 파라미터:**

- `start_date`: 시작 날짜 (YYYY-MM-DD)
- `end_date`: 종료 날짜 (YYYY-MM-DD)

#### 4.2 운동 진행 상황 조회

- **GET** `/api/workout-journal/progress?machine_id=5&limit=10`
- **설명**: 특정 운동 기구의 진행 상황을 조회합니다.

**쿼리 파라미터:**

- `machine_id`: 운동 기구 ID (선택사항)
- `limit`: 조회할 항목 수 (기본값: 10)

### 5. 운동 알림

#### 5.1 운동 알림 생성

- **POST** `/api/workout-journal/reminders`
- **설명**: 새로운 운동 알림을 생성합니다.

**요청 본문:**

```json
{
  "title": "운동 시간",
  "description": "오늘 운동하세요!",
  "reminder_time": "18:00:00",
  "repeat_days": [1, 3, 5],
  "notification_type": "push"
}
```

#### 5.2 운동 알림 목록 조회

- **GET** `/api/workout-journal/reminders`
- **설명**: 사용자의 운동 알림 목록을 조회합니다.

#### 5.3 운동 알림 업데이트

- **PUT** `/api/workout-journal/reminders/:reminder_id`
- **설명**: 운동 알림을 업데이트합니다.

#### 5.4 운동 알림 삭제

- **DELETE** `/api/workout-journal/reminders/:reminder_id`
- **설명**: 운동 알림을 삭제합니다.

### 6. 사용자 요약 통계

#### 6.1 사용자 운동 요약 통계

- **GET** `/api/workout-journal/summary`
- **설명**: 사용자의 운동 요약 통계를 조회합니다.

**응답:**

```json
{
  "success": true,
  "data": {
    "totalSessions": 25,
    "completedSessions": 20,
    "activeGoals": 3,
    "recentSessions": [...]
  }
}
```

## 데이터베이스 스키마

### 주요 테이블

1. **workout_sessions**: 운동 세션 정보
2. **exercise_sets**: 운동 세트 정보
3. **workout_goals**: 운동 목표 정보
4. **workout_plans**: 운동 계획 정보
5. **workout_plan_exercises**: 운동 계획별 운동 정보
6. **workout_stats**: 운동 통계 정보
7. **workout_progress**: 운동 진행 상황 정보
8. **workout_reminders**: 운동 알림 정보

## 에러 코드

- `401`: 인증 실패
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 내부 오류

## 사용 예시

### 운동 세션 생성 및 세트 추가

```javascript
// 1. 운동 세션 생성
const session = await fetch("/api/workout-journal/sessions", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    session_name: "하체 운동",
    start_time: new Date().toISOString(),
  }),
})

// 2. 운동 세트 추가
const set = await fetch("/api/workout-journal/sets", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + token,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    session_id: session.data.session_id,
    machine_id: 10,
    set_number: 1,
    reps_completed: 15,
    weight_kg: 80.0,
  }),
})

// 3. 운동 세션 완료
await fetch(
  `/api/workout-journal/sessions/${session.data.session_id}/complete`,
  {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      end_time: new Date().toISOString(),
    }),
  }
)
```
