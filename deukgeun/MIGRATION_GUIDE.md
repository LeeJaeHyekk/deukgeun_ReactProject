# 🚀 Mix.json 구조 마이그레이션 가이드

## 📋 개요

이 가이드는 기존 프로젝트를 새로운 `mix.json` 기반 구조로 점진적으로 마이그레이션하는 방법을 설명합니다.

## 🎯 마이그레이션 목표

- ✅ **타입 안전성 강화**: 자동 생성된 DTO와 타입
- ✅ **Validation 통합**: 중앙화된 validation 규칙
- ✅ **코드 중복 제거**: 자동 생성된 transformer
- ✅ **일관성 확보**: 통일된 네이밍과 구조
- ✅ **보안 강화**: 민감한 필드 자동 제외

## 📅 마이그레이션 단계 (Updated)

### Phase 1: 타입 통합 및 중복 제거 (1-2일)

#### 1.1 절대 경로 설정 완료 ✅

```json
// tsconfig.json에 추가된 경로들
"@dto/*": ["shared/types/dto/*"],
"@entities-backend/*": ["backend/entities/*"],
"@transformers/*": ["backend/transformers/*"],
"@services/*": ["backend/services/*"],
"@controllers/*": ["backend/controllers/*"]
```

#### 1.2 DTO 통합 인덱스 생성 완료 ✅

```typescript
// src/shared/types/dto/index.ts
export * from "./machine.dto"
export * from "./user.dto"
// ... 모든 DTO export

// 타입 별칭으로 기존 코드 호환성 유지
export type Machine = import("./machine.dto").MachineDTO
export type CreateMachineRequest = import("./machine.dto").CreateMachineDTO
```

#### 1.3 Transformer 통합 인덱스 생성 완료 ✅

```typescript
// src/backend/transformers/index.ts
export { MachineTransformer } from "./machine.transformer"
// ... 모든 Transformer export

// 편의 함수들
export const toMachineDTO = MachineTransformer.toDTO
export const toMachineEntity = MachineTransformer.toEntity
export const toMachineDTOList = MachineTransformer.toDTOList
```

### Phase 2: Controller DTO 적용 (2-3일)

#### 2.1 Machine Controller DTO 적용 완료 ✅

**Before (기존 방식):**

```typescript
export const createMachine = async (req: Request, res: Response) => {
  const savedMachine = await getMachineService().createMachine(machineData)
  res.status(201).json({
    message: "Machine created successfully",
    data: savedMachine, // 엔티티 직접 반환
  })
}
```

**After (새로운 방식):**

```typescript
import { toMachineDTO, toMachineDTOList } from "@transformers/index"
import type { CreateMachineRequest } from "@dto/index"

export const createMachine = async (req: Request, res: Response) => {
  const savedMachine = await getMachineService().createMachine(machineData)

  // DTO 변환 적용
  const machineDTO = toMachineDTO(savedMachine)

  res.status(201).json({
    message: "Machine created successfully",
    data: machineDTO, // DTO 반환
  })
}
```

#### 2.2 나머지 Controller 적용 필요

- [ ] User Controller
- [ ] Post Controller
- [ ] Comment Controller
- [ ] Gym Controller
- [ ] WorkoutSession Controller

### Phase 3: Frontend DTO 참조 적용 (2-3일)

#### 3.1 Machine API 클라이언트 DTO 적용 완료 ✅

**Before:**

```typescript
import type { Machine } from "@shared/types"
```

**After:**

```typescript
import type {
  Machine,
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineListResponse as DTOMachineListResponse,
  MachineResponse as DTOMachineResponse,
} from "@dto/index"
```

#### 3.2 나머지 Frontend 컴포넌트 적용 필요

- [ ] Machine Guide 컴포넌트들
- [ ] Workout 관련 컴포넌트들
- [ ] Community 관련 컴포넌트들
- [ ] User 관련 컴포넌트들

### Phase 4: 중복 타입 파일 정리 (1-2일)

#### 4.1 제거할 파일들

```
src/types/machine.ts          # → @dto/index로 통합
src/types/user.ts             # → @dto/index로 통합
src/types/post.ts             # → @dto/index로 통합
src/shared/types/machine.ts   # → @dto/index로 통합
src/shared/types/user.ts      # → @dto/index로 통합
```

#### 4.2 Import 경로 정리

**Before:**

```typescript
import type { Machine } from "../../../types"
import type { Machine } from "../../../shared/types"
import { Machine } from "../entities/Machine"
```

**After:**

```typescript
import type { Machine } from "@dto/index"
import { Machine } from "@entities-backend/Machine"
```

### Phase 5: Validation 시스템 통합 (2-3일)

#### 5.1 Mix Validation 적용

