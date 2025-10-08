import * as fs from "fs"
import * as path from "path"

interface MixConfig {
  mapping: EntityMapping[]
  rules: {
    naming: NamingRules
    serialization: SerializationRules
    validation: ValidationRules
    security: SecurityRules
    relationships: RelationshipRules
  }
}

interface EntityMapping {
  entity: string
  table: string
  dto: string
  frontType: string
  relations: Record<string, Relation>
  fields: FieldMapping[]
}

interface FieldMapping {
  entityField: string
  dbColumn: string
  dtoField: string | null
  frontField: string | null
  type: string
  rules: string[]
}

interface Relation {
  type: string
  target: string
  dto: string
  frontType: string
}

interface NamingRules {
  entity: string
  dto: string
  front: string
  dbColumn: string
}

interface SerializationRules {
  password: string
  loginAttempts: string
  lockedUntil: string
  date: string
  json: string
}

interface ValidationRules {
  email: string
  nickname: string
  title: string
  author: string
  url: string
  enum: string
}

interface SecurityRules {
  password: string
  private: string
  sensitive: string[]
}

interface RelationshipRules {
  cascade: string[]
  lazy: string[]
  eager: string[]
}

class MixTransformer {
  private config: MixConfig = {} as MixConfig

  constructor() {
    this.loadConfig()
  }

  private loadConfig() {
    const configPath = path.join(process.cwd(), "mix.json")
    this.config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
  }

  private getEntityConfig(entityName: string): EntityMapping | undefined {
    return this.config.mapping.find(
      entity => entity.entity.toLowerCase() === entityName.toLowerCase()
    )
  }

  /**
   * Entity를 DTO로 변환
   */
  entityToDto<T extends Record<string, any>>(
    entity: T,
    entityName: string
  ): any {
    const entityConfig = this.getEntityConfig(entityName)
    if (!entityConfig) {
      throw new Error(`Entity configuration not found for ${entityName}`)
    }

    const dto: Record<string, any> = {}

    entityConfig.fields.forEach(field => {
      if (field.dtoField !== null && !field.rules.includes("private")) {
        const value = entity[field.entityField]
        dto[field.dtoField] = this.transformValue(value, field, "entityToDto")
      }
    })

    return dto
  }

  /**
   * DTO를 Entity로 변환
   */
  dtoToEntity<T extends Record<string, any>>(dto: T, entityName: string): any {
    const entityConfig = this.getEntityConfig(entityName)
    if (!entityConfig) {
      throw new Error(`Entity configuration not found for ${entityName}`)
    }

    const entity: Record<string, any> = {}

    entityConfig.fields.forEach(field => {
      if (field.dtoField !== null && !field.rules.includes("readonly")) {
        const value = dto[field.dtoField]
        entity[field.entityField] = this.transformValue(
          value,
          field,
          "dtoToEntity"
        )
      }
    })

    return entity
  }

  /**
   * DTO를 Frontend Type으로 변환
   */
  dtoToFrontend<T extends Record<string, any>>(
    dto: T,
    entityName: string
  ): any {
    const entityConfig = this.getEntityConfig(entityName)
    if (!entityConfig) {
      throw new Error(`Entity configuration not found for ${entityName}`)
    }

    const frontend: Record<string, any> = {}

    entityConfig.fields.forEach(field => {
      if (
        field.dtoField !== null &&
        field.frontField !== null &&
        !field.rules.includes("private")
      ) {
        const value = dto[field.dtoField]
        frontend[field.frontField] = this.transformValue(
          value,
          field,
          "dtoToFrontend"
        )
      }
    })

    return frontend
  }

  /**
   * Frontend Type을 DTO로 변환
   */
  frontendToDto<T extends Record<string, any>>(
    frontend: T,
    entityName: string
  ): any {
    const entityConfig = this.getEntityConfig(entityName)
    if (!entityConfig) {
      throw new Error(`Entity configuration not found for ${entityName}`)
    }

    const dto: Record<string, any> = {}

    entityConfig.fields.forEach(field => {
      if (
        field.dtoField !== null &&
        field.frontField !== null &&
        !field.rules.includes("readonly")
      ) {
        const value = frontend[field.frontField]
        dto[field.dtoField] = this.transformValue(value, field, "frontendToDto")
      }
    })

    return dto
  }

