# 헬스장 기구 정보 시스템 개선 가이드

## 개요

기존 헬스장 데이터에 상세한 기구 정보를 추가하여 더 풍부한 데이터를 제공하는 시스템으로 개선했습니다.

## 추가된 기능

### 1. 기구 정보 데이터 구조

#### 유산소 기구
- **런닝머신**: 개수, 브랜드, 최신 모델 여부
- **자전거**: 실내 사이클, 스피닝 바이크 개수
- **스텝퍼**: 스텝머신, 클라이머 개수
- **로잉머신**: 개수, 브랜드
- **크로스 트레이너**: 일립티컬 머신 개수
- **스테어마스터**: 계단 오르기 기구
- **스키머신**: 스키 시뮬레이터

#### 웨이트 기구
- **덤벨**: 무게 범위 (5kg~50kg), 개수
- **바벨**: 올림픽 바, 스탠다드 바 개수
- **웨이트 머신**: 체스트 프레스, 레그 프레스 등
- **스미스 머신**: 개수, 브랜드
- **파워랙**: 스쿼트 랙, 벤치 프레스 랙
- **케이블**: 케이블 머신 개수
- **풀업 바**: 개수, 종류

### 2. 새로운 엔티티 및 서비스

#### Equipment 엔티티
```typescript
@Entity()
export class Equipment {
  @PrimaryGeneratedColumn()
  id!: number

  @ManyToOne(() => Gym, gym => gym.equipments)
  gym!: Gym

  @Column({ type: "enum", enum: EquipmentType })
  type!: EquipmentType // cardio | weight

  @Column({ type: "enum", enum: EquipmentCategory })
  category!: EquipmentCategory

  @Column({ type: "varchar", length: 100 })
  name!: string

  @Column({ type: "int", default: 0 })
  quantity!: number

  @Column({ type: "varchar", length: 100, nullable: true })
  brand!: string

  @Column({ type: "varchar", length: 200, nullable: true })
  model!: string

  @Column({ type: "boolean", default: false })
  isLatestModel!: boolean

  @Column({ type: "varchar", length: 50, nullable: true })
  weightRange!: string

  @Column({ type: "varchar", length: 100, nullable: true })
  equipmentVariant!: string

  @Column({ type: "text", nullable: true })
  additionalInfo!: string

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0.8 })
  confidence!: number

  @Column({ type: "varchar", length: 50, nullable: true })
  source!: string
}
```

#### EquipmentService
- 기구 정보 CRUD 작업
- 헬스장별 기구 요약 정보
- 기구 통계 정보
- 기구 정보 크롤링 및 저장

#### EquipmentCrawlerService
- 네이버 블로그에서 기구 정보 크롤링
- 인스타그램에서 기구 정보 수집
- 헬스장 공식 웹사이트 크롤링
- 데이터 정제 및 중복 제거

### 3. API 엔드포인트

#### 기구 정보 관리
```typescript
// 기구 목록 조회
GET /api/equipment?gymId=1&type=cardio&category=treadmill

// 기구 상세 정보
GET /api/equipment/:id

// 기구 정보 생성
POST /api/equipment
{
  "gymId": 1,
  "type": "cardio",
  "category": "treadmill",
  "name": "런닝머신",
  "quantity": 5,
  "brand": "테크노짐",
  "model": "Run Artis",
  "isLatestModel": true,
  "confidence": 0.9,
  "source": "manual"
}

// 기구 정보 업데이트
PUT /api/equipment/:id

// 기구 정보 삭제
DELETE /api/equipment/:id
```

#### 헬스장별 기구 요약
```typescript
// 헬스장 기구 요약 정보
GET /api/equipment/gym/:gymId/summary

// 응답 예시
{
  "success": true,
  "data": {
    "gymId": 1,
    "totalEquipment": 25,
    "cardioEquipment": {
      "total": 15,
      "byCategory": {
        "treadmill": 5,
        "bike": 4,
        "cross_trainer": 3,
        "rowing_machine": 2,
        "stepper": 1
      }
    },
    "weightEquipment": {
      "total": 10,
      "byCategory": {
        "dumbbell": 3,
        "barbell": 2,
        "weight_machine": 4,
        "cable": 1
      }
    },
    "equipmentDetails": [...]
  }
}
```

#### 기구 통계
```typescript
// 기구 통계 정보
GET /api/equipment/statistics

// 응답 예시
{
  "success": true,
  "data": {
    "totalGyms": 50,
    "totalEquipment": 1250,
    "averageEquipmentPerGym": 25,
    "mostCommonEquipment": [
      { "category": "treadmill", "count": 150 },
      { "category": "dumbbell", "count": 120 }
    ],
    "brandDistribution": [
      { "brand": "테크노짐", "count": 200 },
      { "brand": "프리코어", "count": 150 }
    ],
    "equipmentByType": [
      { "type": "cardio", "count": 750, "percentage": 60 },
      { "type": "weight", "count": 500, "percentage": 40 }
    ]
  }
}
```

### 4. 데이터 품질 관리

