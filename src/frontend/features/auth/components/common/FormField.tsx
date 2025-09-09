// ============================================================================
// 폼 필드 컴포넌트
// ============================================================================

import React from "react"
import { UseFormRegister, FieldError } from "react-hook-form"

interface FormFieldProps {
  label: string
  type: "text" | "email" | "password" | "tel" | "number"
  name: string
  register: UseFormRegister<any>
  error?: FieldError
  placeholder?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
}

export function FormField({
  label,
  type,
  name,
  register,
  error,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        {...register(name)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? "border-red-500" : "border-gray-300"}
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
        `}
      />
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  )
}
