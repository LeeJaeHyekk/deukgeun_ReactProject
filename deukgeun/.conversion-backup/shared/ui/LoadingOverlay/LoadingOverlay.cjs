const React = require('react')

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  children?: React.ReactNode
}

function LoadingOverlay
module.exports.LoadingOverlay = LoadingOverlay({
  isLoading,
  message = 'Loading...',
  children,
}: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    </div>
  )
}