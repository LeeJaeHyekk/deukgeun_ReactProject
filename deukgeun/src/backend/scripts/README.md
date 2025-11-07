# Backend Scripts

이 디렉토리에는 백엔드 개발 및 운영에 필요한 유틸리티 스크립트들이 포함되어 있습니다.

## 사용 가능한 스크립트

### 데이터베이스 관련

#### `syncDatabase.ts`
- **용도**: TypeORM 엔티티를 기반으로 데이터베이스 스키마를 동기화합니다.
- **사용법**: `npm run db:sync`
- **안전장치**:
  - 프로덕션 환경에서 실행 불가
  - 데이터베이스 연결 검증
  - 외래키 제약조건 관리
- **옵션**:
  - `--force`: 강제 동기화 (데이터 손실 위험)
  - `--drop-schema`: 스키마 삭제 후 재생성 (데이터 손실 위험)

#### `safeDatabaseReset.ts`
- **용도**: 모든 테이블을 삭제하고 스키마를 재생성합니다.
- **사용법**: `npm run db:reset`
- **안전장치**:
  - 프로덕션 환경에서 실행 불가
  - 사용자 확인 요청
  - 데이터베이스 연결 검증
  - 테이블 존재 여부 확인
- **옵션**:
  - `--skip-confirmation`: 확인 스킵
  - `--skip-backup`: 백업 확인 스킵
  - `--tables-only`: 테이블만 삭제 (스키마 재생성 안 함)

#### `checkDatabaseSchema.ts`
- **용도**: 현재 데이터베이스 스키마를 확인하고 엔티티와 비교합니다.
- **사용법**: `npm run check:schema`
- **기능**:
  - 모든 테이블 목록 조회
  - 주요 테이블 존재 여부 확인
  - 테이블 상세 정보 출력 (컬럼, 행 수, 크기)
  - 데이터베이스 통계

#### `fixDuplicateColumns.ts`
- **용도**: 중복된 컬럼들을 정리합니다.
- **사용법**: `npm run fix:duplicates`
- **안전장치**:
  - 프로덕션 환경 경고
  - 컬럼 존재 여부 확인
  - 외래키 제약조건 관리
- **처리 대상**:
  - `workout_goals` 테이블: `user_id` → `userId`
  - `workout_sessions` 테이블: `user_id` → `userId`, `plan_id` → `planId`, `gym_id` → `gymId`

#### `createWorkoutJournalTables.ts`
- **용도**: 운동 일지 관련 테이블을 생성합니다.
- **사용법**: `npm run createWorkoutJournalTables`
- **안전장치**:
  - 프로덕션 환경 경고
  - 테이블 존재 여부 확인 (중복 생성 방지)
  - 데이터베이스 연결 검증
- **생성 테이블**:
  - `workout_sessions`
  - `exercise_sets`
  - `workout_goals`
  - `workout_plans`
  - `workout_plan_exercises`
  - `workout_stats`
  - `workout_progress`
  - `workout_reminders`

### 디버깅 관련

#### `debugDatabase.ts`
- **용도**: 데이터베이스 연결 디버깅
- **사용법**: `npm run debug:db`
- **기능**:
  - MySQL 서버 연결 테스트
  - 데이터베이스 존재 확인
  - TypeORM DataSource 설정 테스트
  - 엔티티 파일 확인

#### `debugEnvironment.ts`
- **용도**: 환경 변수 디버깅
- **사용법**: `npm run debug:env`
- **기능**:
  - 환경 파일 경로 확인
  - 중요한 환경 변수 확인
  - 데이터베이스 설정 확인
  - JWT 설정 확인
  - CORS 설정 확인

#### `debugServer.ts`
- **용도**: 서버 시작 디버깅
- **사용법**: `npm run debug:server`
- **기능**:
  - 환경 변수 확인
  - Express 앱 생성 테스트
  - 데이터베이스 연결 테스트
  - 라우트 모듈 로드 테스트
  - 서버 시작 테스트

