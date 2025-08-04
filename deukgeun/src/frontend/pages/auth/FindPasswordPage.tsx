import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { validation, showToast } from "@shared/lib";
import styles from "./FindPasswordPage.module.css";

export default function FindPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: { email?: string } = {};

    if (!validation.required(email)) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!validation.email(email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFindPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: 실제 비밀번호 찾기 API 구현
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 임시 딜레이

      showToast(
        "입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.",
        "success"
      );
      navigate("/login");
    } catch (error: any) {
      showToast("비밀번호 찾기에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.findPasswordBox}>
        <button
          onClick={() => navigate("/login")}
          className={styles.backButton}
          aria-label="뒤로 가기"
        >
          <FaArrowLeft />
        </button>

        <h1 className={styles.title}>비밀번호 찾기</h1>
        <p className={styles.description}>
          가입 시 등록한 이메일 주소를 입력하시면
          <br />
          해당 이메일로 비밀번호 재설정 링크를 발송해드립니다.
        </p>

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
            placeholder="이메일 주소"
            className={`${styles.input} ${
              errors.email ? styles.inputError : ""
            }`}
          />
          {errors.email && (
            <span className={styles.errorText}>{errors.email}</span>
          )}
        </div>

        <button
          onClick={handleFindPassword}
          className={styles.findButton}
          disabled={loading}
        >
          {loading ? "처리 중..." : "비밀번호 찾기"}
        </button>

        <div className={styles.linkRow}>
          <button onClick={() => navigate("/login")} className={styles.linkBtn}>
            로그인으로 돌아가기
          </button>
          <button
            onClick={() => navigate("/find-id")}
            className={styles.linkBtn}
          >
            아이디 찾기
          </button>
        </div>
      </div>
    </div>
  );
}
