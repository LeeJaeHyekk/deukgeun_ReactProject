"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTransformer = void 0;
class UserTransformer {
    static toDTO(entity) {
        return {
            id: entity.id,
            email: entity.email,
            nickname: entity.nickname,
            phone: entity.phone,
            phoneNumber: entity.phone,
            gender: entity.gender,
            birthDate: entity.birthday,
            profileImage: entity.profileImage,
            role: entity.role,
            isActive: entity.isActive,
            isEmailVerified: entity.isEmailVerified,
            isPhoneVerified: entity.isPhoneVerified,
            name: entity.name,
            username: entity.username,
            lastLoginAt: entity.lastLoginAt,
            lastActivityAt: entity.lastActivityAt,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
    static toEntity(dto) {
        return {
            id: dto.id,
            email: dto.email,
            nickname: dto.nickname,
            phone: dto.phone,
            gender: dto.gender,
            birthday: dto.birthDate,
            profileImage: dto.profileImage,
            role: dto.role,
            isActive: dto.isActive,
            isEmailVerified: dto.isEmailVerified,
            isPhoneVerified: dto.isPhoneVerified,
            name: dto.name,
            username: dto.username,
            lastLoginAt: dto.lastLoginAt,
            lastActivityAt: dto.lastActivityAt,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
        };
    }
    static toDTOList(entities) {
        return entities.map(entity => UserTransformer.toDTO(entity));
    }
}
exports.UserTransformer = UserTransformer;
