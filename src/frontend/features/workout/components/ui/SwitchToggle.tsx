import React from "react"

interface SwitchToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: "small" | "medium" | "large"
  label?: string
  description?: string
}

export function SwitchToggle({
  checked,
  onChange,
  disabled = false,
  size = "medium",
  label,
  description,
}: SwitchToggleProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const sizeClasses = {
    small: "w-8 h-4",
    medium: "w-12 h-6",
    large: "w-16 h-8",
  }

  const thumbSizeClasses = {
    small: "w-3 h-3",
    medium: "w-5 h-5",
    large: "w-7 h-7",
  }

  const thumbTranslateClasses = {
    small: checked ? "translate-x-4" : "translate-x-0.5",
    medium: checked ? "translate-x-6" : "translate-x-0.5",
    large: checked ? "translate-x-8" : "translate-x-0.5",
  }

  return (
    <div className="switch-toggle-container">
      {label && (
        <div className="switch-label">
          <label className="switch-label-text">{label}</label>
          {description && <p className="switch-description">{description}</p>}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          switch-toggle
          ${sizeClasses[size]}
          ${checked ? "switch-toggle-checked" : "switch-toggle-unchecked"}
          ${disabled ? "switch-toggle-disabled" : ""}
        `}
      >
        <span
          className={`
            switch-thumb
            ${thumbSizeClasses[size]}
            ${thumbTranslateClasses[size]}
            ${disabled ? "switch-thumb-disabled" : ""}
          `}
        />
      </button>
    </div>
  )
}
