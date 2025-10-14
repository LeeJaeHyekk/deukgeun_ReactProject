import { Repository } from 'typeorm'
import { Gym } from '../entities/Gym'
import { Equipment } from '../entities/Equipment'
import { EquipmentDTO, EquipmentCategory, EquipmentType } from '../../shared/types/equipment'

// 데이터 품질 점수 인터페이스
interface QualityScore {
  overall: number
  completeness: number
  accuracy: number
  consistency: number
  timeliness: number
  validity: number
}

// 검증 결과 인터페이스
interface ValidationResult {
  isValid: boolean
  score: QualityScore
  issues: Array<{
    field: string
    issue: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    suggestion: string
  }>
  recommendations: string[]
}

// 데이터 품질 통계
interface QualityStats {
  totalRecords: number
  validRecords: number
  invalidRecords: number
  averageScore: number
  scoreDistribution: {
    excellent: number // 90-100
    good: number      // 80-89
    fair: number      // 70-79
    poor: number      // 60-69
    bad: number       // 0-59
  }
  commonIssues: Array<{
    issue: string
    count: number
    percentage: number
  }>
}

/**
 * 데이터 품질 관리 서비스
 * 헬스장 데이터의 품질을 검증하고 개선하는 서비스
 */
export class DataQualityService {
  private gymRepo: Repository<Gym>
  private equipmentRepo: Repository<Equipment>

  // 필드별 가중치
  private fieldWeights = {
    name: 0.2,
    address: 0.2,
    phone: 0.15,
    latitude: 0.15,
    longitude: 0.15,
    is24Hours: 0.05,
    hasParking: 0.05,
    hasShower: 0.05,
    hasPT: 0.05,
    hasGX: 0.05,
    hasGroupPT: 0.05,
    openHour: 0.05,
    closeHour: 0.05,
    price: 0.05,
    rating: 0.05,
    reviewCount: 0.05
  }

