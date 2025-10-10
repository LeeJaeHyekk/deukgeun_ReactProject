// src/shared/ui/LoadingOverlay/LoadingOverlay.tsx
import styles from './LoadingOverlay.module.css'

interface LoadingOverlayProps {
  show: boolean
}

const LoadingOverlay = ({ show }: LoadingOverlayProps) => {
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
