const { Router  } = require('express');
const { createMachine, getAllMachines, getMachineById, updateMachine, deleteMachine, filterMachines, getMachinesByCategory, getMachinesByDifficulty, getMachinesByTarget,  } = require('../controllers/machineController');
// const { //   validateMachine,
//   validateMachineUpdate,
//   validateId,
//  } = require('../middlewares/mixValidation')
const { machineRateLimiter  } = require('../middlewares/rateLimiter');
const router = Router();
/**
 * Machine API Routes
 *
 * GET    /api/machines                    - 모든 머신 조회
 * GET    /api/machines/filter             - 조건별 머신 필터링
 * GET    /api/machines/category/:category - 카테고리별 머신 조회
 * GET    /api/machines/difficulty/:level  - 난이도별 머신 조회
 * GET    /api/machines/target/:target     - 타겟별 머신 조회
 * GET    /api/machines/:id                - 특정 머신 조회
 * POST   /api/machines                    - 새 머신 생성
 * PUT    /api/machines/:id                - 머신 정보 수정
 * DELETE /api/machines/:id                - 머신 삭제
 */
// 조회 라우트 (GET)
router.get("/", machineRateLimiter, getAllMachines);
router.get("/filter", machineRateLimiter, filterMachines);
router.get("/category/:category", machineRateLimiter, getMachinesByCategory);
router.get("/difficulty/:difficulty", machineRateLimiter, getMachinesByDifficulty);
router.get("/target/:target", machineRateLimiter, getMachinesByTarget);
router.get("/:id", machineRateLimiter, getMachineById);
// 생성 라우트 (POST)
router.post("/", machineRateLimiter, createMachine);
// 수정 라우트 (PUT)
router.put("/:id", machineRateLimiter, updateMachine);
// 삭제 라우트 (DELETE)
router.delete("/:id", machineRateLimiter, deleteMachine);
module.exports = router;
