// ============================================================================
// Machine Transformer
// ============================================================================

import { MachineDTO } from "../types/dto"
import { Machine } from "../entities/Machine"

export class MachineTransformer {
  static toDTO(entity: Machine): MachineDTO {
    return {
      id: entity.id,
      machineKey: entity.machineKey,
      name: entity.name,
      nameKo: entity.nameKo,
      nameEn: entity.nameEn,
      imageUrl: entity.imageUrl,
      shortDesc: entity.shortDesc,
      detailDesc: entity.detailDesc,
      positiveEffect: entity.positiveEffect,
      category: entity.category,
      targetMuscles: entity.targetMuscles,
      difficulty: entity.difficulty,
      videoUrl: entity.videoUrl,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  static toEntity(dto: MachineDTO): Partial<Machine> {
    return {
      id: dto.id,
      machineKey: dto.machineKey,
      name: dto.name,
      nameKo: dto.nameKo,
      nameEn: dto.nameEn,
      imageUrl: dto.imageUrl,
      shortDesc: dto.shortDesc,
      detailDesc: dto.detailDesc,
      positiveEffect: dto.positiveEffect,
      category: dto.category,
      targetMuscles: dto.targetMuscles,
      difficulty: dto.difficulty,
      videoUrl: dto.videoUrl,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    }
  }

  static toDTOList(entities: Machine[]): MachineDTO[] {
    return entities.map(entity => MachineTransformer.toDTO(entity))
  }
}

// Export functions for backward compatibility
export const toMachineDTO = MachineTransformer.toDTO
export const toMachineDTOList = MachineTransformer.toDTOList
