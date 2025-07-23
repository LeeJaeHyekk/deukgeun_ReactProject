import { useState } from 'react';

export default function SignUpPage() {
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  return (
    <div className="SignUpPage" style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>회원가입</h1>

      <div><input type="text" placeholder="이름" /></div>
      <div><input type="email" placeholder="이메일" /></div>
      <div><input type="password" placeholder="비밀번호" /></div>
      <div><input type="password" placeholder="비밀번호 확인" /></div>

      {/* 📱 휴대폰 번호 */}
      <div><input type="tel" placeholder="휴대폰 번호 (010-xxxx-xxxx)" /></div>

      {/* 🎂 생년월일 */}
      <div><input type="date" placeholder="생년월일" /></div>

      {/* ⚧ 성별 */}
      <div>
        <label>성별: </label>
        <select>
          <option value="">선택 안함</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
        </select>
      </div>

      {/* 🖼️ 프로필 이미지 업로드 */}
      <div>
        <label>프로필 이미지:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {profileImage && <p>업로드된 이미지: {profileImage.name}</p>}
      </div>

      {/* 🤖 로봇 아님 인증 (구글 reCAPTCHA 자리) */}
      <div style={{ marginTop: 20 }}>
        <p>[여기에 reCAPTCHA 삽입]</p>
        <div style={{
          width: '100%',
          height: 78,
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14
        }}>
          구글 reCAPTCHA 영역
        </div>
      </div>

      <button style={{ marginTop: 30, padding: '10px 20px', fontSize: 16 }}>가입하기</button>
      <button style={{ marginTop: 30, padding: '10px 20px', fontSize: 16 }}>취소</button>
    </div>
  );
}
