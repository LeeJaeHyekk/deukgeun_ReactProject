"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineService = void 0;
const databaseConfig_1 = require('config/databaseConfig');
const Machine_1 = require('entities/Machine');
class MachineService {
    constructor() {
        this.machineRepository = databaseConfig_1.AppDataSource.getRepository(Machine_1.Machine);
    }
    async createMachine(machineData) {
        const sanitizedData = this.sanitizeMachineData(machineData);
        const machine = this.machineRepository.create(sanitizedData);
        const savedMachine = await this.machineRepository.save(machine);
        return Array.isArray(savedMachine) ? savedMachine[0] : savedMachine;
    }
    async getAllMachines() {
        try {
            return await this.machineRepository.find({
                order: { name: "ASC" },
            });
        }
        catch (error) {
            console.error("기구 조회 오류:", error);
            return [];
        }
    }
    async getMachineById(id) {
        try {
            return await this.machineRepository.findOne({ where: { id } });
        }
        catch (error) {
            console.error("기구 조회 오류:", error);
            return null;
        }
    }
    async getMachineByKey(machineKey) {
        return await this.machineRepository.findOne({
            where: { machineKey: machineKey },
        });
    }
    async updateMachine(id, updateData) {
        try {
            const machine = await this.machineRepository.findOne({ where: { id } });
            if (!machine)
                return null;
            Object.assign(machine, updateData);
            return await this.machineRepository.save(machine);
        }
        catch (error) {
            console.error("기구 수정 오류:", error);
            return null;
        }
    }
    async deleteMachine(id) {
        try {
            const machine = await this.machineRepository.findOne({ where: { id } });
            if (!machine)
                return false;
            await this.machineRepository.remove(machine);
            return true;
        }
        catch (error) {
            console.error("기구 삭제 오류:", error);
            return false;
        }
    }
    async filterMachines(filters) {
        const query = this.machineRepository.createQueryBuilder("machine");
        if (filters.category) {
            query.andWhere("machine.category = :category", {
                category: filters.category,
            });
        }
        if (filters.difficulty) {
            query.andWhere("machine.difficulty_level = :difficulty", {
                difficulty: filters.difficulty,
            });
        }
        if (filters.target) {
            query.andWhere("JSON_CONTAINS(machine.target_muscle, :target)", {
                target: `"${filters.target}"`,
            });
        }
        return await query.getMany();
    }
    async getMachinesByCategory(category) {
        try {
            return await this.machineRepository.find({
                where: { category: category },
                order: { name: "ASC" },
            });
        }
        catch (error) {
            console.error("카테고리별 기구 조회 오류:", error);
            return [];
        }
    }
    async getMachinesByDifficulty(difficulty) {
        try {
            return await this.machineRepository.find({
                where: { difficulty: difficulty },
                order: { name: "ASC" },
            });
        }
        catch (error) {
            console.error("난이도별 기구 조회 오류:", error);
            return [];
        }
    }
    async getMachinesByTarget(target) {
        try {
            return await this.machineRepository
                .createQueryBuilder("machine")
                .where("JSON_CONTAINS(machine.target_muscle, :target)", {
                target: `"${target}"`,
            })
                .orderBy("machine.name", "ASC")
                .getMany();
        }
        catch (error) {
            console.error("타겟별 기구 조회 오류:", error);
            return [];
        }
    }
    sanitizeMachineData(data) {
        return {
            ...data,
            machineKey: this.sanitizeString(data.machineKey),
            name: this.sanitizeString(data.name),
            nameEn: data.nameEn ? this.sanitizeString(data.nameEn) : undefined,
            imageUrl: this.sanitizeString(data.imageUrl),
            shortDesc: this.sanitizeString(data.shortDesc),
            detailDesc: this.sanitizeString(data.detailDesc),
            positiveEffect: data.positiveEffect
                ? this.sanitizeString(data.positiveEffect)
                : undefined,
            videoUrl: data.videoUrl ? this.sanitizeString(data.videoUrl) : undefined,
            targetMuscles: data.targetMuscles
                ? data.targetMuscles.map(muscle => this.sanitizeString(muscle))
                : undefined,
        };
    }
    sanitizeString(str) {
        return str
            .replace(/[<>]/g, "")
            .replace(/javascript:/gi, "")
            .replace(/on\w+=/gi, "")
            .trim();
    }
}
exports.MachineService = MachineService;
