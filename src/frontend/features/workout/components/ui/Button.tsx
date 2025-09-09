import React from "react"

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "danger"
  size?: "small" | "medium" | "large"
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  className?: string
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  className = "",
}: ButtonProps) {
  const baseClasses = "button"
  const variantClasses = {
    primary: "button-primary",
    secondary: "button-secondary",
    danger: "button-danger",
  }
  const sizeClasses = {
    small: "button-small",
    medium: "button-medium",
    large: "button-large",
  }

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled ? "button-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
