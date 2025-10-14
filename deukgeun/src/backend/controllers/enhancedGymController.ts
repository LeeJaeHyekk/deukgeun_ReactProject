import { Request, Response } from 'express'
import { Repository } from 'typeorm'
import { Gym } from '../entities/Gym'
import { IntegratedGymDataService } from '../services/integratedGymDataService'
import { EnhancedCrawlingSources } from '../services/enhancedCrawlingSources'
import { DataMergingService } from '../services/dataMergingService'
import { BatchProcessingService } from '../services/batchProcessingService'
import { DataQualityService } from '../services/dataQualityService'
import { IntegratedCrawlingService } from '../services/integratedCrawlingService'
import { PublicApiScheduler } from '../services/publicApiScheduler'
import { ApiListUpdater } from '../services/apiListUpdater'
import { CrawlingBypassService } from '../services/crawlingBypassService'
import { TypeGuardService } from '../services/typeGuardService'

/**
 * 향상된 헬스장 컨트롤러
 * 공공데이터 API와 크롤링을 통합한 헬스장 데이터 관리 컨트롤러
 */
export class EnhancedGymController {
  private gymRepo: Repository<Gym>
  private integratedService: IntegratedGymDataService
  private crawlingService: EnhancedCrawlingSources
  private mergingService: DataMergingService
  private batchService: BatchProcessingService
  private qualityService: DataQualityService
  private integratedCrawlingService: IntegratedCrawlingService
  private publicApiScheduler: PublicApiScheduler
  private apiListUpdater: ApiListUpdater
  private crawlingBypassService: CrawlingBypassService
  private typeGuardService: TypeGuardService

  constructor(gymRepo: Repository<Gym>) {
    this.gymRepo = gymRepo
    this.integratedService = new IntegratedGymDataService(gymRepo)
    this.crawlingService = new EnhancedCrawlingSources()
    this.mergingService = new DataMergingService(gymRepo)
    this.batchService = new BatchProcessingService(gymRepo)
    this.qualityService = new DataQualityService(gymRepo)
    this.integratedCrawlingService = new IntegratedCrawlingService(gymRepo)
    this.publicApiScheduler = new PublicApiScheduler()
    this.apiListUpdater = new ApiListUpdater()
    this.crawlingBypassService = new CrawlingBypassService()
    this.typeGuardService = new TypeGuardService()
  }

