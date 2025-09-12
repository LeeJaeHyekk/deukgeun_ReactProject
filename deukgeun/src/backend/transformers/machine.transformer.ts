// ============================================================================
// Machine Transformer
// ============================================================================

import { MachineDTO } from '../../shared/types/dto/machine.dto'
import { Machine } from '../entities/Machine'

export class MachineTransformer {
  static toDTO(entity: Machine): MachineDTO {
    return {
      id: entity.id,
      machineKey: entity.machineKey,
      name: entity.name,
      nameKo: entity.name, // name을 nameKo로 매핑
      nameEn: entity.nameEn,
      imageUrl: entity.imageUrl,
      shortDesc: entity.shortDesc,
      detailDesc: entity.shortDesc, // shortDesc를 detailDesc로 매핑
      positiveEffect: '', // 기본값
      category: entity.category,
      targetMuscles: entity.anatomy?.primaryMuscles || [], // anatomy에서 추출
      difficulty: entity.difficulty,
      videoUrl: entity.videoUrl,
      isActive: entity.isActive,
      // 새로운 JSON 필드들
      anatomy: entity.anatomy,
      guide: entity.guide,
      training: entity.training,
      extraInfo: entity.extraInfo,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }
  }

  static toEntity(dto: MachineDTO): Partial<Machine> {
    return {
      id: dto.id,
      machineKey: dto.machineKey,
      name: dto.name,
      nameEn: dto.nameEn || undefined,
      imageUrl: dto.imageUrl,
      shortDesc: dto.shortDesc,
      category: (typeof dto.category === 'string'
        ? dto.category
        : dto.category.name) as any,
      difficulty: (typeof dto.difficulty === 'string'
        ? dto.difficulty
        : dto.difficulty.name) as any,
      videoUrl: dto.videoUrl || undefined,
      isActive: dto.isActive,
      // 새로운 JSON 필드들
      anatomy: dto.anatomy,
      guide: dto.guide,
      training: dto.training,
      extraInfo: dto.extraInfo,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    }
  }

  static toDTOList(entities: Machine[]): MachineDTO[] {
    return entities.map(entity => MachineTransformer.toDTO(entity))
  }
}
