const { MachineService  } = require('../services/machineService');
const { toMachineDTO, toMachineDTOList  } = require('../../../../transformers/index');
const { logger  } = require('../utils/logger');
// Machine 서비스 인스턴스 생성 (지연 초기화)
let machineService = null;
function getMachineService() {
    if (!machineService) {
        machineService = new MachineService();
    }
module.exports.getMachineService = getMachineService
    return machineService;
}
/**
 * Machine 생성 API
 * POST /api/machines
 */
const createMachine
module.exports.createMachine = createMachine = async (req, res) => {
    try {
        const machineData = req.body;
        const savedMachine = await getMachineService().createMachine(machineData);
        // DTO 변환 적용
        const machineDTO = toMachineDTO(savedMachine);
        // 성공 로그 출력
        console.log("=== Machine Created Successfully ===");
        console.log("Machine ID:", machineDTO.id);
        console.log("Machine Name:", machineDTO.name);
        console.log("Machine Name (EN):", machineDTO.nameEn);
        console.log("Category:", machineDTO.category);
        console.log("Difficulty Level:", machineDTO.difficulty);
        console.log("Target Muscles:", machineDTO.targetMuscles);
        console.log("Created At:", machineDTO.createdAt);
        console.log("Full Object:", JSON.stringify(machineDTO, null, 2));
        logger.info(`Machine created - ID: ${machineDTO.id}, Name: ${machineDTO.name}`);
        res.status(201).json({
            message: "Machine created successfully",
            data: machineDTO,
        });
    }
    catch (error) {
        logger.error("Machine creation failed:", error);
        res.status(400).json({
            message: error instanceof Error ? error.message : "Machine creation failed",
        });
    }
};
/**
 * 모든 Machine 조회 API
 * GET /api/machines
 */
const getAllMachines
module.exports.getAllMachines = getAllMachines = async (_, res) => {
    try {
        const machines = await getMachineService().getAllMachines();
        // DTO 변환 적용
        const machineDTOs = toMachineDTOList(machines);
        logger.info(`Retrieved ${machineDTOs.length} machines`);
        res.status(200).json({
            message: "Machines retrieved successfully",
            data: machineDTOs,
            count: machineDTOs.length,
        });
    }
    catch (error) {
        logger.error("Machine retrieval failed:", error);
        res.status(500).json({
            message: "Failed to retrieve machines",
        });
    }
};
/**
 * ID로 Machine 조회 API
 * GET /api/machines/:id
 */
const getMachineById
module.exports.getMachineById = getMachineById = async (req, res) => {
    try {
        const { id } = req.params;
        const machine = await getMachineService().getMachineById(parseInt(id));
        if (!machine) {
            logger.warn(`Machine not found - ID: ${id}`);
            return res.status(404).json({
                message: "Machine not found",
            });
        }
        // DTO 변환 적용
        const machineDTO = toMachineDTO(machine);
        logger.info(`Machine retrieved - ID: ${id}`);
        res.status(200).json({
            message: "Machine retrieved successfully",
            data: machineDTO,
        });
    }
    catch (error) {
        logger.error("Machine retrieval failed:", error);
        res.status(500).json({
            message: "Failed to retrieve machine",
        });
    }
};
/**
 * Machine 업데이트 API
 * PUT /api/machines/:id
 */
const updateMachine
module.exports.updateMachine = updateMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updated = await getMachineService().updateMachine(parseInt(id), updateData);
        if (!updated) {
            logger.warn(`Machine not found for update - ID: ${id}`);
            return res.status(404).json({
                message: "Machine not found",
            });
        }
        logger.info(`Machine updated - ID: ${id}, Name: ${updated.name}`);
        res.status(200).json({
            message: "Machine updated successfully",
            data: updated,
        });
    }
    catch (error) {
        logger.error(`Machine update failed - ID: ${req.params.id}:`, error);
        res.status(500).json({
            message: "Failed to update machine",
        });
    }
};
/**
 * Machine 삭제 API
 * DELETE /api/machines/:id
 */
const deleteMachine
module.exports.deleteMachine = deleteMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await getMachineService().deleteMachine(parseInt(id));
        if (!deleted) {
            logger.warn(`Machine not found for deletion - ID: ${id}`);
            return res.status(404).json({
                message: "Machine not found",
            });
        }
        logger.info(`Machine deleted - ID: ${id}`);
        res.status(200).json({
            message: "Machine deleted successfully",
        });
    }
    catch (error) {
        logger.error(`Machine deletion failed - ID: ${req.params.id}:`, error);
        res.status(500).json({
            message: "Failed to delete machine",
        });
    }
};
/**
 * Machine 필터링 API
 * GET /api/machines/filter
 */
const filterMachines
module.exports.filterMachines = filterMachines = async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            difficulty: req.query.difficulty,
            target: req.query.target,
            search: req.query.search,
        };
        const result = await getMachineService().filterMachines(filters);
        logger.info(`Filtered machines - Count: ${result.length}, Filters: ${JSON.stringify(filters)}`);
        res.status(200).json({
            message: "Machines filtered successfully",
            data: result,
            count: result.length,
            filters,
        });
    }
    catch (error) {
        logger.error("Machine filtering failed:", error);
        res.status(500).json({
            message: "Failed to filter machines",
        });
    }
};
/**
 * 카테고리별 Machine 조회 API
 * GET /api/machines/category/:category
 */
const getMachinesByCategory
module.exports.getMachinesByCategory = getMachinesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const machines = await getMachineService().getMachinesByCategory(category);
        logger.info(`Retrieved ${machines.length} machines by category: ${category}`);
        res.status(200).json({
            message: "Machines retrieved successfully by category",
            data: machines,
            count: machines.length,
            category,
        });
    }
    catch (error) {
        logger.error(`Machine retrieval by category failed - Category: ${req.params.category}:`, error);
        res.status(500).json({
            message: "Failed to retrieve machines by category",
        });
    }
};
/**
 * 난이도별 Machine 조회 API
 * GET /api/machines/difficulty/:difficulty
 */
const getMachinesByDifficulty
module.exports.getMachinesByDifficulty = getMachinesByDifficulty = async (req, res) => {
    try {
        const { difficulty } = req.params;
        const machines = await getMachineService().getMachinesByDifficulty(difficulty);
        logger.info(`Retrieved ${machines.length} machines by difficulty: ${difficulty}`);
        res.status(200).json({
            message: "Machines retrieved successfully by difficulty",
            data: machines,
            count: machines.length,
            difficulty,
        });
    }
    catch (error) {
        logger.error(`Machine retrieval by difficulty failed - Difficulty: ${req.params.difficulty}:`, error);
        res.status(500).json({
            message: "Failed to retrieve machines by difficulty",
        });
    }
};
/**
 * 타겟별 Machine 조회 API
 * GET /api/machines/target/:target
 */
const getMachinesByTarget
module.exports.getMachinesByTarget = getMachinesByTarget = async (req, res) => {
    try {
        const { target } = req.params;
        const machines = await getMachineService().getMachinesByTarget(target);
        logger.info(`Retrieved ${machines.length} machines by target: ${target}`);
        res.status(200).json({
            message: "Machines retrieved successfully by target",
            data: machines,
            count: machines.length,
            target,
        });
    }
    catch (error) {
        logger.error(`Machine retrieval by target failed - Target: ${req.params.target}:`, error);
        res.status(500).json({
            message: "Failed to retrieve machines by target",
        });
    }
};
