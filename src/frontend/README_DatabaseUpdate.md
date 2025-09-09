# 데이터베이스 최신화 기능

프론트엔드에서 서울시 공공데이터 API를 호출하여 헬스장 데이터베이스를 최신화하는 기능입니다.

## 기능 개요

- 서울시 공공데이터 API에서 헬스장 정보 자동 수집
- 유효한 데이터 필터링 (좌표, 전화번호, 이름, 주소 확인)
- 백엔드 데이터베이스에 대량 업데이트
- 실시간 진행 상황 모니터링
- 관리자 페이지를 통한 웹 인터페이스 제공

## 파일 구조

```
src/frontend/
├── script/
│   ├── updateGymDatabase.ts      # 메인 업데이트 함수
│   └── testDatabaseUpdate.ts     # 테스트 스크립트
├── pages/Admin/
│   ├── DatabaseUpdatePage.tsx    # 관리자 페이지 컴포넌트
│   └── DatabaseUpdatePage.module.css
└── pages/location/API/
    └── getGyms.ts               # 서울시 API 호출 함수
```

## 설정 방법

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# 서울시 공공데이터 API 키
VITE_GIM_API_KEY=your_seoul_openapi_key_here

# 백엔드 서버 URL
VITE_BACKEND_URL=http://localhost:5000
```

### 2. 서울시 공공데이터 API 키 발급

1. [서울시 공공데이터 포털](https://data.seoul.go.kr/) 접속
2. 회원가입 및 로그인
3. "헬스장" 검색
4. "서울특별시 헬스장 정보" API 신청
5. 승인 후 API 키 발급

## 사용 방법

### 1. 관리자 페이지 사용

1. 프론트엔드 애플리케이션 실행
2. `/admin/database-update` 페이지 접속
3. "데이터베이스 최신화" 버튼 클릭
4. 진행 상황 모니터링

### 2. 프로그래밍 방식 사용

```typescript
import {
  updateGymDatabase,
  checkDatabaseStatus,
} from "./script/updateGymDatabase"

// 데이터베이스 상태 확인
const status = await checkDatabaseStatus()
console.log("현재 헬스장 수:", status.data.totalGyms)

// 데이터베이스 업데이트
const result = await updateGymDatabase()
if (result.success) {
  console.log("업데이트 완료:", result.validCount, "개")
}
```

### 3. 명령줄에서 테스트

```bash
# 프론트엔드 디렉토리에서
cd src/frontend
npm run test:database
```

## API 엔드포인트

### 백엔드 API

- `GET /api/gyms/status` - 데이터베이스 상태 확인
- `POST /api/gyms/bulk-update` - 대량 헬스장 데이터 업데이트
- `GET /api/gyms` - 모든 헬스장 조회
- `GET /api/gyms/search/location` - 위치 기반 헬스장 검색

### 요청/응답 형식

#### 대량 업데이트 요청

```json
{
  "gyms": [
    {
      "id": "MGTNO",
      "name": "헬스장명",
      "phone": "전화번호",
      "address": "주소",
      "latitude": 37.5665,
      "longitude": 126.978
    }
  ]
}
```

#### 상태 확인 응답

```json
{
  "success": true,
  "data": {
    "totalGyms": 1234,
    "lastUpdated": "2024-01-01T00:00:00.000Z",
    "databaseStatus": "healthy"
  }
}
```

## 데이터 필터링 기준

업데이트 시 다음 조건을 만족하는 데이터만 저장됩니다:

- ✅ 유효한 위도/경도 좌표
- ✅ 전화번호 정보 존재
- ✅ 헬스장 이름 존재
- ✅ 주소 정보 존재

## 주의사항

1. **API 호출 제한**: 서울시 공공데이터 API는 일일 호출 제한이 있을 수 있습니다.
2. **업데이트 시간**: 대량 데이터 업데이트는 1-2분 정도 소요될 수 있습니다.
3. **기존 데이터**: 기존 데이터는 보존되며, 새로운 정보로 업데이트됩니다.
4. **에러 처리**: 개별 헬스장 데이터 처리 실패 시에도 전체 프로세스는 계속됩니다.

## 트러블슈팅

### API 키 오류

```
Error: Failed to fetch gym list from Seoul OpenAPI
```

- API 키가 올바르게 설정되었는지 확인
- 서울시 공공데이터 포털에서 API 승인 상태 확인

### 백엔드 연결 오류

```
Error: 백엔드 API 호출 실패
```

- 백엔드 서버가 실행 중인지 확인
- `VITE_BACKEND_URL` 환경 변수 설정 확인
- CORS 설정 확인

### 데이터베이스 오류

```
Error: 헬스장 데이터 업데이트 중 오류가 발생했습니다
```

- 데이터베이스 연결 상태 확인
- 데이터베이스 스키마 확인
- 백엔드 로그 확인

## 개발 정보

- **프레임워크**: React + TypeScript
- **API**: 서울시 공공데이터 API
- **백엔드**: Node.js + Express + TypeORM
- **데이터베이스**: MySQL

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
