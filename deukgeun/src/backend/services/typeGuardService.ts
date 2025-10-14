// 타입 가드 및 안전장치 서비스
// 데이터 처리 시 타입 안전성을 보장하는 서비스

// 기본 데이터 타입 인터페이스
interface BaseGymData {
  id?: string
  name: string
  type?: string
  address: string
  phone?: string
  latitude: number
  longitude: number
  is24Hours?: boolean
  hasParking?: boolean
  hasShower?: boolean
  hasPT?: boolean
  hasGX?: boolean
  hasGroupPT?: boolean
  openHour?: string
  closeHour?: string
  price?: string
  rating?: number
  reviewCount?: number
  source?: string
  confidence?: number
  additionalInfo?: Record<string, any>
}

// 공공 API 데이터 타입
interface PublicApiGymData extends BaseGymData {
  businessStatus?: string
  lastUpdated?: string
}

// 크롤링 데이터 타입
interface CrawlingGymData extends BaseGymData {
  additionalInfo: Record<string, any>
}

// 통합된 헬스장 데이터 타입
interface IntegratedGymData extends BaseGymData {
  facilities?: string
  dataQuality?: number
  lastUpdated?: Date
  createdAt?: Date
  updatedAt?: Date
}

// 타입 가드 결과 인터페이스
interface TypeGuardResult<T> {
  isValid: boolean
  data?: T
  errors: string[]
  warnings: string[]
}

// 데이터 검증 규칙 인터페이스
interface ValidationRule {
  field: string
  required: boolean
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  customValidator?: (value: any) => boolean
  errorMessage?: string
}

/**
 * 타입 가드 및 안전장치 서비스
 * 데이터 처리 시 타입 안전성과 데이터 품질을 보장하는 서비스
 */
export class TypeGuardService {
  private validationRules: ValidationRule[]

  constructor() {
    this.validationRules = this.initializeValidationRules()
  }

