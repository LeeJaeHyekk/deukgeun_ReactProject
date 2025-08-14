// ============================================================================
// 공유 유틸리티 함수들
// ============================================================================

// 날짜 관련 유틸리티
export * from "./date"

// 문자열 관련 유틸리티
export * from "./string"

// 배열 관련 유틸리티 (중복 함수들은 명시적으로 export)
export {
  isEmpty as arrayIsEmpty,
  removeDuplicates as arrayRemoveDuplicates,
  reverse as arrayReverse,
  every as arrayEvery,
  filter as arrayFilter,
  find as arrayFind,
  findAll as arrayFindAll,
  flatten as arrayFlatten,
  forEach as arrayForEach,
  has as arrayHas,
  reduce as arrayReduce,
  some as arraySome,
  toMap as arrayToMap,
} from "./array"

// 객체 관련 유틸리티 (중복 함수들은 명시적으로 export)
export {
  every as objectEvery,
  filter as objectFilter,
  find as objectFind,
  findAll as objectFindAll,
  flatten as objectFlatten,
  forEach as objectForEach,
  has as objectHas,
  reduce as objectReduce,
  some as objectSome,
  toMap as objectToMap,
} from "./object"

// 검증 관련 유틸리티 (중복 함수들은 명시적으로 export)
export {
  isValidDate as validationIsValidDate,
  validateString as validationValidateString,
} from "./validation"

// 스토리지 관련 유틸리티
export * from "./storage"

// 환경 변수 관련 유틸리티
export * from "./env"
