import { Router, Request, Response } from 'express'
import { EquipmentService } from '../services/equipmentService'
import { 
  CreateEquipmentDTO, 
  UpdateEquipmentDTO, 
  EquipmentSearchFilter,
  EquipmentCategory,
  EquipmentType
} from '../../shared/types/equipment'

const router = Router()

// EquipmentService 인스턴스 (실제 구현에서는 DI 컨테이너에서 주입)
let equipmentService: EquipmentService

export function initializeEquipmentRoutes(service: EquipmentService) {
  equipmentService = service
}

/**
 * @route GET /api/equipment
 * @desc 기구 목록 조회
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      gymId,
      type,
      category,
      brand,
      isLatestModel,
      minQuantity,
      maxQuantity,
      page = 1,
      limit = 20
    } = req.query

    const filter: EquipmentSearchFilter = {}
    
    if (gymId) filter.gymId = parseInt(gymId as string)
    if (type) filter.type = type as EquipmentType
    if (category) filter.category = category as EquipmentCategory
    if (brand) filter.brand = brand as string
    if (isLatestModel !== undefined) filter.isLatestModel = isLatestModel === 'true'
    if (minQuantity) filter.minQuantity = parseInt(minQuantity as string)
    if (maxQuantity) filter.maxQuantity = parseInt(maxQuantity as string)

    const result = await equipmentService.getEquipmentList(
      filter,
      parseInt(page as string),
      parseInt(limit as string)
    )

    res.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('❌ 기구 목록 조회 실패:', error)
    res.status(500).json({
      success: false,
      message: '기구 목록 조회에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    })
  }
})

/**
 * @route GET /api/equipment/:id
 * @desc 기구 상세 정보 조회
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const equipment = await equipmentService.getEquipment(parseInt(id))

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: '기구 정보를 찾을 수 없습니다.'
      })
    }

    res.json({
      success: true,
      data: equipment
    })

  } catch (error) {
    console.error('❌ 기구 상세 조회 실패:', error)
    res.status(500).json({
      success: false,
      message: '기구 상세 조회에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    })
  }
})

/**
 * @route POST /api/equipment
 * @desc 기구 정보 생성
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const createDto: CreateEquipmentDTO = req.body
    const equipment = await equipmentService.createEquipment(createDto)

    res.status(201).json({
      success: true,
      data: equipment,
      message: '기구 정보가 성공적으로 생성되었습니다.'
    })

  } catch (error) {
    console.error('❌ 기구 생성 실패:', error)
    res.status(500).json({
      success: false,
      message: '기구 생성에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    })
  }
})

/**
 * @route PUT /api/equipment/:id
 * @desc 기구 정보 업데이트
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateDto: UpdateEquipmentDTO = req.body
    const equipment = await equipmentService.updateEquipment(parseInt(id), updateDto)

    res.json({
      success: true,
      data: equipment,
      message: '기구 정보가 성공적으로 업데이트되었습니다.'
    })

  } catch (error) {
    console.error('❌ 기구 업데이트 실패:', error)
    res.status(500).json({
      success: false,
      message: '기구 업데이트에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    })
  }
})

/**
 * @route DELETE /api/equipment/:id
 * @desc 기구 정보 삭제
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const success = await equipmentService.deleteEquipment(parseInt(id))

    if (!success) {
      return res.status(404).json({
        success: false,
        message: '기구 정보를 찾을 수 없습니다.'
      })
    }

    res.json({
      success: true,
      message: '기구 정보가 성공적으로 삭제되었습니다.'
    })

  } catch (error) {
    console.error('❌ 기구 삭제 실패:', error)
    res.status(500).json({
      success: false,
      message: '기구 삭제에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    })
  }
})

/**
 * @route GET /api/equipment/gym/:gymId/summary
 * @desc 헬스장별 기구 요약 정보
 */
router.get('/gym/:gymId/summary', async (req: Request, res: Response) => {
  try {
    const { gymId } = req.params
    const summary = await equipmentService.getGymEquipmentSummary(parseInt(gymId))

    res.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error('❌ 헬스장 기구 요약 조회 실패:', error)
    res.status(500).json({
      success: false,
      message: '헬스장 기구 요약 조회에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    })
  }
})

/**
 * @route GET /api/equipment/statistics
 * @desc 기구 통계 정보
 */
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const statistics = await equipmentService.getEquipmentStatistics()

    res.json({
      success: true,
      data: statistics
    })

  } catch (error) {
    console.error('❌ 기구 통계 조회 실패:', error)
    res.status(500).json({
      success: false,
      message: '기구 통계 조회에 실패했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    })
  }
})

export default router
