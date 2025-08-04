import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./LoginPage.module.css";

// 로그인 응답 타입 정의
interface LoginResponse {
  message: string;
  accessToken: string;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const recaptchaToken = "dummy-token"; // TODO: 실제 reCAPTCHA token 발급 필요

      const response = await axios.post<LoginResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        { email, password, recaptchaToken },
        { withCredentials: true } // refreshToken 쿠키 저장
      );

      localStorage.setItem("accessToken", response.data.accessToken);
      navigate("/");
    } catch (error: any) {
      alert(error.response?.data?.message || "로그인 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginBox}>
        <h1 className={styles.logo}>득근 득근</h1>

        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 또는 닉네임"
          className={styles.input}
        />

        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className={styles.passwordInput}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.eyeButton}
            aria-label="비밀번호 보기 토글"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button
          onClick={handleLogin}
          className={styles.loginButton}
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>

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
          <p className={styles.recaptchaText}>구글 reCAPTCHA 적용 예정</p>
        </div>
      </div>
    </div>
  );
}
