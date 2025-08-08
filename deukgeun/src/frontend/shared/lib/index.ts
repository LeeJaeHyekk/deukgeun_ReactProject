import { config } from "../config"

// Validation Functions
export const validation = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return (
      emailRegex.test(email) &&
      email.length >= config.VALIDATION.EMAIL_MIN_LENGTH &&
      email.length <= config.VALIDATION.EMAIL_MAX_LENGTH
    )
  },

  password: (password: string): boolean => {
    return (
      password.length >= config.VALIDATION.PASSWORD_MIN_LENGTH &&
      password.length <= config.VALIDATION.PASSWORD_MAX_LENGTH
    )
  },

  nickname: (nickname: string): boolean => {
    return (
      nickname.length >= config.VALIDATION.NICKNAME_MIN_LENGTH &&
      nickname.length <= config.VALIDATION.NICKNAME_MAX_LENGTH
    )
  },

  required: (value: string): boolean => {
    return value.trim().length > 0
  },
}

// Error Handling
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.message) {
    return error.message
  }

  return "알 수 없는 오류가 발생했습니다."
}

// Toast Message (Simple implementation)
export const showToast = (
  message: string,
  type: "success" | "error" | "info" | "warning" = "info"
) => {
  // Create toast element
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.textContent = message

  // Style the toast
  Object.assign(toast.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    padding: "12px 20px",
    borderRadius: "8px",
    color: "white",
    fontWeight: "500",
    zIndex: "9999",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease",
    maxWidth: "300px",
    wordBreak: "break-word",
  })

  // Set background color based on type
  const colors = {
    success: "#4CAF50",
    error: "#F44336",
    info: "#2196F3",
    warning: "#FF9800",
  }
  toast.style.backgroundColor = colors[type]

  // Add to DOM
  document.body.appendChild(toast)

  // Animate in
  setTimeout(() => {
    toast.style.transform = "translateX(0)"
  }, 100)

  // Remove after delay
  setTimeout(() => {
    toast.style.transform = "translateX(100%)"
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, config.UI.TOAST_DURATION)
}

// Local Storage Utilities
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },

  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },

  clear: () => {
    try {
      localStorage.clear()
      return true
    } catch {
      return false
    }
  },
}

// Debounce Function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Format Functions
export const format = {
  email: (email: string): string => {
    return email.toLowerCase().trim()
  },

  nickname: (nickname: string): string => {
    return nickname.trim().replace(/\s+/g, " ")
  },
}
