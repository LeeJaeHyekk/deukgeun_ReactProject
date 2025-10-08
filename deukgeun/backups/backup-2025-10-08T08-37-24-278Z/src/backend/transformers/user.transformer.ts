// ============================================================================
// User Transformer
// ============================================================================

import { UserDTO } from "../../shared/types/dto/user.dto"
import { User } from "../entities/User"

export class UserTransformer {
  static toDTO(entity: User): UserDTO {
    return {
      id: entity.id,
      email: entity.email,
      nickname: entity.nickname,
      phone: entity.phone,
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
    }
  }

  static toEntity(dto: UserDTO): Partial<User> {
    return {
      id: dto.id,
      email: dto.email,
      nickname: dto.nickname,
      phone: dto.phone,
      gender: dto.gender,
      birthday: dto.birthDate as Date | null,
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
    }
  }

  static toDTOList(entities: User[]): UserDTO[] {
    return entities.map(entity => UserTransformer.toDTO(entity))
  }
}
