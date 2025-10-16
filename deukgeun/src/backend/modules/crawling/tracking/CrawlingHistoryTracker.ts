/**
 * 크롤링 히스토리 추적 시스템
 * 진행사항 문서화 및 히스토리 관리
 */

import { ProcessedGymData, CrawlingStatus } from '../types/CrawlingTypes'
import { MergeResult } from '../processors/EnhancedDataMerger'
import { getCrawlingHistoryPath } from '../utils/pathUtils'

export interface CrawlingHistoryEntry {
  id: string
  timestamp: Date
  sessionId: string
  type: 'api_collection' | 'name_crawling' | 'data_merging' | 'quality_check' | 'complete'
  status: 'started' | 'in_progress' | 'completed' | 'failed'
  details: {
    step: string
    progress?: {
      current: number
      total: number
      percentage: number
    }
    statistics?: {
      totalProcessed?: number
      successfullyMerged?: number
      fallbackUsed?: number
      duplicatesRemoved?: number
      qualityScore?: number
    }
    errors?: string[]
    warnings?: string[]
    duration?: number
  }
  metadata: {
    config: any
    environment: string
    version: string
  }
}

export interface CrawlingSession {
  id: string
  startTime: Date
  endTime?: Date
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  totalSteps: number
  completedSteps: number
  currentStep?: string
  progress: {
    current: number
    total: number
    percentage: number
  }
  results: {
    publicApiGyms: number
    crawlingGyms: number
    mergedGyms: number
    totalGyms: number
    qualityScore: number
  }
  errors: string[]
  warnings: string[]
  history: CrawlingHistoryEntry[]
}

export class CrawlingHistoryTracker {
  private sessions: Map<string, CrawlingSession> = new Map()
  private currentSession: CrawlingSession | null = null
  private readonly maxHistoryEntries = 1000
  private readonly maxSessions = 50

  /**
   * 새로운 크롤링 세션 시작
   */
  startSession(config: any): string {
    const sessionId = this.generateSessionId()
    const session: CrawlingSession = {
      id: sessionId,
      startTime: new Date(),
      status: 'running',
      totalSteps: 0,
      completedSteps: 0,
      progress: { current: 0, total: 0, percentage: 0 },
      results: {
        publicApiGyms: 0,
        crawlingGyms: 0,
        mergedGyms: 0,
        totalGyms: 0,
        qualityScore: 0
      },
      errors: [],
      warnings: [],
      history: []
    }

    this.sessions.set(sessionId, session)
    this.currentSession = session

    // 세션 시작 기록
    this.addHistoryEntry({
      type: 'api_collection',
      status: 'started',
      details: {
        step: '크롤링 세션 시작',
        progress: { current: 0, total: 0, percentage: 0 }
      },
      metadata: {
        config,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      }
    })

    console.log(`📊 크롤링 세션 시작: ${sessionId}`)
    return sessionId
  }

  /**
   * 세션 종료
   */
  endSession(sessionId: string, status: 'completed' | 'failed' | 'cancelled'): void {
    const session = this.sessions.get(sessionId)
    if (!session) return

    session.status = status
    session.endTime = new Date()
    session.currentStep = undefined

    // 세션 종료 기록
    this.addHistoryEntry({
      type: 'complete',
      status: status === 'completed' ? 'completed' : 'failed',
      details: {
        step: `크롤링 세션 ${status}`,
        duration: session.endTime.getTime() - session.startTime.getTime(),
        statistics: {
          totalProcessed: session.results.totalGyms,
          qualityScore: session.results.qualityScore
        }
      },
      metadata: {
        config: {},
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      }
    })

    console.log(`📊 크롤링 세션 종료: ${sessionId} (${status})`)
    
    // 오래된 세션 정리
    this.cleanupOldSessions()
  }

