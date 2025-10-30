import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// 개발 환경에서만 검증 도구 로드
if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
  import('@frontend/shared/utils/verification').catch(() => {
    // 로드 실패 시 무시 (선택적 기능)
  })
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
