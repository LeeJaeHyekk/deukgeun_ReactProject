// React Router 관련 라이브러리 import
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
// Redux 관련 import
import { ReduxProvider } from '@frontend/shared/providers/ReduxProvider'
import { useAuthRedux } from '@frontend/shared/hooks/useAuthRedux'
import { initializeAuth } from '@frontend/shared/store/authInitializer'
// 워크아웃 타이머 컨텍스트 import
import { WorkoutTimerProvider } from '@frontend/shared/contexts/WorkoutTimerContext'
// 공통 UI 컴포넌트 import
import { LoadingSpinner } from '@frontend/shared/ui/LoadingSpinner/LoadingSpinner'
// 에러 처리 관련 import
import { ErrorBoundary, globalErrorHandler } from '@pages/Error'
// 로거 import
import { logger } from '@frontend/shared/utils/logger'
// 개발자 도구 import
import { DevTools } from '@frontend/shared/components/DevTools'
import { LoginTest } from '@frontend/shared/components/LoginTest'
// 라우트 상수 import
import { ROUTES } from '@frontend/shared/constants/routes'
// 페이지 컴포넌트들 import
import HomePage from '@pages/HomePage/HomePage'
import LoginPage from '@pages/login/LoginPage'
import ErrorPage from '@pages/Error/ErrorPage'
import SignUpPage from '@pages/SignUp/SignUpPage'
import FindIdPage from '@pages/auth/FindIdPage'
import FindPasswordPage from '@pages/auth/FindPasswordPage'
import { MachineGuidePage } from '@features/machine-guide'
import CommunityPage from '@features/community/CommunityPage'
import GymFinderPage from '@pages/location/GymFinderPage'
import { WorkoutPage } from '@features/workout/WorkoutPage'
import MyPage from '@pages/MyPage/MyPage'
import AdminDashboardPage from '@features/admin/AdminDashboardPage'
import AdminPerformancePage from '@features/admin/AdminPerformancePage'
import DatabaseUpdatePage from '@features/admin/DatabaseUpdatePage'

/**
 * 보호된 라우트 컴포넌트 - 로그인이 필요한 페이지를 보호
 * @param children - 보호할 자식 컴포넌트
 * @returns 인증된 사용자에게는 자식 컴포넌트를, 그렇지 않으면 로그인 페이지로 리다이렉트
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // 인증 상태와 로딩 상태 가져오기
  const { isLoggedIn: isAuthenticated, isLoading } = useAuthRedux()

  // 로딩 중일 때는 스피너 표시
  if (isLoading) {
    return <LoadingSpinner text="인증 확인 중..." />
  }

  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // 인증된 사용자에게는 자식 컴포넌트 렌더링
  return <>{children}</>
}

/**
 * 관리자 전용 라우트 컴포넌트 - 관리자 권한이 필요한 페이지를 보호
 * @param children - 보호할 자식 컴포넌트
 * @returns 관리자에게는 자식 컴포넌트를, 그렇지 않으면 홈 페이지로 리다이렉트
 */
function AdminRoute({ children }: { children: React.ReactNode }) {
  // 인증 상태와 로딩 상태 가져오기
  const { isLoggedIn: isAuthenticated, isLoading, user } = useAuthRedux()

  // 로딩 중일 때는 스피너 표시
  if (isLoading) {
    return <LoadingSpinner text="인증 확인 중..." />
  }

  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // 관리자가 아닌 경우 홈 페이지로 리다이렉트
  if (user?.role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />
  }

  // 관리자에게는 자식 컴포넌트 렌더링
  return <>{children}</>
}

/**
 * 로그인된 사용자를 홈으로 리다이렉트하는 컴포넌트
 * @param children - 리다이렉트할 자식 컴포넌트
 * @returns 로그인되지 않은 사용자에게는 자식 컴포넌트를, 로그인된 사용자는 홈으로 리다이렉트
 */
