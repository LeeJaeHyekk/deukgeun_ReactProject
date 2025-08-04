import { useState } from "react";
import { config } from "@shared/config";
import { api } from "@shared/api";

export default function ConnectionTest() {
  const [testResults, setTestResults] = useState<{
    backend: string;
    apiClient: string;
    health: string;
  }>({
    backend: "",
    apiClient: "",
    health: "",
  });
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    setLoading(true);
    setTestResults((prev) => ({ ...prev, health: "테스트 중..." }));

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/health`);
      if (response.ok) {
        const data = await response.json();
        setTestResults((prev) => ({
          ...prev,
          health: `✅ Health Check 성공! 서버: ${data.message}, 포트: ${data.port}`,
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          health: `❌ Health Check 실패: ${response.status} ${response.statusText}`,
        }));
      }
    } catch (error: any) {
      setTestResults((prev) => ({
        ...prev,
        health: `❌ Health Check 오류: ${error.message}`,
      }));
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = async () => {
    setLoading(true);
    setTestResults((prev) => ({ ...prev, backend: "테스트 중..." }));

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
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
        const data = await response.json();
        setTestResults((prev) => ({
          ...prev,
          backend: `✅ 백엔드 연결 성공! 로그인 성공: ${data.message}`,
        }));
      } else {
        const errorData = await response.json();
        setTestResults((prev) => ({
          ...prev,
          backend: `⚠️ 백엔드 연결됨, 로그인 실패: ${errorData.message}`,
        }));
      }
    } catch (error: any) {
      setTestResults((prev) => ({
        ...prev,
        backend: `❌ 백엔드 연결 실패: ${error.message}`,
      }));
    } finally {
      setLoading(false);
    }
  };

  const testApiClient = async () => {
    setLoading(true);
    setTestResults((prev) => ({ ...prev, apiClient: "테스트 중..." }));

    try {
      const response = await api.post("/auth/login", {
        email: "test@test.com",
        password: "testpassword",
        recaptchaToken: "test-token",
      });

      setTestResults((prev) => ({
        ...prev,
        apiClient: `✅ API 클라이언트 연결 성공! 로그인 성공: ${response.message}`,
      }));
    } catch (error: any) {
      setTestResults((prev) => ({
        ...prev,
        apiClient: `⚠️ API 클라이언트 연결됨, 로그인 실패: ${
          error.response?.data?.message || error.message
        }`,
      }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults({ backend: "", apiClient: "", health: "" });

    await testHealthCheck();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await testBackendConnection();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await testApiClient();

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🔗 프론트엔드-백엔드 연결 테스트</h1>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <h3>📋 현재 설정</h3>
        <p>
          <strong>백엔드 URL:</strong> {config.API_BASE_URL}
        </p>
        <p>
          <strong>reCAPTCHA 키:</strong> {config.RECAPTCHA_SITE_KEY}
        </p>
        <p>
          <strong>테스트 계정:</strong> test@test.com / testpassword
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={runAllTests}
          disabled={loading}
          style={{
            padding: "12px 24px",
            marginRight: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading ? "🔄 모든 테스트 실행 중..." : "🚀 모든 테스트 실행"}
        </button>

        <button
          onClick={testHealthCheck}
          disabled={loading}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          Health Check
        </button>

        <button
          onClick={testBackendConnection}
          disabled={loading}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: "#ffc107",
            color: "black",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          백엔드 연결
        </button>

        <button
          onClick={testApiClient}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          API 클라이언트
        </button>
      </div>

      <div style={{ display: "grid", gap: "15px" }}>
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <h4>🏥 Health Check 결과:</h4>
          <p>{testResults.health || "테스트를 실행해주세요."}</p>
        </div>

        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <h4>🔌 백엔드 연결 결과:</h4>
          <p>{testResults.backend || "테스트를 실행해주세요."}</p>
        </div>

        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <h4>📡 API 클라이언트 결과:</h4>
          <p>{testResults.apiClient || "테스트를 실행해주세요."}</p>
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#e9ecef",
          borderRadius: "8px",
        }}
      >
        <h3>📖 예상 결과 설명</h3>
        <ul style={{ lineHeight: "1.6" }}>
          <li>
            <strong>✅ 성공:</strong> 서버가 정상적으로 실행되고 연결이 성공
          </li>
          <li>
            <strong>⚠️ 연결됨, 로그인 실패:</strong> 백엔드는 연결되지만 테스트
            계정으로 로그인 실패 (정상)
          </li>
          <li>
            <strong>❌ 연결 실패:</strong> 백엔드 서버가 실행되지 않거나
            네트워크 문제
          </li>
        </ul>

        <h4 style={{ marginTop: "20px" }}>🔧 문제 해결</h4>
        <ul style={{ lineHeight: "1.6" }}>
          <li>백엔드 서버가 포트 3001에서 실행 중인지 확인</li>
          <li>프론트엔드 서버가 포트 5176에서 실행 중인지 확인</li>
          <li>CORS 설정이 올바른지 확인</li>
          <li>네트워크 연결 상태 확인</li>
        </ul>
      </div>
    </div>
  );
}
