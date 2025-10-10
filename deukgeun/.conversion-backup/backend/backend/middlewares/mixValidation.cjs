const { z  } = require('zod');
const fs = require('fs');
const path = require('path');
class MixValidationMiddleware {
    constructor() {
        this.schemas = new Map();
        // Specific entity validators
        this.validateUser = this.validateEntity.bind(this, "user");
        this.validateMachine = this.validateEntity.bind(this, "machine");
        this.validatePost = this.validateEntity.bind(this, "post");
        this.validateGym = this.validateEntity.bind(this, "gym");
        this.validateUserLevel = this.validateEntity.bind(this, "userlevel");
        this.validateComment = this.validateEntity.bind(this, "comment");
        // Update validators
        this.validateUserUpdate = this.validate.bind(this, "update", "user");
        this.validateMachineUpdate = this.validate.bind(this, "update", "machine");
        this.validatePostUpdate = this.validate.bind(this, "update", "post");
        this.validateGymUpdate = this.validate.bind(this, "update", "gym");
        this.validateUserLevelUpdate = this.validate.bind(this, "update", "userlevel");
        this.validateCommentUpdate = this.validate.bind(this, "update", "comment");
        this.config = {};
        this.loadConfig();
        this.generateSchemas();
    }
    loadConfig() {
        const configPath = path.join(process.cwd(), "..", "..", "mix.json");
        this.config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    generateSchemas() {
        this.config.mapping.forEach(entity => {
            // Create schema
            const createSchema = this.generateCreateSchema(entity);
            const updateSchema = this.generateUpdateSchema(entity);
            this.schemas.set(`create_${entity.entity.toLowerCase()}`, createSchema);
            this.schemas.set(`update_${entity.entity.toLowerCase()}`, updateSchema);
        });
    }
    generateCreateSchema(entity) {
        const schemaObject = {};
        entity.fields
            .filter(field => field.dtoField !== null && !field.rules.includes("readonly"))
            .forEach(field => {
            schemaObject[field.dtoField] = this.generateFieldSchema(field);
        });
        return z.object(schemaObject);
    }
    generateUpdateSchema(entity) {
        const createSchema = this.generateCreateSchema(entity);
        return createSchema.partial().extend({
            id: z.number().positive("유효하지 않은 ID입니다"),
        });
    }
    generateFieldSchema(field) {
        let schema = this.getBaseSchema(field.type);
        // Apply validation rules
        field.rules.forEach(rule => {
            schema = this.applyRule(schema, rule, field);
        });
        return schema;
    }
    getBaseSchema(type) {
        switch (type) {
            case "number":
                return z.number();
            case "string":
                return z.string();
            case "boolean":
                return z.boolean();
            case "Date":
                return z.date();
            case "string[]":
                return z.array(z.string());
            case "enum":
                return z.string();
            default:
                return z.unknown();
        }
    }
    applyRule(schema, rule, field) {
        switch (rule) {
            case "required":
                return schema.min(1, `${field.dtoField || "필드"}는 필수 입력 항목입니다`);
            case "unique":
                return schema.refine(() => true, `${field.dtoField}는 중복될 수 없습니다`);
            case "isEmail":
                return schema.email(`${field.dtoField || "필드"}는 올바른 이메일 형식이어야 합니다`);
            case "url":
                return schema.url(`${field.dtoField || "필드"}는 올바른 URL 형식이어야 합니다`);
            case "date":
                return schema.refine((val) => !isNaN(Date.parse(val)), `${field.dtoField || "필드"}는 올바른 날짜 형식이어야 합니다`);
            default:
                if (rule.startsWith("min:")) {
                    const min = parseInt(rule.split(":")[1] || "0");
                    const fieldName = field.dtoField || "필드";
                    return schema.min(min, `${fieldName}는 최소 ${min}자 이상이어야 합니다`);
                }
                if (rule.startsWith("max:")) {
                    const max = parseInt(rule.split(":")[1] || "0");
                    const fieldName = field.dtoField || "필드";
                    return schema.max(max, `${fieldName}는 최대 ${max}자까지 가능합니다`);
                }
                if (rule.startsWith("enum:")) {
                    const enumValues = (rule.split(":")[1] || "").split(",");
                    const fieldName = field.dtoField || "필드";
                    return schema.refine((val) => typeof val === "string" && enumValues.includes(val), `${fieldName}는 다음 중 하나여야 합니다: ${enumValues.join(", ")}`);
                }
                return schema;
        }
    }
    // Middleware factory
    validate(operation, entityName) {
        return (req, res, next) => {
            const schemaKey = `${operation}_${entityName.toLowerCase()}`;
            const schema = this.schemas.get(schemaKey);
            if (!schema) {
                return res.status(500).json({
                    message: `Validation schema not found for ${schemaKey}`,
                });
            }
            try {
                const validatedData = schema.parse(req.body);
                req.body = validatedData;
                next();
            }
            catch (error) {
                if (error instanceof z.ZodError) {
                    const zodError = error;
                    const errors = zodError.errors?.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })) || [];
                    return res.status(400).json({
                        message: "Validation failed",
                        errors,
                    });
                }
                return res.status(500).json({
                    message: "Validation error occurred",
                });
            }
        };
    }
    // Generic validation for any entity
    validateEntity(entityName, operation = "create") {
        return this.validate(operation, entityName);
    }
}
// Export singleton instance
const mixValidation
module.exports.mixValidation = mixValidation = new MixValidationMiddleware();
// Export convenience functions
const validateCreate
module.exports.validateCreate = validateCreate = (entityName) => mixValidation.validate("create", entityName);
const validateUpdate
module.exports.validateUpdate = validateUpdate = (entityName) => mixValidation.validate("update", entityName);
// Export specific validators
export const { validateUser, validateMachine, validatePost, validateGym, validateUserLevel, validateComment, validateUserUpdate, validateMachineUpdate, validatePostUpdate, validateGymUpdate, validateUserLevelUpdate, validateCommentUpdate, } = mixValidation;
