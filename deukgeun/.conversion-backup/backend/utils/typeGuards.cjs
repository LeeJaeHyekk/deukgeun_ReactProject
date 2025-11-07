"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEnvironment = isValidEnvironment;
exports.isValidPort = isValidPort;
exports.isValidDatabaseConfig = isValidDatabaseConfig;
exports.isValidJWTConfig = isValidJWTConfig;
exports.isValidServerStatus = isValidServerStatus;
exports.isValidDatabaseStatus = isValidDatabaseStatus;
exports.isValidApiResponse = isValidApiResponse;
exports.isValidHealthResponse = isValidHealthResponse;
exports.safeGetEnvString = safeGetEnvString;
exports.safeGetEnvNumber = safeGetEnvNumber;
exports.safeGetEnvBoolean = safeGetEnvBoolean;
exports.safeGetEnvArray = safeGetEnvArray;
exports.validateDatabaseConnectionConfig = validateDatabaseConnectionConfig;
exports.validateJWTConfig = validateJWTConfig;
exports.validateServerConfig = validateServerConfig;
exports.validateAllConfigs = validateAllConfigs;
const guards_1 = require("../../shared/types/guards.cjs");
function isValidEnvironment(value) {
    return (0, guards_1.isString)(value) && ['development', 'production', 'test'].includes(value);
}
function isValidPort(value) {
    return (0, guards_1.isNumber)(value) && value > 0 && value <= 65535 && Number.isInteger(value);
}
function isValidDatabaseConfig(value) {
    if (!(0, guards_1.isObject)(value))
        return false;
    const config = value;
    return ((0, guards_1.isString)(config.host) &&
        isValidPort(config.port) &&
        (0, guards_1.isString)(config.username) &&
        (0, guards_1.isString)(config.password) &&
        (0, guards_1.isString)(config.database));
}
function isValidJWTConfig(value) {
    if (!(0, guards_1.isObject)(value))
        return false;
    const config = value;
    return ((0, guards_1.isString)(config.secret) &&
        (0, guards_1.isString)(config.expiresIn) &&
        (0, guards_1.isString)(config.accessSecret) &&
        (0, guards_1.isString)(config.refreshSecret));
}
function isValidServerStatus(value) {
    if (!(0, guards_1.isObject)(value))
        return false;
    const status = value;
    return ((0, guards_1.isString)(status.status) &&
        ['healthy', 'unhealthy', 'starting', 'stopping'].includes(status.status) &&
        (0, guards_1.isString)(status.timestamp) &&
        (0, guards_1.isNumber)(status.uptime) &&
        (0, guards_1.isObject)(status.memory) &&
        (0, guards_1.isNumber)(status.memory.rss) &&
        (0, guards_1.isNumber)(status.memory.heapTotal) &&
        (0, guards_1.isNumber)(status.memory.heapUsed) &&
        (0, guards_1.isNumber)(status.memory.external) &&
        (0, guards_1.isNumber)(status.memory.arrayBuffers));
}
function isValidDatabaseStatus(value) {
    if (!(0, guards_1.isObject)(value))
        return false;
    const status = value;
    return ((0, guards_1.isBoolean)(status.connected) &&
        (0, guards_1.isString)(status.host) &&
        isValidPort(status.port) &&
        (0, guards_1.isString)(status.database) &&
        (0, guards_1.isString)(status.lastChecked));
}
function isValidApiResponse(value) {
    if (!(0, guards_1.isObject)(value))
        return false;
    const response = value;
    return ((0, guards_1.isBoolean)(response.success) &&
        (0, guards_1.isString)(response.message) &&
        (0, guards_1.isString)(response.timestamp) &&
        (response.data === undefined || true) &&
        (response.error === undefined || (0, guards_1.isString)(response.error)));
}
function isValidHealthResponse(value) {
    if (!(0, guards_1.isObject)(value))
        return false;
    const response = value;
    return ((0, guards_1.isString)(response.status) &&
        ['healthy', 'unhealthy'].includes(response.status) &&
        (0, guards_1.isString)(response.timestamp) &&
        (0, guards_1.isNumber)(response.uptime) &&
        (0, guards_1.isString)(response.environment) &&
        isValidPort(response.port) &&
        (response.database === undefined || (0, guards_1.isString)(response.database)) &&
        (response.databaseHealth === undefined || (0, guards_1.isObject)(response.databaseHealth)) &&
        (response.memory === undefined || ((0, guards_1.isObject)(response.memory) &&
            (0, guards_1.isNumber)(response.memory.rss) &&
            (0, guards_1.isNumber)(response.memory.heapTotal) &&
            (0, guards_1.isNumber)(response.memory.heapUsed) &&
            (0, guards_1.isNumber)(response.memory.external) &&
            (0, guards_1.isNumber)(response.memory.arrayBuffers))));
}
function safeGetEnvString(key, defaultValue = '') {
    const value = process.env[key];
    return (0, guards_1.isString)(value) ? value : defaultValue;
}
function safeGetEnvNumber(key, defaultValue = 0) {
    const value = process.env[key];
    if ((0, guards_1.isString)(value)) {
        const parsed = parseInt(value, 10);
        if (key === 'PORT' || key === 'DB_PORT' || key === 'EMAIL_PORT' || key === 'MONITORING_PORT') {
            return isValidPort(parsed) ? parsed : defaultValue;
        }
        return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
}
function safeGetEnvBoolean(key, defaultValue = false) {
    const value = process.env[key];
    if ((0, guards_1.isString)(value)) {
        const lower = value.toLowerCase();
        return lower === 'true' || lower === '1' || lower === 'yes';
    }
    return defaultValue;
}
function safeGetEnvArray(key, defaultValue = []) {
    const value = process.env[key];
    if ((0, guards_1.isString)(value)) {
        return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }
    return defaultValue;
}
function validateDatabaseConnectionConfig() {
    const errors = [];
    const host = safeGetEnvString('DB_HOST', 'localhost');
    const port = safeGetEnvNumber('DB_PORT', 3306);
    const username = safeGetEnvString('DB_USERNAME', 'root');
    const password = safeGetEnvString('DB_PASSWORD', '');
    const database = safeGetEnvString('DB_DATABASE', 'deukgeun_db');
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (!(0, guards_1.isString)(host) || host.length === 0) {
        if (!isDevelopment) {
            errors.push('DB_HOST is required and must be a valid string');
        }
    }
    if (!isValidPort(port)) {
        errors.push('DB_PORT must be a valid port number (1-65535)');
    }
    if (!(0, guards_1.isString)(username) || username.length === 0) {
        if (!isDevelopment) {
            errors.push('DB_USERNAME is required and must be a valid string');
        }
    }
    if (!(0, guards_1.isString)(password)) {
        if (!isDevelopment) {
            errors.push('DB_PASSWORD must be a valid string');
        }
    }
    if (!(0, guards_1.isString)(database) || database.length === 0) {
        if (!isDevelopment) {
            errors.push('DB_DATABASE is required and must be a valid string');
        }
    }
    const config = {
        host,
        port,
        username,
        password,
        database
    };
    return {
        isValid: errors.length === 0,
        config: errors.length === 0 ? config : null,
        errors
    };
}
function validateJWTConfig() {
    const errors = [];
    const secret = safeGetEnvString('JWT_SECRET', 'dev_jwt_secret_key_2024');
    const expiresIn = safeGetEnvString('JWT_EXPIRES_IN', '7d');
    const accessSecret = safeGetEnvString('JWT_ACCESS_SECRET', 'dev_access_secret_2024');
    const refreshSecret = safeGetEnvString('JWT_REFRESH_SECRET', 'dev_refresh_secret_2024');
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (!(0, guards_1.isString)(secret) || secret.length === 0) {
        if (!isDevelopment) {
            errors.push('JWT_SECRET is required and must be a valid string');
        }
    }
    if (!(0, guards_1.isString)(expiresIn) || expiresIn.length === 0) {
        errors.push('JWT_EXPIRES_IN is required and must be a valid string');
    }
    if (!(0, guards_1.isString)(accessSecret) || accessSecret.length === 0) {
        if (!isDevelopment) {
            errors.push('JWT_ACCESS_SECRET is required and must be a valid string');
        }
    }
    if (!(0, guards_1.isString)(refreshSecret) || refreshSecret.length === 0) {
        if (!isDevelopment) {
            errors.push('JWT_REFRESH_SECRET is required and must be a valid string');
        }
    }
    const config = {
        secret,
        expiresIn,
        accessSecret,
        refreshSecret
    };
    return {
        isValid: errors.length === 0,
        config: errors.length === 0 ? config : null,
        errors
    };
}
function validateServerConfig() {
    const errors = [];
    const port = safeGetEnvNumber('PORT', 5000);
    const environment = safeGetEnvString('NODE_ENV', 'development');
    const corsOrigins = safeGetEnvArray('CORS_ORIGIN', [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5000',
        'http://localhost:5001'
    ]);
    if (!isValidPort(port)) {
        errors.push('PORT must be a valid port number (1-65535)');
    }
    if (!isValidEnvironment(environment)) {
        errors.push('NODE_ENV must be one of: development, production, test');
    }
    if (!(0, guards_1.isArray)(corsOrigins) || corsOrigins.length === 0) {
        errors.push('CORS_ORIGIN must be a valid comma-separated list of URLs');
    }
    const config = {
        port,
        environment,
        corsOrigins
    };
    return {
        isValid: errors.length === 0,
        config: errors.length === 0 ? config : null,
        errors
    };
}
function validateAllConfigs() {
    const serverConfig = validateServerConfig();
    const databaseConfig = validateDatabaseConnectionConfig();
    const jwtConfig = validateJWTConfig();
    const allErrors = [
        ...serverConfig.errors,
        ...databaseConfig.errors,
        ...jwtConfig.errors
    ];
    return {
        isValid: allErrors.length === 0,
        configs: {
            server: serverConfig,
            database: databaseConfig,
            jwt: jwtConfig
        },
        allErrors
    };
}
