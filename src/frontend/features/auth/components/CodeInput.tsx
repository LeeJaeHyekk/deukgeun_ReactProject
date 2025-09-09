import { useState, useRef, useEffect } from "react"
import styles from "./CodeInput.module.css"

interface CodeInputProps {
  length?: number
  onComplete: (code: string) => void
  onResend?: () => void
  disabled?: boolean
  loading?: boolean
  error?: string
  className?: string
}

export function CodeInput({
  length = 6,
  onComplete,
  onResend,
  disabled = false,
  loading = false,
  error,
  className = "",
}: CodeInputProps) {
  const [code, setCode] = useState<string[]>(new Array(length).fill(""))
  const [focusedIndex, setFocusedIndex] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  const handleInputChange = (index: number, value: string) => {
    if (disabled || loading) return

    // 숫자만 허용
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // 다음 입력 필드로 이동
    if (value && index < length - 1) {
      setFocusedIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }

    // 모든 코드가 입력되면 완료 콜백 호출
    if (
      newCode.every(digit => digit !== "") &&
      newCode.join("").length === length
    ) {
      onComplete(newCode.join(""))
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (disabled || loading) return

    // 백스페이스로 이전 필드로 이동
    if (e.key === "Backspace" && !code[index] && index > 0) {
      setFocusedIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    }

    // 화살표 키로 이동
    if (e.key === "ArrowLeft" && index > 0) {
      setFocusedIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      setFocusedIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled || loading) return

    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain")
    const numbers = pastedData.replace(/\D/g, "").slice(0, length)

    if (numbers.length === length) {
      const newCode = numbers.split("")
      setCode(newCode)
      onComplete(numbers)
    }
  }

  const handleResend = () => {
    if (onResend && !disabled && !loading) {
      onResend()
    }
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.inputGroup}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={el => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={e => handleInputChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            disabled={disabled || loading}
            className={`${styles.input} ${
              focusedIndex === index ? styles.focused : ""
            } ${error ? styles.error : ""}`}
            aria-label={`인증 코드 ${index + 1}번째 자리`}
          />
        ))}
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {onResend && (
        <div className={styles.resendContainer}>
          <button
            type="button"
            onClick={handleResend}
            disabled={disabled || loading}
            className={styles.resendButton}
          >
            {loading ? "재발송 중..." : "인증 코드 재발송"}
          </button>
        </div>
      )}
    </div>
  )
}
