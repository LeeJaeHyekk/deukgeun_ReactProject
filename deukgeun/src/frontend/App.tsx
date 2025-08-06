import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@shared/contexts/AuthContext";
import { useAuthContext } from "@shared/contexts/AuthContext";
import { LoadingSpinner } from "@shared/ui/LoadingSpinner/LoadingSpinner";
import HomePage from "@pages/HomePage";
import LoginPage from "@pages/login/LoginPage";
import ErrorPage from "@pages/Error/ErrorPage";
import SignUpPage from "@pages/Sign up/SignUpPage";
import MachineGuidePage from "@pages/MachineGuide/MachineGuidePage";
import CommunityPage from "@features/community/CommunityPage";
import GymFinderPage from "@pages/location/GymFinderPage";
import MyPage from "@pages/Mypage/myPage";

// 보호된 라우트 컴포넌트 (로그인 필요)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  console.log("🧪 ProtectedRoute 렌더링");

  const { isLoggedIn, isLoading } = useAuthContext();

  console.log("🧪 ProtectedRoute 상태:", { isLoggedIn, isLoading });

  if (isLoading) {
    console.log("🧪 ProtectedRoute - 로딩 중, 스피너 표시");
    return <LoadingSpinner text="인증 확인 중..." />;
  }

  if (!isLoggedIn) {
    console.log("🧪 ProtectedRoute - 로그인 필요, 로그인 페이지로 리다이렉트");
    return <Navigate to="/login" replace />;
  }

  console.log("🧪 ProtectedRoute - 인증됨, 자식 컴포넌트 렌더링");
  return <>{children}</>;
}

// 로그인된 사용자를 홈으로 리다이렉트하는 컴포넌트
function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  console.log("🧪 RedirectIfLoggedIn 렌더링");

  const { isLoggedIn, isLoading } = useAuthContext();

  console.log("🧪 RedirectIfLoggedIn 상태:", { isLoggedIn, isLoading });

  if (isLoading) {
    console.log("🧪 RedirectIfLoggedIn - 로딩 중, 스피너 표시");
    return <LoadingSpinner text="인증 확인 중..." />;
  }

  if (isLoggedIn) {
    console.log("🧪 RedirectIfLoggedIn - 이미 로그인됨, 홈으로 리다이렉트");
    return <Navigate to="/" replace />;
  }

  console.log("🧪 RedirectIfLoggedIn - 로그인되지 않음, 자식 컴포넌트 렌더링");
  return <>{children}</>;
}

// 라우터 컴포넌트 (AuthProvider 내부에서 사용)
function AppRoutes() {
  console.log("🧪 AppRoutes 렌더링");

  const { isLoading } = useAuthContext();

  console.log("🧪 AppRoutes - 전체 앱 로딩 상태:", isLoading);

  // 전체 앱 로딩 중일 때만 로딩 스피너 표시
  if (isLoading) {
    console.log("🧪 AppRoutes - 전체 앱 로딩 중, 스피너 표시");
    return <LoadingSpinner text="앱 초기화 중..." />;
  }

  console.log("🧪 AppRoutes - 라우트 렌더링");
  return (
    <Routes>
      {/* 홈페이지 - 로그인 없이도 접근 가능 */}
      <Route path="/" element={<HomePage />} />

      {/* 로그인/회원가입 - 로그인된 사용자는 홈으로 리다이렉트 */}
      <Route
        path="/login"
        element={
          <RedirectIfLoggedIn>
            <LoginPage />
          </RedirectIfLoggedIn>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectIfLoggedIn>
            <SignUpPage />
          </RedirectIfLoggedIn>
        }
      />

      {/* 공개 페이지들 - 로그인 없이도 접근 가능 */}
      <Route path="/machine-guide" element={<MachineGuidePage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/location" element={<GymFinderPage />} />

      {/* 보호된 페이지 - 로그인 필요 */}
      <Route
        path="/mypage"
        element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        }
      />

      {/* 에러 페이지 */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

function App() {
  console.log("🧪 App 컴포넌트 렌더링");

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
