"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountRecoveryService = void 0;
const databaseConfig_1 = require('config/databaseConfig');
const User_1 = require('entities/User');
const VerificationToken_1 = require('entities/VerificationToken');
const PasswordResetToken_1 = require('entities/PasswordResetToken');
const logger_1 = require('utils/logger');
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
class AccountRecoveryService {
    constructor() {
        this.userRepo = databaseConfig_1.AppDataSource.getRepository(User_1.User);
        this.verificationTokenRepo = databaseConfig_1.AppDataSource.getRepository(VerificationToken_1.VerificationToken);
        this.passwordResetTokenRepo = databaseConfig_1.AppDataSource.getRepository(PasswordResetToken_1.PasswordResetToken);
        this.rateLimitStore = new Map();
    }
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    generateSecureToken() {
        return crypto_1.default.randomBytes(32).toString("hex");
    }
    maskData(data, type) {
        if (type === "email") {
            const [local, domain] = data.split("@");
            if (!local || !domain || local.length <= 2)
                return data;
            return `${local.substring(0, 2)}***@${domain}`;
        }
        else if (type === "phone") {
            return data.replace(/(\d{3})-(\d{4})-\d{4}/, "$1-$2-****");
        }
        return data;
    }
    checkRateLimit(ipAddress, action) {
        const key = `${ipAddress}:${action}`;
        const now = new Date();
        const limit = this.getRateLimit(action);
        const current = this.rateLimitStore.get(key);
        if (!current || now > current.resetTime) {
            const resetTime = new Date(now.getTime() + 60 * 60 * 1000);
            this.rateLimitStore.set(key, { count: 1, resetTime });
            return { allowed: true, remaining: limit - 1, resetTime };
        }
        if (current.count >= limit) {
            return { allowed: false, remaining: 0, resetTime: current.resetTime };
        }
        current.count++;
        return {
            allowed: true,
            remaining: limit - current.count,
            resetTime: current.resetTime,
        };
    }
    getRateLimit(action) {
        const limits = {
            find_id_step1: 5,
            find_id_step2: 10,
            reset_password_step1: 5,
            reset_password_step2: 10,
            reset_password_step3: 5,
            email_verification: 3,
        };
        return limits[action] || 5;
    }
    async findIdSimple(name, phone, securityInfo, gender, birthday) {
        try {
            const rateLimit = this.checkRateLimit(securityInfo.ipAddress, "find_id_simple");
            if (!rateLimit.allowed) {
                this.logRecoveryAction({
                    action: "find_id_simple_rate_limited",
                    email: "unknown",
                    type: "find_id",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "Rate limit exceeded",
                    success: false,
                });
                return {
                    success: false,
                    error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
                };
            }
            const validation = this.validateUserInput({
                name,
                phone,
                ...(gender && { gender }),
                ...(birthday && { birthday }),
            }, "find_id_simple");
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors[0] || "Validation failed",
                };
            }
            const whereClause = {
                nickname: name.trim(),
                phone: phone.trim(),
            };
            if (gender) {
                whereClause.gender = gender;
            }
            if (birthday) {
                whereClause.birthday = birthday;
            }
            const user = await this.userRepo.findOne({
                where: whereClause,
            });
            if (!user) {
                this.logRecoveryAction({
                    action: "find_id_simple_user_not_found",
                    email: "unknown",
                    type: "find_id",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "User not found",
                    success: false,
                });
                return {
                    success: false,
                    error: "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
                };
            }
            const maskedUsername = this.maskUsername(user.email);
            this.logRecoveryAction({
                action: "find_id_simple_success",
                email: user.email,
                type: "find_id",
                status: "success",
                ipAddress: securityInfo.ipAddress,
                userAgent: securityInfo.userAgent || null,
                timestamp: securityInfo.timestamp,
                success: true,
            });
            return {
                success: true,
                data: { username: maskedUsername },
            };
        }
        catch (error) {
            logger_1.logger.error("단순 아이디 찾기 처리 중 오류:", error);
            return {
                success: false,
                error: "서버 오류가 발생했습니다.",
            };
        }
    }
    async resetPasswordSimpleStep1(username, name, phone, securityInfo, gender, birthday) {
        try {
            const rateLimit = this.checkRateLimit(securityInfo.ipAddress, "reset_password_simple_step1");
            if (!rateLimit.allowed) {
                this.logRecoveryAction({
                    action: "reset_password_simple_step1_rate_limited",
                    email: "unknown",
                    type: "reset_password",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "Rate limit exceeded",
                    success: false,
                });
                return {
                    success: false,
                    error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
                };
            }
            const validation = this.validateUserInput({
                username,
                name,
                phone,
                ...(gender && { gender }),
                ...(birthday && { birthday }),
            }, "reset_password_simple_step1");
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors[0] || "Validation failed",
                };
            }
            const whereClause = {
                email: username.trim(),
                nickname: name.trim(),
                phone: phone.trim(),
            };
            if (gender) {
                whereClause.gender = gender;
            }
            if (birthday) {
                whereClause.birthday = birthday;
            }
            const user = await this.userRepo.findOne({
                where: whereClause,
            });
            if (!user) {
                this.logRecoveryAction({
                    action: "reset_password_simple_step1_user_not_found",
                    email: username,
                    type: "reset_password",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "User not found",
                    success: false,
                });
                return {
                    success: false,
                    error: "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
                };
            }
            const code = this.generateVerificationCode();
            const token = this.generateSecureToken();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            const verificationToken = this.verificationTokenRepo.create({
                token,
                email: user.email,
                type: "reset_password",
                code,
                expiresAt,
                ...(user.phone && { phone: user.phone }),
                name: user.nickname,
                ipAddress: securityInfo.ipAddress,
                ...(securityInfo.userAgent && { userAgent: securityInfo.userAgent }),
            });
            await this.verificationTokenRepo.save(verificationToken);
            this.logRecoveryAction({
                action: "reset_password_simple_step1_success",
                email: user.email,
                type: "reset_password",
                status: "success",
                ipAddress: securityInfo.ipAddress,
                userAgent: securityInfo.userAgent || null,
                timestamp: securityInfo.timestamp,
                success: true,
            });
            return {
                success: true,
                data: {
                    email: user.email,
                    nickname: user.nickname,
                    maskedEmail: this.maskData(user.email, "email"),
                    maskedPhone: this.maskData(user.phone || "", "phone"),
                    verificationCode: code,
                },
            };
        }
        catch (error) {
            logger_1.logger.error("단순 비밀번호 재설정 Step 1 처리 중 오류:", error);
            return {
                success: false,
                error: "서버 오류가 발생했습니다.",
            };
        }
    }
    async resetPasswordSimpleStep2(username, code, newPassword, confirmPassword, securityInfo) {
        try {
            const rateLimit = this.checkRateLimit(securityInfo.ipAddress, "reset_password_simple_step2");
            if (!rateLimit.allowed) {
                this.logRecoveryAction({
                    action: "reset_password_simple_step2_rate_limited",
                    email: "unknown",
                    type: "reset_password",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "Rate limit exceeded",
                    success: false,
                });
                return {
                    success: false,
                    error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
                };
            }
            const validation = this.validateUserInput({ username, newPassword, confirmPassword }, "reset_password_simple_step2");
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors[0] || "Validation failed",
                };
            }
            if (process.env.NODE_ENV === "development" && code === "000000") {
                logger_1.logger.info("개발 환경에서 인증 코드 검증 건너뛰기");
            }
            else {
                const verificationToken = await this.verificationTokenRepo.findOne({
                    where: {
                        email: username.toLowerCase().trim(),
                        type: "reset_password",
                        code,
                        isUsed: false,
                        expiresAt: new Date(),
                    },
                });
                if (!verificationToken) {
                    this.logRecoveryAction({
                        action: "reset_password_simple_step2_invalid_code",
                        email: username,
                        type: "reset_password",
                        status: "failure",
                        ipAddress: securityInfo.ipAddress,
                        userAgent: securityInfo.userAgent || null,
                        timestamp: securityInfo.timestamp,
                        error: "Invalid or expired code",
                        success: false,
                    });
                    return {
                        success: false,
                        error: "인증 코드가 유효하지 않거나 만료되었습니다.",
                    };
                }
                verificationToken.isUsed = true;
                verificationToken.usedAt = new Date();
                await this.verificationTokenRepo.save(verificationToken);
            }
            const user = await this.userRepo.findOne({
                where: { email: username.toLowerCase().trim() },
            });
            if (!user) {
                return { success: false, error: "사용자를 찾을 수 없습니다." };
            }
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 12);
            user.password = hashedPassword;
            await this.userRepo.save(user);
            this.logRecoveryAction({
                action: "reset_password_simple_step2_success",
                email: user.email,
                type: "reset_password",
                status: "success",
                ipAddress: securityInfo.ipAddress,
                userAgent: securityInfo.userAgent || null,
                timestamp: securityInfo.timestamp,
                success: true,
            });
            return {
                success: true,
                data: { message: "비밀번호가 성공적으로 재설정되었습니다." },
            };
        }
        catch (error) {
            logger_1.logger.error("단순 비밀번호 재설정 Step 2 처리 중 오류:", error);
            return {
                success: false,
                error: "서버 오류가 발생했습니다.",
            };
        }
    }
    maskUsername(email) {
        if (!email || email.length < 3)
            return "***";
        const atIndex = email.indexOf("@");
        if (atIndex === -1) {
            const visiblePart = email.substring(0, Math.min(3, email.length));
            return `${visiblePart}****`;
        }
        const username = email.substring(0, atIndex);
        const domain = email.substring(atIndex);
        if (username.length <= 3) {
            return `${username}****${domain}`;
        }
        const visiblePart = username.substring(0, 3);
        return `${visiblePart}****${domain}`;
    }
    validateUserInput(data, type) {
        const errors = [];
        if (data.name) {
            if (data.name.trim().length < 2) {
                errors.push("이름은 2자 이상이어야 합니다.");
            }
            if (data.name.trim().length > 20) {
                errors.push("이름은 20자 이하여야 합니다.");
            }
        }
        if (data.phone) {
            const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
            if (!phoneRegex.test(data.phone.replace(/-/g, ""))) {
                errors.push("유효한 휴대폰 번호를 입력하세요.");
            }
        }
        if (data.email || data.username) {
            const email = data.email || data.username;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push("유효한 이메일 주소를 입력하세요.");
            }
        }
        if (data.gender && !["male", "female", "other"].includes(data.gender)) {
            errors.push("유효한 성별을 선택하세요.");
        }
        if (data.birthday) {
            let birthdayStr;
            if (data.birthday instanceof Date) {
                birthdayStr = data.birthday.toISOString().split("T")[0];
            }
            else if (typeof data.birthday === "string") {
                birthdayStr = data.birthday;
            }
            else {
                errors.push("유효한 생년월일을 입력하세요.");
                return { isValid: false, errors };
            }
            const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!birthdayRegex.test(birthdayStr)) {
                errors.push("생년월일은 YYYY-MM-DD 형식으로 입력하세요.");
            }
            else {
                const date = new Date(birthdayStr);
                if (isNaN(date.getTime())) {
                    errors.push("유효한 생년월일을 입력하세요.");
                }
            }
        }
        if (data.newPassword) {
            if (data.newPassword.length < 8) {
                errors.push("비밀번호는 최소 8자 이상이어야 합니다.");
            }
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
                errors.push("비밀번호는 영문 대소문자와 숫자를 포함해야 합니다.");
            }
            if (data.newPassword !== data.confirmPassword) {
                errors.push("비밀번호가 일치하지 않습니다.");
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
    logRecoveryAction(log) {
        logger_1.logger.info(`Account Recovery: ${log.action}`, {
            email: log.email,
            type: log.type,
            status: log.status,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            error: log.error,
        });
    }
    async findIdStep1(name, phone, securityInfo) {
        try {
            const rateLimit = this.checkRateLimit(securityInfo.ipAddress, "find_id_step1");
            if (!rateLimit.allowed) {
                this.logRecoveryAction({
                    action: "find_id_step1_rate_limited",
                    email: "unknown",
                    type: "find_id",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "Rate limit exceeded",
                    success: false,
                });
                return {
                    success: false,
                    error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
                };
            }
            const validation = this.validateUserInput({ name, phone }, "find_id");
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors[0] || "Validation failed",
                };
            }
            const user = await this.userRepo.findOne({
                where: {
                    nickname: name.trim(),
                    phone: phone.trim(),
                },
            });
            if (!user) {
                this.logRecoveryAction({
                    action: "find_id_step1_user_not_found",
                    email: "unknown",
                    type: "find_id",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "User not found",
                    success: false,
                });
                return {
                    success: false,
                    error: "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
                };
            }
            const code = this.generateVerificationCode();
            const token = this.generateSecureToken();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            const verificationToken = this.verificationTokenRepo.create({
                token,
                email: user.email,
                type: "find_id",
                code,
                expiresAt,
                ...(user.phone && { phone: user.phone }),
                name: user.nickname,
                ipAddress: securityInfo.ipAddress,
                ...(securityInfo.userAgent && { userAgent: securityInfo.userAgent }),
            });
            await this.verificationTokenRepo.save(verificationToken);
            this.logRecoveryAction({
                action: "find_id_step1_success",
                email: user.email,
                type: "find_id",
                status: "success",
                ipAddress: securityInfo.ipAddress,
                userAgent: securityInfo.userAgent || null,
                timestamp: securityInfo.timestamp,
                success: true,
            });
            return {
                success: true,
                data: {
                    email: user.email,
                    nickname: user.nickname,
                    maskedEmail: this.maskData(user.email, "email"),
                    maskedPhone: this.maskData(user.phone || "", "phone"),
                    verificationCode: code,
                },
            };
        }
        catch (error) {
            logger_1.logger.error("Find ID Step 1 error:", error);
            return { success: false, error: "서버 오류가 발생했습니다." };
        }
    }
    async findIdStep2(email, code, securityInfo) {
        try {
            const rateLimit = this.checkRateLimit(securityInfo.ipAddress, "find_id_step2");
            if (!rateLimit.allowed) {
                return {
                    success: false,
                    error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
                };
            }
            const verificationToken = await this.verificationTokenRepo.findOne({
                where: {
                    email: email.toLowerCase().trim(),
                    type: "find_id",
                    code,
                    isUsed: false,
                    expiresAt: new Date(),
                },
            });
            if (!verificationToken) {
                this.logRecoveryAction({
                    action: "find_id_step2_invalid_code",
                    email,
                    type: "find_id",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "Invalid or expired code",
                    success: false,
                });
                return {
                    success: false,
                    error: "인증 코드가 유효하지 않거나 만료되었습니다.",
                };
            }
            verificationToken.isUsed = true;
            verificationToken.usedAt = new Date();
            await this.verificationTokenRepo.save(verificationToken);
            const user = await this.userRepo.findOne({
                where: { email: email.toLowerCase().trim() },
            });
            if (!user) {
                return { success: false, error: "사용자를 찾을 수 없습니다." };
            }
            this.logRecoveryAction({
                action: "find_id_step2_success",
                email: user.email,
                type: "find_id",
                status: "success",
                ipAddress: securityInfo.ipAddress,
                userAgent: securityInfo.userAgent || null,
                timestamp: securityInfo.timestamp,
                success: true,
            });
            return {
                success: true,
                data: {
                    email: user.email,
                    nickname: user.nickname,
                },
            };
        }
        catch (error) {
            logger_1.logger.error("Find ID Step 2 error:", error);
            return { success: false, error: "서버 오류가 발생했습니다." };
        }
    }
    async resetPasswordStep1(name, phone, securityInfo) {
        try {
            const rateLimit = this.checkRateLimit(securityInfo.ipAddress, "reset_password_step1");
            if (!rateLimit.allowed) {
                return {
                    success: false,
                    error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
                };
            }
            const validation = this.validateUserInput({ name, phone }, "reset_password");
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors[0] || "Validation failed",
                };
            }
            const user = await this.userRepo.findOne({
                where: {
                    nickname: name.trim(),
                    phone: phone.trim(),
                },
            });
            if (!user) {
                this.logRecoveryAction({
                    action: "reset_password_step1_user_not_found",
                    email: "unknown",
                    type: "reset_password",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "User not found",
                    success: false,
                });
                return {
                    success: false,
                    error: "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
                };
            }
            const code = this.generateVerificationCode();
            const token = this.generateSecureToken();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            const verificationToken = this.verificationTokenRepo.create({
                token,
                email: user.email,
                type: "reset_password",
                code,
                expiresAt,
                ...(user.phone && { phone: user.phone }),
                name: user.nickname,
                ipAddress: securityInfo.ipAddress,
                ...(securityInfo.userAgent && { userAgent: securityInfo.userAgent }),
            });
            await this.verificationTokenRepo.save(verificationToken);
            this.logRecoveryAction({
                action: "reset_password_step1_success",
                email: user.email,
                type: "reset_password",
                status: "success",
                ipAddress: securityInfo.ipAddress,
                userAgent: securityInfo.userAgent || null,
                timestamp: securityInfo.timestamp,
                success: true,
            });
            return {
                success: true,
                data: {
                    email: user.email,
                    nickname: user.nickname,
                    maskedEmail: this.maskData(user.email, "email"),
                    maskedPhone: this.maskData(user.phone || "", "phone"),
                    verificationCode: code,
                },
            };
        }
        catch (error) {
            logger_1.logger.error("Reset Password Step 1 error:", error);
            return { success: false, error: "서버 오류가 발생했습니다." };
        }
    }
    async resetPasswordStep2(email, code, securityInfo) {
        try {
            const rateLimit = this.checkRateLimit(securityInfo.ipAddress, "reset_password_step2");
            if (!rateLimit.allowed) {
                return {
                    success: false,
                    error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
                };
            }
            const verificationToken = await this.verificationTokenRepo.findOne({
                where: {
                    email: email.toLowerCase().trim(),
                    type: "reset_password",
                    code,
                    isUsed: false,
                    expiresAt: new Date(),
                },
            });
            if (!verificationToken) {
                this.logRecoveryAction({
                    action: "reset_password_step2_invalid_code",
                    email,
                    type: "reset_password",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "Invalid or expired code",
                    success: false,
                });
                return {
                    success: false,
                    error: "인증 코드가 유효하지 않거나 만료되었습니다.",
                };
            }
            verificationToken.isUsed = true;
            verificationToken.usedAt = new Date();
            await this.verificationTokenRepo.save(verificationToken);
            const resetToken = this.generateSecureToken();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
            const passwordResetToken = this.passwordResetTokenRepo.create({
                token: resetToken,
                email: email.toLowerCase().trim(),
                expiresAt,
                ipAddress: securityInfo.ipAddress,
                ...(securityInfo.userAgent && { userAgent: securityInfo.userAgent }),
            });
            await this.passwordResetTokenRepo.save(passwordResetToken);
            this.logRecoveryAction({
                action: "reset_password_step2_success",
                email,
                type: "reset_password",
                status: "success",
                ipAddress: securityInfo.ipAddress,
                userAgent: securityInfo.userAgent || null,
                timestamp: securityInfo.timestamp,
                success: true,
            });
            return {
                success: true,
                data: {
                    resetToken,
                },
            };
        }
        catch (error) {
            logger_1.logger.error("Reset Password Step 2 error:", error);
            return { success: false, error: "서버 오류가 발생했습니다." };
        }
    }
    async resetPasswordStep3(resetToken, newPassword, confirmPassword, securityInfo) {
        try {
            const rateLimit = this.checkRateLimit(securityInfo.ipAddress, "reset_password_step3");
            if (!rateLimit.allowed) {
                return {
                    success: false,
                    error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
                };
            }
            const validation = this.validateUserInput({ newPassword, confirmPassword }, "reset_password");
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors[0] || "Validation failed",
                };
            }
            const passwordResetToken = await this.passwordResetTokenRepo.findOne({
                where: {
                    token: resetToken,
                    isUsed: false,
                    expiresAt: new Date(),
                },
            });
            if (!passwordResetToken) {
                this.logRecoveryAction({
                    action: "reset_password_step3_invalid_token",
                    email: "unknown",
                    type: "reset_password",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "Invalid or expired token",
                    success: false,
                });
                return {
                    success: false,
                    error: "비밀번호 재설정 토큰이 유효하지 않거나 만료되었습니다.",
                };
            }
            const user = await this.userRepo.findOne({
                where: { email: passwordResetToken.email },
            });
            if (!user) {
                return { success: false, error: "사용자를 찾을 수 없습니다." };
            }
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 12);
            user.password = hashedPassword;
            await this.userRepo.save(user);
            passwordResetToken.isUsed = true;
            passwordResetToken.usedAt = new Date();
            await this.passwordResetTokenRepo.save(passwordResetToken);
            this.logRecoveryAction({
                action: "reset_password_step3_success",
                email: user.email,
                type: "reset_password",
                status: "success",
                ipAddress: securityInfo.ipAddress,
                userAgent: securityInfo.userAgent || null,
                timestamp: securityInfo.timestamp,
                success: true,
            });
            return { success: true };
        }
        catch (error) {
            logger_1.logger.error("Reset Password Step 3 error:", error);
            return { success: false, error: "서버 오류가 발생했습니다." };
        }
    }
    async findIdByEmail(email, securityInfo) {
        try {
            const rateLimit = this.checkRateLimit(securityInfo.ipAddress, "email_verification");
            if (!rateLimit.allowed) {
                return {
                    success: false,
                    error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
                };
            }
            const user = await this.userRepo.findOne({
                where: { email: email.toLowerCase().trim() },
            });
            if (!user) {
                this.logRecoveryAction({
                    action: "find_id_email_user_not_found",
                    email,
                    type: "find_id",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "User not found",
                    success: false,
                });
                return {
                    success: false,
                    error: "해당 이메일로 가입된 계정을 찾을 수 없습니다.",
                };
            }
            this.logRecoveryAction({
                action: "find_id_email_success",
                email: user.email,
                type: "find_id",
                status: "success",
                ipAddress: securityInfo.ipAddress,
                userAgent: securityInfo.userAgent || null,
                timestamp: securityInfo.timestamp,
                success: true,
            });
            return {
                success: true,
                data: {
                    email: user.email,
                    nickname: user.nickname,
                },
            };
        }
        catch (error) {
            logger_1.logger.error("Find ID by email error:", error);
            return { success: false, error: "서버 오류가 발생했습니다." };
        }
    }
    async findPasswordByEmail(email, securityInfo) {
        try {
            const rateLimit = this.checkRateLimit(securityInfo.ipAddress, "email_verification");
            if (!rateLimit.allowed) {
                return {
                    success: false,
                    error: "요청이 너무 많습니다. 1시간 후에 다시 시도해주세요.",
                };
            }
            const user = await this.userRepo.findOne({
                where: { email: email.toLowerCase().trim() },
            });
            if (!user) {
                this.logRecoveryAction({
                    action: "find_password_email_user_not_found",
                    email,
                    type: "reset_password",
                    status: "failure",
                    ipAddress: securityInfo.ipAddress,
                    userAgent: securityInfo.userAgent || null,
                    timestamp: securityInfo.timestamp,
                    error: "User not found",
                    success: false,
                });
                return {
                    success: false,
                    error: "해당 이메일로 가입된 계정을 찾을 수 없습니다.",
                };
            }
            const resetToken = this.generateSecureToken();
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
            const passwordResetToken = this.passwordResetTokenRepo.create({
                token: resetToken,
                email: user.email,
                expiresAt,
                ipAddress: securityInfo.ipAddress,
                ...(securityInfo.userAgent && { userAgent: securityInfo.userAgent }),
            });
            await this.passwordResetTokenRepo.save(passwordResetToken);
            this.logRecoveryAction({
                action: "find_password_email_success",
                email: user.email,
                type: "reset_password",
                status: "success",
                ipAddress: securityInfo.ipAddress,
                userAgent: securityInfo.userAgent || null,
                timestamp: securityInfo.timestamp,
                success: true,
            });
            return {
                success: true,
                data: {
                    email: user.email,
                    nickname: user.nickname,
                    resetToken: resetToken,
                },
            };
        }
        catch (error) {
            logger_1.logger.error("Find password by email error:", error);
            return { success: false, error: "서버 오류가 발생했습니다." };
        }
    }
    async cleanupExpiredTokens() {
        try {
            const now = new Date();
            await this.verificationTokenRepo.delete({
                expiresAt: now,
            });
            await this.passwordResetTokenRepo.delete({
                expiresAt: now,
            });
            logger_1.logger.info("Expired tokens cleaned up successfully");
        }
        catch (error) {
            logger_1.logger.error("Error cleaning up expired tokens:", error);
        }
    }
}
exports.accountRecoveryService = new AccountRecoveryService();
