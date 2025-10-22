"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
require("reflect-metadata");
const errorHandler_1 = require('middlewares/errorHandler');
const routes_1 = __importDefault(require('routes'));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pathUtils_1 = require('utils/pathUtils');
const __dirname = (0, pathUtils_1.getDirname)();
const config = {
    corsOrigin: process.env.CORS_ORIGIN?.split(",").filter(origin => origin.trim() !== "") || [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5000",
        "http://localhost:5001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5001",
    ],
    environment: process.env.NODE_ENV || "development"
};
if (!config.corsOrigin || config.corsOrigin.length === 0) {
    console.warn('⚠️ CORS_ORIGIN 환경 변수가 설정되지 않았습니다. 기본 localhost 설정을 사용합니다.');
}
console.log("=".repeat(60));
console.log("🔧 EXPRESS APP INITIALIZATION DEBUG START");
console.log("=".repeat(60));
const app = (0, express_1.default)();
console.log("✅ Express app instance created");
const getCorsOptions = () => {
    console.log("🔄 Step 1: Configuring CORS options...");
    const isDevelopment = config.environment === "development";
    console.log(`   - Environment: ${config.environment}`);
    console.log(`   - Is Development: ${isDevelopment}`);
    const defaultLocalhostOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5000",
        "http://localhost:5001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5000",
        "http://127.0.0.1:5001",
    ];
    console.log(`   - Default localhost origins: ${defaultLocalhostOrigins.length} origins`);
    let envOrigins = config.corsOrigin && config.corsOrigin.length > 0
        ? config.corsOrigin
        : (isDevelopment ? defaultLocalhostOrigins : []);
    console.log(`   - Environment CORS origins: ${envOrigins.length} origins`);
    console.log(`   - Environment CORS origins: ${envOrigins.join(', ')}`);
    if (isDevelopment) {
        envOrigins = [...new Set([...envOrigins, ...defaultLocalhostOrigins])];
        console.log(`   - Final origins (with defaults): ${envOrigins.length} origins`);
    }
    console.log(`🌐 CORS 설정 - 환경: ${config.environment}`);
    console.log(`🌐 허용된 Origins: ${envOrigins.join(', ')}`);
    return {
        origin: (origin, callback) => {
            console.log(`🔍 CORS Check - Origin: ${origin || 'no origin'}`);
            if (!origin || envOrigins.includes(origin)) {
                console.log(`✅ CORS 허용: ${origin || 'no origin'}`);
                callback(null, true);
            }
            else {
                console.warn(`❌ CORS 차단: ${origin}`);
                console.warn(`🌐 허용된 Origins: ${envOrigins.join(', ')}`);
                callback(new Error(`Not allowed by CORS in ${config.environment}`), false);
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "X-API-Key",
        ],
        exposedHeaders: ["X-Total-Count"],
        maxAge: 86400,
    };
};
const corsOptions = getCorsOptions();
console.log("✅ CORS options configured");
console.log("🔄 Step 2: Configuring security middleware (Helmet)...");
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: [
                "'self'",
                "https://api.kakao.com",
                "https://maps.googleapis.com",
            ],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
}));
console.log("✅ Helmet security middleware configured");
console.log("🔄 Step 3: Configuring CORS middleware...");
app.use((0, cors_1.default)(corsOptions));
console.log("✅ CORS middleware configured");
console.log("🔄 Step 4: Configuring HTTP logging middleware (Morgan)...");
const morganFormat = config.environment === "production" ? "combined" : "dev";
console.log(`   - Morgan format: ${morganFormat}`);
app.use((0, morgan_1.default)(morganFormat));
console.log("✅ Morgan logging middleware configured");
console.log("🔄 Step 5: Configuring cookie parser middleware...");
app.use((0, cookie_parser_1.default)());
console.log("✅ Cookie parser middleware configured");
console.log("🔄 Step 6: Configuring body parsing middleware...");
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
console.log("✅ Body parsing middleware configured (JSON: 10MB, URL-encoded: 10MB)");
console.log("🔄 Step 7: Configuring static file serving...");
try {
    const imgPath = path_1.default.join(__dirname, "../../public/img");
    const publicPath = path_1.default.join(__dirname, "../../public");
    console.log(`   - Image path: ${imgPath}`);
    console.log(`   - Public path: ${publicPath}`);
    if (fs_1.default.existsSync(imgPath)) {
        app.use("/img", express_1.default.static(imgPath, {
            maxAge: "1d",
            etag: true,
        }));
        console.log("✅ Image static file serving configured");
    }
    else {
        console.log("⚠️ Image path does not exist, skipping image static serving");
    }
    if (fs_1.default.existsSync(publicPath)) {
        app.use("/public", express_1.default.static(publicPath, {
            maxAge: "1d",
            etag: true,
        }));
        console.log("✅ Public static file serving configured");
    }
    else {
        console.log("⚠️ Public path does not exist, skipping public static serving");
    }
}
catch (error) {
    console.log("⚠️ Static file serving configuration failed:", error instanceof Error ? error.message : String(error));
    console.log("⚠️ Continuing without static file serving...");
}
console.log("🔄 Step 8: Configuring root endpoints...");
app.get("/", (req, res) => {
    console.log(`🔍 Root endpoint accessed - ${req.method} ${req.url}`);
    res.json({
        message: "Deukgeun Backend API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: config.environment,
        status: "healthy",
    });
});
console.log("✅ Root endpoint configured");
app.get("/health", (req, res) => {
    console.log(`🔍 Health check accessed - ${req.method} ${req.url}`);
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
console.log("✅ Health check endpoint configured");
app.get("/debug", (req, res) => {
    console.log(`🔍 Debug endpoint accessed - ${req.method} ${req.url}`);
    res.status(200).json({
        status: "debug",
        timestamp: new Date().toISOString(),
        environment: config.environment,
        process: {
            pid: process.pid,
            version: process.version,
            platform: process.platform,
            arch: process.arch,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        },
        config: {
            environment: config.environment,
            corsOrigins: config.corsOrigin,
        },
        request: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
        }
    });
});
console.log("✅ Debug endpoint configured");
console.log("🔄 Step 9: Configuring API routes...");
app.use("/api", routes_1.default);
console.log("✅ API routes configured");
console.log("🔄 Step 10: Configuring error handler middleware...");
app.use(errorHandler_1.errorHandler);
console.log("✅ Error handler middleware configured");
console.log("=".repeat(60));
console.log("✅ EXPRESS APP INITIALIZATION COMPLETE");
console.log("=".repeat(60));
exports.default = app;
const createApp = () => {
    return app;
};
exports.createApp = createApp;
