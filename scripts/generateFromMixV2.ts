#!/usr/bin/env ts-node

const fs = require("fs")
const path = require("path")

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

class EnhancedCodeGenerator {
  private config: MixConfig
  private outputDir: string

  constructor(configPath: string, outputDir: string) {
    this.config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
    this.outputDir = outputDir
  }

  generate() {
    console.log("🚀 Starting enhanced code generation from mix.json...")

    this.generateDTOs()
    this.generateFrontendTypes()
    this.generateValidationSchemas()
    // this.generateTransformers()
    // this.generateAPIEndpoints()
    // this.generateHooks()
    // this.generateComponents()
    // this.generateServices()

    console.log("✅ Enhanced code generation completed!")
  }

  private generateDTOs() {
    console.log("📝 Generating DTOs...")
    const dtoDir = path.join(this.outputDir, "src/shared/types/dto")
    this.ensureDirectoryExists(dtoDir)

    this.config.mapping.forEach(entity => {
      const dtoContent = this.generateDTOContent(entity)
      const dtoPath = path.join(dtoDir, `${entity.entity.toLowerCase()}.dto.ts`)
      fs.writeFileSync(dtoPath, dtoContent)
      console.log(`  ✅ Generated ${entity.dto}`)
    })
  }

  private generateFrontendTypes() {
    console.log("🎨 Generating Frontend Types...")
    const typesDir = path.join(this.outputDir, "src/frontend/shared/types")
    this.ensureDirectoryExists(typesDir)

    const typesContent = this.generateFrontendTypesContent()
    const typesPath = path.join(typesDir, "mix-generated.ts")
    fs.writeFileSync(typesPath, typesContent)
    console.log("  ✅ Generated Frontend Types")
  }

  private generateValidationSchemas() {
    console.log("🔍 Generating Validation Schemas...")
    const validationDir = path.join(this.outputDir, "src/shared/validation")
    this.ensureDirectoryExists(validationDir)

    this.config.mapping.forEach(entity => {
      const schemaContent = this.generateValidationSchema(entity)
      const schemaPath = path.join(
        validationDir,
        `${entity.entity.toLowerCase()}.schema.ts`
      )
      fs.writeFileSync(schemaPath, schemaContent)
      console.log(`  ✅ Generated validation schema for ${entity.entity}`)
    })
  }

  private generateTransformers() {
    console.log("🔄 Generating Transformers...")
    const transformerDir = path.join(this.outputDir, "src/backend/transformers")
    this.ensureDirectoryExists(transformerDir)

    this.config.mapping.forEach(entity => {
      const transformerContent = this.generateTransformer(entity)
      const transformerPath = path.join(
        transformerDir,
        `${entity.entity.toLowerCase()}.transformer.ts`
      )
      fs.writeFileSync(transformerPath, transformerContent)
      console.log(`  ✅ Generated transformer for ${entity.entity}`)
    })
  }

  private generateAPIEndpoints() {
    console.log("🌐 Generating API Endpoints...")
    const apiDir = path.join(this.outputDir, "src/backend/routes")
    this.ensureDirectoryExists(apiDir)

    this.config.mapping.forEach(entity => {
      const apiContent = this.generateAPIEndpointContent(entity)
      const apiPath = path.join(
        apiDir,
        `${entity.entity.toLowerCase()}.routes.ts`
      )
      fs.writeFileSync(apiPath, apiContent)
      console.log(`  ✅ Generated API endpoints for ${entity.entity}`)
    })
  }

  private generateHooks() {
    console.log("🎣 Generating React Hooks...")
    const hooksDir = path.join(this.outputDir, "src/frontend/shared/hooks")
    this.ensureDirectoryExists(hooksDir)

    this.config.mapping.forEach(entity => {
      const hookContent = this.generateHook(entity)
      const hookPath = path.join(hooksDir, `use${entity.entity}.ts`)
      fs.writeFileSync(hookPath, hookContent)
      console.log(`  ✅ Generated hook for ${entity.entity}`)
    })
  }