  /**
   * 검증 규칙 초기화
   */
  private initializeValidationRules(): ValidationRule[] {
    return [
      {
        field: 'id',
        required: false,
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: /^[A-Za-z0-9_-]+$/,
        errorMessage: 'ID는 영문, 숫자, 하이픈, 언더스코어만 허용됩니다'
      },
      {
        field: 'name',
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 200,
        pattern: /^[가-힣A-Za-z0-9\s\-_()]+$/,
        errorMessage: '헬스장 이름은 한글, 영문, 숫자, 공백, 하이픈, 언더스코어, 괄호만 허용됩니다'
      },
      {
        field: 'type',
        required: false,
        type: 'string',
        minLength: 1,
        maxLength: 50,
        pattern: /^[가-힣A-Za-z0-9\s]+$/,
        errorMessage: '타입은 한글, 영문, 숫자, 공백만 허용됩니다'
      },
      {
        field: 'address',
        required: true,
        type: 'string',
        minLength: 5,
        maxLength: 500,
        pattern: /^[가-힣A-Za-z0-9\s\-_.,()]+$/,
        errorMessage: '주소는 한글, 영문, 숫자, 공백, 하이픈, 언더스코어, 점, 쉼표, 괄호만 허용됩니다'
      },
      {
        field: 'phone',
        required: false,
        type: 'string',
        pattern: /^[\d\-\s()]+$/,
        customValidator: (value: string) => {
          if (!value) return true // 선택적 필드
          const cleanPhone = value.replace(/[^\d]/g, '')
          return cleanPhone.length >= 8 && cleanPhone.length <= 15
        },
        errorMessage: '전화번호는 8-15자리 숫자여야 합니다'
      },
      {
        field: 'latitude',
        required: true,
        type: 'number',
        min: 33.0,
        max: 38.0,
        customValidator: (value: number) => {
          return !isNaN(value) && value !== 0
        },
        errorMessage: '위도는 33.0-38.0 범위의 유효한 숫자여야 합니다'
      },
      {
        field: 'longitude',
        required: true,
        type: 'number',
        min: 124.0,
        max: 132.0,
        customValidator: (value: number) => {
          return !isNaN(value) && value !== 0
        },
        errorMessage: '경도는 124.0-132.0 범위의 유효한 숫자여야 합니다'
      },
      {
        field: 'is24Hours',
        required: false,
        type: 'boolean'
      },
      {
        field: 'hasParking',
        required: false,
        type: 'boolean'
      },
      {
        field: 'hasShower',
        required: false,
        type: 'boolean'
      },
      {
        field: 'hasPT',
        required: false,
        type: 'boolean'
      },
      {
        field: 'hasGX',
        required: false,
        type: 'boolean'
      },
      {
        field: 'hasGroupPT',
        required: false,
        type: 'boolean'
      },
      {
        field: 'openHour',
        required: false,
        type: 'string',
        pattern: /^(\d{1,2}:\d{2}|24시간)$/,
        errorMessage: '운영시간은 HH:MM 형식이거나 "24시간"이어야 합니다'
      },
      {
        field: 'closeHour',
        required: false,
        type: 'string',
        pattern: /^(\d{1,2}:\d{2}|24시간)$/,
        errorMessage: '마감시간은 HH:MM 형식이거나 "24시간"이어야 합니다'
      },
      {
        field: 'price',
        required: false,
        type: 'string',
        maxLength: 100,
        pattern: /^[\d,원만천\s]+$/,
        errorMessage: '가격은 숫자, 쉼표, 원, 만, 천, 공백만 허용됩니다'
      },
      {
        field: 'rating',
        required: false,
        type: 'number',
        min: 0,
        max: 5,
        customValidator: (value: number) => {
          return !isNaN(value) && value >= 0 && value <= 5
        },
        errorMessage: '평점은 0-5 범위의 숫자여야 합니다'
      },
      {
        field: 'reviewCount',
        required: false,
        type: 'number',
        min: 0,
        customValidator: (value: number) => {
          return !isNaN(value) && value >= 0 && Number.isInteger(value)
        },
        errorMessage: '리뷰 수는 0 이상의 정수여야 합니다'
      },
      {
        field: 'source',
        required: false,
        type: 'string',
        maxLength: 100,
        pattern: /^[A-Za-z0-9_-]+$/,
        errorMessage: '소스는 영문, 숫자, 하이픈, 언더스코어만 허용됩니다'
      },
      {
        field: 'confidence',
        required: false,
        type: 'number',
        min: 0,
        max: 1,
        customValidator: (value: number) => {
          return !isNaN(value) && value >= 0 && value <= 1
        },
        errorMessage: '신뢰도는 0-1 범위의 숫자여야 합니다'
      },
      {
        field: 'additionalInfo',
        required: false,
        type: 'object',
        customValidator: (value: any) => {
          return value === null || typeof value === 'object'
        },
        errorMessage: '추가 정보는 객체이거나 null이어야 합니다'
      }
    ]
  }

