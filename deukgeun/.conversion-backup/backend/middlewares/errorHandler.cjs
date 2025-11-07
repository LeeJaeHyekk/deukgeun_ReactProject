"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require('../utils/logger.cjs');
const errorHandler = (error, req, res, _next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    logger_1.logger.error(`Error ${statusCode}: ${message}`, {
        error: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
    });
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
        },
    });
};
exports.errorHandler = errorHandler;
