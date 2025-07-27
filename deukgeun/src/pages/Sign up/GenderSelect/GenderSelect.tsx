// GenderSelect.tsx
import styles from "./GenderSelect.module.css";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";

interface GenderSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const GenderSelect = ({ value, onChange }: GenderSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOptions = () => setIsOpen(!isOpen);

  const handleSelect = (selectedGender: string) => {
    onChange(selectedGender);
    setIsOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.selector} onClick={toggleOptions}>
        <span>{value || "성별 선택"}</span>
        <FaChevronDown className={styles.icon} />
      </div>
      {isOpen && (
        <div className={styles.optionsOverlay}>
          <div className={styles.option} onClick={() => handleSelect("남자")}>
            남자
          </div>
          <div className={styles.option} onClick={() => handleSelect("여자")}>
            여자
          </div>
        </div>
      )}
    </div>
  );
};
