"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentService = void 0;
const equipment_1 = require("../../shared/types/equipment.cjs.cjs");
class EquipmentService {
    constructor(equipmentRepo, gymRepo) {
        this.equipmentRepo = equipmentRepo;
        this.gymRepo = gymRepo;
    }
    async createEquipment(createDto) {
        try {
            const equipment = this.equipmentRepo.create({
                gymId: createDto.gymId,
                type: createDto.type,
                category: createDto.category,
                name: createDto.name,
                quantity: createDto.quantity,
                brand: createDto.brand,
                model: createDto.model,
                isLatestModel: createDto.isLatestModel || false,
                weightRange: createDto.weightRange,
                equipmentVariant: createDto.equipmentVariant,
                additionalInfo: createDto.additionalInfo,
                confidence: createDto.confidence || 0.8,
                source: createDto.source || 'manual'
            });
            const savedEquipment = await this.equipmentRepo.save(equipment);
            console.log(`✅ 기구 정보 생성: ${savedEquipment.name}`);
            return this.mapToDTO(savedEquipment);
        }
        catch (error) {
            console.error('❌ 기구 정보 생성 실패:', error);
            throw error;
        }
    }
    async updateEquipment(id, updateDto) {
        try {
            const equipment = await this.equipmentRepo.findOne({ where: { id } });
            if (!equipment) {
                throw new Error(`기구 정보를 찾을 수 없습니다: ${id}`);
            }
            Object.assign(equipment, updateDto);
            equipment.updatedAt = new Date();
            const savedEquipment = await this.equipmentRepo.save(equipment);
            console.log(`✅ 기구 정보 업데이트: ${savedEquipment.name}`);
            return this.mapToDTO(savedEquipment);
        }
        catch (error) {
            console.error('❌ 기구 정보 업데이트 실패:', error);
            throw error;
        }
    }
    async deleteEquipment(id) {
        try {
            const result = await this.equipmentRepo.delete(id);
            console.log(`✅ 기구 정보 삭제: ${id}`);
            return result.affected > 0;
        }
        catch (error) {
            console.error('❌ 기구 정보 삭제 실패:', error);
            throw error;
        }
    }
    async getEquipment(id) {
        try {
            const equipment = await this.equipmentRepo.findOne({
                where: { id },
                relations: ['gym']
            });
            return equipment ? this.mapToDTO(equipment) : null;
        }
        catch (error) {
            console.error('❌ 기구 정보 조회 실패:', error);
            throw error;
        }
    }
    async getEquipmentList(filter = {}, page = 1, limit = 20) {
        try {
            const queryBuilder = this.equipmentRepo.createQueryBuilder('equipment')
                .leftJoinAndSelect('equipment.gym', 'gym');
            if (filter.gymId) {
                queryBuilder.andWhere('equipment.gymId = :gymId', { gymId: filter.gymId });
            }
            if (filter.type) {
                queryBuilder.andWhere('equipment.type = :type', { type: filter.type });
            }
            if (filter.category) {
                queryBuilder.andWhere('equipment.category = :category', { category: filter.category });
            }
            if (filter.brand) {
                queryBuilder.andWhere('equipment.brand LIKE :brand', { brand: `%${filter.brand}%` });
            }
            if (filter.isLatestModel !== undefined) {
                queryBuilder.andWhere('equipment.isLatestModel = :isLatestModel', { isLatestModel: filter.isLatestModel });
            }
            if (filter.minQuantity) {
                queryBuilder.andWhere('equipment.quantity >= :minQuantity', { minQuantity: filter.minQuantity });
            }
            if (filter.maxQuantity) {
                queryBuilder.andWhere('equipment.quantity <= :maxQuantity', { maxQuantity: filter.maxQuantity });
            }
            const offset = (page - 1) * limit;
            queryBuilder.skip(offset).take(limit);
            queryBuilder.orderBy('equipment.createdAt', 'DESC');
            const [equipments, total] = await queryBuilder.getManyAndCount();
            return {
                equipments: equipments.map(equipment => this.mapToDTO(equipment)),
                total,
                page,
                limit
            };
        }
        catch (error) {
            console.error('❌ 기구 목록 조회 실패:', error);
            throw error;
        }
    }
    async getGymEquipmentSummary(gymId) {
        try {
            const equipments = await this.equipmentRepo.find({
                where: { gymId },
                order: { category: 'ASC' }
            });
            const summary = {
                gymId,
                totalEquipment: equipments.length,
                cardioEquipment: {
                    total: 0,
                    byCategory: {}
                },
                weightEquipment: {
                    total: 0,
                    byCategory: {}
                },
                equipmentDetails: equipments.map(equipment => this.mapToDTO(equipment))
            };
            for (const equipment of equipments) {
                if (equipment.type === equipment_1.EquipmentType.CARDIO) {
                    summary.cardioEquipment.total += equipment.quantity;
                    summary.cardioEquipment.byCategory[equipment.category] =
                        (summary.cardioEquipment.byCategory[equipment.category] || 0) + equipment.quantity;
                }
                else if (equipment.type === equipment_1.EquipmentType.WEIGHT) {
                    summary.weightEquipment.total += equipment.quantity;
                    summary.weightEquipment.byCategory[equipment.category] =
                        (summary.weightEquipment.byCategory[equipment.category] || 0) + equipment.quantity;
                }
            }
            return summary;
        }
        catch (error) {
            console.error('❌ 헬스장 기구 요약 조회 실패:', error);
            throw error;
        }
    }
    async crawlAndSaveEquipment(gymId, gymName, gymAddress) {
        try {
            console.log(`🔍 헬스장 기구 정보 크롤링 시작: ${gymName}`);
            await this.equipmentRepo.delete({
                gymId,
                source: 'crawled'
            });
            const crawledData = [];
            const savedEquipments = [];
            for (const equipmentData of crawledData) {
                try {
                    const createDto = {
                        gymId,
                        type: this.getEquipmentType(equipmentData.category),
                        category: equipmentData.category,
                        name: equipmentData.name,
                        quantity: equipmentData.quantity || 1,
                        brand: equipmentData.brand,
                        model: equipmentData.model,
                        isLatestModel: equipmentData.isLatestModel,
                        weightRange: equipmentData.weightRange,
                        equipmentVariant: equipmentData.equipmentVariant,
                        additionalInfo: equipmentData.additionalInfo,
                        confidence: equipmentData.confidence,
                        source: 'crawled'
                    };
                    const savedEquipment = await this.createEquipment(createDto);
                    savedEquipments.push(savedEquipment);
                }
                catch (error) {
                    console.error(`❌ 기구 정보 저장 실패: ${equipmentData.name}`, error);
                }
            }
            console.log(`✅ 헬스장 기구 정보 크롤링 완료: ${gymName} - ${savedEquipments.length}개 저장`);
            return savedEquipments;
        }
        catch (error) {
            console.error('❌ 헬스장 기구 정보 크롤링 실패:', error);
            throw error;
        }
    }
    async getEquipmentStatistics() {
        try {
            const totalGyms = await this.gymRepo.count();
            const totalEquipment = await this.equipmentRepo.count();
            const categoryStats = await this.equipmentRepo
                .createQueryBuilder('equipment')
                .select('equipment.category', 'category')
                .addSelect('SUM(equipment.quantity)', 'count')
                .groupBy('equipment.category')
                .getRawMany();
            const brandStats = await this.equipmentRepo
                .createQueryBuilder('equipment')
                .select('equipment.brand', 'brand')
                .addSelect('SUM(equipment.quantity)', 'count')
                .where('equipment.brand IS NOT NULL')
                .groupBy('equipment.brand')
                .orderBy('count', 'DESC')
                .limit(10)
                .getRawMany();
            const typeStats = await this.equipmentRepo
                .createQueryBuilder('equipment')
                .select('equipment.type', 'type')
                .addSelect('SUM(equipment.quantity)', 'count')
                .groupBy('equipment.type')
                .getRawMany();
            const statistics = {
                totalGyms,
                totalEquipment,
                averageEquipmentPerGym: totalGyms > 0 ? Math.round(totalEquipment / totalGyms) : 0,
                mostCommonEquipment: categoryStats
                    .sort((a, b) => parseInt(b.count) - parseInt(a.count))
                    .slice(0, 10)
                    .map(stat => ({
                    category: stat.category,
                    count: parseInt(stat.count)
                })),
                brandDistribution: brandStats.map(stat => ({
                    brand: stat.brand,
                    count: parseInt(stat.count)
                })),
                equipmentByType: typeStats.map(stat => ({
                    type: stat.type,
                    count: parseInt(stat.count),
                    percentage: totalEquipment > 0 ? Math.round((parseInt(stat.count) / totalEquipment) * 100) : 0
                }))
            };
            return statistics;
        }
        catch (error) {
            console.error('❌ 기구 통계 조회 실패:', error);
            throw error;
        }
    }
    getEquipmentType(category) {
        const cardioCategories = [
            equipment_1.EquipmentCategory.TREADMILL,
            equipment_1.EquipmentCategory.BIKE,
            equipment_1.EquipmentCategory.STEPPER,
            equipment_1.EquipmentCategory.ROWING_MACHINE,
            equipment_1.EquipmentCategory.CROSS_TRAINER,
            equipment_1.EquipmentCategory.STAIR_MASTER,
            equipment_1.EquipmentCategory.SKI_MACHINE
        ];
        return cardioCategories.includes(category) ? equipment_1.EquipmentType.CARDIO : equipment_1.EquipmentType.WEIGHT;
    }
    mapToDTO(equipment) {
        return {
            id: equipment.id,
            gymId: equipment.gymId,
            type: equipment.type,
            category: equipment.category,
            name: equipment.name,
            quantity: equipment.quantity,
            brand: equipment.brand,
            model: equipment.model,
            isLatestModel: equipment.isLatestModel,
            weightRange: equipment.weightRange,
            equipmentVariant: equipment.equipmentVariant,
            additionalInfo: equipment.additionalInfo,
            confidence: equipment.confidence,
            source: equipment.source,
            createdAt: equipment.createdAt,
            updatedAt: equipment.updatedAt
        };
    }
}
exports.EquipmentService = EquipmentService;
