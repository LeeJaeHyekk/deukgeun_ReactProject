// BirthdaySelect.tsx
import { useState } from "react"
import styles from "./BirthDateSelect.module.css"
import { ChevronDown } from "lucide-react"

interface BirthdaySelectProps {
  value: { year: string; month: string; day: string }
  onChange: (value: { year: string; month: string; day: string }) => void
  error?: string
}

const generateOptions = (start: number, end: number) => {
  const options = []
  for (let i = start; i <= end; i++) {
    options.push(i)
  }
  return options
}

export function BirthdaySelect({
  value,
  onChange,
  error,
}: BirthdaySelectProps) {
  const [openDropdown, setOpenDropdown] = useState<
    "year" | "month" | "day" | null
  >(null)

  const handleSelect = (
    type: "year" | "month" | "day",
    selectedValue: string
  ) => {
    const newValue = { ...value, [type]: selectedValue }
    onChange(newValue)
    setOpenDropdown(null)
  }

  return (
    <div className={styles.wrapper}>
      {/** 연도 */}
      <div className={styles.selectorGroup}>
        <div
          className={`${styles.selector} ${error ? styles.selectorError : ""}`}
          onClick={() =>
            setOpenDropdown(openDropdown === "year" ? null : "year")
          }
        >
          <div>{value.year || "연도"}</div>
          <ChevronDown className={styles.icon} size={18} />
        </div>
        {openDropdown === "year" && (
          <div className={styles.optionsOverlay}>
            {generateOptions(1980, 2025).map(y => (
              <div
                key={y}
                className={styles.option}
                onClick={() => handleSelect("year", y.toString())}
              >
                {y}
              </div>
            ))}
          </div>
        )}
      </div>

      {/** 월 */}
      <div className={styles.selectorGroup}>
        <div
          className={`${styles.selector} ${error ? styles.selectorError : ""}`}
          onClick={() =>
            setOpenDropdown(openDropdown === "month" ? null : "month")
          }
        >
          <div>{value.month || "월"}</div>
          <ChevronDown className={styles.icon} size={18} />
        </div>
        {openDropdown === "month" && (
          <div className={styles.optionsOverlay}>
            {generateOptions(1, 12).map(m => (
              <div
                key={m}
                className={styles.option}
                onClick={() => handleSelect("month", m.toString())}
              >
                {m}
              </div>
            ))}
          </div>
        )}
      </div>

      {/** 일 */}
      <div className={styles.selectorGroup}>
        <div
          className={`${styles.selector} ${error ? styles.selectorError : ""}`}
          onClick={() => setOpenDropdown(openDropdown === "day" ? null : "day")}
        >
          <div>{value.day || "일"}</div>
          <ChevronDown className={styles.icon} size={18} />
        </div>
        {openDropdown === "day" && (
          <div className={styles.optionsOverlay}>
            {generateOptions(1, 31).map(d => (
              <div
                key={d}
                className={styles.option}
                onClick={() => handleSelect("day", d.toString())}
              >
                {d}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
