// ============================================================================
// API 관련 커스텀 훅
// ============================================================================

const { useState, useEffect, useCallback  } = require('react')
import type { ApiResponse, LoadingState } from "../types"
const { apiClient  } = require('../api/client')

// API 요청 상태
export interface ApiState<T> extends LoadingState {
  data: T | null
  refetch: () => Promise<void>
}

// API 요청 옵션
export interface ApiOptions {
  immediate?: boolean
  onSuccess?: (data: unknown) => void
  onError?: (error: string) => void
}

// GET 요청 훅
function useGet<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean>,
  options: ApiOptions = {}
): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    isLoading: false,
    error: undefined,
    data: null,
    refetch: async () => {},
  })

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }))

    try {
      const response = await apiClient.get<T>(endpoint, params)

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          data: response.data as T,
          isLoading: false,
        }))
        options.onSuccess?.(response.data)
      } else {
        throw new Error(response.message || "요청에 실패했습니다.")
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }))
      options.onError?.(errorMessage)
    }
  }, [endpoint, params, options])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData()
    }
  }, [fetchData, options.immediate])

  useEffect(() => {
    setState(prev => ({ ...prev, refetch }))
  }, [refetch])

  return state
}

// POST 요청 훅
function usePost<T = unknown, D = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): [ApiState<T>, (data: D) => Promise<void>] {
  const [state, setState] = useState<ApiState<T>>({
    isLoading: false,
    error: undefined,
    data: null,
    refetch: async () => {},
  })

  const execute = useCallback(
    async (data: D) => {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }))

      try {
        const response = await apiClient.post<T>(endpoint, data)

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            data: response.data as T,
            isLoading: false,
          }))
          options.onSuccess?.(response.data)
        } else {
          throw new Error(response.message || "요청에 실패했습니다.")
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다."
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }))
        options.onError?.(errorMessage)
      }
    },
    [endpoint, options]
  )

  const refetch = useCallback(async () => {
    // POST 요청은 refetch가 의미가 없으므로 빈 함수
  }, [])

  useEffect(() => {
    setState(prev => ({ ...prev, refetch }))
  }, [refetch])

  return [state, execute]
}

// PUT 요청 훅
function usePut<T = unknown, D = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): [ApiState<T>, (data: D) => Promise<void>] {
  const [state, setState] = useState<ApiState<T>>({
    isLoading: false,
    error: undefined,
    data: null,
    refetch: async () => {},
  })

  const execute = useCallback(
    async (data: D) => {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }))

      try {
        const response = await apiClient.put<T>(endpoint, data)

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            data: response.data as T,
            isLoading: false,
          }))
          options.onSuccess?.(response.data)
        } else {
          throw new Error(response.message || "요청에 실패했습니다.")
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다."
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }))
        options.onError?.(errorMessage)
      }
    },
    [endpoint, options]
  )

  const refetch = useCallback(async () => {
    // PUT 요청은 refetch가 의미가 없으므로 빈 함수
  }, [])

  useEffect(() => {
    setState(prev => ({ ...prev, refetch }))
  }, [refetch])

  return [state, execute]
}

// DELETE 요청 훅
function useDelete<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): [ApiState<T>, () => Promise<void>] {
  const [state, setState] = useState<ApiState<T>>({
    isLoading: false,
    error: undefined,
    data: null,
    refetch: async () => {},
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }))

    try {
      const response = await apiClient.delete<T>(endpoint)

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          data: response.data as T,
          isLoading: false,
        }))
        options.onSuccess?.(response.data)
      } else {
        throw new Error(response.message || "요청에 실패했습니다.")
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다."
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }))
      options.onError?.(errorMessage)
    }
  }, [endpoint, options])

  const refetch = useCallback(async () => {
    // DELETE 요청은 refetch가 의미가 없으므로 빈 함수
  }, [])

  useEffect(() => {
    setState(prev => ({ ...prev, refetch }))
  }, [refetch])

  return [state, execute]
}

// 파일 업로드 훅
function useUpload<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): [ApiState<T>, (file: File) => Promise<void>] {
  const [state, setState] = useState<ApiState<T>>({
    isLoading: false,
    error: undefined,
    data: null,
    refetch: async () => {},
  })

  const execute = useCallback(
    async (file: File) => {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }))

      try {
        const response = await apiClient.upload<T>(endpoint, file)

        if (response.success && response.data) {
          setState(prev => ({
            ...prev,
            data: response.data as T,
            isLoading: false,
          }))
          options.onSuccess?.(response.data)
        } else {
          throw new Error(response.message || "업로드에 실패했습니다.")
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "업로드 중 오류가 발생했습니다."
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }))
        options.onError?.(errorMessage)
      }
    },
    [endpoint, options]
  )

  const refetch = useCallback(async () => {
    // 업로드는 refetch가 의미가 없으므로 빈 함수
  }, [])

  useEffect(() => {
    setState(prev => ({ ...prev, refetch }))
  }, [refetch])

  return [state, execute]
}
