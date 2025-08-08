import { useNavigate } from "react-router-dom"

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <video
        src="/video/404Error.mp4"
        loop
        autoPlay
        muted
        style={styles.video}
      />

      <h1 style={styles.title}>404 - 페이지를 찾을 수 없어요 </h1>
      <p style={styles.description}>
        요청하신 페이지가 존재하지 않거나, 이동되었을 수 있어요.
        <br />
        불편을 드려 죄송합니다.
      </p>

      <button onClick={() => navigate("/")} style={styles.button}>
        홈으로 돌아가기
      </button>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "80px 20px",
    textAlign: "center",
    color: "#333",
    fontFamily: "sans-serif",
  },
  video: {
    width: 600,
    height: "auto",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    lineHeight: 1.5,
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
}
