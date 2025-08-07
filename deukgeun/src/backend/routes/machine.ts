import { Router } from "express";
import {
  createMachine,
  getAllMachines,
  getMachineById,
  updateMachine,
  deleteMachine,
  filterMachines,
} from "../controllers/machineController";
import {
  validateCreateMachine,
  validateUpdateMachine,
  validateFilterQuery,
  validateId,
} from "../middlewares/validation";
import { machineRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

/**
 * Machine API Routes
 *
 * GET    /api/machines          - 모든 머신 조회
 * GET    /api/machines/filter   - 조건별 머신 필터링
 * GET    /api/machines/:id      - 특정 머신 조회
 * POST   /api/machines          - 새 머신 생성
 * PUT    /api/machines/:id      - 머신 정보 수정
 * DELETE /api/machines/:id      - 머신 삭제
 */

// 조회 라우트 (GET)
router.get("/", machineRateLimiter, getAllMachines);
router.get("/filter", machineRateLimiter, validateFilterQuery, filterMachines);
router.get("/:id", machineRateLimiter, validateId, getMachineById);

// 생성 라우트 (POST)
router.post("/", machineRateLimiter, validateCreateMachine, createMachine);

// 수정 라우트 (PUT)
router.put(
  "/:id",
  machineRateLimiter,
  validateId,
  validateUpdateMachine,
  updateMachine
);

// 삭제 라우트 (DELETE)
router.delete("/:id", machineRateLimiter, validateId, deleteMachine);

export default router;
