import React, { useState } from 'react'
import { RecaptchaEnterpriseButton, RecaptchaEnterpriseScript, useRecaptchaEnterprise } from '../shared/components/RecaptchaEnterpriseButton'

const RecaptchaTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { isLoaded, isLoading: recaptchaLoading, executeRecaptcha } = useRecaptchaEnterprise()

  const addTestResult = (result: any) => {
    setTestResults(prev => [...prev, {
      ...result,
      timestamp: new Date().toLocaleString()
    }])
  }

  const handleRecaptchaSuccess = async (token: string, action: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/recaptcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          action
        })
      })

      const result = await response.json()
      
      addTestResult({
        action,
        success: result.success,
        score: result.score,
        message: result.message || '검증 완료',
        token: token.substring(0, 20) + '...'
      })
    } catch (error) {
      addTestResult({
        action,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token.substring(0, 20) + '...'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecaptchaError = (error: any, action: string) => {
    addTestResult({
      action,
      success: false,
      error: error.message || 'reCAPTCHA 실행 실패',
      token: null
    })
  }

  const testActions = [
    { name: 'LOGIN', label: '로그인 테스트', minScore: 0.5 },
    { name: 'REGISTER', label: '회원가입 테스트', minScore: 0.7 },
    { name: 'SENSITIVE', label: '민감한 작업 테스트', minScore: 0.8 },
    { name: 'ADMIN', label: '관리자 작업 테스트', minScore: 0.9 }
  ]

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="recaptcha-test-page">
      <RecaptchaEnterpriseScript />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">reCAPTCHA Enterprise 테스트</h1>
        
        {/* 상태 표시 */}
        <div className="mb-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">상태 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded">
              <div className="font-medium">reCAPTCHA 로드 상태</div>
              <div className={`text-sm ${isLoaded ? 'text-green-600' : 'text-red-600'}`}>
                {recaptchaLoading ? '로딩 중...' : isLoaded ? '로드됨' : '로드 실패'}
              </div>
            </div>
            <div className="p-3 bg-white rounded">
              <div className="font-medium">사이트 키</div>
              <div className="text-sm text-gray-600">
                {import.meta.env.VITE_RECAPTCHA_SITE_KEY ? 
                  import.meta.env.VITE_RECAPTCHA_SITE_KEY.substring(0, 20) + '...' : 
                  '설정되지 않음'
                }
              </div>
            </div>
            <div className="p-3 bg-white rounded">
              <div className="font-medium">테스트 결과</div>
              <div className="text-sm text-gray-600">
                {testResults.length}개 실행됨
              </div>
            </div>
          </div>
        </div>

        {/* 테스트 버튼들 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">테스트 실행</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testActions.map(({ name, label, minScore }) => (
              <div key={name} className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">{label}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  최소 점수: {minScore}
                </p>
                <RecaptchaEnterpriseButton
                  action={name}
                  onSuccess={(token) => handleRecaptchaSuccess(token, name)}
                  onError={(error) => handleRecaptchaError(error, name)}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={!isLoaded || isLoading}
                >
                  {isLoading ? '처리 중...' : '테스트 실행'}
                </RecaptchaEnterpriseButton>
              </div>
            ))}
          </div>
        </div>

        {/* 훅을 사용한 테스트 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">훅을 사용한 테스트</h2>
          <div className="p-4 border rounded-lg">
            <button
              onClick={async () => {
                try {
                  const token = await executeRecaptcha('HOOK_TEST')
                  handleRecaptchaSuccess(token, 'HOOK_TEST')
                } catch (error) {
                  handleRecaptchaError(error, 'HOOK_TEST')
                }
              }}
              disabled={!isLoaded || isLoading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              훅 테스트 실행
            </button>
          </div>
        </div>

        {/* 결과 표시 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">테스트 결과</h2>
            <button
              onClick={clearResults}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              결과 지우기
            </button>
          </div>
          
          {testResults.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              아직 테스트가 실행되지 않았습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">
                      {result.action} - {result.success ? '성공' : '실패'}
                    </div>
                    <div className="text-sm text-gray-500">{result.timestamp}</div>
                  </div>
                  
                  {result.success && (
                    <div className="text-sm text-green-600">
                      점수: {result.score?.toFixed(3) || 'N/A'}
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-sm text-red-600">
                      오류: {result.error}
                    </div>
                  )}
                  
                  {result.message && (
                    <div className="text-sm text-gray-600">
                      메시지: {result.message}
                    </div>
                  )}
                  
                  {result.token && (
                    <div className="text-xs text-gray-500 mt-1">
                      토큰: {result.token}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 디버깅 정보 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">디버깅 정보</h2>
          <div className="p-4 bg-gray-100 rounded-lg">
            <pre className="text-sm overflow-auto">
              {JSON.stringify({
                isLoaded,
                isLoading: recaptchaLoading,
                siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
                backendUrl: import.meta.env.VITE_BACKEND_URL,
                testResultsCount: testResults.length
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecaptchaTestPage
