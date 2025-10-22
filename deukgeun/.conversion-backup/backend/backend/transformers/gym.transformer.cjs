"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymTransformer = void 0;
class GymTransformer {
    static toDTO(entity) {
        return {
            id: entity.id,
            name: entity.name,
            address: entity.address,
            phone: entity.phone,
            latitude: entity.latitude,
            longitude: entity.longitude,
            facilities: entity.facilities,
            openHour: entity.openHour,
            is24Hours: entity.is24Hours,
            hasGX: entity.hasGX,
            hasPT: entity.hasPT,
            hasGroupPT: entity.hasGroupPT,
            hasParking: entity.hasParking,
            hasShower: entity.hasShower,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        };
    }
    static toEntity(dto) {
        return {
            id: dto.id,
            name: dto.name,
            address: dto.address,
            phone: dto.phone,
            latitude: dto.latitude,
            longitude: dto.longitude,
            facilities: dto.facilities,
            openHour: dto.openHour,
            is24Hours: dto.is24Hours,
            hasGX: dto.hasGX,
            hasPT: dto.hasPT,
            hasGroupPT: dto.hasGroupPT,
            hasParking: dto.hasParking,
            hasShower: dto.hasShower,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt
        };
    }
    static toDTOList(entities) {
        return entities.map(entity => GymTransformer.toDTO(entity));
    }
}
exports.GymTransformer = GymTransformer;
