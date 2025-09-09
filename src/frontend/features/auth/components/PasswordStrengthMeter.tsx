import { useMemo } from "react"
import styles from "./PasswordStrengthMeter.module.css"
import type {
  PasswordStrength,
  PasswordStrengthResult,
} from "../types/accountRecovery"

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

export function PasswordStrengthMeter({
  password,
  className = "",
}: PasswordStrengthMeterProps) {
  const strengthResult = useMemo((): PasswordStrengthResult => {
    if (!password) {
      return {
        strength: "weak",
        score: 0,
        feedback: [],
      }
    }

    let score = 0
    const feedback: string[] = []

    // 길이 검사
    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push("최소 8자 이상 입력해주세요.")
    }

    if (password.length >= 12) {
      score += 1
    }

    // 영문 대소문자 검사
    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push("소문자를 포함해주세요.")
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push("대문자를 포함해주세요.")
    }

    // 숫자 검사
    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push("숫자를 포함해주세요.")
    }

    // 특수문자 검사
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1
    } else {
      feedback.push("특수문자를 포함해주세요.")
    }

    // 연속된 문자 검사 (감점)
    if (/(.)\1{2,}/.test(password)) {
      score = Math.max(0, score - 1)
      feedback.push("연속된 문자는 피해주세요.")
    }

    // 키보드 패턴 검사 (감점)
    const keyboardPatterns = ["qwerty", "123456", "asdfgh", "zxcvbn"]
    if (
      keyboardPatterns.some(pattern => password.toLowerCase().includes(pattern))
    ) {
      score = Math.max(0, score - 1)
      feedback.push("키보드 패턴은 피해주세요.")
    }

    // 강도 결정
    let strength: PasswordStrength
    if (score <= 2) {
      strength = "weak"
    } else if (score <= 3) {
      strength = "medium"
    } else if (score <= 4) {
      strength = "strong"
    } else {
      strength = "very-strong"
    }

    return {
      strength,
      score,
      feedback: feedback.slice(0, 3), // 최대 3개까지만 표시
    }
  }, [password])

  const getStrengthText = (strength: PasswordStrength): string => {
    switch (strength) {
      case "weak":
        return "약함"
      case "medium":
        return "보통"
      case "strong":
        return "강함"
      case "very-strong":
        return "매우 강함"
      default:
        return "약함"
    }
  }

  const getStrengthColor = (strength: PasswordStrength): string => {
    switch (strength) {
      case "weak":
        return "#ef4444"
      case "medium":
        return "#f59e0b"
      case "strong":
        return "#10b981"
      case "very-strong":
        return "#059669"
      default:
        return "#ef4444"
    }
  }

  const progressPercentage = (strengthResult.score / 6) * 100

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <span className={styles.label}>비밀번호 강도</span>
        <span
          className={styles.strength}
          style={{ color: getStrengthColor(strengthResult.strength) }}
        >
          {getStrengthText(strengthResult.strength)}
        </span>
      </div>

      <div className={styles.meter}>
        <div className={styles.bar}>
          <div
            className={styles.fill}
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: getStrengthColor(strengthResult.strength),
            }}
          />
        </div>
        <div className={styles.segments}>
          {[1, 2, 3, 4, 5, 6].map(segment => (
            <div
              key={segment}
              className={`${styles.segment} ${
                segment <= strengthResult.score ? styles.filled : ""
              }`}
              style={{
                backgroundColor:
                  segment <= strengthResult.score
                    ? getStrengthColor(strengthResult.strength)
                    : "rgba(255, 255, 255, 0.2)",
              }}
            />
          ))}
        </div>
      </div>

      {password && strengthResult.feedback.length > 0 && (
        <div className={styles.feedback}>
          <h4 className={styles.feedbackTitle}>개선 사항:</h4>
          <ul className={styles.feedbackList}>
            {strengthResult.feedback.map((item, index) => (
              <li key={index} className={styles.feedbackItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
