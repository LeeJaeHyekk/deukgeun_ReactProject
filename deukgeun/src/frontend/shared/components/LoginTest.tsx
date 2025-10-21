import React, { useState } from 'react'
import { logger } from '../utils/logger'
import { useAuthRedux } from '../hooks/useAuthRedux'

export function LoginTest() {
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('password123')
  const { isLoggedIn: isAuthenticated, user, isLoading } = useAuthRedux()

  const handleTestLogin = () => {
    logger.info('LOGIN_TEST', '테스트 로그인 시작', {
      email: testEmail,
      hasPassword: !!testPassword
    })
  }

  const handleClearLogs = () => {
    logger.clearLogs()
    logger.info('LOGIN_TEST', '로그 초기화 완료')
  }

  const handleDownloadLogs = () => {
    logger.downloadLogs()
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      backgroundColor: 'white',
      border: '2px solid #2196F3',
      borderRadius: '8px',
      padding: '15px',
      zIndex: 1000,
      maxWidth: '300px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#2196F3' }}>🔧 로그인 테스트</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '12px', marginBottom: '5px' }}>인증 상태:</div>
        <div style={{ fontSize: '11px', color: isAuthenticated ? '#4CAF50' : '#f44336' }}>
          {isLoading ? '로딩 중...' : isAuthenticated ? '✅ 로그인됨' : '❌ 로그인 안됨'}
        </div>
        {user && (
          <div style={{ fontSize: '10px', color: '#666', marginTop: '5px' }}>
            사용자: {user.email}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <input
          type="email"
          placeholder="테스트 이메일"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          style={{ width: '100%', padding: '5px', fontSize: '11px', marginBottom: '5px' }}
        />
        <input
          type="password"
          placeholder="테스트 비밀번호"
          value={testPassword}
          onChange={(e) => setTestPassword(e.target.value)}
          style={{ width: '100%', padding: '5px', fontSize: '11px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button
          onClick={handleTestLogin}
          style={{
            padding: '8px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          🧪 테스트 로그인
        </button>
        
        <button
          onClick={handleClearLogs}
          style={{
            padding: '8px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          🗑️ 로그 지우기
        </button>
        
        <button
          onClick={handleDownloadLogs}
          style={{
            padding: '8px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          💾 로그 다운로드
        </button>
      </div>
    </div>
  )
}
