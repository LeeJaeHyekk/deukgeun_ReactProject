"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommentUpdate = exports.validateUserLevelUpdate = exports.validateGymUpdate = exports.validatePostUpdate = exports.validateMachineUpdate = exports.validateUserUpdate = exports.validateComment = exports.validateUserLevel = exports.validateGym = exports.validatePost = exports.validateMachine = exports.validateUser = exports.validateUpdate = exports.validateCreate = exports.mixValidation = void 0;
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MixValidationMiddleware {
    constructor() {
        this.schemas = new Map();
        this.validateUser = this.validateEntity.bind(this, "user");
        this.validateMachine = this.validateEntity.bind(this, "machine");
        this.validatePost = this.validateEntity.bind(this, "post");
        this.validateGym = this.validateEntity.bind(this, "gym");
        this.validateUserLevel = this.validateEntity.bind(this, "userlevel");
        this.validateComment = this.validateEntity.bind(this, "comment");
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
        return zod_1.z.object(schemaObject);
    }
    generateUpdateSchema(entity) {
        const createSchema = this.generateCreateSchema(entity);
        return createSchema.partial().extend({
            id: zod_1.z.number().positive("유효하지 않은 ID입니다"),
        });
    }
    generateFieldSchema(field) {
        let schema = this.getBaseSchema(field.type);
        field.rules.forEach(rule => {
            schema = this.applyRule(schema, rule, field);
        });
        return schema;
    }
    getBaseSchema(type) {
        switch (type) {
            case "number":
                return zod_1.z.number();
            case "string":
                return zod_1.z.string();
            case "boolean":
                return zod_1.z.boolean();
            case "Date":
                return zod_1.z.date();
            case "string[]":
                return zod_1.z.array(zod_1.z.string());
            case "enum":
                return zod_1.z.string();
            default:
                return zod_1.z.unknown();
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
                if (error instanceof zod_1.z.ZodError) {
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
    validateEntity(entityName, operation = "create") {
        return this.validate(operation, entityName);
    }
}
exports.mixValidation = new MixValidationMiddleware();
const validateCreate = (entityName) => exports.mixValidation.validate("create", entityName);
exports.validateCreate = validateCreate;
const validateUpdate = (entityName) => exports.mixValidation.validate("update", entityName);
exports.validateUpdate = validateUpdate;
exports.validateUser = exports.mixValidation.validateUser, exports.validateMachine = exports.mixValidation.validateMachine, exports.validatePost = exports.mixValidation.validatePost, exports.validateGym = exports.mixValidation.validateGym, exports.validateUserLevel = exports.mixValidation.validateUserLevel, exports.validateComment = exports.mixValidation.validateComment, exports.validateUserUpdate = exports.mixValidation.validateUserUpdate, exports.validateMachineUpdate = exports.mixValidation.validateMachineUpdate, exports.validatePostUpdate = exports.mixValidation.validatePostUpdate, exports.validateGymUpdate = exports.mixValidation.validateGymUpdate, exports.validateUserLevelUpdate = exports.mixValidation.validateUserLevelUpdate, exports.validateCommentUpdate = exports.mixValidation.validateCommentUpdate;
