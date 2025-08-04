import { useState } from "react";
import { config } from "@shared/config";
import { api } from "@shared/api";
import { showToast } from "@shared/lib";

export default function ConnectionTest() {
  const [testResult, setTestResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResult("테스트 중...");
    
    try {
      // 1. 기본 연결 테스트
      const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@test.com",
          password: "testpassword",
          recaptchaToken: "test-token",
        }),
      });

      if (response.ok) {
        setTestResult("✅ 백엔드 서버 연결 성공!");
        showToast("백엔드 연결 성공!", "success");
      } else {
        const errorData = await response.json();
        setTestResult(`⚠️ 백엔드 연결됨, 하지만 로그인 실패: ${errorData.message}`);
        showToast("백엔드 연결됨, 로그인 실패 (예상됨)", "info");
      }
    } catch (error: any) {
      setTestResult(`❌ 백엔드 연결 실패: ${error.message}`);
      showToast("백엔드 연결 실패", "error");
    } finally {
      setLoading(false);
    }
  };

  const testApiClient = async () => {
    setLoading(true);
    setTestResult("API 클라이언트 테스트 중...");
    
    try {
      // API 클라이언트를 사용한 테스트
      const response = await api.post("/auth/login", {
        email: "test@test.com",
        password: "testpassword",
        recaptchaToken: "test-token",
      });
      
      setTestResult("✅ API 클라이언트 연결 성공!");
      showToast("API 클라이언트 연결 성공!", "success");
    } catch (error: any) {
      setTestResult(`⚠️ API 클라이언트 연결됨, 로그인 실패: ${error.response?.data?.message || error.message}`);
      showToast("API 클라이언트 연결됨, 로그인 실패 (예상됨)", "info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>프론트엔드-백엔드 연결 테스트</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <h3>현재 설정</h3>
        <p><strong>백엔드 URL:</strong> {config.API_BASE_URL}</p>
        <p><strong>reCAPTCHA 키:</strong> {config.RECAPTCHA_SITE_KEY}</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button 
          onClick={testBackendConnection}
          disabled={loading}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "테스트 중..." : "백엔드 연결 테스트"}
        </button>

        <button 
          onClick={testApiClient}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "테스트 중..." : "API 클라이언트 테스트"}
        </button>
      </div>

      <div style={{ 
        padding: "15px", 
        backgroundColor: "#f8f9fa", 
        borderRadius: "5px",
        border: "1px solid #dee2e6"
      }}>
        <h4>테스트 결과:</h4>
        <p>{testResult || "테스트를 실행해주세요."}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>예상 결과</h3>
        <ul>
          <li>✅ <strong>연결 성공:</strong> 백엔드 서버가 정상적으로 실행 중</li>
          <li>⚠️ <strong>연결됨, 로그인 실패:</strong> 백엔드는 연결되지만 테스트 계정이 없어서 로그인 실패 (정상)</li>
          <li>❌ <strong>연결 실패:</strong> 백엔드 서버가 실행되지 않음</li>
        </ul>
      </div>
    </div>
  );
} 