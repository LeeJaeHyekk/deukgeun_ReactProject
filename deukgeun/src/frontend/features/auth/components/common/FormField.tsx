import React from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"

interface FormFieldProps {
  type: "text" | "email" | "password" | "tel" | "number"
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  required?: boolean
  autoComplete?: string
  maxLength?: number
  showPasswordToggle?: boolean
  onKeyDown?: (e: React.KeyboardEvent) => void
  className?: string
  id?: string
}

export function FormField({
  type,
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  autoComplete,
  maxLength,
  showPasswordToggle = false,
  onKeyDown,
  className = "",
  id,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const inputType = type === "password" && showPassword ? "text" : type

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      <div className="input-wrapper">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          onKeyDown={onKeyDown}
          className={`form-input ${error ? "error" : ""}`}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            onClick={handlePasswordToggle}
            className="password-toggle"
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>

      {error && (
        <span id={`${id}-error`} className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
