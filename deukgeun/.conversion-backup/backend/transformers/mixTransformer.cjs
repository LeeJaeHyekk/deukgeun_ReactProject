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
exports.commentTransformer = exports.userLevelTransformer = exports.gymTransformer = exports.postTransformer = exports.machineTransformer = exports.userTransformer = exports.applyDefaults = exports.excludeSensitiveFields = exports.transformWithRelations = exports.transformSingle = exports.transformArray = exports.frontendToEntity = exports.entityToFrontend = exports.frontendToDto = exports.dtoToFrontend = exports.dtoToEntity = exports.entityToDto = exports.mixTransformer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MixTransformer {
    constructor() {
        this.config = {};
        this.loadConfig();
    }
    loadConfig() {
        const configPath = path.join(process.cwd(), "mix.json");
        this.config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    getEntityConfig(entityName) {
        return this.config.mapping.find(entity => entity.entity.toLowerCase() === entityName.toLowerCase());
    }
    entityToDto(entity, entityName) {
        const entityConfig = this.getEntityConfig(entityName);
        if (!entityConfig) {
            throw new Error(`Entity configuration not found for ${entityName}`);
        }
        const dto = {};
        entityConfig.fields.forEach(field => {
            if (field.dtoField !== null && !field.rules.includes("private")) {
                const value = entity[field.entityField];
                dto[field.dtoField] = this.transformValue(value, field, "entityToDto");
            }
        });
        return dto;
    }
    dtoToEntity(dto, entityName) {
        const entityConfig = this.getEntityConfig(entityName);
        if (!entityConfig) {
            throw new Error(`Entity configuration not found for ${entityName}`);
        }
        const entity = {};
        entityConfig.fields.forEach(field => {
            if (field.dtoField !== null && !field.rules.includes("readonly")) {
                const value = dto[field.dtoField];
                entity[field.entityField] = this.transformValue(value, field, "dtoToEntity");
            }
        });
        return entity;
    }
    dtoToFrontend(dto, entityName) {
        const entityConfig = this.getEntityConfig(entityName);
        if (!entityConfig) {
            throw new Error(`Entity configuration not found for ${entityName}`);
        }
        const frontend = {};
        entityConfig.fields.forEach(field => {
            if (field.dtoField !== null &&
                field.frontField !== null &&
                !field.rules.includes("private")) {
                const value = dto[field.dtoField];
                frontend[field.frontField] = this.transformValue(value, field, "dtoToFrontend");
            }
        });
        return frontend;
    }
    frontendToDto(frontend, entityName) {
        const entityConfig = this.getEntityConfig(entityName);
        if (!entityConfig) {
            throw new Error(`Entity configuration not found for ${entityName}`);
        }
        const dto = {};
        entityConfig.fields.forEach(field => {
            if (field.dtoField !== null &&
                field.frontField !== null &&
                !field.rules.includes("readonly")) {
                const value = frontend[field.frontField];
                dto[field.dtoField] = this.transformValue(value, field, "frontendToDto");
            }
        });
        return dto;
    }
    entityToFrontend(entity, entityName) {
        const dto = this.entityToDto(entity, entityName);
        return this.dtoToFrontend(dto, entityName);
    }
    frontendToEntity(frontend, entityName) {
        const dto = this.frontendToDto(frontend, entityName);
        return this.dtoToEntity(dto, entityName);
    }
    transformArray(items, entityName, direction) {
        return items.map(item => this.transformSingle(item, entityName, direction));
    }
    transformSingle(item, entityName, direction) {
        switch (direction) {
            case "entityToDto":
                return this.entityToDto(item, entityName);
            case "dtoToEntity":
                return this.dtoToEntity(item, entityName);
            case "dtoToFrontend":
                return this.dtoToFrontend(item, entityName);
            case "frontendToDto":
                return this.frontendToDto(item, entityName);
            case "entityToFrontend":
                return this.entityToFrontend(item, entityName);
            case "frontendToEntity":
                return this.frontendToEntity(item, entityName);
            default:
                throw new Error(`Unknown transformation direction: ${direction}`);
        }
    }
    transformValue(value, field, direction) {
        if (value === null || value === undefined) {
            return value;
        }
        if (field.type === "Date") {
            if (direction === "entityToDto" || direction === "dtoToEntity") {
                return value instanceof Date ? value : new Date(value);
            }
            else if (direction === "dtoToFrontend" ||
                direction === "entityToFrontend") {
                return value instanceof Date ? value.toISOString() : value;
            }
            else if (direction === "frontendToDto" ||
                direction === "frontendToEntity") {
                return typeof value === "string" ? new Date(value) : value;
            }
        }
        if (field.type === "string[]") {
            if (typeof value === "string") {
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value.split(",").map((item) => item.trim());
                }
            }
            return Array.isArray(value) ? value : [value];
        }
        if (field.type === "enum") {
            return String(value);
        }
        switch (field.type) {
            case "number":
                return Number(value);
            case "boolean":
                return Boolean(value);
            case "string":
                return String(value);
            default:
                return value;
        }
    }
    transformWithRelations(item, entityName, direction, includeRelations = []) {
        const result = this.transformSingle(item, entityName, direction);
        const entityConfig = this.getEntityConfig(entityName);
        if (!entityConfig) {
            return result;
        }
        includeRelations.forEach(relationName => {
            const relation = entityConfig.relations[relationName];
            if (relation && item[relationName]) {
                const relationData = Array.isArray(item[relationName])
                    ? this.transformArray(item[relationName], relation.target, direction)
                    : this.transformSingle(item[relationName], relation.target, direction);
                result[relationName] = relationData;
            }
        });
        return result;
    }
    excludeSensitiveFields(data, entityName) {
        const entityConfig = this.getEntityConfig(entityName);
        if (!entityConfig) {
            return data;
        }
        const result = { ...data };
        entityConfig.fields
            .filter(field => field.rules.includes("private") || field.rules.includes("exclude"))
            .forEach(field => {
            if (field.dtoField) {
                delete result[field.dtoField];
            }
            if (field.frontField) {
                delete result[field.frontField];
            }
        });
        return result;
    }
    applyDefaults(data, entityName) {
        const entityConfig = this.getEntityConfig(entityName);
        if (!entityConfig) {
            return data;
        }
        const result = { ...data };
        entityConfig.fields.forEach(field => {
            const defaultValue = this.getDefaultValue(field);
            if (defaultValue !== undefined) {
                if (field.dtoField && result[field.dtoField] === undefined) {
                    result[field.dtoField] = defaultValue;
                }
                if (field.frontField && result[field.frontField] === undefined) {
                    result[field.frontField] = defaultValue;
                }
            }
        });
        return result;
    }
    getDefaultValue(field) {
        const defaultRule = field.rules.find(rule => rule.startsWith("default:"));
        if (defaultRule) {
            const value = defaultRule.split(":")[1];
            return this.transformValue(value, field, "dtoToEntity");
        }
        return undefined;
    }
}
exports.mixTransformer = new MixTransformer();
exports.entityToDto = exports.mixTransformer.entityToDto, exports.dtoToEntity = exports.mixTransformer.dtoToEntity, exports.dtoToFrontend = exports.mixTransformer.dtoToFrontend, exports.frontendToDto = exports.mixTransformer.frontendToDto, exports.entityToFrontend = exports.mixTransformer.entityToFrontend, exports.frontendToEntity = exports.mixTransformer.frontendToEntity, exports.transformArray = exports.mixTransformer.transformArray, exports.transformSingle = exports.mixTransformer.transformSingle, exports.transformWithRelations = exports.mixTransformer.transformWithRelations, exports.excludeSensitiveFields = exports.mixTransformer.excludeSensitiveFields, exports.applyDefaults = exports.mixTransformer.applyDefaults;
exports.userTransformer = {
    toDto: (entity) => (0, exports.entityToDto)(entity, "user"),
    toEntity: (dto) => (0, exports.dtoToEntity)(dto, "user"),
    toFrontend: (dto) => (0, exports.dtoToFrontend)(dto, "user"),
    fromFrontend: (frontend) => (0, exports.frontendToDto)(frontend, "user"),
};
exports.machineTransformer = {
    toDto: (entity) => (0, exports.entityToDto)(entity, "machine"),
    toEntity: (dto) => (0, exports.dtoToEntity)(dto, "machine"),
    toFrontend: (dto) => (0, exports.dtoToFrontend)(dto, "machine"),
    fromFrontend: (frontend) => (0, exports.frontendToDto)(frontend, "machine"),
};
exports.postTransformer = {
    toDto: (entity) => (0, exports.entityToDto)(entity, "post"),
    toEntity: (dto) => (0, exports.dtoToEntity)(dto, "post"),
    toFrontend: (dto) => (0, exports.dtoToFrontend)(dto, "post"),
    fromFrontend: (frontend) => (0, exports.frontendToDto)(frontend, "post"),
};
exports.gymTransformer = {
    toDto: (entity) => (0, exports.entityToDto)(entity, "gym"),
    toEntity: (dto) => (0, exports.dtoToEntity)(dto, "gym"),
    toFrontend: (dto) => (0, exports.dtoToFrontend)(dto, "gym"),
    fromFrontend: (frontend) => (0, exports.frontendToDto)(frontend, "gym"),
};
exports.userLevelTransformer = {
    toDto: (entity) => (0, exports.entityToDto)(entity, "userlevel"),
    toEntity: (dto) => (0, exports.dtoToEntity)(dto, "userlevel"),
    toFrontend: (dto) => (0, exports.dtoToFrontend)(dto, "userlevel"),
    fromFrontend: (frontend) => (0, exports.frontendToDto)(frontend, "userlevel"),
};
exports.commentTransformer = {
    toDto: (entity) => (0, exports.entityToDto)(entity, "comment"),
    toEntity: (dto) => (0, exports.dtoToEntity)(dto, "comment"),
    toFrontend: (dto) => (0, exports.dtoToFrontend)(dto, "comment"),
    fromFrontend: (frontend) => (0, exports.frontendToDto)(frontend, "comment"),
};