  /**
   * Entity를 Frontend Type으로 변환
   */
  entityToFrontend<T extends Record<string, any>>(
    entity: T,
    entityName: string
  ): any {
    const dto = this.entityToDto(entity, entityName)
    return this.dtoToFrontend(dto, entityName)
  }

  /**
   * Frontend Type을 Entity로 변환
   */
  frontendToEntity<T extends Record<string, any>>(
    frontend: T,
    entityName: string
  ): any {
    const dto = this.frontendToDto(frontend, entityName)
    return this.dtoToEntity(dto, entityName)
  }

  /**
   * 배열 변환
   */
  transformArray<T extends Record<string, any>>(
    items: T[],
    entityName: string,
    direction:
      | "entityToDto"
      | "dtoToEntity"
      | "dtoToFrontend"
      | "frontendToDto"
      | "entityToFrontend"
      | "frontendToEntity"
  ): any[] {
    return items.map(item => this.transformSingle(item, entityName, direction))
  }

  /**
   * 단일 객체 변환
   */
  transformSingle<T extends Record<string, any>>(
    item: T,
    entityName: string,
    direction:
      | "entityToDto"
      | "dtoToEntity"
      | "dtoToFrontend"
      | "frontendToDto"
      | "entityToFrontend"
      | "frontendToEntity"
  ): any {
    switch (direction) {
      case "entityToDto":
        return this.entityToDto(item, entityName)
      case "dtoToEntity":
        return this.dtoToEntity(item, entityName)
      case "dtoToFrontend":
        return this.dtoToFrontend(item, entityName)
      case "frontendToDto":
        return this.frontendToDto(item, entityName)
      case "entityToFrontend":
        return this.entityToFrontend(item, entityName)
      case "frontendToEntity":
        return this.frontendToEntity(item, entityName)
      default:
        throw new Error(`Unknown transformation direction: ${direction}`)
    }
  }

  /**
   * 값 변환 (타입별 처리)
   */
  private transformValue(
    value: any,
    field: FieldMapping,
    direction: string
  ): any {
    if (value === null || value === undefined) {
      return value
    }

    // 날짜 변환
    if (field.type === "Date") {
      if (direction === "entityToDto" || direction === "dtoToEntity") {
        return value instanceof Date ? value : new Date(value)
      } else if (
        direction === "dtoToFrontend" ||
        direction === "entityToFrontend"
      ) {
        return value instanceof Date ? value.toISOString() : value
      } else if (
        direction === "frontendToDto" ||
        direction === "frontendToEntity"
      ) {
        return typeof value === "string" ? new Date(value) : value
      }
    }

    // JSON 배열 변환
    if (field.type === "string[]") {
      if (typeof value === "string") {
        try {
          return JSON.parse(value)
        } catch {
          return value.split(",").map((item: string) => item.trim())
        }
      }
      return Array.isArray(value) ? value : [value]
    }

    // Enum 변환
    if (field.type === "enum") {
      return String(value)
    }

    // 기본 타입 변환
    switch (field.type) {
      case "number":
        return Number(value)
      case "boolean":
        return Boolean(value)
      case "string":
        return String(value)
      default:
        return value
    }
  }

  /**
   * 관계 데이터 포함하여 변환
   */
  transformWithRelations<T extends Record<string, any>>(
    item: T,
    entityName: string,
    direction:
      | "entityToDto"
      | "dtoToEntity"
      | "dtoToFrontend"
      | "frontendToDto"
      | "entityToFrontend"
      | "frontendToEntity",
    includeRelations: string[] = []
  ): any {
    const result = this.transformSingle(item, entityName, direction)
    const entityConfig = this.getEntityConfig(entityName)

    if (!entityConfig) {
      return result
    }

    // 관계 데이터 포함
    includeRelations.forEach(relationName => {
      const relation = entityConfig.relations[relationName]
      if (relation && item[relationName]) {
        const relationData = Array.isArray(item[relationName])
          ? this.transformArray(item[relationName], relation.target, direction)
          : this.transformSingle(item[relationName], relation.target, direction)

        result[relationName] = relationData
      }
    })

    return result
  }

