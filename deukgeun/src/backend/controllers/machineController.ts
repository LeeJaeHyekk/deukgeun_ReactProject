import { Request, Response } from "express"
import { MachineService } from "../services/machineService"
import {
  CreateMachineRequest,
  UpdateMachineRequest,
  MachineFilterQuery,
} from "../types/machine"
import type { MachineListResponse } from "../../types/machine"
import { logger } from "../utils/logger"

// Machine 서비스 인스턴스 생성 (지연 초기화)
let machineService: MachineService | null = null

function getMachineService(): MachineService {
  if (!machineService) {
    machineService = new MachineService()
  }
  return machineService
}

/**
 * Machine 생성 API
 * POST /api/machines
 */
export const createMachine = async (req: Request, res: Response) => {
  try {
    const machineData: CreateMachineRequest = req.body
    const savedMachine = await getMachineService().createMachine(machineData)

    // 성공 로그 출력
    console.log("=== Machine Created Successfully ===")
    console.log("Machine ID:", savedMachine.id)
    console.log("Machine Name (KO):", savedMachine.name_ko)
    console.log("Machine Name (EN):", savedMachine.name_en)
    console.log("Category:", savedMachine.category)
    console.log("Difficulty Level:", savedMachine.difficulty_level)
    console.log("Target Muscle:", savedMachine.target_muscle)
    console.log("Created At:", savedMachine.created_at)
    console.log("Full Object:", JSON.stringify(savedMachine, null, 2))

    logger.info(
      `Machine created - ID: ${savedMachine.id}, Name: ${savedMachine.name_ko}`
    )

    res.status(201).json({
      message: "Machine created successfully",
      data: savedMachine,
    })
  } catch (error) {
    logger.error("Machine creation failed:", error)
    res.status(400).json({
      message:
        error instanceof Error ? error.message : "Machine creation failed",
    })
  }
}

/**
 * 모든 Machine 조회 API
 * GET /api/machines
 */
export const getAllMachines = async (_: Request, res: Response) => {
  try {
    const machines = await getMachineService().getAllMachines()

    logger.info(`Retrieved ${machines.length} machines`)

    res.status(200).json({
      message: "Machines retrieved successfully",
      data: machines,
      count: machines.length,
    })
  } catch (error) {
    logger.error("Machine retrieval failed:", error)
    res.status(500).json({
      message: "Failed to retrieve machines",
    })
  }
}

/**
 * ID로 Machine 조회 API
 * GET /api/machines/:id
 */
export const getMachineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const machine = await getMachineService().getMachineById(parseInt(id))

    if (!machine) {
      logger.warn(`Machine not found - ID: ${id}`)
      return res.status(404).json({
        message: "Machine not found",
      })
    }

    logger.info(`Machine retrieved - ID: ${id}`)

    res.status(200).json({
      message: "Machine retrieved successfully",
      data: machine,
    })
  } catch (error) {
    logger.error(`Machine retrieval failed - ID: ${req.params.id}:`, error)
    res.status(500).json({
      message: "Failed to retrieve machine",
    })
  }
}

/**
 * Machine 업데이트 API
 * PUT /api/machines/:id
 */
export const updateMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updateData: UpdateMachineRequest = req.body

    const updated = await getMachineService().updateMachine(
      parseInt(id),
      updateData
    )

    if (!updated) {
      logger.warn(`Machine not found for update - ID: ${id}`)
      return res.status(404).json({
        message: "Machine not found",
      })
    }

    logger.info(`Machine updated - ID: ${id}, Name: ${updated.name_ko}`)

    res.status(200).json({
      message: "Machine updated successfully",
      data: updated,
    })
  } catch (error) {
    logger.error(`Machine update failed - ID: ${req.params.id}:`, error)
    res.status(500).json({
      message: "Failed to update machine",
    })
  }
}

/**
 * Machine 삭제 API
 * DELETE /api/machines/:id
 */
export const deleteMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const deleted = await getMachineService().deleteMachine(parseInt(id))

    if (!deleted) {
      logger.warn(`Machine not found for deletion - ID: ${id}`)
      return res.status(404).json({
        message: "Machine not found",
      })
    }

    logger.info(`Machine deleted - ID: ${id}`)

    res.status(200).json({
      message: "Machine deleted successfully",
    })
  } catch (error) {
    logger.error(`Machine deletion failed - ID: ${req.params.id}:`, error)
    res.status(500).json({
      message: "Failed to delete machine",
    })
  }
}

/**
 * Machine 필터링 API
 * GET /api/machines/filter
 */
export const filterMachines = async (req: Request, res: Response) => {
  try {
    const filters: MachineFilterQuery = {
      category: req.query.category as string,
      difficulty: req.query.difficulty as string,
      target: req.query.target as string,
    }

    const result = await getMachineService().filterMachines(filters)

    logger.info(
      `Filtered machines - Count: ${result.length}, Filters: ${JSON.stringify(
        filters
      )}`
    )

    res.status(200).json({
      message: "Machines filtered successfully",
      data: result,
      count: result.length,
      filters,
    })
  } catch (error) {
    logger.error("Machine filtering failed:", error)
    res.status(500).json({
      message: "Failed to filter machines",
    })
  }
}
