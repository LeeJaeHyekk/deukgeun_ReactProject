// ============================================================================
// Toast notification utilities
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  type?: ToastType
  duration?: number
  position?: 'top' | 'bottom' | 'center'
}

// Simple toast implementation
export const showToast = (message: string, options?: ToastOptions | ToastType): void => {
  // Handle both ToastOptions object and ToastType string
  const toastOptions: ToastOptions = typeof options === 'string' 
    ? { type: options }
    : options || {}
    
  const {
    type = 'info',
    duration = 3000,
    position = 'top'
  } = toastOptions

  // Create toast element
  const toast = document.createElement('div')
  toast.className = `toast toast-${type} toast-${position}`
  toast.textContent = message
  
  // Add styles
  toast.style.cssText = `
    position: fixed;
    z-index: 9999;
    padding: 12px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    font-size: 14px;
    max-width: 400px;
    word-wrap: break-word;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    transform: translateY(-100px);
    opacity: 0;
  `

  // Set position
  switch (position) {
    case 'top':
      toast.style.top = '20px'
      toast.style.left = '50%'
      toast.style.transform = 'translateX(-50%) translateY(-100px)'
      break
    case 'bottom':
      toast.style.bottom = '20px'
      toast.style.left = '50%'
      toast.style.transform = 'translateX(-50%) translateY(100px)'
      break
    case 'center':
      toast.style.top = '50%'
      toast.style.left = '50%'
      toast.style.transform = 'translate(-50%, -50%) scale(0.8)'
      break
  }

  // Set type-specific styles
  switch (type) {
    case 'success':
      toast.style.backgroundColor = '#10b981'
      break
    case 'error':
      toast.style.backgroundColor = '#ef4444'
      break
    case 'warning':
      toast.style.backgroundColor = '#f59e0b'
      break
    case 'info':
      toast.style.backgroundColor = '#3b82f6'
      break
  }

  // Add to DOM
  document.body.appendChild(toast)

  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = position === 'center' 
      ? 'translate(-50%, -50%) scale(1)'
      : position === 'top'
      ? 'translateX(-50%) translateY(0)'
      : 'translateX(-50%) translateY(0)'
    toast.style.opacity = '1'
  })

  // Auto remove
  setTimeout(() => {
    toast.style.transform = position === 'center'
      ? 'translate(-50%, -50%) scale(0.8)'
      : position === 'top'
      ? 'translateX(-50%) translateY(-100px)'
      : 'translateX(-50%) translateY(100px)'
    toast.style.opacity = '0'
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, duration)
}

// Convenience functions
export const toast = {
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    showToast(message, { ...options, type: 'success' }),
  
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    showToast(message, { ...options, type: 'error' }),
  
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    showToast(message, { ...options, type: 'warning' }),
  
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => 
    showToast(message, { ...options, type: 'info' }),
}