  private generateComponents() {
    console.log("🧩 Generating React Components...")
    const componentsDir = path.join(
      this.outputDir,
      "src/frontend/shared/components"
    )
    this.ensureDirectoryExists(componentsDir)

    this.config.mapping.forEach(entity => {
      const componentContent = this.generateComponent(entity)
      const componentPath = path.join(componentsDir, `${entity.entity}List.tsx`)
      fs.writeFileSync(componentPath, componentContent)
      console.log(`  ✅ Generated component for ${entity.entity}`)
    })
  }

  private generateServices() {
    console.log("🔧 Generating Services...")
    const servicesDir = path.join(
      this.outputDir,
      "src/frontend/shared/services"
    )
    this.ensureDirectoryExists(servicesDir)

    this.config.mapping.forEach(entity => {
      const serviceContent = this.generateService(entity)
      const servicePath = path.join(
        servicesDir,
        `${entity.entity.toLowerCase()}.service.ts`
      )
      fs.writeFileSync(servicePath, serviceContent)
      console.log(`  ✅ Generated service for ${entity.entity}`)
    })
  }

  private generateDTOContent(entity: EntityMapping): string {
    const fields = entity.fields
      .filter(field => field.dtoField !== null)
      .map(field => {
        const type = this.mapTypeToDTO(field.type)
        const optional = field.rules.includes("optional") ? "?" : ""
        return `  ${field.dtoField}${optional}: ${type}`
      })
      .join("\n")

    return `// ============================================================================
// ${entity.dto} - Data Transfer Object
// ============================================================================

export interface ${entity.dto} {
${fields}
}

// Create DTO (for creating new ${entity.entity})
export interface Create${entity.dto} {
${entity.fields
  .filter(field => field.dtoField !== null && !field.rules.includes("readonly"))
  .map(field => {
    const type = this.mapTypeToDTO(field.type)
    const optional = field.rules.includes("optional") ? "?" : ""
    return `  ${field.dtoField}${optional}: ${type}`
  })
  .join("\n")}
}

// Update DTO (for updating existing ${entity.entity})
export interface Update${entity.dto} {
${entity.fields
  .filter(field => field.dtoField !== null && !field.rules.includes("readonly"))
  .map(field => {
    const type = this.mapTypeToDTO(field.type)
    return `  ${field.dtoField}?: ${type}`
  })
  .join("\n")}
}

// Response DTO (for API responses)
export interface ${entity.dto}Response {
  success: boolean
  data?: ${entity.dto}
  message?: string
  error?: string
}

// List Response DTO
export interface ${entity.dto}ListResponse {
  success: boolean
  data?: ${entity.dto}[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  message?: string
  error?: string
}
`
  }

  private generateFrontendTypesContent(): string {
    const typeDefinitions = this.config.mapping
      .map(entity => {
        const fields = entity.fields
          .filter(field => field.frontField !== null)
          .map(field => {
            const type = this.mapTypeToFrontend(field.type)
            const optional = field.rules.includes("optional") ? "?" : ""
            return `  ${field.frontField}${optional}: ${type}`
          })
          .join("\n")

        return `// ${entity.entity} 관련 타입
export interface ${entity.frontType} {
${fields}
}`
      })
      .join("\n\n")

    return `// ============================================================================
// Mix.json 기반 자동 생성 Frontend 타입들
// ============================================================================

${typeDefinitions}

// API 응답 타입들
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
`
  }

  private generateValidationSchema(entity: EntityMapping): string {
    const fieldValidations = entity.fields
      .filter(field => field.dtoField !== null)
      .map(field => {
        const validation = this.generateFieldValidation(field)
        return `  ${field.dtoField}: ${validation}`
      })
      .join(",\n")

    return `// ============================================================================
// ${entity.entity} Validation Schema
// ============================================================================

import { z } from "zod"

export const ${entity.entity}Schema = z.object({
${fieldValidations}
})

export const Create${entity.entity}Schema = ${entity.entity}Schema.omit({
${entity.fields
  .filter(
    field =>
      field.rules.includes("readonly") || field.rules.includes("autoGenerate")
  )
  .map(field => `  ${field.dtoField}: true`)
  .join(",\n")}
})

export const Update${entity.entity}Schema = Create${entity.entity}Schema.partial()

export type ${entity.entity}Input = z.infer<typeof ${entity.entity}Schema>
export type Create${entity.entity}Input = z.infer<typeof Create${entity.entity}Schema>
export type Update${entity.entity}Input = z.infer<typeof Update${entity.entity}Schema>
`
  }

