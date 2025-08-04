# 헬스장 크롤링 전략 가이드

## 📋 개요

이 문서는 헬스장 정보를 수집하기 위한 다양한 크롤링 전략과 방법들을 설명합니다.

## 🎯 크롤링 목표

- **정확성**: 정확한 헬스장 정보 수집
- **완성도**: 주소, 전화번호, 좌표, 시설 정보 등 완전한 데이터
- **효율성**: 최소한의 API 호출로 최대한의 정보 수집
- **신뢰성**: 여러 소스의 정보를 통합하여 신뢰도 향상

## 🔍 크롤링 방법별 비교

### 1. API 기반 검색

#### 카카오맵 API

- **장점**: 정확한 좌표, 카테고리 정보, 신뢰도 높음
- **단점**: API 호출 제한, 일부 소규모 헬스장 누락
- **신뢰도**: 0.8-0.9
- **비용**: 무료 (일일 제한 있음)

#### 네이버 검색 API

- **장점**: 다양한 정보 소스, 블로그/카페 정보 포함
- **단점**: 좌표 정보 없음, 정확도 낮음
- **신뢰도**: 0.6-0.7
- **비용**: 무료 (일일 제한 있음)

#### 구글 플레이스 API

- **장점**: 전 세계 데이터, 정확한 좌표, 상세 정보
- **단점**: 유료, 한국 데이터 제한적
- **신뢰도**: 0.9
- **비용**: 유료 (API 호출당 과금)

#### 서울시 공공데이터 API

- **장점**: 공식 데이터, 매우 신뢰도 높음, 무료
- **단점**: 서울시만 해당, 업데이트 주기 느림
- **신뢰도**: 0.95
- **비용**: 무료

### 2. 웹 크롤링

#### 카카오맵 웹사이트

- **장점**: API와 동일한 데이터, 추가 정보 가능
- **단점**: 구조 변경에 취약, 느린 속도
- **신뢰도**: 0.6-0.7
- **비용**: 무료

#### 네이버 지도 웹사이트

- **장점**: 네이버 API와 동일한 데이터
- **단점**: 구조 변경에 취약, 느린 속도
- **신뢰도**: 0.6-0.7
- **비용**: 무료

#### 헬스장 전용 디렉토리 사이트

- **장점**: 헬스장 전문 정보, 상세 시설 정보
- **단점**: 사이트별 구조 다름, 유지보수 복잡
- **신뢰도**: 0.7-0.8
- **비용**: 무료

### 3. 소셜 미디어 크롤링

#### 네이버 블로그/카페

- **장점**: 실제 이용자 정보, 최신 정보
- **단점**: 정확도 낮음, 구조화 어려움
- **신뢰도**: 0.4-0.5
- **비용**: 무료

#### 인스타그램

- **장점**: 위치 태그, 시각적 정보
- **단점**: API 제한, 공개 정보만 접근 가능
- **신뢰도**: 0.3-0.4
- **비용**: 무료

#### 페이스북

- **장점**: 비즈니스 페이지 정보
- **단점**: 로그인 필요, 구조 변경 빈번
- **신뢰도**: 0.5-0.6
- **비용**: 무료

## 🚀 고급 크롤링 전략

### 1. 멀티 소스 통합

```typescript
// 여러 소스에서 동시 검색
const searchPromises = [
  searchKakaoMap(query),
  searchNaverMap(query),
  searchGooglePlaces(query),
  searchSeoulOpenData(query),
  crawlKakaoMapWeb(query),
  crawlNaverMapWeb(query),
];

const results = await Promise.allSettled(searchPromises);
```

### 2. 신뢰도 기반 결과 선택

```typescript
// 신뢰도 점수별 결과 선택
const results = [
  { source: "seoul_opendata", confidence: 0.95 },
  { source: "google", confidence: 0.9 },
  { source: "kakao", confidence: 0.8 },
  { source: "naver", confidence: 0.7 },
  { source: "blog", confidence: 0.4 },
];

// 가장 높은 신뢰도 결과 선택
const bestResult = results.sort((a, b) => b.confidence - a.confidence)[0];
```

### 3. 검색어 최적화

```typescript
// 검색어 정제 및 변환
function generateSearchQueries(gymName: string): string[] {
  const cleanName = gymName
    .replace(/[()（）]/g, "") // 괄호 제거
    .replace(/(주식회사|㈜|\(주\)|\(유\))/g, "") // 회사명 제거
    .replace(/\s+/g, " ") // 공백 정리
    .trim();

  return [
    `${cleanName} 헬스`,
    cleanName,
    `${cleanName.split(" ")[0]} 헬스`, // 첫 번째 단어만
    cleanName.replace("헬스", "피트니스"), // 동의어 변환
  ];
}
```

