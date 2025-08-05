// Navigation.tsx
import { Link } from "react-router-dom";
import { useUserStore } from "@shared/store/userStore";
import styles from "./Navigation.module.css";

const menuItems = [
  { label: "Search for Gym", path: "/location" },
  { label: "Machine Guide", path: "/machine-guide" },
  { label: "Community", path: "/community" },
  { label: "Challenge", path: "/missions" },
];

export const Navigation = () => {
  const user = useUserStore((state) => state.user);

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">
          <img src="/img/logo.png" alt="Logo" className={styles.logoImage} />
        </Link>
      </div>
      <ul className={styles.navMenu}>
        {menuItems.map(({ label, path }) => (
          <li key={path} className={styles.navMenuItem}>
            <Link to={path}>{label}</Link>
          </li>
        ))}
        <li className={styles.navMenuItem}>
          <Link to={user ? "/mypage" : "/login"}>
            {user ? "마이페이지" : "로그인"}
          </Link>
        </li>
      </ul>
    </nav>
  );
};
