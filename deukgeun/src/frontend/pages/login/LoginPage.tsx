import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleNavigation = (route: string) => {
    console.log(`Navigating to: ${route}`);
    // 실제 라우팅 처리 시 next/router 또는 react-router-dom 사용
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginBox}>
        <h1 className={styles.logo}>득근 득근</h1>

        <input
          type="text"
          placeholder="이메일 또는 닉네임"
          className={styles.input}
        />

        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
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

        <button onClick={handleLogin} className={styles.loginButton}>
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <div className={styles.divider}>또는</div>

        <div className={styles.socialWrapper}>
          <button className={styles.kakaoBtn}>🟡 카카오로 로그인</button>
          <button className={styles.googleBtn}>🔵 Google로 로그인</button>
        </div>

        <div className={styles.linkRow}>
          <button
            className={styles.linkBtn}
            onClick={() => handleNavigation("register")}
          >
            회원가입
          </button>
          <button
            className={styles.linkBtn}
            onClick={() => handleNavigation("find-id")}
          >
            아이디 찾기
          </button>
          <button
            className={styles.linkBtn}
            onClick={() => handleNavigation("find-password")}
          >
            비밀번호 찾기
          </button>
        </div>

        <div className={styles.recaptcha}>
          <p className={styles.recaptchaText}>구글 reCAPTCHA 적용 영역</p>
        </div>
      </div>
    </div>
  );
}
