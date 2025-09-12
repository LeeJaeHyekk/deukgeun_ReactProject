# 머신 데이터 시딩 가이드

이 문서는 머신 가이드 데이터를 데이터베이스에 삽입하는 방법을 설명합니다.

## 개요

머신 데이터 시딩은 `machinesData.json` 파일의 데이터를 데이터베이스의 `Machine` 테이블에 삽입하는 과정입니다.
기존 config 파일들(`database.ts`, `env.ts`)을 활용하여 환경 변수에서 데이터베이스 연결 정보를 가져옵니다.

## 사용 가능한 스크립트

### 1. 통합 시드 스크립트 (권장)

```bash
npm run seed:machines:unified
```

- **파일**: `seedMachinesUnified.ts`
- **설명**: 기존 config 파일들을 활용하는 통합된 시드 스크립트
- **특징**:
  - 환경 변수 자동 로드
  - 데이터베이스 연결 정보 표시
  - 상세한 로깅
  - 안전한 연결 관리

### 2. 기존 시드 스크립트 (수정됨)

```bash
npm run seed:machines
```

- **파일**: `seedMachinesData.ts`
- **설명**: 기존 스크립트를 config 기반으로 수정
- **특징**: 기존 코드와의 호환성 유지

### 3. API 기반 삽입 스크립트

```bash
npm run seed:machines:api
```

- **파일**: `insertMachinesViaAPI.ts`
- **설명**: HTTP API를 통해 머신 데이터 삽입
- **특징**:
  - 서버가 실행 중이어야 함
  - API 엔드포인트를 통한 삽입
  - 업데이트 로직 포함

## 환경 설정

### 필수 환경 변수

`.env` 파일에 다음 변수들이 설정되어 있어야 합니다:

```env
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=deukgeun_db

# 애플리케이션 설정
NODE_ENV=development
PORT=5000
```

### 환경 변수 로드 순서

1. `.env.production` (프로덕션 우선)
2. `.env` (개발 환경)

## 데이터 소스

머신 데이터는 다음 파일에서 가져옵니다:

- `../../shared/data/machines/machinesData.json`

## 스크립트 동작 방식

### 1. 데이터베이스 연결

- `AppDataSource`를 사용하여 TypeORM 연결
- 환경 변수에서 데이터베이스 설정 자동 로드
- 연결 상태 확인 및 초기화

### 2. 데이터 처리

- JSON 파일에서 머신 데이터 로드
- 각 머신에 대해 `machineKey`로 중복 확인
- 기존 데이터가 있으면 업데이트, 없으면 새로 삽입

### 3. 결과 보고

- 삽입된 머신 수
- 업데이트된 머신 수
- 오류로 건너뛴 머신 수
- 최종 데이터베이스 머신 수

## 사용 예시

### 개발 환경에서 실행

```bash
# 백엔드 디렉토리로 이동
cd src/backend

# 통합 시드 스크립트 실행
npm run seed:machines:unified
```

### 출력 예시

```
🚀 Starting unified machine seeding process...
🌱 Starting unified machine data seeding...
🔧 Environment: development
🗄️  Database: deukgeun_db on localhost:3306
🔌 Database connection established
📊 Found 0 existing machines in database
📦 Found 25 machines in JSON data
🆕 Inserted new machine: 벤치프레스
🆕 Inserted new machine: 스쿼트랙
...
📈 Seeding Summary:
   🆕 New machines inserted: 25
   ✅ Existing machines updated: 0
   ⏭️  Machines skipped (errors): 0
   📊 Total processed: 25
🎯 Final machine count in database: 25
✅ Machine data seeding completed successfully!
🔌 Database connection closed
🎉 Machine seeding process completed successfully!
```

## 문제 해결

### 일반적인 오류

1. **데이터베이스 연결 실패**
   - `.env` 파일의 데이터베이스 설정 확인
   - MySQL 서버가 실행 중인지 확인
   - 데이터베이스가 존재하는지 확인

2. **JSON 파일을 찾을 수 없음**
   - `machinesData.json` 파일 경로 확인
   - 파일이 존재하는지 확인

3. **권한 오류**
   - 데이터베이스 사용자 권한 확인
   - 테이블 생성/수정 권한 확인

### 디버깅 팁

1. **환경 변수 확인**

   ```bash
   # 환경 변수가 올바르게 로드되었는지 확인
   npm run seed:machines:unified
   ```

2. **데이터베이스 연결 테스트**

   ```bash
   npm run check:schema
   ```

3. **로그 확인**
   - 스크립트 실행 시 상세한 로그가 출력됩니다
   - 오류 메시지를 자세히 확인하세요

## 주의사항

1. **데이터 백업**: 프로덕션 환경에서 실행하기 전에 데이터를 백업하세요
2. **환경 확인**: 올바른 환경 변수가 설정되어 있는지 확인하세요
3. **권한 확인**: 데이터베이스 접근 권한이 있는지 확인하세요
4. **중복 실행**: 같은 데이터를 여러 번 삽입해도 안전합니다 (업데이트 로직 포함)

## 추가 정보

- 스크립트는 `machineKey`를 기준으로 중복을 확인합니다
- 기존 데이터가 있으면 업데이트, 없으면 새로 삽입합니다
- 모든 변경사항은 트랜잭션으로 처리됩니다
- 스크립트 실행 후 데이터베이스 연결이 자동으로 정리됩니다
