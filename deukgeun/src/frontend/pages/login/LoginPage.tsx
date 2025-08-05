import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ReCAPTCHA from "react-google-recaptcha";
import { authApi, LoginRequest } from "@features/auth/api/authApi";
import { validation, showToast } from "@shared/lib";
import { useAuthContext } from "@shared/contexts/AuthContext";
import { config } from "@shared/config";
import { useUserStore } from "@shared/store/userStore";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    recaptcha?: string;
  }>({});
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { login } = useAuthContext();

  // 🧪 디버깅용 로그 (기존 코드에 영향 없음)
  console.log("🧪 LoginPage 렌더링");
  console.log("🧪 현재 상태:", {
    email,
    password,
    loading,
    recaptchaToken,
    errors,
    error,
  });

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: {
      email?: string;
      password?: string;
      recaptcha?: string;
    } = {};

    if (!validation.required(email)) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!validation.email(email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
    }

    if (!validation.required(password)) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (!validation.password(password)) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    }

    if (!recaptchaToken) {
      newErrors.recaptcha = "보안 인증을 완료해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("🧪 폼 검증 실패");
      return;
    }

    console.log("🧪 로그인 시도 시작");
    setLoading(true);
    setError("");

    try {
      const loginData: LoginRequest = {
        email: email.trim().toLowerCase(),
        password,
        recaptchaToken: recaptchaToken!,
      };

      console.log("🧪 로그인 데이터:", { ...loginData, password: "***" });

      const response = await authApi.login(loginData);

      console.log("🧪 로그인 응답:", response);

      if (!response.user) {
        console.log("🧪 로그인 실패: 사용자 정보 없음");
        showToast("로그인에 실패했습니다.", "error");
        setLoading(false);
        return;
      }

      // Zustand 상태 업데이트
      const userData = {
        id: response.user.id,
        nickname: response.user.nickname,
        email: response.user.email,
        accessToken: response.accessToken,
      };

      console.log("🧪 Zustand에 저장할 사용자 데이터:", userData);
      useUserStore.getState().setUser(userData);

      console.log("🧪 로그인 성공!");
      showToast("로그인 성공!", "success");

      navigate("/", { replace: true });
    } catch (error: any) {
      console.log("🧪 로그인 에러:", error);
      const errorMessage =
        error.response?.data?.message || "로그인에 실패했습니다.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
      console.log("🧪 로그인 처리 완료");
    }
  };

  const handleRecaptchaChange = (token: string | null) => {
    // 개발 환경에서는 더미 토큰 사용
    const finalToken =
      process.env.NODE_ENV === "development"
        ? "dummy-token-for-development"
        : token;

    console.log("🧪 reCAPTCHA 토큰 변경:", {
      originalToken: token,
      finalToken,
    });
    setRecaptchaToken(finalToken);
    // reCAPTCHA 완료 시 해당 에러 초기화
    if (finalToken && errors.recaptcha) {
      setErrors((prev) => ({ ...prev, recaptcha: undefined }));
    }
    setError(""); // 전체 에러 메시지도 초기화
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginBox}>
        <h1 className={styles.logo}>득근 득근</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin(e);
          }}
        >
          <div className={styles.inputGroup}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  e.preventDefault();
                  handleLogin(e);
                }
              }}
              placeholder="이메일"
              className={`${styles.input} ${
                errors.email ? styles.inputError : ""
              }`}
              autoComplete="email"
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <span id="email-error" className={styles.errorText}>
                {errors.email}
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    e.preventDefault();
                    handleLogin(e);
                  }
                }}
                placeholder="비밀번호"
                className={`${styles.passwordInput} ${
                  errors.password ? styles.inputError : ""
                }`}
                autoComplete="current-password"
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeButton}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <span id="password-error" className={styles.errorText}>
                {errors.password}
              </span>
            )}
          </div>

          <div className={styles.recaptchaContainer}>
            <ReCAPTCHA
              sitekey={config.RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              className={styles.recaptchaWidget}
              aria-describedby={
                errors.recaptcha ? "recaptcha-error" : undefined
              }
            />
            {errors.recaptcha && (
              <span id="recaptcha-error" className={styles.errorText}>
                {errors.recaptcha}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
            aria-describedby={loading ? "loading-description" : undefined}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
          {loading && (
            <span id="loading-description" className="sr-only">
              로그인 처리 중입니다.
            </span>
          )}
        </form>

        <div className={styles.divider}>또는</div>

        <div className={styles.socialWrapper}>
          <button
            type="button"
            className={styles.kakaoBtn}
            disabled={loading}
            onClick={() => showToast("카카오 로그인은 준비 중입니다.", "info")}
          >
            🟡 카카오로 로그인
          </button>
          <button
            type="button"
            className={styles.googleBtn}
            disabled={loading}
            onClick={() => showToast("Google 로그인은 준비 중입니다.", "info")}
          >
            🔵 Google로 로그인
          </button>
        </div>

        <div className={styles.linkRow}>
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className={styles.linkBtn}
            disabled={loading}
          >
            회원가입
          </button>
          <button
            type="button"
            onClick={() => navigate("/find-id")}
            className={styles.linkBtn}
            disabled={loading}
          >
            아이디 찾기
          </button>
          <button
            type="button"
            onClick={() => navigate("/find-password")}
            className={styles.linkBtn}
            disabled={loading}
          >
            비밀번호 찾기
          </button>
        </div>

        <div className={styles.recaptcha}>
          <p className={styles.recaptchaText}>
            이 사이트는 reCAPTCHA 및 Google 개인정보처리방침과 서비스 약관의
            적용을 받습니다.
          </p>
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
}
