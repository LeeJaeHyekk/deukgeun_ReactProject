# 타입 시스템 마이그레이션 가이드

## 개요

이 문서는 기존 프로젝트의 타입 시스템을 중앙화된 새로운 타입 시스템으로 마이그레이션하는 방법을 설명합니다.

## 주요 변경사항

### 1. 백엔드 엔티티 변경

#### Machine 엔티티

- `machine_key` → `machineKey`
- `name_ko` → `name`
- `name_en` → `nameEn`
- `image_url` → `imageUrl`
- `short_desc` → `shortDesc`
- `detail_desc` → `detailDesc`
- `positive_effect` → `positiveEffect`
- `target_muscle` → `targetMuscles`
- `difficulty_level` → `difficulty`
- `video_url` → `videoUrl`
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`
- 카테고리: `["상체", "하체", "전신", "기타"]` → `["cardio", "strength", "flexibility", "balance", "functional", "rehabilitation"]`
- 난이도: `["초급", "중급", "고급"]` → `["beginner", "intermediate", "advanced", "expert"]`

#### WorkoutGoal 엔티티

- `goal_id` → `id`
- `user_id` → `userId`
- `goal_type` → `type`
- `target_value` → `targetValue`
- `current_value` → `currentValue`
- `target_date` → `deadline`
- `start_date` → 제거
- `status` → `isCompleted`
- `progress_percentage` → 제거
- `created_at` → `createdAt`
- `updated_at` → `updatedAt`
- 목표 타입: `["weight_lift", "endurance", "weight_loss", "muscle_gain", "strength", "flexibility"]` → `["weight", "reps", "duration", "frequency", "streak"]`

### 2. 프론트엔드 컴포넌트 변경

#### WorkoutPlanModal

- Machine props 타입 변경
- WorkoutPlan 인터페이스에 exercises 속성 추가
- 필드명 camelCase로 통일

#### WorkoutSessionModal

- Machine props 타입 변경
- WorkoutSession 인터페이스 업데이트
- ExerciseSet 타입 사용

#### GoalProgressBar

- WorkoutGoal 타입 변경
- 진행률 계산 로직 수정
- 상태 표시 방식 변경

## 마이그레이션 단계

### 1단계: 데이터베이스 백업

```bash
# 프로덕션 환경에서는 반드시 백업을 수행하세요
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2단계: 마이그레이션 스크립트 실행

```bash
cd deukgeun/src/backend
npm run migrate:types
```

### 3단계: 애플리케이션 재시작

```bash
# 백엔드 재시작
npm run dev

# 프론트엔드 재시작 (다른 터미널에서)
cd ../frontend
npm run dev
```

### 4단계: 테스트

- Machine 관련 기능 테스트
- WorkoutGoal 관련 기능 테스트
- 기존 데이터 정상 동작 확인

## 주의사항

### 데이터 손실 위험

- 마이그레이션 전 반드시 데이터베이스 백업을 수행하세요
- 프로덕션 환경에서는 신중하게 실행하세요

### 호환성 문제

- 기존 API 호출이 새로운 필드명을 사용하도록 업데이트되었습니다
- 프론트엔드에서 기존 필드명을 사용하는 코드가 있다면 수정이 필요합니다

### 롤백 방법

마이그레이션 후 문제가 발생하면 백업에서 복원할 수 있습니다:

```bash
mysql -u username -p database_name < backup_file.sql
```

## 문제 해결

### 일반적인 오류

#### 1. 컬럼이 존재하지 않음

```
Error: Unknown column 'old_column_name' in 'field list'
```

- 마이그레이션 스크립트가 이미 실행되었는지 확인
- 데이터베이스 스키마 상태 확인

#### 2. ENUM 값 오류

```
Error: Data truncated for column 'category' at row 1
```

- 기존 데이터의 카테고리/난이도 값이 새로운 ENUM에 맞지 않음
- 마이그레이션 스크립트의 값 변환 로직 확인

#### 3. 타입 오류

```
Type 'string' is not assignable to type 'MachineCategory'
```

- TypeScript 타입 정의가 업데이트되지 않음
- `npm run build` 실행하여 타입 체크

### 디버깅 방법

1. 로그 확인

```bash
tail -f logs/app.log
```

2. 데이터베이스 상태 확인

```sql
DESCRIBE machines;
DESCRIBE workout_goals;
```

3. 샘플 데이터 확인

```sql
SELECT * FROM machines LIMIT 5;
SELECT * FROM workout_goals LIMIT 5;
```

## 추가 작업

### 1. API 문서 업데이트

- Swagger/OpenAPI 문서 업데이트
- API 엔드포인트 응답 형식 변경 반영

### 2. 테스트 코드 업데이트

- 단위 테스트의 모킹 데이터 업데이트
- 통합 테스트의 예상 응답 형식 수정

### 3. 프론트엔드 타입 체크

```bash
cd deukgeun/src/frontend
npm run type-check
```

## 지원

마이그레이션 중 문제가 발생하면:

1. 로그 파일 확인
2. 데이터베이스 상태 점검
3. 개발팀에 문의

---

**마지막 업데이트**: 2024년 12월
**버전**: 1.0.0
