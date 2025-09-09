import { Request, Response, NextFunction } from "express"
import { z } from "zod"
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

class MixValidationMiddleware {
  private config: MixConfig
  private schemas: Map<string, z.ZodSchema> = new Map()

  constructor() {
    this.config = {} as MixConfig
    this.loadConfig()
    this.generateSchemas()
  }

  private loadConfig() {
    const configPath = path.join(process.cwd(), "..", "..", "mix.json")
    this.config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
  }

  private generateSchemas() {
    this.config.mapping.forEach(entity => {
      // Create schema
      const createSchema = this.generateCreateSchema(entity)
      const updateSchema = this.generateUpdateSchema(entity)

      this.schemas.set(`create_${entity.entity.toLowerCase()}`, createSchema)
      this.schemas.set(`update_${entity.entity.toLowerCase()}`, updateSchema)
    })
  }

  private generateCreateSchema(entity: EntityMapping): z.ZodSchema {
    const schemaObject: Record<string, z.ZodTypeAny> = {}

    entity.fields
      .filter(
        field => field.dtoField !== null && !field.rules.includes("readonly")
      )
      .forEach(field => {
        schemaObject[field.dtoField!] = this.generateFieldSchema(field)
      })

    return z.object(schemaObject)
  }

  private generateUpdateSchema(entity: EntityMapping): z.ZodSchema {
    const createSchema = this.generateCreateSchema(entity)
    return (createSchema as z.ZodObject<any>).partial().extend({
      id: z.number().positive("유효하지 않은 ID입니다"),
    })
  }

  private generateFieldSchema(field: FieldMapping): z.ZodTypeAny {
    let schema = this.getBaseSchema(field.type)

    // Apply validation rules
    field.rules.forEach(rule => {
      schema = this.applyRule(schema, rule, field)
    })

    return schema
  }

  private getBaseSchema(type: string): z.ZodTypeAny {
    switch (type) {
      case "number":
        return z.number()
      case "string":
        return z.string()
      case "boolean":
        return z.boolean()
      case "Date":
        return z.date()
      case "string[]":
        return z.array(z.string())
      case "enum":
        return z.string()
      default:
        return z.unknown()
    }
  }

  private applyRule(
    schema: z.ZodTypeAny,
    rule: string,
    field: FieldMapping
  ): z.ZodTypeAny {
    switch (rule) {
      case "required":
        return (schema as z.ZodString).min(
          1,
          `${field.dtoField || "필드"}는 필수 입력 항목입니다`
        )

      case "unique":
        return schema.refine(
          () => true,
          `${field.dtoField}는 중복될 수 없습니다`
        )

      case "isEmail":
        return (schema as z.ZodString).email(
          `${field.dtoField || "필드"}는 올바른 이메일 형식이어야 합니다`
        )

      case "url":
        return (schema as z.ZodString).url(
          `${field.dtoField || "필드"}는 올바른 URL 형식이어야 합니다`
        )

      case "date":
        return (schema as z.ZodString).refine(
          (val: string) => !isNaN(Date.parse(val)),
          `${field.dtoField || "필드"}는 올바른 날짜 형식이어야 합니다`
        )

      default:
        if (rule.startsWith("min:")) {
          const min = parseInt(rule.split(":")[1] || "0")
          const fieldName = field.dtoField || "필드"
          return (schema as z.ZodString).min(
            min,
            `${fieldName}는 최소 ${min}자 이상이어야 합니다`
          )
        }

        if (rule.startsWith("max:")) {
          const max = parseInt(rule.split(":")[1] || "0")
          const fieldName = field.dtoField || "필드"
          return (schema as z.ZodString).max(
            max,
            `${fieldName}는 최대 ${max}자까지 가능합니다`
          )
        }

        if (rule.startsWith("enum:")) {
          const enumValues = (rule.split(":")[1] || "").split(",")
          const fieldName = field.dtoField || "필드"
          return schema.refine(
            (val: unknown) =>
              typeof val === "string" && enumValues.includes(val),
            `${fieldName}는 다음 중 하나여야 합니다: ${enumValues.join(", ")}`
          )
        }

        return schema
    }
  }

  // Middleware factory
  validate(operation: "create" | "update", entityName: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const schemaKey = `${operation}_${entityName.toLowerCase()}`
      const schema = this.schemas.get(schemaKey)

      if (!schema) {
        return res.status(500).json({
          message: `Validation schema not found for ${schemaKey}`,
        })
      }

      try {
        const validatedData = schema.parse(req.body)
        req.body = validatedData
        next()
      } catch (error) {
        if (error instanceof z.ZodError) {
          const zodError = error as z.ZodError
          const errors =
            (zodError as any).errors?.map((err: any) => ({
              field: err.path.join("."),
              message: err.message,
            })) || []

          return res.status(400).json({
            message: "Validation failed",
            errors,
          })
        }

        return res.status(500).json({
          message: "Validation error occurred",
        })
      }
    }
  }

  // Generic validation for any entity
  validateEntity(
    entityName: string,
    operation: "create" | "update" = "create"
  ) {
    return this.validate(operation, entityName)
  }

  // Specific entity validators
  validateUser = this.validateEntity.bind(this, "user")
  validateMachine = this.validateEntity.bind(this, "machine")
  validatePost = this.validateEntity.bind(this, "post")
  validateGym = this.validateEntity.bind(this, "gym")
  validateUserLevel = this.validateEntity.bind(this, "userlevel")
  validateComment = this.validateEntity.bind(this, "comment")

  // Update validators
  validateUserUpdate = this.validate.bind(this, "update", "user")
  validateMachineUpdate = this.validate.bind(this, "update", "machine")
  validatePostUpdate = this.validate.bind(this, "update", "post")
  validateGymUpdate = this.validate.bind(this, "update", "gym")
  validateUserLevelUpdate = this.validate.bind(this, "update", "userlevel")
  validateCommentUpdate = this.validate.bind(this, "update", "comment")
}

// Export singleton instance
export const mixValidation = new MixValidationMiddleware()

// Export convenience functions
export const validateCreate = (entityName: string) =>
  mixValidation.validate("create", entityName)
export const validateUpdate = (entityName: string) =>
  mixValidation.validate("update", entityName)

// Export specific validators
export const {
  validateUser,
  validateMachine,
  validatePost,
  validateGym,
  validateUserLevel,
  validateComment,
  validateUserUpdate,
  validateMachineUpdate,
  validatePostUpdate,
  validateGymUpdate,
  validateUserLevelUpdate,
  validateCommentUpdate,
} = mixValidation
