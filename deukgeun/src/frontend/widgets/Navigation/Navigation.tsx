import { Link, useNavigate } from "react-router-dom";
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
  const user = useUserStore((state) => state.user);
  const { isLoggedIn, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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

        {!isLoggedIn || !user ? (
          <li>
            <Link to="/login" className={styles.navMenuItem}>
              Login
            </Link>
          </li>
        ) : (
          <>
            <li>
              <Link to="/mypage" className={styles.navMenuItem}>
                My Page
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className={`${styles.navMenuItem} ${styles.buttonLink}`}
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};
