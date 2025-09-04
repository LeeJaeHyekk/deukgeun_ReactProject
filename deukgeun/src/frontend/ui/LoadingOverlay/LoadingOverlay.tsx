// 프론트엔드 전용 LoadingOverlay 컴포넌트
import styles from "./LoadingOverlay.module.css"

interface LoadingOverlayProps {
  show: boolean
}

export const LoadingOverlay = ({ show }: LoadingOverlayProps) => {
  if (!show) return null

  return (
    <div className={styles.overlay}>
      <video
        autoPlay
        loop
        muted
        className={styles.video}
        src="/video/loading.mp4"
      />
      <p className={styles.text}>Loading...</p>
    </div>
  )
}
