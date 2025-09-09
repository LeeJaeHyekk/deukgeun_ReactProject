import React from 'react'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ isLoading, message = "로딩 중...", className = "" }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-700 text-sm">{message}</p>
      </div>
    </div>
  )
}