### 4. 좌표 역검색

```typescript
// 주소로 좌표 찾기
async function reverseGeocodeAddress(address: string) {
  const response = await axios.get(
    `https://dapi.kakao.com/v2/local/search/address.json`,
    {
      params: { query: address },
      headers: { Authorization: `KakaoAK ${API_KEY}` },
    }
  );

  return {
    latitude: parseFloat(response.data.documents[0].y),
    longitude: parseFloat(response.data.documents[0].x),
  };
}
```

## 📊 성능 최적화

### 1. API 호출 최적화

- **병렬 처리**: 여러 API 동시 호출
- **캐싱**: 중복 요청 방지
- **재시도 로직**: 일시적 오류 대응
- **요청 간격 조절**: API 제한 준수

### 2. 데이터 품질 향상

- **중복 제거**: 동일 정보 통합
- **데이터 검증**: 좌표 범위, 전화번호 형식 등
- **신뢰도 점수**: 소스별 신뢰도 평가
- **수동 검토**: 중요 데이터 수동 확인

### 3. 오류 처리

- **타임아웃 설정**: 응답 지연 대응
- **부분 실패 허용**: 일부 실패해도 계속 진행
- **로깅**: 상세한 오류 로그
- **복구 메커니즘**: 실패한 항목 재시도

## 🔧 구현 가이드

### 1. 환경 설정

```env
# .env 파일
KAKAO_REST_MAP_API_KEY=your_kakao_api_key
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
GOOGLE_PLACES_API_KEY=your_google_places_api_key
SEOUl_OPENAPI_KEY=your_seoul_openapi_key
```

### 2. 의존성 설치

```bash
npm install axios cheerio puppeteer
```

### 3. 사용 예시

```typescript
import { searchWithMultipleSources } from "./services/multiSourceCrawlerService";
import { searchWithAdvancedSources } from "./services/advancedCrawlerService";

// 기본 멀티소스 검색
const result1 = await searchWithMultipleSources("스포애니 강남점");

// 고급 멀티소스 검색
const result2 = await searchWithAdvancedSources("스포애니 강남점");
```

## 📈 성과 측정

### 1. 성공률 지표

- **전체 성공률**: 전체 헬스장 중 성공 비율
- **소스별 성공률**: 각 API/소스별 성공 비율
- **신뢰도 분포**: 결과의 신뢰도 점수 분포

### 2. 품질 지표

- **좌표 정확도**: 실제 위치와의 거리 차이
- **정보 완성도**: 필수 정보 누락 비율
- **데이터 일관성**: 중복 데이터 간 일치도

### 3. 성능 지표

- **처리 속도**: 헬스장당 평균 처리 시간
- **API 사용량**: 각 API의 호출 횟수
- **오류율**: API 호출 실패 비율

## 🚨 주의사항

### 1. 법적 고려사항

- **이용약관 준수**: 각 서비스의 이용약관 확인
- **개인정보 보호**: 개인정보 수집 금지
- **저작권 존중**: 콘텐츠 저작권 준수

### 2. 기술적 제한

- **API 제한**: 각 API의 호출 제한 준수
- **속도 제한**: 과도한 요청 방지
- **구조 변경**: 웹사이트 구조 변경 대응

### 3. 데이터 품질

- **정확성 검증**: 수집된 데이터의 정확성 확인
- **최신성 유지**: 정기적인 데이터 업데이트
- **중복 제거**: 동일 정보의 중복 방지

## 🔮 향후 개선 방향

### 1. AI/ML 활용

- **자연어 처리**: 헬스장명 정규화
- **이미지 인식**: 로고/사진 기반 매칭
- **추천 시스템**: 유사 헬스장 추천

### 2. 실시간 업데이트

- **웹훅**: 실시간 정보 업데이트
- **모니터링**: 변경사항 자동 감지
- **알림 시스템**: 중요 변경사항 알림

### 3. 확장성 개선

- **마이크로서비스**: 독립적인 크롤링 서비스
- **분산 처리**: 대용량 데이터 처리
- **클라우드 활용**: 확장 가능한 인프라

---

이 문서는 지속적으로 업데이트되며, 새로운 크롤링 방법이나 개선사항이 발견되면 추가됩니다.
