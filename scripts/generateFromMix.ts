#!/usr/bin/env ts-node

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

class CodeGenerator {
  private config: MixConfig
  private outputDir: string

  constructor(configPath: string, outputDir: string) {
    this.config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
    this.outputDir = outputDir
  }

  generate() {
    console.log("🚀 Starting code generation from mix.json...")

    this.generateDTOs()
    this.generateFrontendTypes()
    this.generateValidationSchemas()
    this.generateTransformers()
    this.generateAPIEndpoints()

    console.log("✅ Code generation completed!")
  }

  private generateDTOs() {
    console.log("📝 Generating DTOs...")

    const dtoDir = path.join(this.outputDir, "src/backend/dto")
    this.ensureDir(dtoDir)

    this.config.mapping.forEach(entity => {
      const dtoContent = this.generateDTOContent(entity)
      const dtoPath = path.join(dtoDir, `${entity.entity.toLowerCase()}.dto.ts`)
      fs.writeFileSync(dtoPath, dtoContent)
    })
  }

  private generateDTOContent(entity: EntityMapping): string {
    const requestFields = entity.fields
      .filter(field => field.dtoField !== null)
      .map(field => `  ${field.dtoField}: ${this.mapTypeToTS(field.type)}`)

    const responseFields = entity.fields
      .filter(
        field => field.dtoField !== null && !field.rules.includes("private")
      )
      .map(field => `  ${field.dtoField}: ${this.mapTypeToTS(field.type)}`)

    return `// Auto-generated from mix.json
// ${entity.entity} DTOs

export interface Create${entity.dto} {
${requestFields.join("\n")}
}

export interface Update${entity.dto} extends Partial<Create${entity.dto}> {
  id: number
}

export interface ${entity.dto}Response {
${responseFields.join("\n")}
}

export interface ${entity.dto}ListResponse {
  data: ${entity.dto}Response[]
  total: number
  page: number
  limit: number
}
`
  }

  private generateFrontendTypes() {
    console.log("🎨 Generating Frontend Types...")

    const typesDir = path.join(this.outputDir, "src/types/generated")
    this.ensureDir(typesDir)

    this.config.mapping.forEach(entity => {
      const typeContent = this.generateFrontendTypeContent(entity)
      const typePath = path.join(typesDir, `${entity.entity.toLowerCase()}.ts`)
      fs.writeFileSync(typePath, typeContent)
    })
  }

  private generateFrontendTypeContent(entity: EntityMapping): string {
    const fields = entity.fields
      .filter(
        field => field.frontField !== null && !field.rules.includes("private")
      )
      .map(
        field => `  ${field.frontField}: ${this.mapTypeToFrontend(field.type)}`
      )

    return `// Auto-generated from mix.json
// ${entity.entity} Frontend Type

export interface ${entity.frontType} {
${fields.join("\n")}
}

export interface Create${entity.frontType}Request {
${entity.fields
  .filter(field => field.dtoField !== null && !field.rules.includes("readonly"))
  .map(field => `  ${field.dtoField}: ${this.mapTypeToFrontend(field.type)}`)
  .join("\n")}
}

export interface Update${entity.frontType}Request extends Partial<Create${entity.frontType}Request> {
  id: number
}
`
  }

  private generateValidationSchemas() {
    console.log("🔍 Generating Validation Schemas...")

    const validationDir = path.join(this.outputDir, "src/backend/validation")
    this.ensureDir(validationDir)

    this.config.mapping.forEach(entity => {
      const validationContent = this.generateValidationContent(entity)
      const validationPath = path.join(
        validationDir,
        `${entity.entity.toLowerCase()}.validation.ts`
      )
      fs.writeFileSync(validationPath, validationContent)
    })
  }

  private generateValidationContent(entity: EntityMapping): string {
    const validationRules = entity.fields
      .filter(field => field.dtoField !== null)
      .map(field => this.generateFieldValidation(field))

    return `// Auto-generated from mix.json
// ${entity.entity} Validation Schema

import { z } from 'zod'

export const create${entity.dto}Schema = z.object({
${validationRules.join(",\n")}
})

export const update${entity.dto}Schema = create${entity.dto}Schema.partial().extend({
  id: z.number().positive()
})

export type Create${entity.dto}Input = z.infer<typeof create${entity.dto}Schema>
export type Update${entity.dto}Input = z.infer<typeof update${entity.dto}Schema>
`
  }

