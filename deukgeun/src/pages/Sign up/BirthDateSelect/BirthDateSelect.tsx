// BirthdaySelect.tsx
import { useState } from "react";
import styles from "./BirthDateSelect.module.css";
import { ChevronDown } from "lucide-react";

const generateOptions = (start: number, end: number) => {
  const options = [];
  for (let i = start; i <= end; i++) {
    options.push(i);
  }
  return options;
};

export function BirthdaySelect() {
  const [year, setYear] = useState<string | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<
    "year" | "month" | "day" | null
  >(null);

  const handleSelect = (type: "year" | "month" | "day", value: string) => {
    if (type === "year") setYear(value);
    if (type === "month") setMonth(value);
    if (type === "day") setDay(value);
    setOpenDropdown(null);
  };

  return (
    <div className={styles.wrapper}>
      {/** 연도 */}
      <div className={styles.selectorGroup}>
        <div
          className={styles.selector}
          onClick={() =>
            setOpenDropdown(openDropdown === "year" ? null : "year")
          }
        >
          <div>{year ?? "연도"}</div>
          <ChevronDown className={styles.icon} size={18} />
        </div>
        {openDropdown === "year" && (
          <div className={styles.optionsOverlay}>
            {generateOptions(1980, 2025).map((y) => (
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
          className={styles.selector}
          onClick={() =>
            setOpenDropdown(openDropdown === "month" ? null : "month")
          }
        >
          <div>{month ?? "월"}</div>
          <ChevronDown className={styles.icon} size={18} />
        </div>
        {openDropdown === "month" && (
          <div className={styles.optionsOverlay}>
            {generateOptions(1, 12).map((m) => (
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
          className={styles.selector}
          onClick={() => setOpenDropdown(openDropdown === "day" ? null : "day")}
        >
          <div>{day ?? "일"}</div>
          <ChevronDown className={styles.icon} size={18} />
        </div>
        {openDropdown === "day" && (
          <div className={styles.optionsOverlay}>
            {generateOptions(1, 31).map((d) => (
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
  );
}
