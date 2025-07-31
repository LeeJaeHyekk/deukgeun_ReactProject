import { useState } from "react";
import styles from "./SignUpPage.module.css";
import { GenderSelect } from "./GenderSelect/GenderSelect";
import { BirthdaySelect } from "./BirthDateSelect/BirthDateSelect";

export default function SignUpPage() {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [gender, setGender] = useState<string>("");
  const [birthday, setBirthday] = useState({ year: "", month: "", day: "" });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>회원가입</h1>

        <input type="text" placeholder="이름" className={styles.input} />
        <input type="email" placeholder="이메일" className={styles.input} />
        <input
          type="password"
          placeholder="비밀번호"
          className={styles.input}
        />
        <input
          type="password"
          placeholder="비밀번호 확인"
          className={styles.input}
        />
        <input
          type="tel"
          placeholder="휴대폰 번호 (010-xxxx-xxxx)"
          className={styles.input}
        />
        {/* <input type="date" placeholder="생년월일" className={styles.input} /> */}
        <BirthdaySelect />

        {/* 커스텀 성별 선택 */}
        <GenderSelect value={gender} onChange={setGender} />

        {/* 프로필 이미지 선택 */}
        <div className={styles.fileWrapper}>
          <label htmlFor="profileImage" className={styles.fileLabel}>
            프로필 이미지 선택
          </label>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.hiddenFileInput}
          />
          {profileImage && (
            <p className={styles.fileInfo}>
              업로드된 이미지: {profileImage.name}
            </p>
          )}
        </div>

        {/* reCAPTCHA 자리 */}
        <div className={styles.recaptcha}>
          <p>구글 reCAPTCHA 영역</p>
        </div>

        <button className={styles.submitButton}>가입하기</button>
        <button className={styles.cancelButton}>취소</button>
      </div>
    </div>
  );
}
