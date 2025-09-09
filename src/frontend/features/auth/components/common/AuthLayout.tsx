import React from "react"
import { FaArrowLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  showBackButton?: boolean
  backTo?: string
  className?: string
}

export function AuthLayout({
  title,
  subtitle,
  children,
  showBackButton = true,
  backTo = "/",
  className = "",
}: AuthLayoutProps) {
  const navigate = useNavigate()

  const handleBackClick = () => {
    navigate(backTo)
  }

  return (
    <div className={`auth-layout ${className}`}>
      <div className="auth-container">
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className="back-button"
            aria-label="뒤로 가기"
          >
            <FaArrowLeft />
          </button>
        )}

        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>

        <div className="auth-content">{children}</div>
      </div>
    </div>
  )
}
