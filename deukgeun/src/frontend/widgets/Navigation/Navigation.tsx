import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const { isLoggedIn, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/" onClick={closeMobileMenu}>
          <img src="/img/logo.png" alt="Logo" className={styles.logoImage} />
        </Link>
      </div>

      {/* 데스크톱 메뉴 */}
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

      {/* 모바일 햄버거 버튼 */}
      <button
        className={styles.mobileMenuButton}
        onClick={toggleMobileMenu}
        aria-label="메뉴 열기"
      >
        <span
          className={`${styles.hamburger} ${
            isMobileMenuOpen ? styles.active : ""
          }`}
        ></span>
      </button>

      {/* 모바일 메뉴 */}
      <div
        className={`${styles.mobileMenu} ${
          isMobileMenuOpen ? styles.open : ""
        }`}
      >
        <div className={styles.mobileMenuHeader}>
          <span className={styles.mobileMenuTitle}>메뉴</span>
          <button
            className={styles.mobileMenuClose}
            onClick={closeMobileMenu}
            aria-label="메뉴 닫기"
          >
            ✕
          </button>
        </div>

        <ul className={styles.mobileMenuList}>
          {menuItems.map(({ label, path }) => (
            <li key={path}>
              <Link
                to={path}
                className={styles.mobileMenuItem}
                onClick={closeMobileMenu}
              >
                {label}
              </Link>
            </li>
          ))}

          {!isLoggedIn || !user ? (
            <li>
              <Link
                to="/login"
                className={styles.mobileMenuItem}
                onClick={closeMobileMenu}
              >
                Login
              </Link>
            </li>
          ) : (
            <>
              <li>
                <Link
                  to="/mypage"
                  className={styles.mobileMenuItem}
                  onClick={closeMobileMenu}
                >
                  My Page
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className={styles.mobileMenuItem}
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={closeMobileMenu} />
      )}
    </nav>
  );
};
