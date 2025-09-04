// ============================================================================
// User Transformer
// ============================================================================

import { UserDTO } from "../types/backend.types.js"
import { User } from "../entities/User.js"

export class UserTransformer {
  static toDTO(entity: User): UserDTO {
    return {
      id: entity.id,
      email: entity.email,
      username: entity.username || entity.nickname,
      nickname: entity.nickname,
      phone: entity.phone,
      gender: entity.gender,
      birthday: entity.birthday,
      role: entity.role,
      profileImage: entity.profileImage,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastLoginAt: entity.lastLoginAt,
      isActive: entity.isActive,
      isVerified: entity.isEmailVerified,
      level: undefined,
      experience: undefined,
      streak: undefined,
    }
  }

  static toEntity(dto: UserDTO): Partial<User> {
    return {
      id: dto.id,
      email: dto.email,
      nickname: dto.nickname,
      phone: dto.phone,
      gender: dto.gender,
      birthday: dto.birthday,
      profileImage: dto.profileImage,
      role: dto.role,
      isActive: dto.isActive,
      isEmailVerified: dto.isVerified,
      username: dto.username,
      lastLoginAt: dto.lastLoginAt,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    }
  }

  static toDTOList(entities: User[]): UserDTO[] {
    return entities.map(entity => UserTransformer.toDTO(entity))
  }
}