```typescript
// src/backend/routes/machine.ts
import {
  validateMachine,
  validateMachineUpdate,
} from "../middlewares/mixValidation"

router.post("/", validateMachine, createMachine)
router.put("/:id", validateMachineUpdate, updateMachine)
```

### Phase 6: 테스트 업데이트 (2-3일)

#### 6.1 테스트 데이터 업데이트

```typescript
// src/test/shared/mocks/machineMock.ts
import { CreateMachineDTO } from "@dto/index"

export const createMockMachine = (
  overrides: Partial<CreateMachineDTO> = {}
): CreateMachineDTO => ({
  machineKey: "test-machine",
  name: "Test Machine",
  imageUrl: "https://example.com/image.jpg",
  shortDesc: "Test description",
  detailDesc: "Detailed test description",
  category: "strength",
  difficulty: "beginner",
  ...overrides,
})
```

## 🔧 마이그레이션 도구

### 1. 코드 생성기

```bash
# 수동 실행
npm run generate:code

# 파일 변경 감지 자동 실행
npm run generate:watch
```

### 2. Validation 검사기

```bash
# mix.json 설정 검증
npm run validate:mix
```

### 3. 전체 설정

```bash
# 검증 + 코드 생성
npm run mix:setup
```

## 📊 마이그레이션 체크리스트

### ✅ Phase 1: 타입 통합 및 중복 제거

- [x] 절대 경로 설정 완료
- [x] DTO 통합 인덱스 생성 완료
- [x] Transformer 통합 인덱스 생성 완료
- [ ] 중복 타입 파일 제거
- [ ] Import 경로 정리

### ✅ Phase 2: Controller DTO 적용

- [x] Machine Controller 업데이트
- [ ] User Controller 업데이트
- [ ] Post Controller 업데이트
- [ ] Gym Controller 업데이트
- [ ] Comment Controller 업데이트

### ✅ Phase 3: Frontend DTO 참조 적용

- [x] Machine API 클라이언트 업데이트
- [ ] Machine Guide 컴포넌트 업데이트
- [ ] Workout 컴포넌트 업데이트
- [ ] Community 컴포넌트 업데이트

### ⏳ Phase 4: 중복 타입 파일 정리

- [ ] src/types/ 디렉토리 정리
- [ ] src/shared/types/ 중복 제거
- [ ] Import 경로 표준화

### ⏳ Phase 5: Validation 시스템 통합

- [ ] Mix Validation 적용
- [ ] 기존 validation 제거

### ⏳ Phase 6: 테스트 업데이트

- [ ] Unit 테스트 업데이트
- [ ] Integration 테스트 업데이트
- [ ] E2E 테스트 업데이트

### ⏳ Phase 7: 자동화 적용

- [ ] Mix 시스템 완전 적용
- [ ] 자동 생성 코드 검증

## 🚨 주의사항

### 1. 점진적 마이그레이션

- 한 번에 모든 것을 변경하지 마세요
- Entity별로 순차적으로 진행하세요
- 각 단계마다 테스트를 실행하세요

### 2. 기존 코드 호환성

- 기존 API는 그대로 유지하세요
- 새로운 validation은 선택적으로 적용하세요
- 점진적으로 기존 코드를 교체하세요

### 3. 데이터베이스 스키마

- 기존 데이터베이스 스키마는 변경하지 마세요
- 새로운 필드는 선택적으로 추가하세요

## 🎉 마이그레이션 완료 후

### 얻을 수 있는 이점

- ✅ **타입 안전성**: 컴파일 타임 에러 감소
- ✅ **개발 속도**: 자동 생성으로 개발 시간 단축
- ✅ **일관성**: 통일된 코드 스타일
- ✅ **유지보수성**: 중앙화된 설정 관리
- ✅ **보안**: 민감한 필드 자동 제외

### 다음 단계

- [ ] 새로운 Entity 추가 시 mix.json 업데이트
- [ ] Validation 규칙 추가 시 mix.json 업데이트
- [ ] API 문서 자동 생성 도구 추가
- [ ] 성능 모니터링 도구 추가

## 📞 문제 해결

### 자주 발생하는 문제

#### 1. 코드 생성 실패

```bash
# mix.json 문법 오류 확인
npm run validate:mix

# TypeScript 컴파일 오류 확인
npm run type-check
```

#### 2. Validation 오류

```bash
# Validation schema 재생성
npm run generate:code

# 브라우저 캐시 클리어
npm run dev -- --force
```

#### 3. 타입 오류

```bash
# 생성된 타입 파일 확인
ls src/shared/types/dto/

# Import 경로 확인
npm run type-check
```

## 📚 추가 리소스

- [Zod Documentation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Middleware](https://expressjs.com/en/guide/using-middleware.html)
