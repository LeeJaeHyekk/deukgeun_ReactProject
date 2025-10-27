# 이미지 메타데이터 구현 가이드

## 🎯 추가된 이미지 정보 필드들

### 1. ImageMetadata (기본 메타데이터)
```typescript
interface ImageMetadata {
  fileName: string          // "bench-press.png"
  fileSize: number          // 1568335 (bytes)
  dimensions: {             // { width: 800, height: 600 }
    width: number
    height: number
  }
  format: string            // "PNG"
  lastModified: Date        // 파일 수정일
  checksum?: string         // 파일 무결성 검증용 해시
}
```

### 2. ImageClassification (이미지 분류)
```typescript
interface ImageClassification {
  type: 'equipment' | 'exercise' | 'instruction' | 'diagram'
  angle: 'front' | 'side' | 'back' | 'top' | 'diagonal'
  lighting: 'natural' | 'studio' | 'gym'
  background: 'transparent' | 'white' | 'gym' | 'outdoor'
}
```

### 3. ImageUsage (사용 정보)
```typescript
interface ImageUsage {
  isThumbnail: boolean      // 썸네일용 이미지인지
  isMainImage: boolean     // 메인 이미지인지
  displayOrder: number      // 표시 순서
  altText: string          // 접근성을 위한 대체 텍스트
}
```

## 🚀 사용 방법

### 1. 이미지 메타데이터 생성
```typescript
import { generateCompleteImageMetadata } from '../utils/imageMetadataUtils'

// 이미지 메타데이터 생성
const imageMetadata = await generateCompleteImageMetadata(
  '/img/machine/bench-press.png',
  'bench-press.png',
  'strength',
  true // 메인 이미지
)
```

### 2. MachineCard에서 활용
```typescript
// MachineCard.tsx에서 이미지 정보 표시
{machine.imageMetadata && (
  <>
    <span className="meta-item">
      <span className="meta-icon">📏</span>
      {machine.imageMetadata.dimensions.width}x{machine.imageMetadata.dimensions.height}
    </span>
    <span className="meta-item">
      <span className="meta-icon">💾</span>
      {(machine.imageMetadata.fileSize / 1024).toFixed(0)}KB
    </span>
  </>
)}
```

### 3. 이미지 품질 정보 활용
```typescript
// 고해상도 이미지 표시
{machine.imageMetadata && machine.imageMetadata.dimensions.width > 1920 && (
  <span className="meta-item">
    <span className="meta-icon">🖼️</span>
    고해상도
  </span>
)}

// 이미지 형식 표시
{machine.imageClassification && (
  <span className="meta-item">
    <span className="meta-icon">🎨</span>
    {machine.imageClassification.type === 'equipment' ? '기구' : '운동법'}
  </span>
)}
```

## 📊 실제 사용 예시

### 현재 MachineCard 푸터에 표시되는 정보:
1. **🎥 동영상 유무** - 동영상 있음/없음
2. **📋 사용법 단계 수** - N단계
3. **✅/❌ 활성 상태** - 사용 가능/점검 중
4. **💪 타겟 근육 수** - N개 근육
5. **📏 이미지 크기** - 800x600 (새로 추가)
6. **💾 파일 크기** - 1532KB (새로 추가)

### 추가로 활용 가능한 정보:
- **🖼️ 이미지 품질** - 고해상도/일반
- **🎨 이미지 타입** - 기구/운동법/설명도
- **📐 이미지 각도** - 정면/측면/후면
- **💡 조명** - 자연광/스튜디오/헬스장
- **🖼️ 배경** - 투명/흰색/헬스장/야외

## 🔧 백엔드 구현 필요사항

### 1. 데이터베이스 스키마 업데이트
```sql
-- machines 테이블에 이미지 메타데이터 컬럼 추가
ALTER TABLE machines ADD COLUMN image_metadata JSON;
ALTER TABLE machines ADD COLUMN image_classification JSON;
ALTER TABLE machines ADD COLUMN image_usage JSON;
```

### 2. API 엔드포인트 업데이트
```typescript
// machineController.ts에서 이미지 메타데이터 처리
export const createMachine = async (req: Request, res: Response) => {
  const { imageMetadata, imageClassification, imageUsage } = req.body
  
  // 이미지 메타데이터 저장
  const machine = await Machine.create({
    ...req.body,
    imageMetadata: JSON.stringify(imageMetadata),
    imageClassification: JSON.stringify(imageClassification),
    imageUsage: JSON.stringify(imageUsage)
  })
}
```

### 3. 이미지 업로드 시 메타데이터 자동 생성
```typescript
// 이미지 업로드 시 메타데이터 자동 생성
export const uploadMachineImage = async (req: Request, res: Response) => {
  const { file } = req
  const imageUrl = `/uploads/machines/${file.filename}`
  
  // 메타데이터 생성
  const metadata = await generateCompleteImageMetadata(
    imageUrl,
    file.filename,
    req.body.category,
    true
  )
  
  res.json({
    success: true,
    data: {
      imageUrl,
      ...metadata
    }
  })
}
```

## 🎨 UI/UX 개선 방안

### 1. 이미지 품질 표시
- 고해상도 이미지에 특별한 배지 표시
- 로딩 시간 예측 (파일 크기 기반)

### 2. 이미지 분류 필터링
- 이미지 타입별 필터 (기구/운동법/설명도)
- 각도별 필터 (정면/측면/후면)

### 3. 접근성 향상
- altText를 활용한 스크린 리더 지원
- 이미지 설명 자동 생성

### 4. 성능 최적화
- 썸네일 이미지 자동 생성
- 반응형 이미지 로딩
- 이미지 캐싱 전략

## 📈 확장 가능성

### 1. AI 기반 이미지 분석
- 자동 태그 생성
- 이미지 품질 평가
- 콘텐츠 기반 분류

### 2. 사용자 피드백 통합
- 이미지 품질 평가
- 사용자 선호도 학습
- 개인화된 이미지 추천

### 3. 분석 및 리포팅
- 이미지 사용 통계
- 성능 최적화 제안
- 콘텐츠 품질 분석
