// import { useState } from "react";
// import styles from "./SearchBar.module.css";

// interface Props {
//   onSearch: (query: string) => void;
// }

// export const SearchBar = ({ onSearch }: Props) => {
//   const [query, setQuery] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSearch(query);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <input
//         type="text"
//         placeholder="헬스장 이름이나 위치 검색"
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//       />
//       <button type="submit">검색</button>
//     </form>
//   );
// };

import { useState } from "react"
import styles from "./SearchBar.module.css"

interface Props {
  onSearch: (query: string) => void
}

export const SearchBar = ({ onSearch }: Props) => {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form className={styles.searchForm} onSubmit={handleSubmit}>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="헬스장 이름이나 위치 검색"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <button type="submit" className={styles.searchButton}>
        검색
      </button>
    </form>
  )
}
