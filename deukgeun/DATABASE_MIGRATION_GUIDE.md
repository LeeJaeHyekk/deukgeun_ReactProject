# 데이터베이스 마이그레이션 가이드

## 개요

이 가이드는 최적화된 프론트엔드 구조에 맞춰 데이터베이스를 재구성하는 방법을 설명합니다.

## 🔄 마이그레이션 대상

### 1. User 테이블
- **role enum 확장**: `["user", "admin"]` → `["user", "admin", "moderator"]`
- **계정 복구 필드 추가**: `name`, `username` 필드 추가
- **기존 데이터 보존**: 기존 사용자 데이터에 기본값 설정

### 2. Machine 테이블
- **컬럼명 변경**: snake_case → camelCase
- **카테고리 값 변환**: 한글 → 영문
- **새로운 필드 추가**: `isActive` 필드

### 3. Workout 관련 테이블
- **컬럼명 변경**: snake_case → camelCase
- **ENUM 값 표준화**: 일관된 값 형식 적용

## 🚀 마이그레이션 실행

### 1단계: 데이터베이스 백업

```bash
# 프로덕션 환경에서는 반드시 백업을 수행하세요
mysqldump -u root -p deukgeun_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2단계: 마이그레이션 실행

```bash
cd deukgeun/src/backend

# 전체 최적화 마이그레이션 (권장)
npm run migrate:optimized

# 또는 개별 마이그레이션
npm run migrate:user      # User 테이블만
npm run migrate:machine   # Machine 테이블만
```

### 3단계: 데이터베이스 동기화

```bash
# 스키마 동기화
npm run db:sync

# 또는 완전 리셋 (주의: 모든 데이터 삭제)
npm run db:reset
```

### 4단계: 테스트 데이터 생성

```bash
# 테스트 데이터 시드
npm run seedAllTestData
```

## 📊 마이그레이션 결과

### User 테이블 변경사항

```sql
-- 기존
CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255),
  password VARCHAR(255),
  nickname VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  -- ...
);

-- 마이그레이션 후
CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255),
  password VARCHAR(255),
  nickname VARCHAR(255),
  name VARCHAR(100) NULL,           -- 추가
  username VARCHAR(100) NULL,       -- 추가
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',  -- 확장
  -- ...
);
```

### Machine 테이블 변경사항

```sql
-- 기존
CREATE TABLE machines (
  machine_key VARCHAR(100),
  name_ko VARCHAR(100),
  name_en VARCHAR(100),
  image_url VARCHAR(255),
  short_desc VARCHAR(255),
  detail_desc TEXT,
  positive_effect TEXT,
  target_muscle JSON,
  difficulty_level ENUM('beginner', 'intermediate', 'advanced'),
  video_url VARCHAR(255),
  category VARCHAR(50),  -- 한글 값
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- 마이그레이션 후
CREATE TABLE machines (
  machineKey VARCHAR(100),          -- 변경
  name VARCHAR(100),                -- 변경
  nameEn VARCHAR(100),              -- 변경
  imageUrl VARCHAR(255),            -- 변경
  shortDesc VARCHAR(255),           -- 변경
  detailDesc TEXT,                  -- 변경
  positiveEffect TEXT,              -- 변경
  targetMuscles JSON,               -- 변경
  difficulty ENUM('beginner', 'intermediate', 'advanced', 'expert'),  -- 확장
  videoUrl VARCHAR(255),            -- 변경
  isActive BOOLEAN DEFAULT TRUE,    -- 추가
  category VARCHAR(50),             -- 영문 값으로 변환
  createdAt TIMESTAMP,              -- 변경
  updatedAt TIMESTAMP               -- 변경
);
```

## ⚠️ 주의사항

### 데이터 손실 위험
- 마이그레이션 전 반드시 데이터베이스 백업을 수행하세요
- 프로덕션 환경에서는 신중하게 실행하세요

### 호환성 문제
- 기존 API 호출이 새로운 필드명을 사용하도록 업데이트되었습니다
- 프론트엔드에서 기존 필드명을 사용하는 코드가 있다면 수정이 필요합니다

### 롤백 방법
마이그레이션 후 문제가 발생하면 백업에서 복원할 수 있습니다:

```bash
mysql -u root -p deukgeun_db < backup_file.sql
```

## 🔧 문제 해결

### 일반적인 오류

#### 1. 컬럼이 존재하지 않음
```
Error: Unknown column 'old_column_name' in 'field list'
```
- 마이그레이션 스크립트가 이미 실행되었는지 확인
- 데이터베이스 스키마 상태 확인

#### 2. ENUM 값 오류
```
Error: Data truncated for column 'role' at row 1
```
- 기존 데이터의 role 값이 새로운 ENUM에 맞지 않음
- 마이그레이션 스크립트의 값 변환 로직 확인

#### 3. 타입 오류
```
Type 'string' is not assignable to type 'UserRole'
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
SHOW TABLES;
DESCRIBE users;
DESCRIBE machines;
```

3. 마이그레이션 상태 확인
```sql
SELECT * FROM users_backup LIMIT 5;
SELECT * FROM machines_backup LIMIT 5;
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 환경 변수 설정 (`src/backend/.env`)
2. 데이터베이스 연결 상태
3. 로그 파일 (`logs/app.log`)
4. 타입 정의 일치성

---

**참고**: 이 가이드는 개발 환경을 기준으로 작성되었습니다. 프로덕션 환경에서는 적절한 보안 설정을 추가하세요.