  private generateTransformer(entity: EntityMapping): string {
    return `// ============================================================================
// ${entity.entity} Transformer
// ============================================================================

import { ${entity.dto} } from "../../shared/types/dto/${entity.entity.toLowerCase()}.dto"
import { ${entity.entity} } from "../entities/${entity.entity}"

export class ${entity.entity}Transformer {
  static toDTO(entity: ${entity.entity}): ${entity.dto} {
    return {
${entity.fields
  .filter(field => field.dtoField !== null)
  .map(field => `      ${field.dtoField}: entity.${field.entityField}`)
  .join(",\n")}
    }
  }

  static toEntity(dto: ${entity.dto}): Partial<${entity.entity}> {
    return {
${entity.fields
  .filter(field => field.dtoField !== null)
  .map(field => `      ${field.entityField}: dto.${field.dtoField}`)
  .join(",\n")}
    }
  }

  static toDTOList(entities: ${entity.entity}[]): ${entity.dto}[] {
    return entities.map(entity => this.toDTO(entity))
  }
}
`
  }

  private generateAPIEndpointContent(entity: EntityMapping): string {
    return `// ============================================================================
// ${entity.entity} API Routes
// ============================================================================

import { Router } from "express"
import { ${entity.entity}Controller } from "../controllers/${entity.entity.toLowerCase()}.controller"
import { validateRequest } from "../middlewares/validation"
import { ${entity.entity}Schema, Create${entity.entity}Schema, Update${entity.entity}Schema } from "../../shared/validation/${entity.entity.toLowerCase()}.schema"

const router = Router()

// GET /api/${entity.entity.toLowerCase()}s
router.get("/", ${entity.entity}Controller.getAll)

// GET /api/${entity.entity.toLowerCase()}s/:id
router.get("/:id", ${entity.entity}Controller.getById)

// POST /api/${entity.entity.toLowerCase()}s
router.post("/", validateRequest(Create${entity.entity}Schema), ${entity.entity}Controller.create)

// PUT /api/${entity.entity.toLowerCase()}s/:id
router.put("/:id", validateRequest(Update${entity.entity}Schema), ${entity.entity}Controller.update)

// DELETE /api/${entity.entity.toLowerCase()}s/:id
router.delete("/:id", ${entity.entity}Controller.delete)

export default router
`
  }

  private generateHook(entity: EntityMapping): string {
    return `// ============================================================================
// use${entity.entity} Hook
// ============================================================================

import { useState, useEffect } from "react"
import { ${entity.frontType} } from "../types/mix-generated"
import { ${entity.entity.toLowerCase()}Service } from "../services/${entity.entity.toLowerCase()}.service"

export function use${entity.entity}() {
  const [data, setData] = useState<${entity.frontType}[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await ${entity.entity.toLowerCase()}Service.getAll()
      setData(response.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const create = async (item: Partial<${entity.frontType}>) => {
    try {
      setLoading(true)
      const response = await ${entity.entity.toLowerCase()}Service.create(item)
      await fetchData()
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const update = async (id: number, item: Partial<${entity.frontType}>) => {
    try {
      setLoading(true)
      const response = await ${entity.entity.toLowerCase()}Service.update(id, item)
      await fetchData()
      return response
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: number) => {
    try {
      setLoading(true)
      await ${entity.entity.toLowerCase()}Service.delete(id)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    error,
    fetchData,
    create,
    update,
    remove
  }
}
`
  }