#### 기구 정보 검증
- 필수 필드 검증 (이름, 카테고리, 타입)
- 개수 및 신뢰도 범위 검증
- 카테고리와 타입 일치성 검증
- 무게 범위 형식 검증

#### 품질 점수 계산
- 완성도 (Completeness): 필드 완성도
- 정확성 (Accuracy): 데이터 정확성
- 일관성 (Consistency): 데이터 일관성
- 시의성 (Timeliness): 데이터 최신성
- 유효성 (Validity): 데이터 유효성

### 5. 크롤링 시스템

#### 자동 기구 정보 수집
```typescript
// 헬스장 기구 정보 크롤링
const equipmentData = await equipmentService.crawlAndSaveEquipment(
  gymId,
  gymName,
  gymAddress
)
```

#### 크롤링 소스
1. **네이버 블로그**: 헬스장 리뷰 및 시설 정보
2. **인스타그램**: 헬스장 사진 및 기구 정보
3. **공식 웹사이트**: 헬스장 공식 시설 안내

#### 데이터 정제
- 중복 제거
- 패턴 매칭을 통한 기구 정보 추출
- 브랜드 및 모델 정보 추출
- 신뢰도 점수 계산

## 사용 방법

### 1. 데이터베이스 마이그레이션
```bash
npm run migration:run
```

### 2. 기구 정보 추가
```typescript
import { EquipmentService } from './services/equipmentService'

const equipmentService = new EquipmentService(equipmentRepo, gymRepo)

// 기구 정보 생성
const equipment = await equipmentService.createEquipment({
  gymId: 1,
  type: EquipmentType.CARDIO,
  category: EquipmentCategory.TREADMILL,
  name: "런닝머신",
  quantity: 5,
  brand: "테크노짐",
  model: "Run Artis",
  isLatestModel: true,
  confidence: 0.9,
  source: "manual"
})
```

### 3. 헬스장 기구 정보 크롤링
```typescript
// 헬스장 기구 정보 자동 수집
const equipmentData = await equipmentService.crawlAndSaveEquipment(
  1, // gymId
  "강남 헬스장", // gymName
  "서울특별시 강남구 테헤란로 123" // gymAddress
)
```

### 4. 기구 정보 조회
```typescript
// 헬스장별 기구 요약
const summary = await equipmentService.getGymEquipmentSummary(1)

// 기구 통계
const statistics = await equipmentService.getEquipmentStatistics()
```

## 데이터 구조 예시

### 기존 헬스장 데이터
```json
{
  "id": 1,
  "name": "강남 헬스장",
  "address": "서울특별시 강남구 테헤란로 123",
  "phone": "02-1234-5678",
  "is24Hours": true,
  "hasParking": true,
  "hasShower": true,
  "hasPT": true,
  "hasGX": true,
  "hasGroupPT": false,
  "openHour": "06:00",
  "closeHour": "24:00",
  "price": "월 8만원",
  "rating": 4.3,
  "reviewCount": 50,
  "source": "naver_blog",
  "confidence": 0.7
}
```

### 개선된 헬스장 데이터 (기구 정보 포함)
```json
{
  "id": 1,
  "name": "강남 헬스장",
  "address": "서울특별시 강남구 테헤란로 123",
  "phone": "02-1234-5678",
  "is24Hours": true,
  "hasParking": true,
  "hasShower": true,
  "hasPT": true,
  "hasGX": true,
  "hasGroupPT": false,
  "openHour": "06:00",
  "closeHour": "24:00",
  "price": "월 8만원",
  "rating": 4.3,
  "reviewCount": 50,
  "source": "naver_blog",
  "confidence": 0.7,
  "equipment": [
    {
      "id": 1,
      "gymId": 1,
      "type": "cardio",
      "category": "treadmill",
      "name": "런닝머신",
      "quantity": 5,
      "brand": "테크노짐",
      "model": "Run Artis",
      "isLatestModel": true,
      "confidence": 0.9,
      "source": "crawled"
    },
    {
      "id": 2,
      "gymId": 1,
      "type": "weight",
      "category": "dumbbell",
      "name": "덤벨",
      "quantity": 3,
      "weightRange": "5kg~50kg",
      "confidence": 0.8,
      "source": "crawled"
    }
  ]
}
```

## 향후 개선 사항

1. **실시간 기구 상태 모니터링**: IoT 센서를 통한 기구 사용률 추적
2. **AI 기반 기구 추천**: 사용자 운동 목표에 따른 기구 추천
3. **기구 예약 시스템**: 특정 기구 사용 시간 예약
4. **기구 유지보수 관리**: 기구 상태 및 수리 이력 관리
5. **사용자 피드백 통합**: 기구별 사용자 평가 및 리뷰

## 결론

이번 개선을 통해 헬스장 데이터의 품질과 상세함이 크게 향상되었습니다. 사용자는 이제 각 헬스장의 구체적인 기구 정보를 확인할 수 있으며, 더 나은 헬스장 선택을 할 수 있게 되었습니다.
