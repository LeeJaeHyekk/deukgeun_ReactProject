import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUpload, FaTimes } from "react-icons/fa";
import { authApi, RegisterRequest } from "@features/auth/api/authApi";
import { validation, showToast, storage } from "@shared/lib";
import {
  executeRecaptcha,
  getDummyRecaptchaToken,
} from "@shared/lib/recaptcha";
import styles from "./SignUpPage.module.css";
import { GenderSelect } from "./GenderSelect/GenderSelect";
import { BirthdaySelect } from "./BirthDateSelect/BirthDateSelect";

export default function SignUpPage() {
  const navigate = useNavigate();

  // 폼 상태
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    phone: "",
  });

  // UI 상태
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [gender, setGender] = useState<string>("");
  const [birthday, setBirthday] = useState({ year: "", month: "", day: "" });

  // 에러 상태
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    nickname?: string;
    phone?: string;
    gender?: string;
    birthday?: string;
  }>({});

  // 입력값 변경 핸들러
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 메시지 초기화
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // 이미지 변경 핸들러
  // 폼 검증 함수
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // 이메일 검증
    if (!validation.required(formData.email)) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!validation.email(formData.email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
    }

    // 비밀번호 검증
    if (!validation.required(formData.password)) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (!validation.password(formData.password)) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    }

    // 비밀번호 확인 검증
    if (!validation.required(formData.confirmPassword)) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    // 닉네임 검증
    if (!validation.required(formData.nickname)) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    } else if (formData.nickname.length < 2 || formData.nickname.length > 20) {
      newErrors.nickname = "닉네임은 2-20자 사이여야 합니다.";
    }

    // 휴대폰 번호 검증
    if (!validation.required(formData.phone)) {
      newErrors.phone = "휴대폰 번호를 입력해주세요.";
    } else if (!/^010-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone =
        "올바른 휴대폰 번호 형식을 입력해주세요. (010-xxxx-xxxx)";
    }

    // 성별 검증
    if (!gender) {
      newErrors.gender = "성별을 선택해주세요.";
    }

    // 생년월일 검증
    if (!birthday.year || !birthday.month || !birthday.day) {
      newErrors.birthday = "생년월일을 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 회원가입 처리 함수
  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // reCAPTCHA 토큰 생성
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha("register");
      } catch (error) {
        // reCAPTCHA 실패 시 개발용 더미 토큰 사용
        recaptchaToken = getDummyRecaptchaToken();
      }

      const registerData: RegisterRequest = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        nickname: formData.nickname.trim(),
        recaptchaToken,
      };

      const response = await authApi.register(registerData);

      // 토큰 저장
      storage.set("accessToken", response.accessToken);
      storage.set("user", response.user);

      showToast("회원가입 성공! 환영합니다!", "success");
      navigate("/");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "회원가입에 실패했습니다.";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // 취소 처리 함수
  const handleCancel = () => {
    navigate("/login");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>회원가입</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignUp();
          }}
        >
          {/* 이메일 입력 */}
          <div className={styles.inputGroup}>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="이메일 *"
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

          {/* 비밀번호 입력 */}
          <div className={styles.inputGroup}>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="비밀번호 * (8자 이상)"
                className={`${styles.passwordInput} ${
                  errors.password ? styles.inputError : ""
                }`}
                autoComplete="new-password"
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

          {/* 비밀번호 확인 입력 */}
          <div className={styles.inputGroup}>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder="비밀번호 확인 *"
                className={`${styles.passwordInput} ${
                  errors.confirmPassword ? styles.inputError : ""
                }`}
                autoComplete="new-password"
                aria-describedby={
                  errors.confirmPassword ? "confirm-password-error" : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.eyeButton}
                aria-label={
                  showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                }
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span id="confirm-password-error" className={styles.errorText}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* 닉네임 입력 */}
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleInputChange("nickname", e.target.value)}
              placeholder="닉네임 * (2-20자)"
              className={`${styles.input} ${
                errors.nickname ? styles.inputError : ""
              }`}
              autoComplete="nickname"
              aria-describedby={errors.nickname ? "nickname-error" : undefined}
            />
            {errors.nickname && (
              <span id="nickname-error" className={styles.errorText}>
                {errors.nickname}
              </span>
            )}
          </div>

          {/* 휴대폰 번호 입력 */}
          <div className={styles.inputGroup}>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="휴대폰 번호 * (010-xxxx-xxxx)"
              className={`${styles.input} ${
                errors.phone ? styles.inputError : ""
              }`}
              autoComplete="tel"
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
            {errors.phone && (
              <span id="phone-error" className={styles.errorText}>
                {errors.phone}
              </span>
            )}
          </div>

          {/* 생년월일 선택 */}
          <div className={styles.inputGroup}>
            <BirthdaySelect
              value={birthday}
              onChange={setBirthday}
              error={errors.birthday}
            />
            {errors.birthday && (
              <span className={styles.errorText}>{errors.birthday}</span>
            )}
          </div>

          {/* 성별 선택 */}
          <div className={styles.inputGroup}>
            <GenderSelect
              value={gender}
              onChange={setGender}
              error={errors.gender}
            />
            {errors.gender && (
              <span className={styles.errorText}>{errors.gender}</span>
            )}
          </div>

          {/* 프로필 이미지 선택 */}
          <div className={styles.fileWrapper}>
            <label htmlFor="profileImage" className={styles.fileLabel}>
              <FaUpload /> 프로필 이미지 선택 (선택사항)
            </label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.hiddenFileInput}
            />
            {profileImage && (
              <div className={styles.fileInfo}>
                <span>업로드된 이미지: {profileImage.name}</span>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={styles.removeButton}
                  aria-label="이미지 제거"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>

          {/* reCAPTCHA */}
          <div className={styles.recaptcha}>
            <p className={styles.recaptchaText}>
              이 사이트는 reCAPTCHA 및 Google 개인정보처리방침과 서비스 약관의
              적용을 받습니다.
            </p>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
            aria-describedby={loading ? "loading-description" : undefined}
          >
            {loading ? "가입 중..." : "가입하기"}
          </button>
          {loading && (
            <span id="loading-description" className="sr-only">
              회원가입 처리 중입니다.
            </span>
          )}
        </form>

        {/* 취소 버튼 */}
        <button
          type="button"
          onClick={handleCancel}
          className={styles.cancelButton}
          disabled={loading}
        >
          취소
        </button>

        {/* 로그인 링크 */}
        <div className={styles.loginLink}>
          <span>이미 계정이 있으신가요? </span>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className={styles.linkButton}
            disabled={loading}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}
