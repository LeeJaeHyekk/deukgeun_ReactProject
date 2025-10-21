import { useAuthRedux } from '../hooks/useAuthRedux'

function AuthStatus() {
  const { isLoggedIn: isAuthenticated, user, isLoading, logout } = useAuthRedux()

  if (isLoading) {
    return <div>인증 상태 확인 중...</div>
  }

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', margin: '1rem' }}>
      <h3>인증 상태</h3>
      {isAuthenticated ? (
        <div>
          <p>✅ 로그인됨</p>
          <p>
            사용자: {user?.nickname} ({user?.email})
          </p>
          <button onClick={logout}>로그아웃</button>
        </div>
      ) : (
        <div>
          <p>❌ 로그아웃됨</p>
          <p>로그인이 필요합니다.</p>
        </div>
      )}
    </div>
  )
}
