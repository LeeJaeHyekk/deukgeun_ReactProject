import { EnhancedGymInfo } from '@backend/modules/crawling/types/CrawlingTypes'
import { PriceExtractor } from './PriceExtractor'

/**
 * 교차 검증기
 */
export class CrossValidator {
  private priceExtractor: PriceExtractor

  constructor() {
    this.priceExtractor = new PriceExtractor()
  }

  /**
   * 교차 검증 실행
   */
  crossValidateResults(results: EnhancedGymInfo[], originalGym: any): EnhancedGymInfo {
    try {
      if (!Array.isArray(results) || results.length === 0) {
        console.warn('교차 검증: 유효하지 않은 결과 배열')
        return this.createFallbackResult(originalGym)
      }

      if (!originalGym || typeof originalGym !== 'object') {
        console.warn('교차 검증: 유효하지 않은 원본 헬스장 데이터')
        return this.createFallbackResult(originalGym)
      }

      console.log(`🔍 교차 검증 시작: ${originalGym.name || '알 수 없음'} (${results.length}개 소스)`)
      
      const baseResult = results[0]
      if (!baseResult) {
        console.warn('교차 검증: 기본 결과가 없음')
        return this.createFallbackResult(originalGym)
      }

      const validatedResult: EnhancedGymInfo = { ...baseResult }
      
      const validationStats = {
        phoneMatches: 0,
        hoursMatches: 0,
        priceMatches: 0,
        facilitiesMatches: 0,
        totalSources: results.length
      }

      // 전화번호 교차 검증
      const allPhones = results
        .map(r => r.phone)
        .filter((phone): phone is string => phone !== undefined && phone.trim().length > 0)
      
      if (allPhones.length > 0) {
        const mostCommonPhone = this.getMostCommonValue(allPhones)
        if (mostCommonPhone) {
          const phoneCount = allPhones.filter(p => p === mostCommonPhone).length
          if (phoneCount >= 2) {
            validatedResult.phone = mostCommonPhone
            validationStats.phoneMatches = phoneCount
            console.log(`📞 전화번호 교차 검증: ${mostCommonPhone} (${phoneCount}/${allPhones.length} 일치)`)
          }
        }
      }

      // 운영시간 교차 검증
      const allOpenHours = results
        .map(r => r.openHour)
        .filter((hour): hour is string => hour !== undefined && hour.trim().length > 0)
      
      if (allOpenHours.length > 0) {
        const mostCommonOpenHour = this.getMostCommonValue(allOpenHours)
        if (mostCommonOpenHour) {
          const openHourCount = allOpenHours.filter(h => h === mostCommonOpenHour).length
          if (openHourCount >= 2) {
            validatedResult.openHour = mostCommonOpenHour
            validationStats.hoursMatches = openHourCount
            console.log(`🕐 오픈시간 교차 검증: ${mostCommonOpenHour} (${openHourCount}/${allOpenHours.length} 일치)`)
          }
        }
      }

      const allCloseHours = results
        .map(r => r.closeHour)
        .filter((hour): hour is string => hour !== undefined && hour.trim().length > 0)
      
      if (allCloseHours.length > 0) {
        const mostCommonCloseHour = this.getMostCommonValue(allCloseHours)
        if (mostCommonCloseHour) {
          const closeHourCount = allCloseHours.filter(h => h === mostCommonCloseHour).length
          if (closeHourCount >= 2) {
            validatedResult.closeHour = mostCommonCloseHour
            console.log(`🕐 클로즈시간 교차 검증: ${mostCommonCloseHour}`)
          }
        }
      }

      // 가격 정보 교차 검증 (할인 정보 제외)
      const allPrices = results
        .map(r => [r.membershipPrice, r.ptPrice, r.gxPrice, r.dayPassPrice, r.priceDetails, r.minimumPrice])
        .flat()
        .filter((price): price is string => price !== undefined && price.trim().length > 0)
      
      // 할인 정보 교차 검증 (별도 처리)
      const allDiscounts = results
        .map(r => r.discountInfo)
        .filter((discount): discount is string => discount !== undefined && discount.trim().length > 0)

      // 가격 정보 처리 로직 개선
      const processedPriceInfo = this.priceExtractor.processPriceInformation(allPrices, results)
      
      if (processedPriceInfo) {
        validatedResult.membershipPrice = processedPriceInfo.membershipPrice
        validatedResult.ptPrice = processedPriceInfo.ptPrice
        validatedResult.gxPrice = processedPriceInfo.gxPrice
        validatedResult.dayPassPrice = processedPriceInfo.dayPassPrice
        validatedResult.priceDetails = processedPriceInfo.priceDetails
        validatedResult.minimumPrice = processedPriceInfo.minimumPrice
        validatedResult.price = processedPriceInfo.finalPrice
        
        validationStats.priceMatches = processedPriceInfo.matchCount
        console.log(`💰 가격 교차 검증: ${processedPriceInfo.finalPrice} (${processedPriceInfo.matchCount}/${allPrices.length} 일치)`)
      }

      // 할인 정보 교차 검증
      if (allDiscounts.length > 0) {
        const mostCommonDiscount = this.getMostCommonValue(allDiscounts)
        if (mostCommonDiscount) {
          const discountCount = allDiscounts.filter(d => d === mostCommonDiscount).length
          if (discountCount >= 2) {
            validatedResult.discountInfo = mostCommonDiscount
            console.log(`🎁 할인 정보 교차 검증: ${mostCommonDiscount} (${discountCount}/${allDiscounts.length} 일치)`)
          }
        }
      }

      // 시설 정보 교차 검증
      const allFacilities = results
        .map(r => r.facilities)
        .flat()
        .filter((facility): facility is string => facility !== undefined && facility.trim().length > 0)
      
      if (allFacilities.length > 0) {
        const facilityFrequency: Record<string, number> = {}
        for (const facility of allFacilities) {
          facilityFrequency[facility] = (facilityFrequency[facility] || 0) + 1
        }
        
        const validatedFacilities = Object.entries(facilityFrequency)
          .filter(([_, count]) => count >= 2)
          .map(([facility, _]) => facility)
        
        if (validatedFacilities.length > 0) {
          validatedResult.facilities = validatedFacilities
          validationStats.facilitiesMatches = validatedFacilities.length
          console.log(`🏋️ 시설 교차 검증: ${validatedFacilities.join(', ')} (${validatedFacilities.length}개 검증됨)`)
        }
      }

      // 신뢰도 재계산
      const validationScore = (
        (validationStats.phoneMatches > 0 ? 0.3 : 0) +
        (validationStats.hoursMatches > 0 ? 0.2 : 0) +
        (validationStats.priceMatches > 0 ? 0.3 : 0) +
        (validationStats.facilitiesMatches > 0 ? 0.2 : 0)
      )

      validatedResult.confidence = Math.min(0.9, baseResult.confidence + validationScore)
      validatedResult.source = `cross_validated_${results.length}_sources`

      console.log(`✅ 교차 검증 완료: 신뢰도 ${validatedResult.confidence.toFixed(2)} (검증 점수: ${validationScore.toFixed(2)})`)
      
      return validatedResult
    } catch (error) {
      console.error('교차 검증 오류:', error)
      return this.createFallbackResult(originalGym)
    }
  }

