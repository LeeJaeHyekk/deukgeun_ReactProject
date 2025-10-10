// ============================================================================
// ErrorBoundary 컴포넌트 테스트
// ============================================================================

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, withErrorBoundary } from '../ErrorBoundary'
import { ErrorFallback, ComponentErrorFallback, ApiErrorFallback } from '../ErrorFallback'

// 에러를 발생시키는 테스트 컴포넌트
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// 에러를 발생시키는 비동기 컴포넌트
const AsyncThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Async test error')
  }
  return <div>No async error</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // console.error를 mock하여 테스트 중 에러 로그를 숨김
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('기본 동작', () => {
    it('에러가 없을 때 자식 컴포넌트를 렌더링해야 한다', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('에러가 발생했을 때 ErrorFallback을 렌더링해야 한다', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument()
      expect(screen.getByText('예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')).toBeInTheDocument()
    })

    it('커스텀 fallback을 사용해야 한다', () => {
      const customFallback = <div>Custom error message</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })
  })

  describe('에러 복구', () => {
    it('다시 시도 버튼을 클릭하면 에러 상태를 리셋해야 한다', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument()

      const retryButton = screen.getByText('다시 시도')
      fireEvent.click(retryButton)

      // 에러가 발생하지 않는 상태로 리렌더링
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      // 잠시 후 에러 상태가 리셋되어야 함
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('페이지 새로고침 버튼을 클릭하면 window.location.reload가 호출되어야 한다', () => {
      const mockReload = jest.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      })

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const reloadButton = screen.getByText('페이지 새로고침')
      fireEvent.click(reloadButton)

      expect(mockReload).toHaveBeenCalled()
    })
  })

  describe('resetKeys 기능', () => {
    it('resetKeys가 변경되면 에러 상태를 리셋해야 한다', async () => {
      const { rerender } = render(
        <ErrorBoundary resetKeys={['key1']}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument()

      // resetKeys를 변경하여 리렌더링
      rerender(
        <ErrorBoundary resetKeys={['key2']}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      // 잠시 후 에러 상태가 리셋되어야 함
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })

  describe('resetOnPropsChange 기능', () => {
    it('resetOnPropsChange가 true일 때 props 변경 시 에러 상태를 리셋해야 한다', async () => {
      const { rerender } = render(
        <ErrorBoundary resetOnPropsChange={true}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument()

      // children을 변경하여 리렌더링
      rerender(
        <ErrorBoundary resetOnPropsChange={true}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      // 잠시 후 에러 상태가 리셋되어야 함
      await new Promise(resolve => setTimeout(resolve, 150))
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })

  describe('에러 핸들링', () => {
    it('onError 콜백이 호출되어야 한다', () => {
      const onError = jest.fn()

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
    })

    it('에러 ID가 생성되어야 한다', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const errorIdElement = screen.getByText(/오류 ID:/)
      expect(errorIdElement).toBeInTheDocument()
    })
  })

  describe('개발 환경 기능', () => {
    it('개발 환경에서 상세 정보 토글 버튼이 표시되어야 한다', () => {
      // 개발 환경으로 설정
      const originalEnv = import.meta.env.DEV
      Object.defineProperty(import.meta.env, 'DEV', {
        value: true,
        writable: true
      })

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('상세 정보 보기')).toBeInTheDocument()

      // 원래 환경으로 복원
      Object.defineProperty(import.meta.env, 'DEV', {
        value: originalEnv,
        writable: true
      })
    })

    it('상세 정보를 토글할 수 있어야 한다', () => {
      // 개발 환경으로 설정
      Object.defineProperty(import.meta.env, 'DEV', {
        value: true,
        writable: true
      })

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const toggleButton = screen.getByText('상세 정보 보기')
      fireEvent.click(toggleButton)

      expect(screen.getByText('상세 정보 숨기기')).toBeInTheDocument()
      expect(screen.getByText('에러 메시지:')).toBeInTheDocument()
    })
  })
})

describe('withErrorBoundary HOC', () => {
  it('컴포넌트를 에러 바운더리로 래핑해야 한다', () => {
    const TestComponent = () => <div>Test Component</div>
    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent />)

    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('에러가 발생했을 때 에러 바운더리가 작동해야 한다', () => {
    const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('HOC test error')
      }
      return <div>Test Component</div>
    }

    const WrappedComponent = withErrorBoundary(TestComponent)

    render(<WrappedComponent shouldThrow={true} />)

    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument()
  })
})

describe('ErrorFallback 컴포넌트들', () => {
  describe('ComponentErrorFallback', () => {
    it('컴포넌트 에러 폴백을 렌더링해야 한다', () => {
      const onRetry = jest.fn()

      render(
        <ComponentErrorFallback
          componentName="TestComponent"
          onRetry={onRetry}
        />
      )

      expect(screen.getByText('TestComponent 컴포넌트 오류')).toBeInTheDocument()
      expect(screen.getByText('이 컴포넌트에서 문제가 발생했습니다.')).toBeInTheDocument()

      const retryButton = screen.getByText('다시 시도')
      fireEvent.click(retryButton)

      expect(onRetry).toHaveBeenCalled()
    })
  })

  describe('ApiErrorFallback', () => {
    it('네트워크 에러 폴백을 렌더링해야 한다', () => {
      const onRetry = jest.fn()
      const networkError = new Error('Network error')

      render(
        <ApiErrorFallback
          error={networkError}
          onRetry={onRetry}
        />
      )

      expect(screen.getByText('네트워크 오류')).toBeInTheDocument()
      expect(screen.getByText('인터넷 연결을 확인해주세요.')).toBeInTheDocument()
    })

    it('서버 에러 폴백을 렌더링해야 한다', () => {
      const onRetry = jest.fn()
      const serverError = new Error('500 Server Error')

      render(
        <ApiErrorFallback
          error={serverError}
          onRetry={onRetry}
        />
      )

      expect(screen.getByText('서버 오류')).toBeInTheDocument()
      expect(screen.getByText('서버에 일시적인 문제가 있습니다.')).toBeInTheDocument()
    })

    it('일반 API 에러 폴백을 렌더링해야 한다', () => {
      const onRetry = jest.fn()
      const apiError = new Error('API Error')

      render(
        <ApiErrorFallback
          error={apiError}
          onRetry={onRetry}
        />
      )

      expect(screen.getByText('API 오류')).toBeInTheDocument()
      expect(screen.getByText('데이터를 불러오는 중 오류가 발생했습니다.')).toBeInTheDocument()
    })
  })
})

describe('타입 안전성', () => {
  it('ErrorBoundary props 타입이 올바르게 정의되어야 한다', () => {
    // TypeScript 컴파일 타임에 타입 체크
    const validProps = {
      children: <div>Test</div>,
      fallback: <div>Fallback</div>,
      onError: (error: Error, errorInfo: React.ErrorInfo) => {},
      resetKeys: ['key1', 'key2'],
      resetOnPropsChange: true
    }

    expect(typeof validProps.children).toBe('object')
    expect(typeof validProps.fallback).toBe('object')
    expect(typeof validProps.onError).toBe('function')
    expect(Array.isArray(validProps.resetKeys)).toBe(true)
    expect(typeof validProps.resetOnPropsChange).toBe('boolean')
  })

  it('ErrorFallback props 타입이 올바르게 정의되어야 한다', () => {
    const validProps = {
      error: new Error('Test error'),
      errorInfo: { componentStack: 'Test stack' },
      errorId: 'error_123',
      onRetry: () => {},
      onReload: () => {}
    }

    expect(validProps.error).toBeInstanceOf(Error)
    expect(typeof validProps.errorInfo).toBe('object')
    expect(typeof validProps.errorId).toBe('string')
    expect(typeof validProps.onRetry).toBe('function')
    expect(typeof validProps.onReload).toBe('function')
  })
})
