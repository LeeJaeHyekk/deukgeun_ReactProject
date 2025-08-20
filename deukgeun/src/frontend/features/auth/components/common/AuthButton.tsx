import React from "react"

interface AuthButtonProps {
  type?: "button" | "submit"
  variant?: "primary" | "secondary" | "social" | "link"
  size?: "small" | "medium" | "large"
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  fullWidth?: boolean
}

export function AuthButton({
  type = "button",
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  onClick,
  children,
  className = "",
  icon,
  fullWidth = false,
}: AuthButtonProps) {
  const baseClass = "auth-button"
  const variantClass = `auth-button--${variant}`
  const sizeClass = `auth-button--${size}`
  const widthClass = fullWidth ? "auth-button--full-width" : ""
  const loadingClass = loading ? "auth-button--loading" : ""

  const buttonClass =
    `${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`.trim()

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="loading-spinner" />}
      {icon && <span className="button-icon">{icon}</span>}
      <span className="button-text">{children}</span>
    </button>
  )
}
