// ============================================================================
// 공유 유틸리티 함수들
// ============================================================================

// 날짜 관련 유틸리티
export * from "./date"

// 문자열 관련 유틸리티
export * from "./string"

// 배열 관련 유틸리티 (중복 함수들은 명시적으로 export)
module.exports.arrayIsEmpty = isEmpty
module.exports.arrayRemoveDuplicates = removeDuplicates
module.exports.arrayReverse = reverse
module.exports.arrayEvery = every
module.exports.arrayFilter = filter
module.exports.arrayFind = find
module.exports.arrayFindAll = findAll
module.exports.arrayFlatten = flatten
module.exports.arrayForEach = forEach
module.exports.arrayHas = has
module.exports.arrayReduce = reduce
module.exports.arraySome = some
module.exports.arrayToMap = toMap
module.exports. =  from "./array"

// 객체 관련 유틸리티 (중복 함수들은 명시적으로 export)
module.exports.objectEvery = every
module.exports.objectFilter = filter
module.exports.objectFind = find
module.exports.objectFindAll = findAll
module.exports.objectFlatten = flatten
module.exports.objectForEach = forEach
module.exports.objectHas = has
module.exports.objectReduce = reduce
module.exports.objectSome = some
module.exports.objectToMap = toMap
module.exports. =  from "./object"

// 검증 관련 유틸리티 (중복 함수들은 명시적으로 export)
module.exports.validationIsValidDate = isValidDate
module.exports.validationValidateString = validateString
module.exports. =  from "./validation"

// 스토리지 관련 유틸리티
export * from "./storage"

// 환경 변수 관련 유틸리티
export * from "./env"