  private generateComponent(entity: EntityMapping): string {
    return `// ============================================================================
// ${entity.entity}List Component
// ============================================================================

import React from "react"
import { use${entity.entity} } from "../hooks/use${entity.entity}"
import { ${entity.frontType} } from "../types/mix-generated"

export function ${entity.entity}List() {
  const { data, loading, error, create, update, remove } = use${entity.entity}()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="${entity.entity.toLowerCase()}-list">
      <h2>${entity.entity} List</h2>
      <div className="list-container">
        {data.map((item) => (
          <div key={item.id} className="list-item">
            <h3>{item.id}</h3>
            {/* Add more fields based on your entity */}
            <div className="actions">
              <button onClick={() => update(item.id, {})}>Edit</button>
              <button onClick={() => remove(item.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
`
  }

  private generateService(entity: EntityMapping): string {
    return `// ============================================================================
// ${entity.entity} Service
// ============================================================================

import { ${entity.frontType} } from "../types/mix-generated"
import { ApiResponse, PaginatedResponse } from "../types/mix-generated"
import { apiClient } from "../api/client"

export class ${entity.entity}Service {
  static async getAll(): Promise<PaginatedResponse<${entity.frontType}>> {
    const response = await apiClient.get(\`/api/${entity.entity.toLowerCase()}s\`)
    return response.data
  }

  static async getById(id: number): Promise<ApiResponse<${entity.frontType}>> {
    const response = await apiClient.get(\`/api/${entity.entity.toLowerCase()}s/\${id}\`)
    return response.data
  }

  static async create(data: Partial<${entity.frontType}>): Promise<ApiResponse<${entity.frontType}>> {
    const response = await apiClient.post(\`/api/${entity.entity.toLowerCase()}s\`, data)
    return response.data
  }

  static async update(id: number, data: Partial<${entity.frontType}>): Promise<ApiResponse<${entity.frontType}>> {
    const response = await apiClient.put(\`/api/${entity.entity.toLowerCase()}s/\${id}\`, data)
    return response.data
  }

  static async delete(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(\`/api/${entity.entity.toLowerCase()}s/\${id}\`)
    return response.data
  }
}
`
  }

  private mapTypeToDTO(type: string): string {
    const typeMap: Record<string, string> = {
      number: "number",
      string: "string",
      boolean: "boolean",
      Date: "Date",
      "string[]": "string[]",
      object: "Record<string, unknown>",
    }
    return typeMap[type] || "unknown"
  }

  private mapTypeToFrontend(type: string): string {
    const typeMap: Record<string, string> = {
      number: "number",
      string: "string",
      boolean: "boolean",
      Date: "Date",
      "string[]": "string[]",
      object: "Record<string, unknown>",
    }
    return typeMap[type] || "unknown"
  }

  private generateFieldValidation(field: FieldMapping): string {
    let validation = "z"

    if (field.type === "string") {
      validation += ".string()"
    } else if (field.type === "number") {
      validation += ".number()"
    } else if (field.type === "boolean") {
      validation += ".boolean()"
    } else if (field.type === "Date") {
      validation += ".date()"
    } else if (field.type === "string[]") {
      validation += ".array(z.string())"
    } else if (field.type === "object") {
      validation += ".record(z.unknown())"
    }

    // Add validation rules
    field.rules.forEach(rule => {
      if (rule.startsWith("min:")) {
        const value = rule.split(":")[1]
        validation += `.min(${value})`
      } else if (rule.startsWith("max:")) {
        const value = rule.split(":")[1]
        validation += `.max(${value})`
      } else if (rule === "required") {
        // Already required by default
      } else if (rule === "optional") {
        validation += ".optional()"
      } else if (rule === "isEmail") {
        validation += ".email()"
      } else if (rule === "isUrl") {
        validation += ".url()"
      } else if (rule.startsWith("enum:")) {
        const values = rule.split(":")[1].split(",")
        validation += `.enum([${values.map(v => `"${v}"`).join(", ")}])`
      }
    })

    return validation
  }

  private ensureDirectoryExists(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}

// Main execution
if (require.main === module) {
  const configPath = path.join(__dirname, "../mix.json")
  const outputDir = path.join(__dirname, "..")

  const generator = new EnhancedCodeGenerator(configPath, outputDir)
  generator.generate()
}
