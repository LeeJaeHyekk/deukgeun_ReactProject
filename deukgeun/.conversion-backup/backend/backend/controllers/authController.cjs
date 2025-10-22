"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
exports.login = login;
exports.refreshToken = refreshToken;
exports.logout = logout;
exports.checkAuth = checkAuth;
exports.findId = findId;
exports.findPassword = findPassword;
exports.findIdStep1 = findIdStep1;
exports.findIdStep2 = findIdStep2;
exports.resetPasswordStep1 = resetPasswordStep1;
exports.resetPasswordStep2 = resetPasswordStep2;
exports.resetPasswordStep3 = resetPasswordStep3;
exports.findIdSimple = findIdSimple;
exports.resetPasswordSimpleStep1 = resetPasswordSimpleStep1;
exports.resetPasswordSimpleStep2 = resetPasswordSimpleStep2;
const User_1 = require('entities/User');
const UserLevel_1 = require('entities/UserLevel');
const UserStreak_1 = require('entities/UserStreak');
const bcrypt_1 = __importDefault(require("bcrypt"));
const recaptcha_1 = require('utils/recaptcha');
const jwt_1 = require('utils/jwt');
const logger_1 = require('utils/logger');
const LazyLoader_1 = require('modules/server/LazyLoader');
const accountRecoveryService_1 = require('services/accountRecoveryService');
const user_transformer_1 = require('transformers/user.transformer');
async function login(req, res) {
    try {
        const { email, password, recaptchaToken } = req.body;
        console.log("로그인 요청 body:", req.body);
        if (!email || !password || !recaptchaToken) {
            res.status(400).json({
                success: false,
                message: "모든 필드를 입력하세요.",
                error: "필수 필드 누락",
            });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: "유효한 이메일 주소를 입력하세요.",
                error: "이메일 형식 오류",
            });
            return;
        }
        const isHuman = await (0, recaptcha_1.verifyRecaptcha)(recaptchaToken);
        if (!isHuman) {
            logger_1.logger.warn(`reCAPTCHA 실패 - IP: ${req.ip}, Email: ${email}`);
            res.status(403).json({
                success: false,
                message: "reCAPTCHA 검증에 실패했습니다.",
                error: "reCAPTCHA 실패",
            });
            return;
        }
        const dataSource = await (0, LazyLoader_1.lazyLoadDatabase)();
        const userRepo = dataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            logger_1.logger.warn(`로그인 실패 - IP: ${req.ip}, Email: ${email}`);
            res.status(401).json({
                success: false,
                message: "이메일 또는 비밀번호가 틀렸습니다.",
                error: "인증 실패",
            });
            return;
        }
        const { accessToken, refreshToken } = (0, jwt_1.createTokens)(user.id, user.role);
        logger_1.logger.info(`로그인 성공 - User ID: ${user.id}, Email: ${email}`);
        res
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .json({
            success: true,
            message: "로그인 성공",
            data: {
                accessToken,
                refreshToken,
                user: user_transformer_1.UserTransformer.toDTO(user),
            }
        });
    }
    catch (error) {
        logger_1.logger.error("로그인 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
async function refreshToken(req, res) {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Refresh token이 없습니다.",
                error: "토큰 없음",
            });
            return;
        }
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        if (!payload) {
            logger_1.logger.warn(`유효하지 않은 refresh token - IP: ${req.ip}`);
            res.status(401).json({
                success: false,
                message: "Refresh token이 유효하지 않습니다.",
                error: "토큰 무효",
            });
            return;
        }
        const dataSource = await (0, LazyLoader_1.lazyLoadDatabase)();
        const userRepo = dataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { id: payload.userId } });
        if (!user) {
            logger_1.logger.warn(`Refresh token으로 사용자를 찾을 수 없음 - User ID: ${payload.userId}`);
            res.status(404).json({
                success: false,
                message: "사용자를 찾을 수 없습니다.",
                error: "사용자 없음",
            });
            return;
        }
        const { accessToken, refreshToken: newRefreshToken } = (0, jwt_1.createTokens)(user.id, user.role);
        logger_1.logger.info(`Token 갱신 성공 - User ID: ${user.id}`);
        res
            .cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .json({
            success: true,
            message: "Token 갱신 성공",
            data: { accessToken },
        });
    }
    catch (error) {
        logger_1.logger.error("Token 갱신 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
function logout(req, res) {
    try {
        logger_1.logger.info(`로그아웃 - User ID: ${req.user?.userId}`);
        res.clearCookie("refreshToken").json({
            success: true,
            message: "로그아웃 성공",
            data: null
        });
    }
    catch (error) {
        logger_1.logger.error("로그아웃 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
            data: null
        });
    }
}
function checkAuth(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "인증되지 않은 사용자입니다.",
                error: "인증 필요",
            });
            return;
        }
        logger_1.logger.info(`인증 상태 확인 - User ID: ${req.user.userId}`);
        res.status(200).json({
            success: true,
            message: "인증된 사용자입니다.",
            data: { authenticated: true },
        });
    }
    catch (error) {
        logger_1.logger.error("인증 상태 확인 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
const register = async (req, res) => {
    try {
        console.log("🚀 회원가입 요청 시작");
        console.log("📥 요청 IP:", req.ip);
        console.log("📥 User-Agent:", req.get("User-Agent"));
        const { email, password, nickname, phone, gender, birthday, recaptchaToken, } = req.body;
        console.log("📥 요청 데이터:", {
            email,
            nickname,
            phone,
            gender,
            birthday,
            recaptchaToken: recaptchaToken
                ? recaptchaToken.substring(0, 20) + "..."
                : "없음",
        });
        if (!email || !password || !nickname || !recaptchaToken) {
            const missingFields = [];
            if (!email)
                missingFields.push("이메일");
            if (!password)
                missingFields.push("비밀번호");
            if (!nickname)
                missingFields.push("닉네임");
            if (!recaptchaToken)
                missingFields.push("보안 인증");
            console.log("❌ 필수 필드 누락:", {
                email: !!email,
                password: !!password,
                nickname: !!nickname,
                recaptchaToken: !!recaptchaToken,
            });
            res.status(400).json({
                success: false,
                message: `다음 필드를 입력해주세요: ${missingFields.join(", ")}`,
                error: "필수 필드 누락",
            });
            return;
        }
        if (recaptchaToken === "") {
            console.log("❌ reCAPTCHA 토큰이 빈 문자열");
            res.status(400).json({
                success: false,
                message: "보안 인증이 필요합니다. 다시 시도해주세요.",
                error: "reCAPTCHA 토큰 누락",
            });
            return;
        }
        console.log("✅ 필수 필드 검증 통과");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log("❌ 이메일 형식 오류:", email);
            res.status(400).json({
                success: false,
                message: "올바른 이메일 형식으로 입력해주세요. (예: user@example.com)",
                error: "이메일 형식 오류",
            });
            return;
        }
        console.log("✅ 이메일 형식 검증 통과");
        if (password.length < 8) {
            console.log("❌ 비밀번호 강도 부족:", password.length, "자");
            res.status(400).json({
                success: false,
                message: "비밀번호는 최소 8자 이상이어야 합니다.",
                error: "비밀번호 강도 부족",
            });
            return;
        }
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            res.status(400).json({
                success: false,
                message: "비밀번호는 영문 대소문자와 숫자를 포함해야 합니다.",
                error: "비밀번호 복잡성 부족",
            });
            return;
        }
        console.log("✅ 비밀번호 강도 검증 통과");
        if (nickname.length < 2 || nickname.length > 20) {
            console.log("❌ 닉네임 길이 오류:", nickname.length, "자");
            res.status(400).json({
                success: false,
                message: "닉네임은 2-20자 사이로 입력해주세요.",
                error: "닉네임 길이 오류",
            });
            return;
        }
        const nicknameRegex = /^[a-zA-Z0-9가-힣_-]+$/;
        if (!nicknameRegex.test(nickname)) {
            res.status(400).json({
                success: false,
                message: "닉네임에는 영문, 숫자, 한글, 언더스코어(_), 하이픈(-)만 사용 가능합니다.",
                error: "닉네임 형식 오류",
            });
            return;
        }
        console.log("✅ 닉네임 검증 통과");
        console.log("🔍 백엔드 휴대폰 번호 검증:", phone);
        if (phone) {
            const phoneRegex = /^(010-\d{4}-\d{4}|(011|016|017|018|019)-\d{3}-\d{4})$/;
            const isValid = phoneRegex.test(phone);
            console.log("🔍 휴대폰 번호 정규식 테스트 결과:", isValid);
            if (!isValid) {
                console.log("❌ 휴대폰 번호 형식 오류:", phone);
                res.status(400).json({
                    success: false,
                    message: "올바른 휴대폰 번호 형식을 입력하세요. (010-xxxx-xxxx 또는 011-xxx-xxxx)",
                    error: "휴대폰 번호 형식 오류",
                });
                return;
            }
            console.log("✅ 휴대폰 번호 검증 통과");
        }
        else {
            console.log("✅ 휴대폰 번호 빈 값 (선택사항)");
        }
        console.log("🔄 reCAPTCHA 검증 시작");
        const isHuman = await (0, recaptcha_1.verifyRecaptcha)(recaptchaToken);
        if (!isHuman) {
            console.log("❌ reCAPTCHA 검증 실패");
            logger_1.logger.warn(`회원가입 reCAPTCHA 실패 - IP: ${req.ip}, Email: ${email}`);
            res.status(403).json({
                success: false,
                message: "reCAPTCHA 검증에 실패했습니다.",
                error: "reCAPTCHA 실패",
            });
            return;
        }
        console.log("✅ reCAPTCHA 검증 통과");
        console.log("🔄 데이터베이스 연결 및 중복 확인 시작");
        const dataSource = await (0, LazyLoader_1.lazyLoadDatabase)();
        const userRepo = dataSource.getRepository(User_1.User);
        const userLevelRepo = dataSource.getRepository(UserLevel_1.UserLevel);
        const userStreakRepo = dataSource.getRepository(UserStreak_1.UserStreak);
        console.log("🔍 이메일 중복 확인:", email);
        const existingUser = await userRepo.findOne({ where: { email } });
        if (existingUser) {
            if (process.env.NODE_ENV === "development" && email === "test@test.com") {
                console.log("🔄 개발 환경에서 테스트 이메일 기존 사용자 삭제:", email);
                await userRepo.remove(existingUser);
                console.log("✅ 기존 테스트 사용자 삭제 완료");
            }
            else {
                console.log("❌ 이메일 중복 발견:", email);
                res.status(409).json({
                    success: false,
                    message: "이미 가입된 이메일입니다.",
                    error: "이메일 중복",
                });
                return;
            }
        }
        console.log("✅ 이메일 중복 없음");
        console.log("🔍 닉네임 중복 확인:", nickname);
        const existingNickname = await userRepo.findOne({ where: { nickname } });
        if (existingNickname) {
            if (process.env.NODE_ENV === "development" && nickname === "tset") {
                console.log("🔄 개발 환경에서 테스트 닉네임 기존 사용자 삭제:", nickname);
                await userRepo.remove(existingNickname);
                console.log("✅ 기존 테스트 사용자 삭제 완료");
            }
            else {
                console.log("❌ 닉네임 중복 발견:", nickname);
                res.status(409).json({
                    success: false,
                    message: "이미 사용 중인 닉네임입니다.",
                    error: "닉네임 중복",
                });
                return;
            }
        }
        console.log("✅ 닉네임 중복 없음");
        console.log("🔄 비밀번호 해싱 시작");
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        console.log("✅ 비밀번호 해싱 완료");
        console.log("🔄 생년월일 변환 시작:", birthday);
        let birthdayDate;
        if (birthday) {
            try {
                if (birthday && typeof birthday === "object" && "getTime" in birthday) {
                    birthdayDate = birthday;
                    console.log("📅 Date 객체로 인식됨");
                }
                else if (typeof birthday === "string") {
                    birthdayDate = new Date(birthday);
                    console.log("📅 문자열에서 Date 변환:", birthday);
                }
                else if (typeof birthday === "object" && birthday !== null) {
                    const { year, month, day } = birthday;
                    console.log("📅 객체 형태 생년월일:", { year, month, day });
                    if (year && month && day) {
                        birthdayDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        console.log("📅 객체에서 Date 변환 완료:", birthdayDate);
                    }
                }
                if (!birthdayDate || isNaN(birthdayDate.getTime())) {
                    console.log("❌ 유효하지 않은 날짜:", birthdayDate);
                    res.status(400).json({
                        success: false,
                        message: "올바른 생년월일을 입력하세요.",
                        error: "날짜 형식 오류",
                    });
                    return;
                }
                console.log("✅ 생년월일 변환 완료:", birthdayDate);
            }
            catch (error) {
                console.log("❌ 생년월일 변환 오류:", error);
                res.status(400).json({
                    success: false,
                    message: "올바른 생년월일을 입력하세요.",
                    error: "날짜 형식 오류",
                });
                return;
            }
        }
        else {
            console.log("📅 생년월일 없음");
        }
        console.log("🔄 사용자 생성 시작");
        const newUser = userRepo.create({
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            nickname: nickname.trim(),
            ...(phone?.trim() && { phone: phone.trim() }),
            ...(gender && { gender: gender }),
            ...(birthdayDate && { birthday: birthdayDate }),
            role: "user",
        });
        console.log("📝 사용자 객체 생성 완료:", {
            email: newUser.email,
            nickname: newUser.nickname,
            phone: newUser.phone,
            gender: newUser.gender,
            birthday: newUser.birthday,
            role: newUser.role,
        });
        await userRepo.save(newUser);
        console.log("✅ 사용자 저장 완료 - ID:", newUser.id);
        console.log("🔄 레벨 시스템 초기화 시작");
        const userLevel = userLevelRepo.create({
            userId: newUser.id,
            level: 1,
            currentExp: 0,
            totalExp: 0,
            seasonExp: 0,
        });
        await userLevelRepo.save(userLevel);
        console.log("✅ 레벨 시스템 초기화 완료");
        console.log("🔄 연속 활동 기록 초기화 시작");
        const userStreak = userStreakRepo.create({
            userId: newUser.id,
            currentCount: 0,
            lastActivity: new Date(),
            streakType: "login",
        });
        await userStreakRepo.save(userStreak);
        console.log("✅ 연속 활동 기록 초기화 완료");
        console.log("🔄 토큰 생성 시작");
        const { accessToken, refreshToken } = (0, jwt_1.createTokens)(newUser.id, newUser.role);
        console.log("✅ 토큰 생성 완료");
        logger_1.logger.info(`회원가입 성공 - User ID: ${newUser.id}, Email: ${email}`);
        console.log("🎉 회원가입 성공 - 응답 전송 시작");
        const responseData = {
            success: true,
            message: "회원가입 성공",
            accessToken,
            refreshToken,
            user: user_transformer_1.UserTransformer.toDTO(newUser),
        };
        console.log("📤 응답 데이터:", {
            success: responseData.success,
            message: responseData.message,
            userId: responseData.user.id,
            userEmail: responseData.user.email,
            userNickname: responseData.user.nickname,
        });
        res
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .status(201)
            .json(responseData);
        console.log("✅ 회원가입 완료 - 응답 전송 완료");
    }
    catch (error) {
        console.error("❌ 회원가입 처리 중 오류:", error);
        console.error("❌ 에러 상세:", {
            name: error instanceof Error ? error.name : "Unknown",
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });
        logger_1.logger.error("회원가입 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
};
exports.register = register;
async function findId(req, res) {
    try {
        const { email, recaptchaToken } = req.body;
        console.log("아이디 찾기 요청:", { email });
        if (!email || !recaptchaToken) {
            res.status(400).json({
                success: false,
                message: "모든 필드를 입력하세요.",
                error: "필수 필드 누락",
            });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: "유효한 이메일 주소를 입력하세요.",
                error: "이메일 형식 오류",
            });
            return;
        }
        const isHuman = await (0, recaptcha_1.verifyRecaptcha)(recaptchaToken);
        if (!isHuman) {
            logger_1.logger.warn(`reCAPTCHA 실패 (아이디 찾기) - IP: ${req.ip}, Email: ${email}`);
            res.status(403).json({
                success: false,
                message: "reCAPTCHA 검증에 실패했습니다.",
                error: "reCAPTCHA 실패",
            });
            return;
        }
        const userAgent = req.get("User-Agent");
        const securityInfo = {
            ipAddress: req.ip || "unknown",
            ...(userAgent && { userAgent }),
            timestamp: new Date(),
        };
        const result = await accountRecoveryService_1.accountRecoveryService.findIdByEmail(email, securityInfo);
        if (!result.success) {
            res.status(404).json({
                success: false,
                message: result.error || "아이디 찾기에 실패했습니다.",
                error: "아이디 찾기 실패",
            });
            return;
        }
        logger_1.logger.info(`아이디 찾기 성공 - Email: ${email}`);
        res.json({
            success: true,
            message: "입력하신 이메일로 아이디 정보를 발송했습니다.",
            data: result.data,
        });
    }
    catch (error) {
        logger_1.logger.error("아이디 찾기 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
async function findPassword(req, res) {
    try {
        const { email, recaptchaToken } = req.body;
        console.log("비밀번호 찾기 요청:", { email });
        if (!email || !recaptchaToken) {
            res.status(400).json({
                success: false,
                message: "모든 필드를 입력하세요.",
                error: "필수 필드 누락",
            });
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: "유효한 이메일 주소를 입력하세요.",
                error: "이메일 형식 오류",
            });
            return;
        }
        const isHuman = await (0, recaptcha_1.verifyRecaptcha)(recaptchaToken);
        if (!isHuman) {
            logger_1.logger.warn(`reCAPTCHA 실패 (비밀번호 찾기) - IP: ${req.ip}, Email: ${email}`);
            res.status(403).json({
                success: false,
                message: "reCAPTCHA 검증에 실패했습니다.",
                error: "reCAPTCHA 실패",
            });
            return;
        }
        const userAgent = req.get("User-Agent");
        const securityInfo = {
            ipAddress: req.ip || "unknown",
            ...(userAgent && { userAgent }),
            timestamp: new Date(),
        };
        const result = await accountRecoveryService_1.accountRecoveryService.findPasswordByEmail(email, securityInfo);
        if (!result.success) {
            res.status(404).json({
                success: false,
                message: result.error || "비밀번호 찾기에 실패했습니다.",
                error: "비밀번호 찾기 실패",
            });
            return;
        }
        logger_1.logger.info(`비밀번호 찾기 성공 - Email: ${email}`);
        res.json({
            success: true,
            message: "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.",
            data: result.data,
        });
    }
    catch (error) {
        logger_1.logger.error("비밀번호 찾기 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
async function findIdStep1(req, res) {
    try {
        const { name, phone, recaptchaToken } = req.body;
        console.log("아이디 찾기 Step 1 요청:", { name, phone });
        if (!name || !phone || !recaptchaToken) {
            res.status(400).json({
                success: false,
                message: "모든 필드를 입력하세요.",
                error: "필수 필드 누락",
            });
            return;
        }
        const isHuman = await (0, recaptcha_1.verifyRecaptcha)(recaptchaToken);
        if (!isHuman) {
            logger_1.logger.warn(`reCAPTCHA 실패 (아이디 찾기 Step 1) - IP: ${req.ip}`);
            res.status(403).json({
                success: false,
                message: "reCAPTCHA 검증에 실패했습니다.",
                error: "reCAPTCHA 실패",
            });
            return;
        }
        const securityInfo = {
            ipAddress: req.ip || "unknown",
            userAgent: req.get("User-Agent") || "unknown",
            timestamp: new Date(),
        };
        const result = await accountRecoveryService_1.accountRecoveryService.findIdStep1(name, phone, securityInfo);
        if (!result.success) {
            res.status(400).json({
                success: false,
                message: result.error || "사용자 확인에 실패했습니다.",
                error: "사용자 확인 실패",
            });
            return;
        }
        logger_1.logger.info(`아이디 찾기 Step 1 성공 - Name: ${name}`);
        res.json({
            success: true,
            message: "인증 코드를 이메일로 발송했습니다.",
            data: result.data,
        });
    }
    catch (error) {
        logger_1.logger.error("아이디 찾기 Step 1 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
async function findIdStep2(req, res) {
    try {
        const { email, code, recaptchaToken } = req.body;
        console.log("아이디 찾기 Step 2 요청:", { email });
        if (!email || !code || !recaptchaToken) {
            res.status(400).json({
                success: false,
                message: "모든 필드를 입력하세요.",
                error: "필수 필드 누락",
            });
            return;
        }
        const isHuman = await (0, recaptcha_1.verifyRecaptcha)(recaptchaToken);
        if (!isHuman) {
            logger_1.logger.warn(`reCAPTCHA 실패 (아이디 찾기 Step 2) - IP: ${req.ip}`);
            res.status(403).json({
                success: false,
                message: "reCAPTCHA 검증에 실패했습니다.",
                error: "reCAPTCHA 실패",
            });
            return;
        }
        const securityInfo = {
            ipAddress: req.ip || "unknown",
            userAgent: req.get("User-Agent") || "unknown",
            timestamp: new Date(),
        };
        const result = await accountRecoveryService_1.accountRecoveryService.findIdStep2(email, code, securityInfo);
        if (!result.success) {
            res.status(400).json({
                success: false,
                message: result.error || "인증 코드 확인에 실패했습니다.",
                error: "인증 코드 확인 실패",
            });
            return;
        }
        logger_1.logger.info(`아이디 찾기 Step 2 성공 - Email: ${email}`);
        res.json({
            success: true,
            message: "아이디 찾기가 완료되었습니다.",
            data: result.data,
        });
    }
    catch (error) {
        logger_1.logger.error("아이디 찾기 Step 2 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
async function resetPasswordStep1(req, res) {
    try {
        const { name, phone, recaptchaToken } = req.body;
        console.log("비밀번호 재설정 Step 1 요청:", { name, phone });
        if (!name || !phone || !recaptchaToken) {
            res.status(400).json({
                success: false,
                message: "모든 필드를 입력하세요.",
                error: "필수 필드 누락",
            });
            return;
        }
        const isHuman = await (0, recaptcha_1.verifyRecaptcha)(recaptchaToken);
        if (!isHuman) {
            logger_1.logger.warn(`reCAPTCHA 실패 (비밀번호 재설정 Step 1) - IP: ${req.ip}`);
            res.status(403).json({
                success: false,
                message: "reCAPTCHA 검증에 실패했습니다.",
                error: "reCAPTCHA 실패",
            });
            return;
        }
        const securityInfo = {
            ipAddress: req.ip || "unknown",
            userAgent: req.get("User-Agent") || "unknown",
            timestamp: new Date(),
        };
        const result = await accountRecoveryService_1.accountRecoveryService.resetPasswordStep1(name, phone, securityInfo);
        if (!result.success) {
            res.status(400).json({
                success: false,
                message: result.error || "사용자 확인에 실패했습니다.",
                error: "사용자 확인 실패",
            });
            return;
        }
        logger_1.logger.info(`비밀번호 재설정 Step 1 성공 - Name: ${name}`);
        res.json({
            success: true,
            message: "인증 코드를 이메일로 발송했습니다.",
            data: result.data,
        });
    }
    catch (error) {
        logger_1.logger.error("비밀번호 재설정 Step 1 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
async function resetPasswordStep2(req, res) {
    try {
        const { email, code, recaptchaToken } = req.body;
        console.log("비밀번호 재설정 Step 2 요청:", { email });
        if (!email || !code || !recaptchaToken) {
            res.status(400).json({
                success: false,
                message: "모든 필드를 입력하세요.",
                error: "필수 필드 누락",
            });
            return;
        }
        const isHuman = await (0, recaptcha_1.verifyRecaptcha)(recaptchaToken);
        if (!isHuman) {
            logger_1.logger.warn(`reCAPTCHA 실패 (비밀번호 재설정 Step 2) - IP: ${req.ip}`);
            res.status(403).json({
                success: false,
                message: "reCAPTCHA 검증에 실패했습니다.",
                error: "reCAPTCHA 실패",
            });
            return;
        }
        const securityInfo = {
            ipAddress: req.ip || "unknown",
            userAgent: req.get("User-Agent") || "unknown",
            timestamp: new Date(),
        };
        const result = await accountRecoveryService_1.accountRecoveryService.resetPasswordStep2(email, code, securityInfo);
        if (!result.success) {
            res.status(400).json({
                success: false,
                message: result.error || "인증 코드 확인에 실패했습니다.",
                error: "인증 코드 확인 실패",
            });
            return;
        }
        logger_1.logger.info(`비밀번호 재설정 Step 2 성공 - Email: ${email}`);
        res.json({
            success: true,
            message: "비밀번호 재설정 토큰이 생성되었습니다.",
            data: result.data,
        });
    }
    catch (error) {
        logger_1.logger.error("비밀번호 재설정 Step 2 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
async function resetPasswordStep3(req, res) {
    try {
        const { resetToken, newPassword, confirmPassword, recaptchaToken } = req.body;
        console.log("비밀번호 재설정 Step 3 요청");
        if (!resetToken || !newPassword || !confirmPassword || !recaptchaToken) {
            res.status(400).json({
                success: false,
                message: "모든 필드를 입력하세요.",
                error: "필수 필드 누락",
            });
            return;
        }
        const isHuman = await (0, recaptcha_1.verifyRecaptcha)(recaptchaToken);
        if (!isHuman) {
            logger_1.logger.warn(`reCAPTCHA 실패 (비밀번호 재설정 Step 3) - IP: ${req.ip}`);
            res.status(403).json({
                success: false,
                message: "reCAPTCHA 검증에 실패했습니다.",
                error: "reCAPTCHA 실패",
            });
            return;
        }
        const securityInfo = {
            ipAddress: req.ip || "unknown",
            userAgent: req.get("User-Agent") || "unknown",
            timestamp: new Date(),
        };
        const result = await accountRecoveryService_1.accountRecoveryService.resetPasswordStep3(resetToken, newPassword, confirmPassword, securityInfo);
        if (!result.success) {
            res.status(400).json({
                success: false,
                message: result.error || "비밀번호 재설정에 실패했습니다.",
                error: "비밀번호 재설정 실패",
            });
            return;
        }
        logger_1.logger.info("비밀번호 재설정 Step 3 성공");
        res.json({
            success: true,
            message: "비밀번호가 성공적으로 재설정되었습니다.",
            data: null
        });
    }
    catch (error) {
        logger_1.logger.error("비밀번호 재설정 Step 3 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
async function findIdSimple(req, res) {
    try {
        const { name, phone, gender, birthday, recaptchaToken } = req.body;
        console.log("단순 아이디 찾기 요청:", { name, phone, gender, birthday });
        if (!name || !phone || !recaptchaToken) {
            res.status(400).json({
                success: false,
                message: "필수 필드를 모두 입력하세요.",
                error: "필수 필드 누락",
            });
            return;
        }
        const isHuman = await (0, recaptcha_1.verifyRecaptcha)(recaptchaToken);
        if (!isHuman) {
            logger_1.logger.warn(`reCAPTCHA 실패 (단순 아이디 찾기) - IP: ${req.ip}`);
            res.status(403).json({
                success: false,
                message: "reCAPTCHA 검증에 실패했습니다.",
                error: "reCAPTCHA 실패",
            });
            return;
        }
        const securityInfo = {
            ipAddress: req.ip || "unknown",
            userAgent: req.get("User-Agent") || "unknown",
            timestamp: new Date(),
        };
        const result = await accountRecoveryService_1.accountRecoveryService.findIdSimple(name, phone, securityInfo, gender, birthday ?? null);
        if (!result.success) {
            res.status(404).json({
                success: false,
                message: result.error || "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.",
                error: "계정 찾기 실패",
            });
            return;
        }
        logger_1.logger.info(`단순 아이디 찾기 성공 - Name: ${name}`);
        res.json({
            success: true,
            message: "아이디 조회 성공",
            data: result.data,
        });
    }
    catch (error) {
        logger_1.logger.error("단순 아이디 찾기 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
async function resetPasswordSimpleStep1(req, res) {
    try {
        const { username, name, phone, gender, birthday, recaptchaToken } = req.body;
        console.log("단순 비밀번호 재설정 Step 1 요청:", {
            username,
            name,
            phone,
            gender,
            birthday,
        });
        const recaptchaValid = await (0, recaptcha_1.verifyRecaptcha)(recaptchaToken);
        if (!recaptchaValid) {
            res.status(400).json({
                success: false,
                message: "reCAPTCHA 검증에 실패했습니다.",
                error: "reCAPTCHA 검증 실패",
            });
            return;
        }
        const securityInfo = {
            ipAddress: req.ip || req.connection.remoteAddress || "unknown",
            userAgent: req.get("User-Agent") || "unknown",
            timestamp: new Date(),
        };
        const result = await accountRecoveryService_1.accountRecoveryService.resetPasswordSimpleStep1(username, name, phone, securityInfo, gender, birthday ?? null);
        if (result.success) {
            res.status(200).json({
                success: true,
                message: "사용자 인증이 완료되었습니다. 인증 코드를 확인하세요.",
                data: result.data,
            });
            return;
        }
        else {
            res.status(400).json({
                success: false,
                message: result.error || "사용자 인증에 실패했습니다.",
                error: result.error || "사용자 인증 실패",
            });
            return;
        }
    }
    catch (error) {
        logger_1.logger.error("단순 비밀번호 재설정 Step 1 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
async function resetPasswordSimpleStep2(req, res) {
    try {
        const { username, code, newPassword, confirmPassword, recaptchaToken } = req.body;
        console.log("단순 비밀번호 재설정 Step 2 요청:", { username, code });
        const recaptchaValid = await (0, recaptcha_1.verifyRecaptcha)(recaptchaToken);
        if (!recaptchaValid) {
            res.status(400).json({
                success: false,
                message: "reCAPTCHA 검증에 실패했습니다.",
                error: "reCAPTCHA 검증 실패",
            });
            return;
        }
        const securityInfo = {
            ipAddress: req.ip || req.connection.remoteAddress || "unknown",
            timestamp: new Date(),
        };
        const result = await accountRecoveryService_1.accountRecoveryService.resetPasswordSimpleStep2(username, code, newPassword, confirmPassword, securityInfo);
        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.data?.message || "비밀번호가 성공적으로 재설정되었습니다.",
                data: result.data,
            });
            return;
        }
        else {
            res.status(400).json({
                success: false,
                message: result.error || "비밀번호 재설정에 실패했습니다.",
                error: result.error || "비밀번호 재설정 실패",
            });
            return;
        }
    }
    catch (error) {
        logger_1.logger.error("단순 비밀번호 재설정 Step 2 처리 중 오류:", error);
        res.status(500).json({
            success: false,
            message: "서버 오류가 발생했습니다.",
            error: "서버 오류",
        });
    }
}