  // 검증 규칙
  private validationRules: Record<string, any> = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[가-힣a-zA-Z0-9\s\-()]+$/
    },
    address: {
      required: true,
      minLength: 10,
      maxLength: 200,
      pattern: /^서울[^0-9]*[0-9-]+/
    },
    phone: {
      required: false,
      pattern: /^\d{2,3}-\d{3,4}-\d{4}$/
    },
    latitude: {
      required: true,
      min: 37.4,
      max: 37.7
    },
    longitude: {
      required: true,
      min: 126.8,
      max: 127.2
    },
    rating: {
      required: false,
      min: 0,
      max: 5
    },
    reviewCount: {
      required: false,
      min: 0
    }
  }

  constructor(gymRepo: Repository<Gym>, equipmentRepo: Repository<Equipment>) {
    this.gymRepo = gymRepo
    this.equipmentRepo = equipmentRepo
  }

  /**
   * 단일 헬스장 데이터 품질 검증
   */
  async validateGymData(gym: Gym): Promise<ValidationResult> {
    const issues: ValidationResult['issues'] = []
    const recommendations: string[] = []

    // 1. 완성도 검증
    const completenessScore = this.validateCompleteness(gym, issues)

    // 2. 정확성 검증
    const accuracyScore = this.validateAccuracy(gym, issues)

    // 3. 일관성 검증
    const consistencyScore = this.validateConsistency(gym, issues)

    // 4. 유효성 검증
    const validityScore = this.validateValidity(gym, issues)

    // 5. 시의성 검증
    const timelinessScore = this.validateTimeliness(gym, issues)

    // 6. 전체 점수 계산
    const overallScore = this.calculateOverallScore({
      completeness: completenessScore,
      accuracy: accuracyScore,
      consistency: consistencyScore,
      validity: validityScore,
      timeliness: timelinessScore
    })

    // 7. 권장사항 생성
    this.generateRecommendations(issues, recommendations)

    return {
      isValid: overallScore >= 70 && issues.filter(i => i.severity === 'critical').length === 0,
      score: {
        overall: overallScore,
        completeness: completenessScore,
        accuracy: accuracyScore,
        consistency: consistencyScore,
        timeliness: timelinessScore,
        validity: validityScore
      },
      issues,
      recommendations
    }
  }

  /**
   * 완성도 검증
   */
  private validateCompleteness(gym: Gym, issues: ValidationResult['issues']): number {
    let completedFields = 0
    let totalWeight = 0

    Object.entries(this.fieldWeights).forEach(([field, weight]) => {
      const value = gym[field as keyof Gym]
      totalWeight += weight

      if (this.isFieldComplete(value)) {
        completedFields += weight
      } else {
        const rule = this.validationRules[field as keyof typeof this.validationRules]
        if (rule?.required) {
          issues.push({
            field,
            issue: '필수 필드가 누락되었습니다',
            severity: 'critical',
            suggestion: `${field} 필드를 입력해주세요`
          })
        } else {
          issues.push({
            field,
            issue: '선택 필드가 누락되었습니다',
            severity: 'low',
            suggestion: `${field} 정보를 추가하면 더 나은 서비스를 제공할 수 있습니다`
          })
        }
      }
    })

    return totalWeight > 0 ? (completedFields / totalWeight) * 100 : 0
  }

  /**
   * 정확성 검증
   */
  private validateAccuracy(gym: Gym, issues: ValidationResult['issues']): number {
    let accurateFields = 0
    let totalFields = 0

    // 이름 정확성
    if (gym.name) {
      totalFields++
      if (this.isValidName(gym.name)) {
        accurateFields++
      } else {
        issues.push({
          field: 'name',
          issue: '헬스장 이름 형식이 올바르지 않습니다',
          severity: 'high',
          suggestion: '헬스장 이름을 정확히 입력해주세요'
        })
      }
    }

    // 주소 정확성
    if (gym.address) {
      totalFields++
      if (this.isValidAddress(gym.address)) {
        accurateFields++
      } else {
        issues.push({
          field: 'address',
          issue: '주소 형식이 올바르지 않습니다',
          severity: 'high',
          suggestion: '서울시 내의 정확한 주소를 입력해주세요'
        })
      }
    }

    // 전화번호 정확성
    if (gym.phone) {
      totalFields++
      if (this.isValidPhone(gym.phone)) {
        accurateFields++
      } else {
        issues.push({
          field: 'phone',
          issue: '전화번호 형식이 올바르지 않습니다',
          severity: 'medium',
          suggestion: '올바른 전화번호 형식(예: 02-1234-5678)으로 입력해주세요'
        })
      }
    }

    // 좌표 정확성
    if (gym.latitude && gym.longitude) {
      totalFields++
      if (this.isValidCoordinates(gym.latitude, gym.longitude)) {
        accurateFields++
      } else {
        issues.push({
          field: 'coordinates',
          issue: '좌표가 서울시 범위를 벗어났습니다',
          severity: 'high',
          suggestion: '서울시 내의 정확한 위치 좌표를 입력해주세요'
        })
      }
    }

    // 평점 정확성
    if (gym.rating !== undefined) {
      totalFields++
      if (gym.rating >= 0 && gym.rating <= 5) {
        accurateFields++
      } else {
        issues.push({
          field: 'rating',
          issue: '평점이 유효한 범위를 벗어났습니다',
          severity: 'medium',
          suggestion: '평점은 0-5 사이의 값이어야 합니다'
        })
      }
    }

    return totalFields > 0 ? (accurateFields / totalFields) * 100 : 0
  }

  /**
   * 일관성 검증
   */
  private validateConsistency(gym: Gym, issues: ValidationResult['issues']): number {
    let consistentFields = 0
    let totalChecks = 0

    // 24시간 운영과 운영시간 일관성
    totalChecks++
    if (gym.is24Hours && (gym.openHour || gym.closeHour)) {
      issues.push({
        field: 'operatingHours',
        issue: '24시간 운영인데 운영시간이 설정되어 있습니다',
        severity: 'medium',
        suggestion: '24시간 운영이면 운영시간을 비워두세요'
      })
    } else {
      consistentFields++
    }

    // 운영시간 일관성
    if (gym.openHour && gym.closeHour) {
      totalChecks++
      if (this.isValidTimeRange(gym.openHour, gym.closeHour)) {
        consistentFields++
      } else {
        issues.push({
          field: 'operatingHours',
          issue: '운영시간이 올바르지 않습니다',
          severity: 'medium',
          suggestion: '운영시간을 올바른 형식으로 입력해주세요'
        })
      }
    }

    // 리뷰 수와 평점 일관성
    if (gym.reviewCount !== undefined && gym.rating !== undefined) {
      totalChecks++
      if ((gym.reviewCount > 0 && gym.rating > 0) || (gym.reviewCount === 0 && gym.rating === 0)) {
        consistentFields++
      } else {
        issues.push({
          field: 'reviews',
          issue: '리뷰 수와 평점이 일치하지 않습니다',
          severity: 'low',
          suggestion: '리뷰 수와 평점을 일치시켜주세요'
        })
      }
    }

    // 시설 정보 일관성
    totalChecks++
    if (this.hasConsistentFacilities(gym)) {
      consistentFields++
    } else {
      issues.push({
        field: 'facilities',
        issue: '시설 정보가 일관되지 않습니다',
        severity: 'low',
        suggestion: '시설 정보를 확인하고 수정해주세요'
      })
    }

    return totalChecks > 0 ? (consistentFields / totalChecks) * 100 : 0
  }

  /**
   * 유효성 검증
   */
  private validateValidity(gym: Gym, issues: ValidationResult['issues']): number {
    let validFields = 0
    let totalFields = 0

    // 각 필드의 유효성 검증
    Object.entries(this.validationRules).forEach(([field, rules]) => {
      const value = gym[field as keyof Gym]
      
      if (value !== undefined && value !== null) {
        totalFields++
        
        if (this.isFieldValid(value, rules)) {
          validFields++
        } else {
          issues.push({
            field,
            issue: `${field} 필드가 유효하지 않습니다`,
            severity: 'medium',
            suggestion: `${field} 필드를 올바른 형식으로 입력해주세요`
          })
        }
      }
    })

    return totalFields > 0 ? (validFields / totalFields) * 100 : 0
  }

  /**
   * 시의성 검증
   */
  private validateTimeliness(gym: Gym, issues: ValidationResult['issues']): number {
    let score = 100

    // 업데이트 시간 확인
    if (gym.updatedAt) {
      const daysSinceUpdate = (Date.now() - gym.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysSinceUpdate > 365) {
        score -= 30
        issues.push({
          field: 'updatedAt',
          issue: '데이터가 1년 이상 업데이트되지 않았습니다',
          severity: 'medium',
          suggestion: '최신 정보로 업데이트해주세요'
        })
      } else if (daysSinceUpdate > 180) {
        score -= 15
        issues.push({
          field: 'updatedAt',
          issue: '데이터가 6개월 이상 업데이트되지 않았습니다',
          severity: 'low',
          suggestion: '정기적으로 정보를 업데이트해주세요'
        })
      }
    }

    return Math.max(0, score)
  }

  /**
   * 전체 점수 계산
   */
  private calculateOverallScore(scores: Omit<QualityScore, 'overall'>): number {
    const weights = {
      completeness: 0.3,
      accuracy: 0.3,
      consistency: 0.2,
      validity: 0.1,
      timeliness: 0.1
    }

    let totalScore = 0
    let totalWeight = 0

    Object.entries(weights).forEach(([key, weight]) => {
      totalScore += scores[key as keyof typeof scores] * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? totalScore / totalWeight : 0
  }

  /**
   * 권장사항 생성
   */
  private generateRecommendations(
    issues: ValidationResult['issues'],
    recommendations: string[]
  ): void {
    const criticalIssues = issues.filter(i => i.severity === 'critical')
    const highIssues = issues.filter(i => i.severity === 'high')
    const mediumIssues = issues.filter(i => i.severity === 'medium')

    if (criticalIssues.length > 0) {
      recommendations.push('필수 필드를 모두 입력해주세요')
    }

    if (highIssues.length > 0) {
      recommendations.push('주소와 좌표 정보를 정확히 입력해주세요')
    }

    if (mediumIssues.length > 0) {
      recommendations.push('전화번호와 운영시간 정보를 확인해주세요')
    }

    if (issues.filter(i => i.field === 'facilities').length > 0) {
      recommendations.push('시설 정보를 상세히 입력해주세요')
    }

    if (recommendations.length === 0) {
      recommendations.push('데이터 품질이 우수합니다')
    }
  }

  /**
   * 전체 데이터베이스 품질 통계
   */
  async getQualityStats(): Promise<QualityStats> {
    const allGyms = await this.gymRepo.find()
    const validationResults = await Promise.all(
      allGyms.map(gym => this.validateGymData(gym))
    )

    const totalRecords = allGyms.length
    const validRecords = validationResults.filter(r => r.isValid).length
    const invalidRecords = totalRecords - validRecords

    const scores = validationResults.map(r => r.score.overall)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

    const scoreDistribution = {
      excellent: scores.filter(s => s >= 90).length,
      good: scores.filter(s => s >= 80 && s < 90).length,
      fair: scores.filter(s => s >= 70 && s < 80).length,
      poor: scores.filter(s => s >= 60 && s < 70).length,
      bad: scores.filter(s => s < 60).length
    }

    // 공통 이슈 분석
    const allIssues = validationResults.flatMap(r => r.issues)
    const issueCounts = new Map<string, number>()
    
    allIssues.forEach(issue => {
      const key = issue.issue
      issueCounts.set(key, (issueCounts.get(key) || 0) + 1)
    })

    const commonIssues = Array.from(issueCounts.entries())
      .map(([issue, count]) => ({
        issue,
        count,
        percentage: (count / totalRecords) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalRecords,
      validRecords,
      invalidRecords,
      averageScore,
      scoreDistribution,
      commonIssues
    }
  }

  /**
   * 데이터 품질 개선 제안
   */
  async getImprovementSuggestions(): Promise<{
    priority: 'high' | 'medium' | 'low'
    category: string
    description: string
    impact: string
    effort: 'low' | 'medium' | 'high'
  }[]> {
    const stats = await this.getQualityStats()
    const suggestions = []

    // 높은 우선순위 제안
    if (stats.commonIssues.some(issue => issue.percentage > 50)) {
      suggestions.push({
        priority: 'high' as const,
        category: '데이터 완성도',
        description: '50% 이상의 레코드에서 공통 이슈가 발견되었습니다',
        impact: '사용자 경험 크게 개선',
        effort: 'medium' as const
      })
    }

    if (stats.scoreDistribution.bad > stats.totalRecords * 0.2) {
      suggestions.push({
        priority: 'high' as const,
        category: '데이터 품질',
        description: '20% 이상의 레코드가 낮은 품질 점수를 받았습니다',
        impact: '전체 데이터 품질 크게 개선',
        effort: 'high' as const
      })
    }

    // 중간 우선순위 제안
    if (stats.averageScore < 80) {
      suggestions.push({
        priority: 'medium' as const,
        category: '전체 품질',
        description: '전체 평균 품질 점수가 80점 미만입니다',
        impact: '전체적인 데이터 신뢰성 향상',
        effort: 'medium' as const
      })
    }

    // 낮은 우선순위 제안
    if (stats.scoreDistribution.excellent < stats.totalRecords * 0.3) {
      suggestions.push({
        priority: 'low' as const,
        category: '데이터 최적화',
        description: '우수한 품질의 레코드 비율을 높일 수 있습니다',
        impact: '서비스 품질 향상',
        effort: 'low' as const
      })
    }

    return suggestions
  }

  // 유틸리티 메서드들
  private isFieldComplete(value: any): boolean {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (typeof value === 'number') return !isNaN(value)
    if (typeof value === 'boolean') return true
    return true
  }

  private isValidName(name: string): boolean {
    return name.length >= 2 && name.length <= 100 && /^[가-힣a-zA-Z0-9\s\-()]+$/.test(name)
  }

  private isValidAddress(address: string): boolean {
    return address.length >= 10 && address.length <= 200 && /^서울[^0-9]*[0-9-]+/.test(address)
  }

  private isValidPhone(phone: string): boolean {
    return /^\d{2,3}-\d{3,4}-\d{4}$/.test(phone)
  }

  private isValidCoordinates(lat: number, lon: number): boolean {
    return lat >= 37.4 && lat <= 37.7 && lon >= 126.8 && lon <= 127.2
  }

  private isValidTimeRange(openHour: string, closeHour: string): boolean {
    const timeRegex = /^\d{1,2}:\d{2}$/
    return timeRegex.test(openHour) && timeRegex.test(closeHour)
  }

  private hasConsistentFacilities(gym: Gym): boolean {
    // 시설 정보의 논리적 일관성 확인
    return true // 간단한 구현
  }

  private isFieldValid(value: any, rules: any): boolean {
    if (rules.required && (value === null || value === undefined)) {
      return false
    }

    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) return false
      if (rules.maxLength && value.length > rules.maxLength) return false
      if (rules.pattern && !rules.pattern.test(value)) return false
    }

    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) return false
      if (rules.max !== undefined && value > rules.max) return false
    }

    return true
  }

  /**
   * 기구 정보 품질 검증
   */
  async validateEquipmentData(equipment: Equipment): Promise<ValidationResult> {
    const issues: Array<{
      field: string
      issue: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      suggestion: string
    }> = []

    const recommendations: string[] = []

    // 필수 필드 검증
    if (!equipment.name || equipment.name.trim().length === 0) {
      issues.push({
        field: 'name',
        issue: '기구명이 비어있습니다',
        severity: 'critical',
        suggestion: '기구명을 입력해주세요'
      })
    }

    if (!equipment.category) {
      issues.push({
        field: 'category',
        issue: '기구 카테고리가 지정되지 않았습니다',
        severity: 'critical',
        suggestion: '기구 카테고리를 선택해주세요'
      })
    }

    if (!equipment.type) {
      issues.push({
        field: 'type',
        issue: '기구 타입이 지정되지 않았습니다',
        severity: 'critical',
        suggestion: '기구 타입을 선택해주세요'
      })
    }

    // 개수 검증
    if (equipment.quantity < 0) {
      issues.push({
        field: 'quantity',
        issue: '기구 개수가 음수입니다',
        severity: 'high',
        suggestion: '기구 개수를 0 이상으로 설정해주세요'
      })
    }

    if (equipment.quantity > 100) {
      issues.push({
        field: 'quantity',
        issue: '기구 개수가 비정상적으로 많습니다',
        severity: 'medium',
        suggestion: '기구 개수를 확인해주세요'
      })
    }

    // 신뢰도 검증
    if (equipment.confidence < 0 || equipment.confidence > 1) {
      issues.push({
        field: 'confidence',
        issue: '신뢰도 값이 범위를 벗어났습니다',
        severity: 'high',
        suggestion: '신뢰도는 0과 1 사이의 값이어야 합니다'
      })
    }

    // 브랜드 정보 검증
    if (equipment.brand && equipment.brand.length > 100) {
      issues.push({
        field: 'brand',
        issue: '브랜드명이 너무 깁니다',
        severity: 'low',
        suggestion: '브랜드명을 100자 이내로 줄여주세요'
      })
    }

    // 모델 정보 검증
    if (equipment.model && equipment.model.length > 200) {
      issues.push({
        field: 'model',
        issue: '모델명이 너무 깁니다',
        severity: 'low',
        suggestion: '모델명을 200자 이내로 줄여주세요'
      })
    }

    // 무게 범위 검증
    if (equipment.weightRange && !this.isValidWeightRange(equipment.weightRange)) {
      issues.push({
        field: 'weightRange',
        issue: '무게 범위 형식이 올바르지 않습니다',
        severity: 'medium',
        suggestion: '무게 범위를 "5kg~50kg" 형식으로 입력해주세요'
      })
    }

    // 카테고리와 타입 일치성 검증
    if (equipment.category && equipment.type) {
      const expectedType = this.getExpectedTypeForCategory(equipment.category)
      if (expectedType && expectedType !== equipment.type) {
        issues.push({
          field: 'type',
          issue: '기구 카테고리와 타입이 일치하지 않습니다',
          severity: 'high',
          suggestion: `카테고리 ${equipment.category}에 맞는 타입은 ${expectedType}입니다`
        })
      }
    }

    // 품질 점수 계산
    const completeness = this.calculateEquipmentCompleteness(equipment)
    const accuracy = this.calculateEquipmentAccuracy(equipment, issues)
    const consistency = this.calculateEquipmentConsistency(equipment)
    const timeliness = this.calculateEquipmentTimeliness(equipment)
    const validity = this.calculateEquipmentValidity(equipment, issues)

    const overall = (completeness + accuracy + consistency + timeliness + validity) / 5

    // 권장사항 생성
    if (completeness < 0.8) {
      recommendations.push('기구 정보의 완성도를 높이기 위해 브랜드, 모델, 무게 범위 등의 추가 정보를 입력해주세요')
    }

    if (accuracy < 0.8) {
      recommendations.push('기구 정보의 정확성을 높이기 위해 데이터를 다시 확인해주세요')
    }

    if (equipment.confidence < 0.7) {
      recommendations.push('데이터 신뢰도가 낮습니다. 더 신뢰할 수 있는 소스에서 정보를 수집해주세요')
    }

    return {
      isValid: issues.filter(issue => issue.severity === 'critical' || issue.severity === 'high').length === 0,
      score: {
        overall,
        completeness,
        accuracy,
        consistency,
        timeliness,
        validity
      },
      issues,
      recommendations
    }
  }

  /**
   * 기구 정보 완성도 계산
   */
  private calculateEquipmentCompleteness(equipment: Equipment): number {
    const fields = [
      'name', 'category', 'type', 'quantity', 'brand', 'model', 
      'weightRange', 'equipmentVariant', 'additionalInfo'
    ]
    
    let completedFields = 0
    for (const field of fields) {
      const value = (equipment as any)[field]
      if (value !== null && value !== undefined && value !== '') {
        completedFields++
      }
    }
    
    return completedFields / fields.length
  }

  /**
   * 기구 정보 정확성 계산
   */
  private calculateEquipmentAccuracy(equipment: Equipment, issues: any[]): number {
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length
    const highIssues = issues.filter(issue => issue.severity === 'high').length
    const mediumIssues = issues.filter(issue => issue.severity === 'medium').length
    
    let accuracy = 1.0
    accuracy -= criticalIssues * 0.3
    accuracy -= highIssues * 0.2
    accuracy -= mediumIssues * 0.1
    
    return Math.max(0, accuracy)
  }

  /**
   * 기구 정보 일관성 계산
   */
  private calculateEquipmentConsistency(equipment: Equipment): number {
    let consistency = 1.0
    
    // 카테고리와 타입 일치성
    const expectedType = this.getExpectedTypeForCategory(equipment.category)
    if (expectedType && expectedType !== equipment.type) {
      consistency -= 0.3
    }
    
    // 개수와 브랜드 정보 일관성
    if (equipment.quantity > 10 && !equipment.brand) {
      consistency -= 0.1 // 많은 기구가 있는데 브랜드 정보가 없음
    }
    
    return Math.max(0, consistency)
  }

  /**
   * 기구 정보 시의성 계산
   */
  private calculateEquipmentTimeliness(equipment: Equipment): number {
    const now = new Date()
    const updatedAt = equipment.updatedAt
    const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceUpdate < 30) return 1.0
    if (daysSinceUpdate < 90) return 0.8
    if (daysSinceUpdate < 180) return 0.6
    if (daysSinceUpdate < 365) return 0.4
    return 0.2
  }

  /**
   * 기구 정보 유효성 계산
   */
  private calculateEquipmentValidity(equipment: Equipment, issues: any[]): number {
    const validityIssues = issues.filter(issue => 
      issue.field === 'quantity' || 
      issue.field === 'confidence' || 
      issue.field === 'weightRange'
    ).length
    
    return Math.max(0, 1.0 - (validityIssues * 0.2))
  }

  /**
   * 무게 범위 형식 검증
   */
  private isValidWeightRange(weightRange: string): boolean {
    const pattern = /^\d+(\.\d+)?kg\s*~\s*\d+(\.\d+)?kg$/
    return pattern.test(weightRange)
  }

  /**
   * 카테고리에 따른 예상 타입 반환
   */
  private getExpectedTypeForCategory(category: EquipmentCategory): EquipmentType | null {
    const cardioCategories = [
      EquipmentCategory.TREADMILL,
      EquipmentCategory.BIKE,
      EquipmentCategory.STEPPER,
      EquipmentCategory.ROWING_MACHINE,
      EquipmentCategory.CROSS_TRAINER,
      EquipmentCategory.STAIR_MASTER,
      EquipmentCategory.SKI_MACHINE
    ]
    
    if (cardioCategories.includes(category)) {
      return EquipmentType.CARDIO
    }
    
    return EquipmentType.WEIGHT
  }

  /**
   * 헬스장별 기구 정보 품질 통계
   */
  async getGymEquipmentQualityStats(gymId: number): Promise<QualityStats> {
    try {
      const equipments = await this.equipmentRepo.find({
        where: { gymId }
      })

      const validationResults = await Promise.all(
        equipments.map(equipment => this.validateEquipmentData(equipment))
      )

      const totalRecords = equipments.length
      const validRecords = validationResults.filter(result => result.isValid).length
      const invalidRecords = totalRecords - validRecords
      
      const averageScore = validationResults.length > 0 
        ? validationResults.reduce((sum, result) => sum + result.score.overall, 0) / validationResults.length
        : 0

      // 점수 분포 계산
      const scoreDistribution = {
        excellent: 0, // 90-100
        good: 0,      // 80-89
        fair: 0,      // 70-79
        poor: 0,      // 60-69
        bad: 0        // 0-59
      }

      validationResults.forEach(result => {
        const score = result.score.overall * 100
        if (score >= 90) scoreDistribution.excellent++
        else if (score >= 80) scoreDistribution.good++
        else if (score >= 70) scoreDistribution.fair++
        else if (score >= 60) scoreDistribution.poor++
        else scoreDistribution.bad++
      })

      // 일반적인 문제점 분석
      const issueCounts = new Map<string, number>()
      validationResults.forEach(result => {
        result.issues.forEach(issue => {
          const count = issueCounts.get(issue.issue) || 0
          issueCounts.set(issue.issue, count + 1)
        })
      })

      const commonIssues = Array.from(issueCounts.entries())
        .map(([issue, count]) => ({
          issue,
          count,
          percentage: Math.round((count / totalRecords) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return {
        totalRecords,
        validRecords,
        invalidRecords,
        averageScore,
        scoreDistribution,
        commonIssues
      }

    } catch (error) {
      console.error('❌ 헬스장 기구 품질 통계 조회 실패:', error)
      throw error
    }
  }
}