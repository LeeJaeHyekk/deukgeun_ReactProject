import { useState } from "react"
import styles from "./SearchBar.module.css"

interface SearchBarProps {
  onSearch: (query: string) => void
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="현재 위치 또는 주소 입력"
        className={styles.input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className={styles.button}>🔍 헬스장 찾기</button>
    </form>
  )
}
