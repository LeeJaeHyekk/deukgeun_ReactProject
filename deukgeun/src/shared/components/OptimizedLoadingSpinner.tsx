// ============================================================================
// 최적화된 로딩 스피너 컴포넌트
// 성능 최적화와 접근성을 고려한 로딩 인디케이터
// ============================================================================

import React, { memo, useMemo, useState } from 'react'
import { usePerformanceMonitor } from '../utils/performanceOptimizer'

interface OptimizedLoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  text?: string
  fullScreen?: boolean
  overlay?: boolean
  className?: string
  'aria-label'?: string
}

// 스피너 크기 설정
const SIZE_CONFIG = {
  small: {
    size: 'w-4 h-4',
    text: 'text-sm',
  },
  medium: {
    size: 'w-8 h-8',
    text: 'text-base',
  },
  large: {
    size: 'w-12 h-12',
    text: 'text-lg',
  },
}

// 색상 설정
const COLOR_CONFIG = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  gray: 'text-gray-400',
}

// 메모이제이션된 스피너 아이콘
const SpinnerIcon = memo(() => (
  <svg
    className="animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
))

SpinnerIcon.displayName = 'SpinnerIcon'

// 메인 컴포넌트
export const OptimizedLoadingSpinner = memo<OptimizedLoadingSpinnerProps>(
  ({
    size = 'medium',
    color = 'primary',
    text,
    fullScreen = false,
    overlay = false,
    className = '',
    'aria-label': ariaLabel = '로딩 중...',
  }) => {
    // 성능 모니터링
    usePerformanceMonitor('OptimizedLoadingSpinner')

    // 메모이제이션된 스타일 계산
    const styles = useMemo(() => {
      const sizeConfig = SIZE_CONFIG[size]
      const colorClass = COLOR_CONFIG[color]

      const baseClasses = [
        'flex',
        'items-center',
        'justify-center',
        'flex-col',
        'gap-2',
      ]

      const spinnerClasses = [sizeConfig.size, colorClass]

      const textClasses = [sizeConfig.text, colorClass, 'font-medium']

      const containerClasses = [
        ...baseClasses,
        fullScreen && 'fixed inset-0 z-50',
        overlay && 'absolute inset-0 bg-white bg-opacity-75 z-40',
        className,
      ].filter(Boolean)

      return {
        container: containerClasses.join(' '),
        spinner: spinnerClasses.join(' '),
        text: textClasses.join(' '),
      }
    }, [size, color, fullScreen, overlay, className])

    return (
      <div
        className={styles.container}
        role="status"
        aria-label={ariaLabel}
        aria-live="polite"
      >
        <div className={styles.spinner}>
          <SpinnerIcon />
        </div>
        {text && <p className={styles.text}>{text}</p>}
        <span className="sr-only">{ariaLabel}</span>
      </div>
    )
  }
)

OptimizedLoadingSpinner.displayName = 'OptimizedLoadingSpinner'

// 특수한 용도의 스피너 컴포넌트들
export const InlineSpinner = memo<
  Omit<OptimizedLoadingSpinnerProps, 'fullScreen' | 'overlay'>
>(props => <OptimizedLoadingSpinner {...props} />)

InlineSpinner.displayName = 'InlineSpinner'

export const FullScreenSpinner = memo<
  Omit<OptimizedLoadingSpinnerProps, 'fullScreen'>
>(props => <OptimizedLoadingSpinner {...props} fullScreen />)

FullScreenSpinner.displayName = 'FullScreenSpinner'

export const OverlaySpinner = memo<
  Omit<OptimizedLoadingSpinnerProps, 'overlay'>
>(props => <OptimizedLoadingSpinner {...props} overlay />)

OverlaySpinner.displayName = 'OverlaySpinner'

// 스켈레톤 로딩 컴포넌트
export const OptimizedSkeletonLoader = memo<{
  lines?: number
  className?: string
  animate?: boolean
}>(({ lines = 3, className = '', animate = true }) => {
  usePerformanceMonitor('OptimizedSkeletonLoader')

  const skeletonLines = useMemo(
    () =>
      Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded ${
            animate ? 'animate-pulse' : ''
          } ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      )),
    [lines, animate]
  )

  return <div className={`space-y-3 ${className}`}>{skeletonLines}</div>
})

OptimizedSkeletonLoader.displayName = 'OptimizedSkeletonLoader'

// 프로그레스 바 컴포넌트
export const OptimizedProgressBar = memo<{
  progress: number
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'success' | 'warning' | 'error'
  showPercentage?: boolean
  className?: string
}>(
  ({
    progress,
    size = 'medium',
    color = 'primary',
    showPercentage = false,
    className = '',
  }) => {
    usePerformanceMonitor('OptimizedProgressBar')

    const sizeClasses = useMemo(() => {
      switch (size) {
        case 'small':
          return 'h-1'
        case 'medium':
          return 'h-2'
        case 'large':
          return 'h-3'
        default:
          return 'h-2'
      }
    }, [size])

    const colorClasses = useMemo(() => {
      switch (color) {
        case 'primary':
          return 'bg-blue-600'
        case 'success':
          return 'bg-green-600'
        case 'warning':
          return 'bg-yellow-600'
        case 'error':
          return 'bg-red-600'
        default:
          return 'bg-blue-600'
      }
    }, [color])

    const clampedProgress = Math.min(Math.max(progress, 0), 100)

    return (
      <div className={`w-full ${className}`}>
        <div
          className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses}`}
        >
          <div
            className={`${colorClasses} transition-all duration-300 ease-out ${sizeClasses}`}
            style={{ width: `${clampedProgress}%` }}
            role="progressbar"
            aria-valuenow={clampedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`진행률 ${clampedProgress}%`}
          />
        </div>
        {showPercentage && (
          <p className="text-sm text-gray-600 mt-1 text-center">
            {clampedProgress.toFixed(0)}%
          </p>
        )}
      </div>
    )
  }
)

OptimizedProgressBar.displayName = 'OptimizedProgressBar'

// 로딩 상태 관리 훅
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState)
  const [loadingText, setLoadingText] = React.useState<string>('')

  const startLoading = React.useCallback((text?: string) => {
    setIsLoading(true)
    if (text) setLoadingText(text)
  }, [])

  const stopLoading = React.useCallback(() => {
    setIsLoading(false)
    setLoadingText('')
  }, [])

  const setLoading = React.useCallback((loading: boolean, text?: string) => {
    setIsLoading(loading)
    if (text !== undefined) setLoadingText(text)
  }, [])

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    setLoading,
  }
}