  /**
   * 공공 API 수집 진행상황 기록
   */
  recordApiCollection(progress: { current: number; total: number }, results: { count: number }): void {
    if (!this.currentSession) return

    this.addHistoryEntry({
      type: 'api_collection',
      status: 'in_progress',
      details: {
        step: '공공 API 데이터 수집',
        progress: {
          current: progress.current,
          total: progress.total,
          percentage: Math.round((progress.current / progress.total) * 100)
        },
        statistics: {
          totalProcessed: results.count
        }
      },
      metadata: {
        config: {},
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      }
    })

    this.currentSession.results.publicApiGyms = results.count
    this.updateSessionProgress()
  }

  /**
   * name 기반 크롤링 진행상황 기록
   */
  recordNameCrawling(progress: CrawlingStatus): void {
    if (!this.currentSession) return

    this.addHistoryEntry({
      type: 'name_crawling',
      status: progress.isRunning ? 'in_progress' : 'completed',
      details: {
        step: `헬스장 이름 크롤링: ${progress.currentStep}`,
        progress: {
          current: progress.progress.current,
          total: progress.progress.total,
          percentage: progress.progress.percentage
        },
        errors: progress.errors
      },
      metadata: {
        config: {},
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      }
    })

    this.currentSession.results.crawlingGyms = progress.progress.current
    this.updateSessionProgress()
  }

  /**
   * 데이터 병합 진행상황 기록
   */
  recordDataMerging(mergeResult: MergeResult): void {
    if (!this.currentSession) return

    this.addHistoryEntry({
      type: 'data_merging',
      status: 'completed',
      details: {
        step: '데이터 병합 완료',
        statistics: {
          totalProcessed: mergeResult.statistics.totalProcessed,
          successfullyMerged: mergeResult.statistics.successfullyMerged,
          fallbackUsed: mergeResult.statistics.fallbackUsed,
          duplicatesRemoved: mergeResult.statistics.duplicatesRemoved,
          qualityScore: mergeResult.statistics.qualityScore
        }
      },
      metadata: {
        config: {},
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      }
    })

    this.currentSession.results.mergedGyms = mergeResult.statistics.totalProcessed
    this.currentSession.results.qualityScore = mergeResult.statistics.qualityScore
    this.updateSessionProgress()
  }

  /**
   * 오류 기록
   */
  recordError(error: string, step?: string): void {
    if (!this.currentSession) return

    this.currentSession.errors.push(error)

    this.addHistoryEntry({
      type: 'api_collection',
      status: 'failed',
      details: {
        step: step || '알 수 없는 단계',
        errors: [error]
      },
      metadata: {
        config: {},
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      }
    })
  }

  /**
   * 경고 기록
   */
  recordWarning(warning: string, step?: string): void {
    if (!this.currentSession) return

    this.currentSession.warnings.push(warning)

    this.addHistoryEntry({
      type: 'api_collection',
      status: 'in_progress',
      details: {
        step: step || '알 수 없는 단계',
        warnings: [warning]
      },
      metadata: {
        config: {},
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      }
    })
  }

  /**
   * 현재 세션 조회
   */
  getCurrentSession(): CrawlingSession | null {
    return this.currentSession ? { ...this.currentSession } : null
  }

  /**
   * 세션 조회
   */
  getSession(sessionId: string): CrawlingSession | null {
    const session = this.sessions.get(sessionId)
    return session ? { ...session } : null
  }

  /**
   * 모든 세션 조회
   */
  getAllSessions(): CrawlingSession[] {
    return Array.from(this.sessions.values()).map(session => ({ ...session }))
  }