  /**
   * 공공데이터와 크롤링을 통합한 헬스장 데이터 업데이트
   */
  async updateGymDataWithCrawling(req: Request, res: Response): Promise<void> {
    try {
      console.log('🚀 통합 헬스장 데이터 업데이트 시작')

      const { 
        batchSize = 20, 
        concurrency = 3, 
        delayBetweenBatches = 2000,
        maxRetries = 3,
        timeout = 30000
      } = req.body

      // 배치 처리 설정
      const batchConfig = {
        batchSize,
        concurrency,
        delayBetweenBatches,
        maxRetries,
        timeout,
        retryDelay: 1000
      }

      // 배치 처리 실행
      const result = await this.batchService.processGymsInBatches(batchConfig)

      res.json({
        success: true,
        message: '헬스장 데이터 업데이트가 완료되었습니다',
        data: {
          total: result.total,
          success: result.success,
          failed: result.failed,
          successRate: result.total > 0 ? ((result.success / result.total) * 100).toFixed(1) : 0,
          duration: result.duration,
          errors: result.errors.slice(0, 10) // 처음 10개 오류만 반환
        }
      })

    } catch (error) {
      console.error('❌ 헬스장 데이터 업데이트 실패:', error)
      res.status(500).json({
        success: false,
        message: '헬스장 데이터 업데이트 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 특정 헬스장의 상세 정보 크롤링
   */
  async crawlGymDetails(req: Request, res: Response): Promise<void> {
    try {
      const { gymName } = req.params

      if (!gymName) {
        res.status(400).json({
          success: false,
          message: '헬스장 이름이 필요합니다'
        })
        return
      }

      console.log(`🔍 헬스장 상세 정보 크롤링 시작: ${gymName}`)

      // 통합 검색 실행
      const searchResult = await this.integratedService.searchAllSources(gymName)
      
      if (!searchResult) {
        res.status(404).json({
          success: false,
          message: '헬스장 정보를 찾을 수 없습니다'
        })
        return
      }

      // 크롤링으로 추가 정보 수집
      const crawlingResults = await this.crawlingService.searchAllCrawlingSources(gymName)

      // 데이터 병합
      const allSourceData = [searchResult, ...crawlingResults]
      const mergedData = await this.mergingService.mergeGymDataFromMultipleSources(allSourceData)

      res.json({
        success: true,
        message: '헬스장 상세 정보 크롤링이 완료되었습니다',
        data: {
          gymName,
          searchResult,
          crawlingResults: crawlingResults.slice(0, 5), // 처음 5개만 반환
          mergedData: mergedData.slice(0, 3), // 처음 3개만 반환
          totalSources: allSourceData.length
        }
      })

    } catch (error) {
      console.error('❌ 헬스장 상세 정보 크롤링 실패:', error)
      res.status(500).json({
        success: false,
        message: '헬스장 상세 정보 크롤링 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 데이터 품질 검증
   */
  async validateDataQuality(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 데이터 품질 검증 시작')

      const { gymId } = req.params

      if (gymId) {
        // 특정 헬스장 품질 검증
        const gym = await this.gymRepo.findOne({ where: { id: parseInt(gymId) } })
        
        if (!gym) {
          res.status(404).json({
            success: false,
            message: '헬스장을 찾을 수 없습니다'
          })
          return
        }

        const validationResult = await this.qualityService.validateGymData(gym)

        res.json({
          success: true,
          message: '헬스장 데이터 품질 검증이 완료되었습니다',
          data: {
            gymId,
            gymName: gym.name,
            validation: validationResult
          }
        })

      } else {
        // 전체 데이터 품질 통계
        const qualityStats = await this.qualityService.getQualityStats()
        const improvementSuggestions = await this.qualityService.getImprovementSuggestions()

        res.json({
          success: true,
          message: '전체 데이터 품질 검증이 완료되었습니다',
          data: {
            stats: qualityStats,
            suggestions: improvementSuggestions
          }
        })
      }

    } catch (error) {
      console.error('❌ 데이터 품질 검증 실패:', error)
      res.status(500).json({
        success: false,
        message: '데이터 품질 검증 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 크롤링 소스별 통계
   */
  async getCrawlingStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 크롤링 통계 조회')

      const allGyms = await this.gymRepo.find()
      
      // 소스별 통계
      const sourceStats = allGyms.reduce((acc, gym) => {
        const source = gym.source || 'unknown'
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // 시설별 통계
      const facilityStats = {
        is24Hours: allGyms.filter(g => g.is24Hours).length,
        hasParking: allGyms.filter(g => g.hasParking).length,
        hasShower: allGyms.filter(g => g.hasShower).length,
        hasPT: allGyms.filter(g => g.hasPT).length,
        hasGX: allGyms.filter(g => g.hasGX).length,
        hasGroupPT: allGyms.filter(g => g.hasGroupPT).length
      }

      // 데이터 완성도 통계
      const completenessStats = {
        withPhone: allGyms.filter(g => g.phone && g.phone.trim().length > 0).length,
        withAddress: allGyms.filter(g => g.address && g.address.trim().length > 0).length,
        withCoordinates: allGyms.filter(g => g.latitude !== 0 && g.longitude !== 0).length,
        withRating: allGyms.filter(g => g.rating && g.rating > 0).length,
        withPrice: allGyms.filter(g => g.price && g.price.trim().length > 0).length
      }

      res.json({
        success: true,
        message: '크롤링 통계 조회가 완료되었습니다',
        data: {
          total: allGyms.length,
          sourceStats,
          facilityStats,
          completenessStats,
          completenessPercentage: {
            phone: ((completenessStats.withPhone / allGyms.length) * 100).toFixed(1),
            address: ((completenessStats.withAddress / allGyms.length) * 100).toFixed(1),
            coordinates: ((completenessStats.withCoordinates / allGyms.length) * 100).toFixed(1),
            rating: ((completenessStats.withRating / allGyms.length) * 100).toFixed(1),
            price: ((completenessStats.withPrice / allGyms.length) * 100).toFixed(1)
          }
        }
      })

    } catch (error) {
      console.error('❌ 크롤링 통계 조회 실패:', error)
      res.status(500).json({
        success: false,
        message: '크롤링 통계 조회 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 크롤링 설정 업데이트
   */
  async updateCrawlingConfig(req: Request, res: Response): Promise<void> {
    try {
      const { 
        batchSize, 
        concurrency, 
        delayBetweenBatches, 
        maxRetries, 
        timeout 
      } = req.body

      console.log('⚙️ 크롤링 설정 업데이트')

      // 설정 유효성 검증
      if (batchSize && (batchSize < 1 || batchSize > 100)) {
        res.status(400).json({
          success: false,
          message: '배치 크기는 1-100 사이여야 합니다'
        })
        return
      }

      if (concurrency && (concurrency < 1 || concurrency > 10)) {
        res.status(400).json({
          success: false,
          message: '동시성은 1-10 사이여야 합니다'
        })
        return
      }

      // 실제 구현에서는 설정을 데이터베이스나 설정 파일에 저장
      const newConfig = {
        batchSize: batchSize || 20,
        concurrency: concurrency || 3,
        delayBetweenBatches: delayBetweenBatches || 2000,
        maxRetries: maxRetries || 3,
        timeout: timeout || 30000
      }

      res.json({
        success: true,
        message: '크롤링 설정이 업데이트되었습니다',
        data: {
          config: newConfig,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('❌ 크롤링 설정 업데이트 실패:', error)
      res.status(500).json({
        success: false,
        message: '크롤링 설정 업데이트 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 크롤링 상태 모니터링
   */
  async getCrawlingStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 크롤링 상태 모니터링')

      // 실제 구현에서는 Redis나 다른 캐시에서 상태 정보를 가져옴
      const status = {
        isRunning: false,
        progress: {
          processed: 0,
          total: 0,
          percentage: 0
        },
        currentBatch: 0,
        totalBatches: 0,
        startTime: null,
        estimatedCompletion: null,
        errors: []
      }

      res.json({
        success: true,
        message: '크롤링 상태 조회가 완료되었습니다',
        data: {
          status,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('❌ 크롤링 상태 모니터링 실패:', error)
      res.status(500).json({
        success: false,
        message: '크롤링 상태 모니터링 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 크롤링 중단
   */
  async stopCrawling(req: Request, res: Response): Promise<void> {
    try {
      console.log('⏹️ 크롤링 중단 요청')

      await this.batchService.cancelBatchProcessing()

      res.json({
        success: true,
        message: '크롤링이 중단되었습니다',
        data: {
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('❌ 크롤링 중단 실패:', error)
      res.status(500).json({
        success: false,
        message: '크롤링 중단 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 성능 통계 조회
   */
  async getPerformanceStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('📈 성능 통계 조회')

      const stats = await this.batchService.collectPerformanceStats()

      res.json({
        success: true,
        message: '성능 통계 조회가 완료되었습니다',
        data: {
          stats,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('❌ 성능 통계 조회 실패:', error)
      res.status(500).json({
        success: false,
        message: '성능 통계 조회 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 통합 크롤링 실행
   */
  async executeIntegratedCrawling(req: Request, res: Response): Promise<void> {
    try {
      console.log('🚀 통합 크롤링 실행')

      const result = await this.integratedCrawlingService.executeIntegratedCrawling()

      res.json({
        success: result.success,
        message: result.success ? '통합 크롤링이 완료되었습니다' : '통합 크롤링 중 오류가 발생했습니다',
        data: {
          totalGyms: result.totalGyms,
          publicApiGyms: result.publicApiGyms,
          crawlingGyms: result.crawlingGyms,
          mergedGyms: result.mergedGyms,
          duration: result.duration,
          dataQuality: result.dataQuality,
          errors: result.errors,
          warnings: result.warnings
        }
      })

    } catch (error) {
      console.error('❌ 통합 크롤링 실행 실패:', error)
      res.status(500).json({
        success: false,
        message: '통합 크롤링 실행 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 공공 API 스케줄러 상태 조회
   */
  async getPublicApiSchedulerStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 공공 API 스케줄러 상태 조회')

      const status = this.publicApiScheduler.getStatus()

      res.json({
        success: true,
        message: '공공 API 스케줄러 상태 조회가 완료되었습니다',
        data: {
          status,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('❌ 공공 API 스케줄러 상태 조회 실패:', error)
      res.status(500).json({
        success: false,
        message: '공공 API 스케줄러 상태 조회 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 공공 API 스케줄러 시작/중지
   */
  async controlPublicApiScheduler(req: Request, res: Response): Promise<void> {
    try {
      const { action } = req.body

      if (action === 'start') {
        this.publicApiScheduler.start()
        res.json({
          success: true,
          message: '공공 API 스케줄러가 시작되었습니다'
        })
      } else if (action === 'stop') {
        this.publicApiScheduler.stop()
        res.json({
          success: true,
          message: '공공 API 스케줄러가 중지되었습니다'
        })
      } else {
        res.status(400).json({
          success: false,
          message: '유효하지 않은 액션입니다. start 또는 stop을 사용하세요'
        })
      }

    } catch (error) {
      console.error('❌ 공공 API 스케줄러 제어 실패:', error)
      res.status(500).json({
        success: false,
        message: '공공 API 스케줄러 제어 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * API 목록 업데이트 실행
   */
  async updateApiList(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔄 API 목록 업데이트 실행')

      const result = await this.apiListUpdater.updateAllApis()

      res.json({
        success: result.success,
        message: result.success ? 'API 목록 업데이트가 완료되었습니다' : 'API 목록 업데이트 중 오류가 발생했습니다',
        data: {
          totalApis: result.totalApis,
          successfulApis: result.successfulApis,
          failedApis: result.failedApis,
          totalGyms: result.totalGyms,
          duration: result.duration,
          errors: result.errors
        }
      })

    } catch (error) {
      console.error('❌ API 목록 업데이트 실패:', error)
      res.status(500).json({
        success: false,
        message: 'API 목록 업데이트 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 크롤링 우회 서비스로 헬스장 정보 수집
   */
  async crawlGymWithBypass(req: Request, res: Response): Promise<void> {
    try {
      const { gymName } = req.params

      if (!gymName) {
        res.status(400).json({
          success: false,
          message: '헬스장 이름이 필요합니다'
        })
        return
      }

      console.log(`🕷️ 크롤링 우회 서비스로 헬스장 정보 수집: ${gymName}`)

      const results = await this.crawlingBypassService.crawlAllSources(gymName)

      res.json({
        success: true,
        message: '크롤링 우회 서비스로 헬스장 정보 수집이 완료되었습니다',
        data: {
          gymName,
          results: results.slice(0, 10), // 처음 10개만 반환
          totalResults: results.length
        }
      })

    } catch (error) {
      console.error('❌ 크롤링 우회 서비스 실행 실패:', error)
      res.status(500).json({
        success: false,
        message: '크롤링 우회 서비스 실행 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 타입 가드 서비스로 데이터 검증
   */
  async validateDataWithTypeGuard(req: Request, res: Response): Promise<void> {
    try {
      const { data, dataType } = req.body

      if (!data) {
        res.status(400).json({
          success: false,
          message: '검증할 데이터가 필요합니다'
        })
        return
      }

      console.log(`🔍 타입 가드 서비스로 데이터 검증: ${dataType || 'unknown'}`)

      let validationResult

      switch (dataType) {
        case 'publicApi':
          validationResult = this.typeGuardService.validatePublicApiData(data)
          break
        case 'crawling':
          validationResult = this.typeGuardService.validateCrawlingData(data)
          break
        case 'integrated':
          validationResult = this.typeGuardService.validateIntegratedData(data)
          break
        default:
          validationResult = this.typeGuardService.validateIntegratedData(data)
      }

      res.json({
        success: validationResult.isValid,
        message: validationResult.isValid ? '데이터 검증이 완료되었습니다' : '데이터 검증에 실패했습니다',
        data: {
          isValid: validationResult.isValid,
          data: validationResult.data,
          errors: validationResult.errors,
          warnings: validationResult.warnings
        }
      })

    } catch (error) {
      console.error('❌ 타입 가드 서비스 실행 실패:', error)
      res.status(500).json({
        success: false,
        message: '타입 가드 서비스 실행 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 통합 크롤링 상태 조회
   */
  async getIntegratedCrawlingStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 통합 크롤링 상태 조회')

      const status = this.integratedCrawlingService.getStatus()
      const stats = await this.integratedCrawlingService.getCrawlingStats()

      res.json({
        success: true,
        message: '통합 크롤링 상태 조회가 완료되었습니다',
        data: {
          status,
          stats,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('❌ 통합 크롤링 상태 조회 실패:', error)
      res.status(500).json({
        success: false,
        message: '통합 크롤링 상태 조회 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }

  /**
   * 통합 크롤링 중단
   */
  async stopIntegratedCrawling(req: Request, res: Response): Promise<void> {
    try {
      console.log('⏹️ 통합 크롤링 중단')

      await this.integratedCrawlingService.stopCrawling()

      res.json({
        success: true,
        message: '통합 크롤링이 중단되었습니다',
        data: {
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('❌ 통합 크롤링 중단 실패:', error)
      res.status(500).json({
        success: false,
        message: '통합 크롤링 중단 중 오류가 발생했습니다',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      })
    }
  }
}