  /**
   * 가장 많이 나타나는 값 찾기
   */
  private getMostCommonValue(values: string[]): string | null {
    if (values.length === 0) return null
    
    const frequency: Record<string, number> = {}
    let maxCount = 0
    let mostCommon = values[0]
    
    for (const value of values) {
      frequency[value] = (frequency[value] || 0) + 1
      if (frequency[value] > maxCount) {
        maxCount = frequency[value]
        mostCommon = value
      }
    }
    
    return mostCommon
  }

  /**
   * 폴백 결과 생성 (오류 시 안전한 기본값)
   */
  private createFallbackResult(originalGym: any): EnhancedGymInfo {
    try {
      return {
        name: this.safeTrim(originalGym?.name) || '알 수 없는 헬스장',
        address: this.safeTrim(originalGym?.address) || '',
        phone: this.safeTrim(originalGym?.phone) || undefined,
        rating: this.safeExtractNumber(originalGym?.rating) || undefined,
        reviewCount: this.safeExtractNumber(originalGym?.reviewCount) || undefined,
        openHour: this.safeTrim(originalGym?.openHour) || undefined,
        closeHour: this.safeTrim(originalGym?.closeHour) || undefined,
        price: this.safeTrim(originalGym?.price) || undefined,
        membershipPrice: this.safeTrim(originalGym?.membershipPrice) || undefined,
        ptPrice: this.safeTrim(originalGym?.ptPrice) || undefined,
        gxPrice: this.safeTrim(originalGym?.gxPrice) || undefined,
        dayPassPrice: this.safeTrim(originalGym?.dayPassPrice) || undefined,
        priceDetails: this.safeTrim(originalGym?.priceDetails) || undefined,
        minimumPrice: this.safeTrim(originalGym?.minimumPrice) || undefined,
        discountInfo: this.safeTrim(originalGym?.discountInfo) || undefined,
        facilities: this.safeArray<string>(originalGym?.facilities),
        services: this.safeArray<string>(originalGym?.services),
        website: this.safeTrim(originalGym?.website) || undefined,
        instagram: this.safeTrim(originalGym?.instagram) || undefined,
        facebook: this.safeTrim(originalGym?.facebook) || undefined,
        source: 'fallback_error_recovery',
        confidence: 0.1,
        type: 'private' as const
      }
    } catch (error) {
      console.error('폴백 결과 생성 오류:', error)
      return {
        name: '알 수 없는 헬스장',
        address: '',
        source: 'fallback_critical_error',
        confidence: 0.0,
        type: 'private' as const
      }
    }
  }

  /**
   * 안전한 문자열 정리
   */
  private safeTrim(text: any): string {
    try {
      if (typeof text !== 'string') return ''
      return text.trim()
    } catch (error) {
      console.warn('safeTrim 오류:', error)
      return ''
    }
  }

  /**
   * 안전한 숫자 추출
   */
  private safeExtractNumber(text: string): number | null {
    try {
      if (!text || typeof text !== 'string') return null
      const match = text.match(/\d+/)
      return match ? parseInt(match[0], 10) : null
    } catch (error) {
      console.warn('safeExtractNumber 오류:', error)
      return null
    }
  }

  /**
   * 안전한 배열 처리
   */
  private safeArray<T>(value: any): T[] {
    try {
      if (Array.isArray(value)) return value
      if (value && typeof value === 'string') return [value] as T[]
      return []
    } catch (error) {
      console.warn('safeArray 오류:', error)
      return []
    }
  }
}
