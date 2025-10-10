const fs = require('fs');
const path = require('path');
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
    /**
     * Entity를 DTO로 변환
     */
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
    /**
     * DTO를 Entity로 변환
     */
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
    /**
     * DTO를 Frontend Type으로 변환
     */
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
    /**
     * Frontend Type을 DTO로 변환
     */
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
    /**
     * Entity를 Frontend Type으로 변환
     */
    entityToFrontend(entity, entityName) {
        const dto = this.entityToDto(entity, entityName);
        return this.dtoToFrontend(dto, entityName);
    }
    /**
     * Frontend Type을 Entity로 변환
     */
    frontendToEntity(frontend, entityName) {
        const dto = this.frontendToDto(frontend, entityName);
        return this.dtoToEntity(dto, entityName);
    }
    /**
     * 배열 변환
     */
    transformArray(items, entityName, direction) {
        return items.map(item => this.transformSingle(item, entityName, direction));
    }
    /**
     * 단일 객체 변환
     */
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
    /**
     * 값 변환 (타입별 처리)
     */
    transformValue(value, field, direction) {
        if (value === null || value === undefined) {
            return value;
        }
        // 날짜 변환
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
        // JSON 배열 변환
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
        // Enum 변환
        if (field.type === "enum") {
            return String(value);
        }
        // 기본 타입 변환
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
    /**
     * 관계 데이터 포함하여 변환
     */
    transformWithRelations(item, entityName, direction, includeRelations = []) {
        const result = this.transformSingle(item, entityName, direction);
        const entityConfig = this.getEntityConfig(entityName);
        if (!entityConfig) {
            return result;
        }
        // 관계 데이터 포함
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
    /**
     * 민감한 필드 제외
     */
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
    /**
     * 기본값 적용
     */
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
    /**
     * 기본값 추출
     */
    getDefaultValue(field) {
        const defaultRule = field.rules.find(rule => rule.startsWith("default:"));
        if (defaultRule) {
            const value = defaultRule.split(":")[1];
            return this.transformValue(value, field, "dtoToEntity");
        }
        return undefined;
    }
}
// Export singleton instance
const mixTransformer
module.exports.mixTransformer = mixTransformer = new MixTransformer();
// Export convenience functions
export const { entityToDto, dtoToEntity, dtoToFrontend, frontendToDto, entityToFrontend, frontendToEntity, transformArray, transformSingle, transformWithRelations, excludeSensitiveFields, applyDefaults, } = mixTransformer;
// Export specific entity transformers
const userTransformer
module.exports.userTransformer = userTransformer = {
    toDto: (entity) => entityToDto(entity, "user"),
    toEntity: (dto) => dtoToEntity(dto, "user"),
    toFrontend: (dto) => dtoToFrontend(dto, "user"),
    fromFrontend: (frontend) => frontendToDto(frontend, "user"),
};
const machineTransformer
module.exports.machineTransformer = machineTransformer = {
    toDto: (entity) => entityToDto(entity, "machine"),
    toEntity: (dto) => dtoToEntity(dto, "machine"),
    toFrontend: (dto) => dtoToFrontend(dto, "machine"),
    fromFrontend: (frontend) => frontendToDto(frontend, "machine"),
};
const postTransformer
module.exports.postTransformer = postTransformer = {
    toDto: (entity) => entityToDto(entity, "post"),
    toEntity: (dto) => dtoToEntity(dto, "post"),
    toFrontend: (dto) => dtoToFrontend(dto, "post"),
    fromFrontend: (frontend) => frontendToDto(frontend, "post"),
};
const gymTransformer
module.exports.gymTransformer = gymTransformer = {
    toDto: (entity) => entityToDto(entity, "gym"),
    toEntity: (dto) => dtoToEntity(dto, "gym"),
    toFrontend: (dto) => dtoToFrontend(dto, "gym"),
    fromFrontend: (frontend) => frontendToDto(frontend, "gym"),
};
const userLevelTransformer
module.exports.userLevelTransformer = userLevelTransformer = {
    toDto: (entity) => entityToDto(entity, "userlevel"),
    toEntity: (dto) => dtoToEntity(dto, "userlevel"),
    toFrontend: (dto) => dtoToFrontend(dto, "userlevel"),
    fromFrontend: (frontend) => frontendToDto(frontend, "userlevel"),
};
const commentTransformer
module.exports.commentTransformer = commentTransformer = {
    toDto: (entity) => entityToDto(entity, "comment"),
    toEntity: (dto) => dtoToEntity(dto, "comment"),
    toFrontend: (dto) => dtoToFrontend(dto, "comment"),
    fromFrontend: (frontend) => frontendToDto(frontend, "comment"),
};
