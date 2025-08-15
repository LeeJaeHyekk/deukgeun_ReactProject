// React Router 관련 라이브러리 import
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
// 인증 관련 컨텍스트 및 훅 import
import { AuthProvider } from "@shared/contexts/AuthContext"
import { useAuthContext } from "@shared/contexts/AuthContext"
// 공통 UI 컴포넌트 import
import { LoadingSpinner } from "@shared/ui/LoadingSpinner/LoadingSpinner"
// 페이지 컴포넌트들 import
import HomePage from "@pages/HomePage"
import LoginPage from "@pages/login/LoginPage"
import ErrorPage from "@pages/Error/ErrorPage"
import SignUpPage from "@pages/Sign up/SignUpPage"
import FindIdPage from "@pages/auth/FindIdPage"
import FindPasswordPage from "@pages/auth/FindPasswordPage"
import MachineGuidePage from "@pages/MachineGuide/MachineGuidePage"
import CommunityPage from "@features/community/CommunityPage"
import GymFinderPage from "@pages/location/GymFinderPage"
import WorkoutJournalPage from "@features/workout/WorkoutJournalPage"
import MyPage from "@pages/Mypage/myPage"

/**
 * 보호된 라우트 컴포넌트 - 로그인이 필요한 페이지를 보호
 * @param children - 보호할 자식 컴포넌트
 * @returns 인증된 사용자에게는 자식 컴포넌트를, 그렇지 않으면 로그인 페이지로 리다이렉트
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // 인증 상태와 로딩 상태 가져오기
  const { isLoggedIn, isLoading } = useAuthContext()

  // 로딩 중일 때는 스피너 표시
  if (isLoading) {
    return <LoadingSpinner text="인증 확인 중..." />
  }

  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  // 인증된 사용자에게는 자식 컴포넌트 렌더링
  return <>{children}</>
}

/**
 * 로그인된 사용자를 홈으로 리다이렉트하는 컴포넌트
 * @param children - 리다이렉트할 자식 컴포넌트
 * @returns 로그인되지 않은 사용자에게는 자식 컴포넌트를, 로그인된 사용자는 홈으로 리다이렉트
 */
function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  // 인증 상태와 로딩 상태 가져오기
  const { isLoggedIn, isLoading } = useAuthContext()

  // 로딩 중일 때는 스피너 표시
  if (isLoading) {
    return <LoadingSpinner text="인증 확인 중..." />
  }

  // 이미 로그인된 경우 홈으로 리다이렉트
  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  // 로그인되지 않은 사용자에게는 자식 컴포넌트 렌더링
  return <>{children}</>
}

/**
 * 메인 라우터 컴포넌트 - AuthProvider 내부에서 사용
 * @returns 전체 앱의 라우팅 구조를 정의
 */
function AppRoutes() {
  // 전체 앱의 로딩 상태 가져오기
  const { isLoading } = useAuthContext()

  // 전체 앱 로딩 중일 때만 로딩 스피너 표시
  if (isLoading) {
    return <LoadingSpinner text="앱 초기화 중..." />
  }

  return (
    <Routes>
      {/* 홈페이지 - 로그인 없이도 접근 가능한 공개 페이지 */}
      <Route path="/" element={<HomePage />} />

      {/* 로그인/회원가입 페이지들 - 로그인된 사용자는 홈으로 리다이렉트 */}
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

      {/* 아이디/비밀번호 찾기 페이지들 - 로그인된 사용자는 홈으로 리다이렉트 */}
      <Route
        path="/find-id"
        element={
          <RedirectIfLoggedIn>
            <FindIdPage />
          </RedirectIfLoggedIn>
        }
      />
      <Route
        path="/find-password"
        element={
          <RedirectIfLoggedIn>
            <FindPasswordPage />
          </RedirectIfLoggedIn>
        }
      />

      {/* 공개 페이지 - 커뮤니티는 로그인 없이도 접근 가능 */}
      <Route path="/community" element={<CommunityPage />} />

      {/* 보호된 페이지들 - 로그인이 필요한 기능들 */}
      <Route
        path="/machine-guide"
        element={
          <ProtectedRoute>
            <MachineGuidePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/location"
        element={
          <ProtectedRoute>
            <GymFinderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout-journal"
        element={
          <ProtectedRoute>
            <WorkoutJournalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mypage"
        element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        }
      />

      {/* 404 에러 페이지 - 정의되지 않은 모든 경로 */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}

/**
 * 메인 App 컴포넌트 - 전체 애플리케이션의 루트 컴포넌트
 * @returns 인증 컨텍스트와 라우터를 포함한 전체 앱 구조
 */
function App() {
  return (
    // 인증 상태를 관리하는 컨텍스트 프로바이더
    <AuthProvider>
      {/* 브라우저 라우터 설정 - React Router v7 호환성을 위한 future flags */}
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {/* 메인 라우트 컴포넌트 */}
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
