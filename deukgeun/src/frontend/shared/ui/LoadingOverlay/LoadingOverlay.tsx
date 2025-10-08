// src/shared/ui/LoadingOverlay/LoadingOverlay.tsx
const styles = require('./LoadingOverlay.module.css').default

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
