import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import { verifyRecaptcha } from "../utils/recaptcha";
import { createTokens, verifyRefreshToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import { connectDatabase } from "../config/database";

const userRepository = connectDatabase().then((connection) => {
  return connection.getRepository(User);
});

export async function login(req: Request, res: Response) {
  try {
    const { email, password, recaptchaToken } = req.body;

    // 입력 검증
    if (!email || !password || !recaptchaToken) {
      return res.status(400).json({
        message: "모든 필드를 입력하세요.",
        required: ["email", "password", "recaptchaToken"],
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "유효한 이메일 주소를 입력하세요.",
      });
    }

    // reCAPTCHA 검증
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      logger.warn(`reCAPTCHA 실패 - IP: ${req.ip}, Email: ${email}`);
      return res
        .status(403)
        .json({ message: "reCAPTCHA 검증에 실패했습니다." });
    }

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn(`로그인 실패 - IP: ${req.ip}, Email: ${email}`);
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 틀렸습니다." });
    }

    const { accessToken, refreshToken } = createTokens(user.id);

    logger.info(`로그인 성공 - User ID: ${user.id}, Email: ${email}`);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      })
      .json({
        message: "로그인 성공",
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
        },
      });
  } catch (error) {
    logger.error("로그인 처리 중 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token이 없습니다." });
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      logger.warn(`유효하지 않은 refresh token - IP: ${req.ip}`);
      return res
        .status(401)
        .json({ message: "Refresh token이 유효하지 않습니다." });
    }

    const userRepo = getRepository(User);
    const user = await userRepo.findOne({ where: { id: payload.userId } });

    if (!user) {
      logger.warn(
        `Refresh token으로 사용자를 찾을 수 없음 - User ID: ${payload.userId}`
      );
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const { accessToken, refreshToken: newRefreshToken } = createTokens(
      user.id
    );

    logger.info(`토큰 갱신 성공 - User ID: ${user.id}`);

    res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      })
      .json({
        message: "토큰이 갱신되었습니다.",
        accessToken,
      });
  } catch (error) {
    logger.error("토큰 갱신 중 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}

export function logout(req: Request, res: Response) {
  try {
    logger.info(`로그아웃 요청 - IP: ${req.ip}`);

    res
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({ message: "로그아웃 되었습니다." });
  } catch (error) {
    logger.error("로그아웃 처리 중 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, recaptchaToken } = req.body;

    // 입력 검증
    if (!email || !password || !recaptchaToken) {
      return res.status(400).json({
        message: "모든 필드를 입력하세요.",
        required: ["email", "password", "recaptchaToken"],
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "유효한 이메일 주소를 입력하세요.",
      });
    }

    // 비밀번호 강도 검증
    if (password.length < 8) {
      return res.status(400).json({
        message: "비밀번호는 최소 8자 이상이어야 합니다.",
      });
    }

    // reCAPTCHA 검증
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      logger.warn(`회원가입 reCAPTCHA 실패 - IP: ${req.ip}, Email: ${email}`);
      return res
        .status(403)
        .json({ message: "reCAPTCHA 검증에 실패했습니다." });
    }

    const userRepo = getRepository(User);
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "이미 가입된 이메일입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // salt rounds 증가
    const newUser = userRepo.create({ email, password: hashedPassword });
    await userRepo.save(newUser);

    const { accessToken, refreshToken } = createTokens(newUser.id);

    logger.info(`회원가입 성공 - User ID: ${newUser.id}, Email: ${email}`);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
      })
      .status(201)
      .json({
        message: "회원가입 성공",
        accessToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          nickname: newUser.nickname,
        },
      });
  } catch (error) {
    logger.error("회원가입 처리 중 오류:", error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};
