import styles from "./GymCard.module.css"

interface Props {
  name: string
  distance: string
  description: string
}

export const GymCard = ({ name, distance, description }: Props) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{name}</h3>
        <span>{distance}</span>
      </div>
      <p className={styles.description}>{description}</p>
      <div className={styles.footer}>
        <button>지도에서 보기 →</button>
      </div>
    </div>
  )
}
