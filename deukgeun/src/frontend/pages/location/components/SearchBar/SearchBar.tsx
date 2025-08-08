import styles from "./SearchBar.module.css"

export const SearchBar = () => {
  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        placeholder="현재 위치 또는 주소 입력"
        className={styles.input}
      />
      <button className={styles.button}>🔍 헬스장 찾기</button>
    </div>
  )
}