  /**
   * 공공 API 데이터 타입 가드
   */
  validatePublicApiData(data: any): TypeGuardResult<PublicApiGymData> {
    const result: TypeGuardResult<PublicApiGymData> = {
      isValid: true,
      errors: [],
      warnings: []
    }

    try {
      // 기본 데이터 검증
      const baseValidation = this.validateBaseData(data)
      result.errors.push(...baseValidation.errors)
      result.warnings.push(...baseValidation.warnings)

      // 공공 API 특화 검증
      if (data.businessStatus && typeof data.businessStatus !== 'string') {
        result.errors.push('businessStatus는 문자열이어야 합니다')
      }

      if (data.lastUpdated && !this.isValidDateString(data.lastUpdated)) {
        result.errors.push('lastUpdated는 유효한 날짜 문자열이어야 합니다')
      }

      // 데이터 정리 및 변환
      if (result.errors.length === 0) {
        result.data = this.cleanPublicApiData(data)
      } else {
        result.isValid = false
      }

    } catch (error) {
      result.isValid = false
      result.errors.push(`데이터 검증 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }

    return result
  }

  /**
   * 크롤링 데이터 타입 가드
   */
  validateCrawlingData(data: any): TypeGuardResult<CrawlingGymData> {
    const result: TypeGuardResult<CrawlingGymData> = {
      isValid: true,
      errors: [],
      warnings: []
    }

    try {
      // 기본 데이터 검증
      const baseValidation = this.validateBaseData(data)
      result.errors.push(...baseValidation.errors)
      result.warnings.push(...baseValidation.warnings)

      // 크롤링 데이터 특화 검증
      if (!data.additionalInfo || typeof data.additionalInfo !== 'object') {
        result.warnings.push('additionalInfo가 없거나 객체가 아닙니다')
      }

      // 데이터 정리 및 변환
      if (result.errors.length === 0) {
        result.data = this.cleanCrawlingData(data)
      } else {
        result.isValid = false
      }

    } catch (error) {
      result.isValid = false
      result.errors.push(`데이터 검증 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }

    return result
  }

  /**
   * 통합 데이터 타입 가드
   */
  validateIntegratedData(data: any): TypeGuardResult<IntegratedGymData> {
    const result: TypeGuardResult<IntegratedGymData> = {
      isValid: true,
      errors: [],
      warnings: []
    }

    try {
      // 기본 데이터 검증
      const baseValidation = this.validateBaseData(data)
      result.errors.push(...baseValidation.errors)
      result.warnings.push(...baseValidation.warnings)

      // 통합 데이터 특화 검증
      if (data.facilities && typeof data.facilities !== 'string') {
        result.errors.push('facilities는 문자열이어야 합니다')
      }

      if (data.dataQuality !== undefined && (typeof data.dataQuality !== 'number' || data.dataQuality < 0 || data.dataQuality > 1)) {
        result.errors.push('dataQuality는 0-1 범위의 숫자여야 합니다')
      }

      if (data.lastUpdated && !(data.lastUpdated instanceof Date)) {
        result.errors.push('lastUpdated는 Date 객체여야 합니다')
      }

      // 데이터 정리 및 변환
      if (result.errors.length === 0) {
        result.data = this.cleanIntegratedData(data)
      } else {
        result.isValid = false
      }

    } catch (error) {
      result.isValid = false
      result.errors.push(`데이터 검증 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    }

    return result
  }

  /**
   * 기본 데이터 검증
   */
  private validateBaseData(data: any): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    if (!data || typeof data !== 'object') {
      errors.push('데이터는 객체여야 합니다')
      return { errors, warnings }
    }

    // 각 필드에 대해 검증 규칙 적용
    this.validationRules.forEach(rule => {
      const value = data[rule.field]
      const fieldErrors = this.validateField(value, rule)
      errors.push(...fieldErrors)
    })

    // 추가 검증 로직
    this.performAdditionalValidations(data, errors, warnings)

    return { errors, warnings }
  }

  /**
   * 개별 필드 검증
   */
  private validateField(value: any, rule: ValidationRule): string[] {
    const errors: string[] = []

    // 필수 필드 검증
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.field}는 필수 필드입니다`)
      return errors
    }

    // 값이 없는 경우 (선택적 필드)
    if (value === undefined || value === null || value === '') {
      return errors
    }

    // 타입 검증
    if (!this.isValidType(value, rule.type)) {
      errors.push(`${rule.field}는 ${rule.type} 타입이어야 합니다`)
      return errors
    }

    // 문자열 길이 검증
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${rule.field}는 최소 ${rule.minLength}자 이상이어야 합니다`)
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${rule.field}는 최대 ${rule.maxLength}자 이하여야 합니다`)
      }
    }

    // 숫자 범위 검증
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${rule.field}는 최소 ${rule.min} 이상이어야 합니다`)
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${rule.field}는 최대 ${rule.max} 이하여야 합니다`)
      }
    }

    // 패턴 검증
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors.push(rule.errorMessage || `${rule.field} 형식이 올바르지 않습니다`)
    }

    // 커스텀 검증
    if (rule.customValidator && !rule.customValidator(value)) {
      errors.push(rule.errorMessage || `${rule.field} 값이 유효하지 않습니다`)
    }

    return errors
  }

  /**
   * 타입 검증
   */
  private isValidType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'object':
        return typeof value === 'object' && value !== null
      case 'array':
        return Array.isArray(value)
      default:
        return true
    }
  }

  /**
   * 추가 검증 로직
   */
  private performAdditionalValidations(data: any, errors: string[], warnings: string[]): void {
    // 좌표 유효성 검증
    if (data.latitude && data.longitude) {
      if (data.latitude === 0 && data.longitude === 0) {
        warnings.push('좌표가 (0, 0)으로 설정되어 있습니다')
      }
    }

    // 운영시간 일관성 검증
    if (data.openHour && data.closeHour && data.is24Hours) {
      warnings.push('24시간 운영인데 운영시간이 설정되어 있습니다')
    }

    // 평점과 리뷰 수 일관성 검증
    if (data.rating && data.rating > 0 && data.reviewCount === 0) {
      warnings.push('평점이 있는데 리뷰 수가 0입니다')
    }

    // 전화번호 형식 검증
    if (data.phone && !this.isValidPhoneNumber(data.phone)) {
      warnings.push('전화번호 형식이 표준이 아닙니다')
    }

    // 주소 형식 검증
    if (data.address && !this.isValidAddress(data.address)) {
      warnings.push('주소 형식이 표준이 아닙니다')
    }
  }

  /**
   * 공공 API 데이터 정리
   */
  private cleanPublicApiData(data: any): PublicApiGymData {
    return {
      id: this.cleanString(data.id) || '',
      name: this.cleanString(data.name) || '',
      type: this.cleanString(data.type) || '짐',
      address: this.cleanString(data.address) || '',
      phone: this.cleanPhone(data.phone) || '',
      latitude: this.cleanNumber(data.latitude) || 0,
      longitude: this.cleanNumber(data.longitude) || 0,
      is24Hours: Boolean(data.is24Hours),
      hasParking: Boolean(data.hasParking),
      hasShower: Boolean(data.hasShower),
      hasPT: Boolean(data.hasPT),
      hasGX: Boolean(data.hasGX),
      hasGroupPT: Boolean(data.hasGroupPT),
      openHour: this.cleanString(data.openHour),
      closeHour: this.cleanString(data.closeHour),
      price: this.cleanString(data.price),
      rating: this.cleanNumber(data.rating),
      reviewCount: this.cleanNumber(data.reviewCount),
      source: this.cleanString(data.source) || 'public_api',
      confidence: this.cleanNumber(data.confidence) || 0.9,
      businessStatus: this.cleanString(data.businessStatus),
      lastUpdated: this.cleanString(data.lastUpdated),
      additionalInfo: this.cleanObject(data.additionalInfo)
    }
  }

  /**
   * 크롤링 데이터 정리
   */
  private cleanCrawlingData(data: any): CrawlingGymData {
    return {
      id: this.cleanString(data.id) || '',
      name: this.cleanString(data.name) || '',
      type: this.cleanString(data.type) || '짐',
      address: this.cleanString(data.address) || '',
      phone: this.cleanPhone(data.phone) || '',
      latitude: this.cleanNumber(data.latitude) || 0,
      longitude: this.cleanNumber(data.longitude) || 0,
      is24Hours: Boolean(data.is24Hours),
      hasParking: Boolean(data.hasParking),
      hasShower: Boolean(data.hasShower),
      hasPT: Boolean(data.hasPT),
      hasGX: Boolean(data.hasGX),
      hasGroupPT: Boolean(data.hasGroupPT),
      openHour: this.cleanString(data.openHour),
      closeHour: this.cleanString(data.closeHour),
      price: this.cleanString(data.price),
      rating: this.cleanNumber(data.rating),
      reviewCount: this.cleanNumber(data.reviewCount),
      source: this.cleanString(data.source) || 'crawling',
      confidence: this.cleanNumber(data.confidence) || 0.7,
      additionalInfo: this.cleanObject(data.additionalInfo) || {}
    }
  }

  /**
   * 통합 데이터 정리
   */
  private cleanIntegratedData(data: any): IntegratedGymData {
    return {
      id: this.cleanString(data.id) || '',
      name: this.cleanString(data.name) || '',
      type: this.cleanString(data.type) || '짐',
      address: this.cleanString(data.address) || '',
      phone: this.cleanPhone(data.phone) || '',
      latitude: this.cleanNumber(data.latitude) || 0,
      longitude: this.cleanNumber(data.longitude) || 0,
      is24Hours: Boolean(data.is24Hours),
      hasParking: Boolean(data.hasParking),
      hasShower: Boolean(data.hasShower),
      hasPT: Boolean(data.hasPT),
      hasGX: Boolean(data.hasGX),
      hasGroupPT: Boolean(data.hasGroupPT),
      openHour: this.cleanString(data.openHour),
      closeHour: this.cleanString(data.closeHour),
      price: this.cleanString(data.price),
      rating: this.cleanNumber(data.rating),
      reviewCount: this.cleanNumber(data.reviewCount),
      source: this.cleanString(data.source) || 'integrated',
      confidence: this.cleanNumber(data.confidence) || 0.8,
      facilities: this.cleanString(data.facilities),
      dataQuality: this.cleanNumber(data.dataQuality),
      lastUpdated: data.lastUpdated instanceof Date ? data.lastUpdated : new Date(),
      createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(),
      updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(),
      additionalInfo: this.cleanObject(data.additionalInfo)
    }
  }

  /**
   * 문자열 정리
   */
  private cleanString(value: any): string | undefined {
    if (value === null || value === undefined) return undefined
    const cleaned = String(value).trim()
    return cleaned === '' ? undefined : cleaned
  }

  /**
   * 숫자 정리
   */
  private cleanNumber(value: any): number | undefined {
    if (value === null || value === undefined) return undefined
    const num = Number(value)
    return isNaN(num) ? undefined : num
  }

  /**
   * 전화번호 정리
   */
  private cleanPhone(value: any): string | undefined {
    if (!value) return undefined
    const cleaned = String(value).replace(/[^\d-]/g, '')
    return cleaned === '' ? undefined : cleaned
  }

  /**
   * 객체 정리
   */
  private cleanObject(value: any): Record<string, any> | undefined {
    if (value === null || value === undefined) return undefined
    if (typeof value !== 'object') return undefined
    return value
  }

  /**
   * 유효한 날짜 문자열 검증
   */
  private isValidDateString(value: string): boolean {
    const date = new Date(value)
    return !isNaN(date.getTime())
  }

  /**
   * 유효한 전화번호 검증
   */
  private isValidPhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/[^\d]/g, '')
    return cleanPhone.length >= 8 && cleanPhone.length <= 15
  }

  /**
   * 유효한 주소 검증
   */
  private isValidAddress(address: string): boolean {
    return address.length >= 5 && /서울/.test(address)
  }

  /**
   * 배열 데이터 일괄 검증
   */
  validateDataArray<T>(dataArray: any[], validator: (data: any) => TypeGuardResult<T>): {
    validData: T[]
    invalidData: { data: any; errors: string[] }[]
    totalCount: number
    validCount: number
    invalidCount: number
  } {
    const validData: T[] = []
    const invalidData: { data: any; errors: string[] }[] = []

    dataArray.forEach((data, index) => {
      const result = validator(data)
      
      if (result.isValid && result.data) {
        validData.push(result.data)
      } else {
        invalidData.push({
          data,
          errors: result.errors
        })
      }
    })

    return {
      validData,
      invalidData,
      totalCount: dataArray.length,
      validCount: validData.length,
      invalidCount: invalidData.length
    }
  }

  /**
   * 검증 규칙 업데이트
   */
  updateValidationRule(field: string, rule: Partial<ValidationRule>): boolean {
    const ruleIndex = this.validationRules.findIndex(r => r.field === field)
    
    if (ruleIndex === -1) {
      return false
    }

    this.validationRules[ruleIndex] = { ...this.validationRules[ruleIndex], ...rule }
    return true
  }

  /**
   * 검증 규칙 조회
   */
  getValidationRules(): ValidationRule[] {
    return [...this.validationRules]
  }
}
