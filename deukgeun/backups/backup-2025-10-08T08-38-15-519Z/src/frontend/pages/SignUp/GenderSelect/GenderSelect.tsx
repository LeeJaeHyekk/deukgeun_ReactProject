// GenderSelect.tsx
import styles from "./GenderSelect.module.css"
import { FaChevronDown } from "react-icons/fa"
import { useState } from "react"

interface GenderSelectProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export const GenderSelect = ({ value, onChange, error }: GenderSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const toggleOptions = () => setIsOpen(!isOpen)

  const handleSelect = (selectedGender: string) => {
    onChange(selectedGender)
    setIsOpen(false)
  }

  // 한글 표시를 위한 매핑
  const getDisplayText = (genderValue: string) => {
    switch (genderValue) {
      case "male":
        return "남자"
      case "female":
        return "여자"
      case "other":
        return "기타"
      default:
        return "성별 선택"
    }
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.selector} ${error ? styles.selectorError : ""}`}
        onClick={toggleOptions}
      >
        <span>{getDisplayText(value)}</span>
        <FaChevronDown className={styles.icon} />
      </div>
      {isOpen && (
        <div className={styles.optionsOverlay}>
          <div className={styles.option} onClick={() => handleSelect("male")}>
            남자
          </div>
          <div className={styles.option} onClick={() => handleSelect("female")}>
            여자
          </div>
          <div className={styles.option} onClick={() => handleSelect("other")}>
            기타
          </div>
        </div>
      )}
    </div>
  )
}