  private generateFieldValidation(field: FieldMapping): string {
    const rules = field.rules
    let validation = `  ${field.dtoField}: z.${this.mapTypeToZod(field.type)}`

    if (rules.includes("required")) {
      validation += '.min(1, "필수 입력 항목입니다")'
    }

    if (rules.includes("unique")) {
      validation += '.refine(() => true, "중복된 값입니다")'
    }

    if (rules.includes("isEmail")) {
      validation += '.email("올바른 이메일 형식이 아닙니다")'
    }

    if (rules.includes("url")) {
      validation += '.url("올바른 URL 형식이 아닙니다")'
    }

    const minRule = rules.find(r => r.startsWith("min:"))
    if (minRule) {
      const min = minRule.split(":")[1]
      validation += `.min(${min}, "최소 ${min}자 이상이어야 합니다")`
    }

    const maxRule = rules.find(r => r.startsWith("max:"))
    if (maxRule) {
      const max = maxRule.split(":")[1]
      validation += `.max(${max}, "최대 ${max}자까지 가능합니다")`
    }

    return validation
  }

  private generateTransformers() {
    console.log("🔄 Generating Transformers...")

    const transformerDir = path.join(this.outputDir, "src/backend/transformers")
    this.ensureDir(transformerDir)

    this.config.mapping.forEach(entity => {
      const transformerContent = this.generateTransformerContent(entity)
      const transformerPath = path.join(
        transformerDir,
        `${entity.entity.toLowerCase()}.transformer.ts`
      )
      fs.writeFileSync(transformerPath, transformerContent)
    })
  }

  private generateTransformerContent(entity: EntityMapping): string {
    const entityToDtoFields = entity.fields
      .filter(
        field => field.dtoField !== null && !field.rules.includes("private")
      )
      .map(field => `    ${field.dtoField}: entity.${field.entityField}`)

    const dtoToEntityFields = entity.fields
      .filter(
        field => field.dtoField !== null && !field.rules.includes("readonly")
      )
      .map(field => `    ${field.entityField}: dto.${field.dtoField}`)

    return `// Auto-generated from mix.json
// ${entity.entity} Transformers

import { ${entity.entity} } from '../entities/${entity.entity}'
import { Create${entity.dto}, Update${entity.dto}, ${entity.dto}Response } from '../dto/${entity.entity.toLowerCase()}.dto'

export class ${entity.entity}Transformer {
  static toDto(entity: ${entity.entity}): ${entity.dto}Response {
    return {
${entityToDtoFields.join(",\n")}
    }
  }

  static toEntity(dto: Create${entity.dto}): Partial<${entity.entity}> {
    return {
${dtoToEntityFields.join(",\n")}
    }
  }

  static toEntityUpdate(dto: Update${entity.dto}): Partial<${entity.entity}> {
    return this.toEntity(dto)
  }
}
`
  }

  private generateAPIEndpoints() {
    console.log("🌐 Generating API Endpoints...")

    const apiDir = path.join(this.outputDir, "src/shared/constants/generated")
    this.ensureDir(apiDir)

    const endpointsContent = this.generateEndpointsContent()
    const endpointsPath = path.join(apiDir, "api-endpoints.ts")
    fs.writeFileSync(endpointsPath, endpointsContent)
  }

  private generateEndpointsContent(): string {
    const endpoints = this.config.mapping.map(entity => {
      const entityName = entity.entity.toLowerCase()
      return `  ${entity.entity.toUpperCase()}: {
    LIST: "/api/${entityName}s",
    CREATE: "/api/${entityName}s",
    DETAIL: (id: number) => \`/api/${entityName}s/\${id}\`,
    UPDATE: (id: number) => \`/api/${entityName}s/\${id}\`,
    DELETE: (id: number) => \`/api/${entityName}s/\${id}\`,
  }`
    })

    return `// Auto-generated from mix.json
// API Endpoints

export const API_ENDPOINTS = {
${endpoints.join(",\n")}
} as const
`
  }

  private mapTypeToTS(type: string): string {
    const typeMap: Record<string, string> = {
      number: "number",
      string: "string",
      boolean: "boolean",
      Date: "Date",
      "string[]": "string[]",
      enum: "string",
    }
    return typeMap[type] || "unknown"
  }

  private mapTypeToFrontend(type: string): string {
    const typeMap: Record<string, string> = {
      number: "number",
      string: "string",
      boolean: "boolean",
      Date: "string",
      "string[]": "string[]",
      enum: "string",
    }
    return typeMap[type] || "unknown"
  }

  private mapTypeToZod(type: string): string {
    const typeMap: Record<string, string> = {
      number: "number()",
      string: "string()",
      boolean: "boolean()",
      Date: "date()",
      "string[]": "array(z.string())",
      enum: "string()",
    }
    return typeMap[type] || "unknown()"
  }

  private ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}

// 실행
if (require.main === module) {
  const configPath = path.join(__dirname, "../mix.json")
  const outputDir = path.join(__dirname, "..")

  const generator = new CodeGenerator(configPath, outputDir)
  generator.generate()
}
