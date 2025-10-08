import { Request, Response } from "express"
import { MachineService } from "../services/machineService"
import {
  validateMachine,
  validateMachineUpdate,
} from "../middlewares/mixValidation"
import { machineTransformer } from "../transformers/mixTransformer"
import { logger } from "../utils/logger"

/**
 * Machine Controller - Updated to use mix.json configuration
 *
 * This example shows how to refactor existing controllers to use the new
 * mix-based validation and transformation system.
 */
export class MachineController {
  private machineService: MachineService

  constructor() {
    this.machineService = new MachineService()
  }

  /**
   * 모든 Machine 조회 API
   * GET /api/machines
   */
  getAllMachines = async (_: Request, res: Response) => {
    try {
      const machines = await this.machineService.getAllMachines()

      // Transform entities to DTOs using mix transformer
      const machineDtos = machines.map(machine =>
        machineTransformer.toDto(machine)
      )

      logger.info(`Retrieved ${machines.length} machines`)

      res.status(200).json({
        message: "Machines retrieved successfully",
        data: machineDtos,
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
  getMachineById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const machine = await this.machineService.getMachineById(parseInt(id))

      if (!machine) {
        return res.status(404).json({
          message: "Machine not found",
        })
      }

      // Transform entity to DTO
      const machineDto = machineTransformer.toDto(machine)

      res.status(200).json({
        message: "Machine retrieved successfully",
        data: machineDto,
      })
    } catch (error) {
      logger.error("Machine retrieval failed:", error)
      res.status(500).json({
        message: "Failed to retrieve machine",
      })
    }
  }

  /**
   * Machine 생성 API
   * POST /api/machines
   *
   * Uses mix-based validation middleware
   */
  createMachine = async (req: Request, res: Response) => {
    try {
      // Validation is handled by middleware: validateMachine
      const createData = req.body

      // Transform DTO to entity
      const machineData = machineTransformer.toEntity(createData)

      const machine = await this.machineService.createMachine(machineData)

      // Transform entity to DTO for response
      const machineDto = machineTransformer.toDto(machine)

      logger.info(`Created machine: ${machine.id}`)

      res.status(201).json({
        message: "Machine created successfully",
        data: machineDto,
      })
    } catch (error) {
      logger.error("Machine creation failed:", error)
      res.status(500).json({
        message: "Failed to create machine",
      })
    }
  }

  /**
   * Machine 수정 API
   * PUT /api/machines/:id
   *
   * Uses mix-based validation middleware
   */
  updateMachine = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      // Validation is handled by middleware: validateMachineUpdate
      const updateData = req.body

      // Transform DTO to entity
      const machineData = machineTransformer.toEntity(updateData)

      const machine = await this.machineService.updateMachine(
        parseInt(id),
        machineData
      )

      if (!machine) {
        return res.status(404).json({
          message: "Machine not found",
        })
      }

      // Transform entity to DTO for response
      const machineDto = machineTransformer.toDto(machine)

      logger.info(`Updated machine: ${id}`)

      res.status(200).json({
        message: "Machine updated successfully",
        data: machineDto,
      })
    } catch (error) {
      logger.error("Machine update failed:", error)
      res.status(500).json({
        message: "Failed to update machine",
      })
    }
  }

  /**
   * Machine 삭제 API
   * DELETE /api/machines/:id
   */
  deleteMachine = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const success = await this.machineService.deleteMachine(parseInt(id))

      if (!success) {
        return res.status(404).json({
          message: "Machine not found",
        })
      }

      logger.info(`Deleted machine: ${id}`)

      res.status(200).json({
        message: "Machine deleted successfully",
      })
    } catch (error) {
      logger.error("Machine deletion failed:", error)
      res.status(500).json({
        message: "Failed to delete machine",
      })
    }
  }

  /**
   * Machine 필터링 API
   * GET /api/machines/filter
   */
  filterMachines = async (req: Request, res: Response) => {
    try {
      const { category, difficulty, target } = req.query as any

      const machines = await this.machineService.filterMachines({
        category,
        difficulty,
        target,
      })

      // Transform entities to DTOs
      const machineDtos = machines.map(machine =>
        machineTransformer.toDto(machine)
      )

      res.status(200).json({
        message: "Machines filtered successfully",
        data: machineDtos,
        count: machines.length,
        filters: { category, difficulty, target },
      })
    } catch (error) {
      logger.error("Machine filtering failed:", error)
      res.status(500).json({
        message: "Failed to filter machines",
      })
    }
  }
}

// Export controller instance
export const machineController = new MachineController()

// Export individual methods for route binding
export const {
  getAllMachines,
  getMachineById,
  createMachine,
  updateMachine,
  deleteMachine,
  filterMachines,
} = machineController

/**
 * Route setup example with mix-based validation:
 *
 * import { validateMachine, validateMachineUpdate } from '../middlewares/mixValidation'
 *
 * router.get('/', getAllMachines)
 * router.get('/:id', getMachineById)
 * router.post('/', validateMachine, createMachine)  // Mix validation
 * router.put('/:id', validateMachineUpdate, updateMachine)  // Mix validation
 * router.delete('/:id', deleteMachine)
 * router.get('/filter', filterMachines)
 */