  /**
   * 민감한 필드 제외
   */
  excludeSensitiveFields<T extends Record<string, any>>(
    data: T,
    entityName: string
  ): T {
    const entityConfig = this.getEntityConfig(entityName)
    if (!entityConfig) {
      return data
    }

    const result = { ...data }

    entityConfig.fields
      .filter(
        field =>
          field.rules.includes("private") || field.rules.includes("exclude")
      )
      .forEach(field => {
        if (field.dtoField) {
          delete result[field.dtoField]
        }
        if (field.frontField) {
          delete result[field.frontField]
        }
      })

    return result
  }

  /**
   * 기본값 적용
   */
  applyDefaults<T extends Record<string, any>>(data: T, entityName: string): T {
    const entityConfig = this.getEntityConfig(entityName)
    if (!entityConfig) {
      return data
    }

    const result = { ...data } as Record<string, any>

    entityConfig.fields.forEach(field => {
      const defaultValue = this.getDefaultValue(field)
      if (defaultValue !== undefined) {
        if (field.dtoField && result[field.dtoField] === undefined) {
          result[field.dtoField] = defaultValue
        }
        if (field.frontField && result[field.frontField] === undefined) {
          result[field.frontField] = defaultValue
        }
      }
    })

    return result as T
  }

  /**
   * 기본값 추출
   */
  private getDefaultValue(field: FieldMapping): any {
    const defaultRule = field.rules.find(rule => rule.startsWith("default:"))
    if (defaultRule) {
      const value = defaultRule.split(":")[1]
      return this.transformValue(value, field, "dtoToEntity")
    }
    return undefined
  }
}

// Export singleton instance
export const mixTransformer = new MixTransformer()

// Export convenience functions
export const {
  entityToDto,
  dtoToEntity,
  dtoToFrontend,
  frontendToDto,
  entityToFrontend,
  frontendToEntity,
  transformArray,
  transformSingle,
  transformWithRelations,
  excludeSensitiveFields,
  applyDefaults,
} = mixTransformer

// Export specific entity transformers
export const userTransformer = {
  toDto: (entity: any) => entityToDto(entity, "user"),
  toEntity: (dto: any) => dtoToEntity(dto, "user"),
  toFrontend: (dto: any) => dtoToFrontend(dto, "user"),
  fromFrontend: (frontend: any) => frontendToDto(frontend, "user"),
}

export const machineTransformer = {
  toDto: (entity: any) => entityToDto(entity, "machine"),
  toEntity: (dto: any) => dtoToEntity(dto, "machine"),
  toFrontend: (dto: any) => dtoToFrontend(dto, "machine"),
  fromFrontend: (frontend: any) => frontendToDto(frontend, "machine"),
}

export const postTransformer = {
  toDto: (entity: any) => entityToDto(entity, "post"),
  toEntity: (dto: any) => dtoToEntity(dto, "post"),
  toFrontend: (dto: any) => dtoToFrontend(dto, "post"),
  fromFrontend: (frontend: any) => frontendToDto(frontend, "post"),
}

export const gymTransformer = {
  toDto: (entity: any) => entityToDto(entity, "gym"),
  toEntity: (dto: any) => dtoToEntity(dto, "gym"),
  toFrontend: (dto: any) => dtoToFrontend(dto, "gym"),
  fromFrontend: (frontend: any) => frontendToDto(frontend, "gym"),
}

export const userLevelTransformer = {
  toDto: (entity: any) => entityToDto(entity, "userlevel"),
  toEntity: (dto: any) => dtoToEntity(dto, "userlevel"),
  toFrontend: (dto: any) => dtoToFrontend(dto, "userlevel"),
  fromFrontend: (frontend: any) => frontendToDto(frontend, "userlevel"),
}

export const commentTransformer = {
  toDto: (entity: any) => entityToDto(entity, "comment"),
  toEntity: (dto: any) => dtoToEntity(dto, "comment"),
  toFrontend: (dto: any) => dtoToFrontend(dto, "comment"),
  fromFrontend: (frontend: any) => frontendToDto(frontend, "comment"),
}
