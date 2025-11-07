"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMachinesByTarget = exports.getMachinesByDifficulty = exports.getMachinesByCategory = exports.filterMachines = exports.deleteMachine = exports.updateMachine = exports.getMachineById = exports.getAllMachines = exports.createMachine = void 0;
const machineService_1 = require("../services/machineService.cjs");
const index_1 = require("../transformers/index.cjs");
const logger_1 = require("../utils/logger.cjs");
let machineService = null;
function getMachineService() {
    if (!machineService) {
        machineService = new machineService_1.MachineService();
    }
    return machineService;
}
const createMachine = async (req, res) => {
    try {
        const machineData = req.body;
        const savedMachine = await getMachineService().createMachine(machineData);
        const machineDTO = (0, index_1.toMachineDTO)(savedMachine);
        console.log("=== Machine Created Successfully ===");
        console.log("Machine ID:", machineDTO.id);
        console.log("Machine Name:", machineDTO.name);
        console.log("Machine Name (EN):", machineDTO.nameEn);
        console.log("Category:", machineDTO.category);
        console.log("Difficulty Level:", machineDTO.difficulty);
        console.log("Target Muscles:", machineDTO.targetMuscles);
        console.log("Created At:", machineDTO.createdAt);
        console.log("Full Object:", JSON.stringify(machineDTO, null, 2));
        logger_1.logger.info(`Machine created - ID: ${machineDTO.id}, Name: ${machineDTO.name}`);
        res.status(201).json({
            message: "Machine created successfully",
            data: machineDTO,
        });
    }
    catch (error) {
        logger_1.logger.error("Machine creation failed:", error);
        res.status(400).json({
            message: error instanceof Error ? error.message : "Machine creation failed",
        });
    }
};
exports.createMachine = createMachine;
const getAllMachines = async (_, res) => {
    try {
        const machines = await getMachineService().getAllMachines();
        const machineDTOs = (0, index_1.toMachineDTOList)(machines);
        logger_1.logger.info(`Retrieved ${machineDTOs.length} machines`);
        res.status(200).json({
            message: "Machines retrieved successfully",
            data: machineDTOs,
            count: machineDTOs.length,
        });
    }
    catch (error) {
        logger_1.logger.error("Machine retrieval failed:", error);
        res.status(500).json({
            message: "Failed to retrieve machines",
        });
    }
};
exports.getAllMachines = getAllMachines;
const getMachineById = async (req, res) => {
    try {
        const { id } = req.params;
        const machine = await getMachineService().getMachineById(parseInt(id));
        if (!machine) {
            logger_1.logger.warn(`Machine not found - ID: ${id}`);
            return res.status(404).json({
                message: "Machine not found",
            });
        }
        const machineDTO = (0, index_1.toMachineDTO)(machine);
        logger_1.logger.info(`Machine retrieved - ID: ${id}`);
        res.status(200).json({
            message: "Machine retrieved successfully",
            data: machineDTO,
        });
    }
    catch (error) {
        logger_1.logger.error("Machine retrieval failed:", error);
        res.status(500).json({
            message: "Failed to retrieve machine",
        });
    }
};
exports.getMachineById = getMachineById;
const updateMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updated = await getMachineService().updateMachine(parseInt(id), updateData);
        if (!updated) {
            logger_1.logger.warn(`Machine not found for update - ID: ${id}`);
            return res.status(404).json({
                message: "Machine not found",
            });
        }
        logger_1.logger.info(`Machine updated - ID: ${id}, Name: ${updated.name}`);
        res.status(200).json({
            message: "Machine updated successfully",
            data: updated,
        });
    }
    catch (error) {
        logger_1.logger.error(`Machine update failed - ID: ${req.params.id}:`, error);
        res.status(500).json({
            message: "Failed to update machine",
        });
    }
};
exports.updateMachine = updateMachine;
const deleteMachine = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await getMachineService().deleteMachine(parseInt(id));
        if (!deleted) {
            logger_1.logger.warn(`Machine not found for deletion - ID: ${id}`);
            return res.status(404).json({
                message: "Machine not found",
            });
        }
        logger_1.logger.info(`Machine deleted - ID: ${id}`);
        res.status(200).json({
            message: "Machine deleted successfully",
        });
    }
    catch (error) {
        logger_1.logger.error(`Machine deletion failed - ID: ${req.params.id}:`, error);
        res.status(500).json({
            message: "Failed to delete machine",
        });
    }
};
exports.deleteMachine = deleteMachine;
const filterMachines = async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            difficulty: req.query.difficulty,
            target: req.query.target,
            search: req.query.search,
        };
        const result = await getMachineService().filterMachines(filters);
        logger_1.logger.info(`Filtered machines - Count: ${result.length}, Filters: ${JSON.stringify(filters)}`);
        res.status(200).json({
            message: "Machines filtered successfully",
            data: result,
            count: result.length,
            filters,
        });
    }
    catch (error) {
        logger_1.logger.error("Machine filtering failed:", error);
        res.status(500).json({
            message: "Failed to filter machines",
        });
    }
};
exports.filterMachines = filterMachines;
const getMachinesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const machines = await getMachineService().getMachinesByCategory(category);
        logger_1.logger.info(`Retrieved ${machines.length} machines by category: ${category}`);
        res.status(200).json({
            message: "Machines retrieved successfully by category",
            data: machines,
            count: machines.length,
            category,
        });
    }
    catch (error) {
        logger_1.logger.error(`Machine retrieval by category failed - Category: ${req.params.category}:`, error);
        res.status(500).json({
            message: "Failed to retrieve machines by category",
        });
    }
};
exports.getMachinesByCategory = getMachinesByCategory;
const getMachinesByDifficulty = async (req, res) => {
    try {
        const { difficulty } = req.params;
        const machines = await getMachineService().getMachinesByDifficulty(difficulty);
        logger_1.logger.info(`Retrieved ${machines.length} machines by difficulty: ${difficulty}`);
        res.status(200).json({
            message: "Machines retrieved successfully by difficulty",
            data: machines,
            count: machines.length,
            difficulty,
        });
    }
    catch (error) {
        logger_1.logger.error(`Machine retrieval by difficulty failed - Difficulty: ${req.params.difficulty}:`, error);
        res.status(500).json({
            message: "Failed to retrieve machines by difficulty",
        });
    }
};
exports.getMachinesByDifficulty = getMachinesByDifficulty;
const getMachinesByTarget = async (req, res) => {
    try {
        const { target } = req.params;
        const machines = await getMachineService().getMachinesByTarget(target);
        logger_1.logger.info(`Retrieved ${machines.length} machines by target: ${target}`);
        res.status(200).json({
            message: "Machines retrieved successfully by target",
            data: machines,
            count: machines.length,
            target,
        });
    }
    catch (error) {
        logger_1.logger.error(`Machine retrieval by target failed - Target: ${req.params.target}:`, error);
        res.status(500).json({
            message: "Failed to retrieve machines by target",
        });
    }
};
exports.getMachinesByTarget = getMachinesByTarget;
