// ============================================================================
// Machine Transformer
// ============================================================================

import { MachineDTO } from "../../shared/types/dto/machine.dto"
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
      nameKo: dto.nameKo || undefined,
      nameEn: dto.nameEn || undefined,
      imageUrl: dto.imageUrl,
      shortDesc: dto.shortDesc,
      detailDesc: dto.detailDesc,
      positiveEffect: dto.positiveEffect || undefined,
      category: (typeof dto.category === "string"
        ? dto.category
        : dto.category.name) as any,
      targetMuscles: dto.targetMuscles || undefined,
      difficulty: (typeof dto.difficulty === "string"
        ? dto.difficulty
        : dto.difficulty.name) as any,
      videoUrl: dto.videoUrl || undefined,
      isActive: dto.isActive,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    }
  }

  static toDTOList(entities: Machine[]): MachineDTO[] {
    return entities.map(entity => MachineTransformer.toDTO(entity))
  }
}
