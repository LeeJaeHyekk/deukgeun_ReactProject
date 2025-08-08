import { Gym } from "../../types/index"
import { formatDistance } from "../../utils/distanceUtils"
import styles from "./GymCard.module.css"

interface GymCardProps {
  gym: Gym
  onClick?: (gym: Gym) => void
}

export function GymCard({ gym, onClick }: GymCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(gym)
    }
  }

  const renderFacilities = () => {
    const facilities = []
    if (gym.hasPT) facilities.push("PT")
    if (gym.hasGX) facilities.push("GX")
    if (gym.is24Hours) facilities.push("24시간")
    if (gym.hasParking) facilities.push("주차")
    if (gym.hasShower) facilities.push("샤워")

    return facilities.length > 0 ? (
      <div className={styles.facilities}>
        {facilities.map(facility => (
          <span key={facility} className={styles.facilityTag}>
            {facility}
          </span>
        ))}
      </div>
    ) : null
  }

  const renderRating = () => {
    if (!gym.rating) return null

    return (
      <div className={styles.rating}>
        <span className={styles.stars}>
          {"★".repeat(Math.floor(gym.rating))}
          {"☆".repeat(5 - Math.floor(gym.rating))}
        </span>
        <span className={styles.ratingText}>
          {gym.rating.toFixed(1)}
          {gym.reviewCount && ` (${gym.reviewCount})`}
        </span>
      </div>
    )
  }

  return (
    <div
      className={styles.card}
      onClick={handleClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {gym.imageUrl && (
        <div className={styles.imageContainer}>
          <img src={gym.imageUrl} alt={gym.name} className={styles.image} />
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.name}>{gym.name}</h3>
          {gym.distance !== undefined && (
            <span className={styles.distance}>
              {formatDistance(gym.distance)}
            </span>
          )}
        </div>

        <p className={styles.address}>{gym.address}</p>

        {renderRating()}

        {renderFacilities()}

        {gym.phone && <p className={styles.phone}>📞 {gym.phone}</p>}

        {gym.price && <p className={styles.price}>💰 {gym.price}</p>}

        {gym.openTime && gym.closeTime && (
          <p className={styles.hours}>
            🕒 {gym.openTime} - {gym.closeTime}
          </p>
        )}
      </div>
    </div>
  )
}
