import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(morgan("combined"));
app.use(cookieParser());

// Request body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    message: "Backend server is running", 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Simple auth endpoints for testing
app.post("/api/auth/login", (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  // Basic validation
  if (!email || !password || !recaptchaToken) {
    return res.status(400).json({
      message: "모든 필드를 입력하세요.",
      required: ["email", "password", "recaptchaToken"],
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "유효한 이메일 주소를 입력하세요.",
    });
  }

  // For testing purposes, accept any valid email/password
  if (email === "test@test.com" && password === "testpassword") {
    const accessToken = "test-access-token-" + Date.now();
    const refreshToken = "test-refresh-token-" + Date.now();

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // false for development
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        message: "로그인 성공",
        accessToken,
        user: {
          id: 1,
          email: email,
          nickname: "테스트 사용자",
        },
      });
  } else {
    res.status(401).json({ 
      message: "이메일 또는 비밀번호가 틀렸습니다." 
    });
  }
});

app.post("/api/auth/refresh", (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "Refresh token이 없습니다." });
  }

  // For testing, always return a new access token
  const newAccessToken = "new-access-token-" + Date.now();
  const newRefreshToken = "new-refresh-token-" + Date.now();

  res
    .cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      message: "토큰이 갱신되었습니다.",
      accessToken: newAccessToken,
    });
});

app.post("/api/auth/logout", (req, res) => {
  res
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .status(200)
    .json({ message: "로그아웃 되었습니다." });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple backend server is running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Frontend should connect to: http://localhost:${PORT}/api`);
}); 