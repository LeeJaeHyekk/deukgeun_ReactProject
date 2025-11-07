"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeEquipmentRoutes = initializeEquipmentRoutes;
const express_1 = require("express");
const router = (0, express_1.Router)();
let equipmentService;
function initializeEquipmentRoutes(service) {
    equipmentService = service;
}
router.get('/', async (req, res) => {
    try {
        const { gymId, type, category, brand, isLatestModel, minQuantity, maxQuantity, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (gymId)
            filter.gymId = parseInt(gymId);
        if (type)
            filter.type = type;
        if (category)
            filter.category = category;
        if (brand)
            filter.brand = brand;
        if (isLatestModel !== undefined)
            filter.isLatestModel = isLatestModel === 'true';
        if (minQuantity)
            filter.minQuantity = parseInt(minQuantity);
        if (maxQuantity)
            filter.maxQuantity = parseInt(maxQuantity);
        const result = await equipmentService.getEquipmentList(filter, parseInt(page), parseInt(limit));
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('❌ 기구 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '기구 목록 조회에 실패했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await equipmentService.getEquipment(parseInt(id));
        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: '기구 정보를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            data: equipment
        });
    }
    catch (error) {
        console.error('❌ 기구 상세 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '기구 상세 조회에 실패했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        const createDto = req.body;
        const equipment = await equipmentService.createEquipment(createDto);
        res.status(201).json({
            success: true,
            data: equipment,
            message: '기구 정보가 성공적으로 생성되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 기구 생성 실패:', error);
        res.status(500).json({
            success: false,
            message: '기구 생성에 실패했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateDto = req.body;
        const equipment = await equipmentService.updateEquipment(parseInt(id), updateDto);
        res.json({
            success: true,
            data: equipment,
            message: '기구 정보가 성공적으로 업데이트되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 기구 업데이트 실패:', error);
        res.status(500).json({
            success: false,
            message: '기구 업데이트에 실패했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const success = await equipmentService.deleteEquipment(parseInt(id));
        if (!success) {
            return res.status(404).json({
                success: false,
                message: '기구 정보를 찾을 수 없습니다.'
            });
        }
        res.json({
            success: true,
            message: '기구 정보가 성공적으로 삭제되었습니다.'
        });
    }
    catch (error) {
        console.error('❌ 기구 삭제 실패:', error);
        res.status(500).json({
            success: false,
            message: '기구 삭제에 실패했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/gym/:gymId/summary', async (req, res) => {
    try {
        const { gymId } = req.params;
        const summary = await equipmentService.getGymEquipmentSummary(parseInt(gymId));
        res.json({
            success: true,
            data: summary
        });
    }
    catch (error) {
        console.error('❌ 헬스장 기구 요약 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '헬스장 기구 요약 조회에 실패했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
router.get('/statistics', async (req, res) => {
    try {
        const statistics = await equipmentService.getEquipmentStatistics();
        res.json({
            success: true,
            data: statistics
        });
    }
    catch (error) {
        console.error('❌ 기구 통계 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '기구 통계 조회에 실패했습니다.',
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
    }
});
exports.default = router;