#### `testSimpleServer.ts`
- **용도**: 간단한 서버 테스트
- **사용법**: `npm run test:simple`
- **기능**:
  - 엔티티 없이 기본 데이터베이스 연결만 테스트
  - Express 앱 생성 테스트
  - 서버 시작 테스트

#### `minimalReproduction.ts`
- **용도**: 최소 재현 스크립트
- **사용법**: `npm run debug:minimal`
- **기능**:
  - 최소한의 코드로 문제 재현
  - MySQL 직접 연결 테스트
  - TypeORM DataSource 최소 설정 테스트
  - Express 서버 최소 설정 테스트

### 보안 및 검증

#### `validateEnv.ts`
- **용도**: 환경 변수 보안 검증
- **사용법**: `npm run security:check`
- **기능**:
  - 필수 환경 변수 확인
  - 위험한 기본값 확인
  - 보안 권장사항 제공
- **옵션**:
  - `--generate-secrets`: 보안 시크릿 생성 도우미

### 크롤링 관련

#### `weeklyCrawlingCron.ts`
- **용도**: EC2 환경용 7일 주기 크롤링 스크립트
- **사용법**: PM2로 배포 또는 수동 실행
- **기능**:
  - 공공 API 데이터 수집
  - 웹 크롤링 (병렬 처리)
  - 데이터 병합
  - 안전한 파일 작업

### 빌드 관련

#### `postbuild.cjs`
- **용도**: 빌드 후 package.json 변환
- **사용법**: 자동 실행 (postbuild 스크립트)
- **기능**:
  - ESM 개발 환경에서 CJS 빌드 결과로 변환
  - 빌드용 package.json 생성

## 삭제된 스크립트

다음 스크립트들은 사용되지 않거나 중복되어 삭제되었습니다:

- `unifiedSeedScript.ts` - `scripts/db-seed-unified.ts`로 대체됨
- `unifiedSeedScriptSimple.ts` - `scripts/db-seed-unified.ts`로 대체됨
- `testCrawlingBasic.ts` - 크롤링 테스트용, 사용되지 않음
- `testCrawlingComplex.ts` - 크롤링 테스트용, 사용되지 않음
- `testCrawlingFallback.ts` - 크롤링 테스트용, 사용되지 않음
- `testCrawlingPerformance.ts` - 크롤링 테스트용, 사용되지 않음
- `testCrawlingStress.ts` - 크롤링 테스트용, 사용되지 않음
- `runAllCrawlingTests.ts` - 크롤링 테스트용, 사용되지 않음
- `cleanupUnusedModules.ts` - 사용하지 않는 모듈 정리용, 사용되지 않음
- `migrateToOptimizedSchema.ts` - 이미 실행된 마이그레이션
- `migrateUserTable.ts` - 이미 실행된 마이그레이션
- `migrateMachineOnly.ts` - 이미 실행된 마이그레이션
- `migrateToNewTypeSystem.ts` - 이미 실행된 마이그레이션
- `postbuild.mjs` - `postbuild.cjs`와 중복
- `init.sql` - SQL 초기화 스크립트, 사용되지 않음
- `gymUtils.ts` - 유틸리티 함수, 사용되지 않음
- `ec2MonitorCrawling.ts` - EC2 모니터링용, 사용되지 않음

## 안전장치

모든 스크립트에는 다음 안전장치가 포함되어 있습니다:

1. **프로덕션 환경 확인**: 프로덕션 환경에서 위험한 작업은 실행 불가
2. **데이터베이스 연결 검증**: 실행 전 데이터베이스 연결 확인
3. **사용자 확인**: 데이터 손실 위험이 있는 작업은 사용자 확인 요청
4. **에러 처리**: 모든 에러를 적절히 처리하고 로깅
5. **리소스 정리**: 스크립트 종료 시 데이터베이스 연결 정리

## 주의사항

- 프로덕션 환경에서는 데이터베이스 스키마 변경 스크립트를 실행하지 마세요.
- 모든 스크립트 실행 전 데이터베이스 백업을 권장합니다.
- 스크립트 실행 시 환경 변수가 올바르게 설정되어 있는지 확인하세요.