  /**
   * 최근 세션 조회
   */
  getRecentSessions(limit: number = 10): CrawlingSession[] {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit)
      .map(session => ({ ...session }))
  }

  /**
   * 세션 통계 조회
   */
  getSessionStatistics(): {
    totalSessions: number
    completedSessions: number
    failedSessions: number
    averageDuration: number
    averageQualityScore: number
    totalGymsProcessed: number
  } {
    const sessions = Array.from(this.sessions.values())
    
    const completedSessions = sessions.filter(s => s.status === 'completed')
    const failedSessions = sessions.filter(s => s.status === 'failed')
    
    const averageDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => {
          const duration = s.endTime ? s.endTime.getTime() - s.startTime.getTime() : 0
          return sum + duration
        }, 0) / completedSessions.length
      : 0

    const averageQualityScore = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.results.qualityScore, 0) / completedSessions.length
      : 0

    const totalGymsProcessed = sessions.reduce((sum, s) => sum + s.results.totalGyms, 0)

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      failedSessions: failedSessions.length,
      averageDuration,
      averageQualityScore,
      totalGymsProcessed
    }
  }

  /**
   * 히스토리 엔트리 추가
   */
  private addHistoryEntry(entry: Omit<CrawlingHistoryEntry, 'id' | 'timestamp' | 'sessionId'>): void {
    if (!this.currentSession) return

    const historyEntry: CrawlingHistoryEntry = {
      id: this.generateEntryId(),
      timestamp: new Date(),
      sessionId: this.currentSession.id,
      ...entry
    }

    this.currentSession.history.push(historyEntry)

    // 히스토리 크기 제한
    if (this.currentSession.history.length > this.maxHistoryEntries) {
      this.currentSession.history = this.currentSession.history.slice(-this.maxHistoryEntries)
    }
  }

  /**
   * 세션 진행상황 업데이트
   */
  private updateSessionProgress(): void {
    if (!this.currentSession) return

    const totalGyms = this.currentSession.results.publicApiGyms + this.currentSession.results.crawlingGyms
    this.currentSession.results.totalGyms = totalGyms
    this.currentSession.progress = {
      current: totalGyms,
      total: totalGyms, // 실제로는 예상 총량을 설정해야 함
      percentage: 100 // 임시로 100% 설정
    }
  }

  /**
   * 오래된 세션 정리
   */
  private cleanupOldSessions(): void {
    if (this.sessions.size <= this.maxSessions) return

    const sessions = Array.from(this.sessions.entries())
      .sort((a, b) => b[1].startTime.getTime() - a[1].startTime.getTime())

    // 최신 세션만 유지
    const sessionsToKeep = sessions.slice(0, this.maxSessions)
    this.sessions.clear()
    
    sessionsToKeep.forEach(([id, session]) => {
      this.sessions.set(id, session)
    })

    console.log(`🧹 오래된 세션 정리 완료: ${sessions.length - this.maxSessions}개 세션 제거`)
  }

  /**
   * 세션 ID 생성
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 엔트리 ID 생성
   */
  private generateEntryId(): string {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 히스토리를 파일로 저장
   */
  async saveHistoryToFile(): Promise<void> {
    try {
      const fs = await import('fs/promises')
      
      const filePath = getCrawlingHistoryPath()
      
      const historyData = {
        sessions: Array.from(this.sessions.values()),
        statistics: this.getSessionStatistics(),
        lastUpdated: new Date().toISOString()
      }

      await fs.writeFile(filePath, JSON.stringify(historyData, null, 2), 'utf-8')
      console.log('💾 크롤링 히스토리 저장 완료')
      
    } catch (error) {
      console.error('❌ 크롤링 히스토리 저장 실패:', error)
    }
  }

  /**
   * 파일에서 히스토리 로드
   */
  async loadHistoryFromFile(): Promise<void> {
    try {
      const fs = await import('fs/promises')
      
      const filePath = getCrawlingHistoryPath()
      
      const content = await fs.readFile(filePath, 'utf-8')
      const historyData = JSON.parse(content)

      if (historyData.sessions) {
        this.sessions.clear()
        historyData.sessions.forEach((session: CrawlingSession) => {
          this.sessions.set(session.id, session)
        })
        console.log(`📄 크롤링 히스토리 로드 완료: ${this.sessions.size}개 세션`)
      }
      
    } catch (error) {
      console.log('📄 크롤링 히스토리 파일을 찾을 수 없습니다. 새로 시작합니다.')
    }
  }
}