function RedirectIfLoggedIn({ children }: { children: React.ReactNode }) {
  const { isLoggedIn: isAuthenticated, isLoading } = useAuthRedux()

  logger.debug('REDIRECT', 'RedirectIfLoggedIn 체크', { isAuthenticated, isLoading })

  if (isLoading) {
    logger.debug('REDIRECT', 'RedirectIfLoggedIn: 로딩 중...')
    return <LoadingSpinner text="인증 확인 중..." />
  }

  if (isAuthenticated) {
    logger.info('REDIRECT', 'RedirectIfLoggedIn: 로그인된 사용자 감지 - 홈으로 리다이렉트')
    return <Navigate to={ROUTES.HOME} replace />
  }

  logger.debug('REDIRECT', 'RedirectIfLoggedIn: 로그인되지 않은 사용자 - 페이지 표시')
  return <>{children}</>
}

/**
 * 메인 라우터 컴포넌트 - AuthProvider 내부에서 사용
 * @returns 전체 앱의 라우팅 구조를 정의
 */
function AppRoutes() {
  // 전체 앱의 로딩 상태 가져오기
  const { isLoading } = useAuthRedux()

  // 앱 초기화 (한 번만 실행)
  useEffect(() => {
    initializeAuth().catch((error) => {
      console.error('앱 초기화 실패:', error)
    })
  }, [])

  // 전체 앱 로딩 중일 때만 로딩 스피너 표시
  if (isLoading) {
    return <LoadingSpinner text="앱 초기화 중..." />
  }

  return (
    <Routes>
      {/* 홈페이지 - 로그인 없이도 접근 가능한 공개 페이지 */}
      <Route path={ROUTES.HOME} element={<HomePage />} />

      {/* 로그인/회원가입 페이지들 - 로그인된 사용자는 홈으로 리다이렉트 */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <RedirectIfLoggedIn>
            <LoginPage />
          </RedirectIfLoggedIn>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <RedirectIfLoggedIn>
            <SignUpPage />
          </RedirectIfLoggedIn>
        }
      />

      {/* 아이디/비밀번호 찾기 페이지들 - 로그인된 사용자는 홈으로 리다이렉트 */}
      <Route
        path={ROUTES.FIND_ID}
        element={
          <RedirectIfLoggedIn>
            <FindIdPage />
          </RedirectIfLoggedIn>
        }
      />
      <Route
        path={ROUTES.FIND_PASSWORD}
        element={
          <RedirectIfLoggedIn>
            <FindPasswordPage />
          </RedirectIfLoggedIn>
        }
      />

      {/* 공개 페이지 - 커뮤니티는 로그인 없이도 접근 가능 */}
      <Route path={ROUTES.COMMUNITY} element={<CommunityPage />} />

      {/* 보호된 페이지들 - 로그인이 필요한 기능들 */}
      <Route
        path={ROUTES.MACHINE_GUIDE}
        element={
          <ProtectedRoute>
            <MachineGuidePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.GYM_FINDER}
        element={
          <ProtectedRoute>
            <GymFinderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.WORKOUT}
        element={
          <ProtectedRoute>
            <WorkoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.MYPAGE}
        element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        }
      />

      {/* 관리자 전용 페이지들 */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_USERS}
        element={
          <AdminRoute>
            <AdminPerformancePage />
          </AdminRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_MACHINES}
        element={
          <AdminRoute>
            <DatabaseUpdatePage />
          </AdminRoute>
        }
      />

      {/* 에러 페이지 */}
      <Route path={ROUTES.SERVER_ERROR} element={<ErrorPage />} />

      {/* 404 페이지 */}
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
    // 전역 에러 바운더리로 전체 앱을 감싸기
    <ErrorBoundary
      onError={(error: Error, errorInfo: any) => {
        // 에러 발생 시 전역 에러 핸들러에 보고
        globalErrorHandler.manualErrorReport(error, {
          componentStack: errorInfo.componentStack || '',
        })
      }}
    >
      {/* Redux 상태를 관리하는 프로바이더 */}
      <ReduxProvider>
        {/* 워크아웃 타이머 상태를 관리하는 컨텍스트 프로바이더 */}
        <WorkoutTimerProvider>
          {/* 브라우저 라우터 설정 - React Router v7 호환성을 위한 future flags */}
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            {/* 메인 라우트 컴포넌트 */}
            <AppRoutes />
            {/* 개발자 도구 */}
            <DevTools />
            {/* 로그인 테스트 도구 */}
            <LoginTest />
          </BrowserRouter>
        </WorkoutTimerProvider>
      </ReduxProvider>
    </ErrorBoundary>
  )
}

export default App
