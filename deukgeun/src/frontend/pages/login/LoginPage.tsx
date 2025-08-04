import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { authApi, LoginRequest } from "@features/auth/api/authApi";
import { validation, showToast, storage } from "@shared/lib";
import {
  executeRecaptcha,
  getDummyRecaptchaToken,
} from "@shared/lib/recaptcha";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const navigate = useNavigate();

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // reCAPTCHA 토큰 생성
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha("login");
      } catch (error) {
        // reCAPTCHA 실패 시 개발용 더미 토큰 사용
        recaptchaToken = getDummyRecaptchaToken();
      }

      const loginData: LoginRequest = {
        email: email.trim().toLowerCase(),
        password,
        recaptchaToken,
      };

      const response = await authApi.login(loginData);

      // 토큰 저장
      storage.set("accessToken", response.accessToken);
      storage.set("user", response.user);

      showToast("로그인 성공!", "success");
      navigate("/");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "로그인에 실패했습니다.";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginBox}>
        <h1 className={styles.logo}>득근 득근</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
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
                  handleLogin();
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
                    handleLogin();
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
          <button className={styles.kakaoBtn}>🟡 카카오로 로그인</button>
          <button className={styles.googleBtn}>🔵 Google로 로그인</button>
        </div>

        <div className={styles.linkRow}>
          <button
            onClick={() => navigate("/signup")}
            className={styles.linkBtn}
          >
            회원가입
          </button>
          <button
            onClick={() => navigate("/find-id")}
            className={styles.linkBtn}
          >
            아이디 찾기
          </button>
          <button
            onClick={() => navigate("/find-password")}
            className={styles.linkBtn}
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
      </div>
    </div>
  );
}
