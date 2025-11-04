/**
 * 크롤링 관련 API 엔드포인트
 * - 크롤링 상태 조회
 * - 수동 크롤링 실행
 */

import { Router } from 'express'
import { weeklyCrawlingScheduler } from '@backend/schedulers/weeklyCrawlingScheduler'

const router = Router()

/**
 * @route GET /api/crawling/status
 * @desc 크롤링 상태 조회
 */
router.get('/status', (req, res) => {
  try {
    const status = weeklyCrawlingScheduler.getStatus()
    
    res.json({
      success: true,
      data: {
        ...status,
        nextRunISO: status.nextRun ? status.nextRun.toISOString() : null,
        lastRunISO: status.lastRun ? status.lastRun.toISOString() : null,
        lastRunDurationSeconds: status.lastRunDuration 
          ? (status.lastRunDuration / 1000).toFixed(2) 
          : null
      }
    })
  } catch (error) {
    console.error('크롤링 상태 조회 실패:', error)
    res.status(500).json({
      success: false,
      message: '크롤링 상태 조회 실패',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

/**
 * @route POST /api/crawling/run
 * @desc 수동 크롤링 실행
 */
router.post('/run', async (req, res) => {
  try {
    const result = await weeklyCrawlingScheduler.runManual()
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      })
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      })
    }
  } catch (error) {
    console.error('수동 크롤링 실행 실패:', error)
    res.status(500).json({
      success: false,
      message: '수동 크롤링 실행 실패',
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

export default router

