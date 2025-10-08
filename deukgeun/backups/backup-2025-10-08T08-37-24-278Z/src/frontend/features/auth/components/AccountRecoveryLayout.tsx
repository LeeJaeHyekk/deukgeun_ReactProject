import { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import styles from "./AccountRecoveryLayout.module.css"

interface AccountRecoveryLayoutProps {
  title: string
  description: string
  children: ReactNode
  showBackButton?: boolean
  onBackClick?: () => void
}

export function AccountRecoveryLayout({
  title,
  description,
  children,
  showBackButton = true,
  onBackClick,
}: AccountRecoveryLayoutProps) {
  const navigate = useNavigate()

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      navigate("/login")
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.recoveryBox}>
        {showBackButton && (
          <button
            onClick={handleBackClick}
            className={styles.backButton}
            aria-label="뒤로 가기"
          >
            <FaArrowLeft />
          </button>
        )}

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
