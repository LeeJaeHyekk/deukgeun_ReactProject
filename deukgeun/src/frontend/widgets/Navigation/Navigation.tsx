// Navigation.tsx
import { Link } from "react-router-dom";
import { useUserStore } from "@shared/store/userStore";
import { useAuthContext } from "@shared/contexts/AuthContext";
import styles from "./Navigation.module.css";

const menuItems = [
  { label: "Search for Gym", path: "/location" },
  { label: "Machine Guide", path: "/machine-guide" },
  { label: "Community", path: "/community" },
  { label: "Challenge", path: "/missions" },
];

export const Navigation = () => {
  console.log("🧪 Navigation 렌더링 시작");

  const user = useUserStore((state) => state.user);
  const { isLoggedIn } = useAuthContext();

  console.log("🧪 Navigation 상태:", {
    user: user
      ? { id: user.id, email: user.email, nickname: user.nickname }
      : null,
    isLoggedIn,
    showMyPage: isLoggedIn && user,
    showLogin: !isLoggedIn || !user,
  });

  console.log("🧪 Navigation 렌더링 완료");

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">
          <img src="/img/logo.png" alt="Logo" className={styles.logoImage} />
        </Link>
      </div>
      <ul className={styles.navMenu}>
        {menuItems.map(({ label, path }) => (
          <li key={path}>
            <Link to={path} className={styles.navMenuItem}>
              {label}
            </Link>
          </li>
        ))}
        <li className={styles.navMenuItem}>
          <Link
            to={isLoggedIn && user ? "/mypage" : "/login"}
            className={styles.navMenuItem}
          >
            {isLoggedIn && user ? "마이페이지" : "로그인"}
          </Link>
        </li>
      </ul>
    </nav>
  );
};
