import { Router } from "express";
import { schedulerAPI } from "../services/autoUpdateScheduler";

const router = Router();

// 스케줄러 상태 조회
router.get("/status", (req, res) => {
  try {
    const status = schedulerAPI.status();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// 스케줄러 시작
router.post("/start", (req, res) => {
  try {
    const config = req.body;
    const scheduler = schedulerAPI.start(config);
    res.json({
      success: true,
      message: "스케줄러가 시작되었습니다.",
      data: scheduler.getStatus(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// 스케줄러 중지
router.post("/stop", (req, res) => {
  try {
    const result = schedulerAPI.stop();
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// 설정 업데이트
router.put("/config", (req, res) => {
  try {
    const config = req.body;
    const result = schedulerAPI.updateConfig(config);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// 수동 업데이트 실행
router.post("/manual-update", async (req, res) => {
  try {
    const { updateType } = req.body;
    const result = await schedulerAPI.manualUpdate(updateType);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// 즉시 업데이트 실행 (향상된 크롤링)
router.post("/update/enhanced", async (req, res) => {
  try {
    const result = await schedulerAPI.manualUpdate("enhanced");
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// 즉시 업데이트 실행 (기본 크롤링)
router.post("/update/basic", async (req, res) => {
  try {
    const result = await schedulerAPI.manualUpdate("basic");
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// 즉시 업데이트 실행 (멀티소스 크롤링)
router.post("/update/multisource", async (req, res) => {
  try {
    const result = await schedulerAPI.manualUpdate("multisource");
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

// 즉시 업데이트 실행 (고급 크롤링)
router.post("/update/advanced", async (req, res) => {
  try {
    const result = await schedulerAPI.manualUpdate("advanced");
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export default router;
