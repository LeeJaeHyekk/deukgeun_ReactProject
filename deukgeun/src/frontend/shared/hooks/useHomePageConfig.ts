import { useState, useEffect } from 'react'
import { homePageApi, HomePageConfig, DEFAULT_HOME_PAGE_CONFIG } from '../api/homePageApi'

const useHomePageConfig = () => {
  const [config, setConfig] = useState<HomePageConfig>(DEFAULT_HOME_PAGE_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await homePageApi.getHomePageConfig()
      setConfig(data)
    } catch (err) {
      console.error("홈페이지 설정 조회 오류:", err)
      setError("홈페이지 설정을 불러오는데 실패했습니다.")
      // 오류 발생 시 기본값 사용
      setConfig(DEFAULT_HOME_PAGE_CONFIG)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  return {
    config,
    isLoading,
    error,
    refetch: fetchConfig,
  }
}

// Export the hook
export { useHomePageConfig }