import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    // 실제 로그인 처리 로직
    setTimeout(() => setLoading(false), 2000); // 시뮬레이션용
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>로그인</h1>

      <input type="text" placeholder="ID (이메일 또는 닉네임)" style={{ width: "100%", marginBottom: 10 }} />
      
      <div style={{ position: "relative", marginBottom: 10 }}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="비밀번호"
          style={{ width: "100%", paddingRight: 30 }}
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          style={{ position: "absolute", right: 8, top: 8, cursor: "pointer", fontSize: 12 }}
        >
          {showPassword ? "🙈" : "👁️"}
        </span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          <input type="checkbox" /> 자동 로그인
        </label>
      </div>

      <button onClick={handleLogin} style={{ width: "100%", padding: 10 }}>
        {loading ? "로그인 중..." : "로그인"}
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 14 }}>
        <span style={{ cursor: "pointer", color: "#007bff" }}>회원가입</span>
        <span style={{ cursor: "pointer", color: "#007bff" }}>아이디 찾기</span>
        <span style={{ cursor: "pointer", color: "#007bff" }}>비밀번호 찾기</span>
      </div>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        {/* 소셜 로그인 자리 */}
        <button style={{ width: "100%", padding: 8, backgroundColor: "#f7e600", border: "none", marginBottom: 8 }}>
          🟡 카카오로 로그인
        </button>
        <button style={{ width: "100%", padding: 8, backgroundColor: "#4285F4", color: "#fff", border: "none" }}>
          🔵 Google로 로그인
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        {/* reCAPTCHA 자리 */}
        <p>[reCAPTCHA 자리]</p>
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
    </div>
  );
}
