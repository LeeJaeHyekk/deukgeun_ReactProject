import styles from "./FilterTag.module.css"

interface Props {
  label: string
  active: boolean
  onClick: () => void
}

export const FilterTag = ({ label, active, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.tag} ${active ? styles.active : ""}`}
    >
      {label}
    </button>
  )
}
