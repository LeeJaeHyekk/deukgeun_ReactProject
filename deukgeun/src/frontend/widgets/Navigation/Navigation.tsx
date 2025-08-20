import { Link, useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"
import { useUserStore } from "@shared/store/userStore"
import { useAuthContext } from "@shared/contexts/AuthContext"
import { MENU_ITEMS, ROUTES, routeUtils } from "@shared/constants/routes"
import { shouldShowAdminMenu } from "@shared/utils/adminUtils"
import styles from "./Navigation.module.css"

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const user = useUserStore(state => state.user)
  const { isLoggedIn, logout } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // 현재 활성 페이지 확인
  const isActivePage = (path: string) => {
    return location.pathname === path
  }

  // 사용자 인증 상태에 따라 접근 가능한 메뉴 아이템 필터링
  const accessibleMenuItems = routeUtils.getAccessibleMenuItems(isLoggedIn)

  // 관리자 메뉴 표시 여부 확인
  const showAdminMenu = shouldShowAdminMenu(user)

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to={ROUTES.HOME} onClick={closeMobileMenu}>
          <img src="/img/logo.png" alt="Logo" className={styles.logoImage} />
        </Link>
      </div>

      {/* 데스크톱 메뉴 */}
      <ul className={styles.navMenu}>
        {accessibleMenuItems.map(({ label, path, icon }) => (
          <li key={path}>
            <Link
              to={path}
              className={`${styles.navMenuItem} ${isActivePage(path) ? styles.active : ""}`}
              onClick={closeMobileMenu}
            >
              <span className={styles.menuIcon}>{icon}</span>
              {label}
            </Link>
          </li>
        ))}

        {!isLoggedIn || !user ? (
          <li>
            <Link
              to={ROUTES.LOGIN}
              className={`${styles.navMenuItem} ${isActivePage(ROUTES.LOGIN) ? styles.active : ""}`}
              onClick={closeMobileMenu}
            >
              로그인
            </Link>
          </li>
        ) : (
          <>
            <li>
              <Link
                to={ROUTES.MYPAGE}
                className={`${styles.navMenuItem} ${isActivePage(ROUTES.MYPAGE) ? styles.active : ""}`}
                onClick={closeMobileMenu}
              >
                마이페이지
              </Link>
            </li>
            {showAdminMenu && (
              <li>
                <Link
                  to={ROUTES.ADMIN_DASHBOARD}
                  className={`${styles.navMenuItem} ${styles.adminMenuItem} ${isActivePage(ROUTES.ADMIN_DASHBOARD) ? styles.active : ""}`}
                  onClick={closeMobileMenu}
                >
                  관리자
                </Link>
              </li>
            )}
            <li>
              <button
                onClick={handleLogout}
                className={`${styles.navMenuItem} ${styles.buttonLink}`}
              >
                로그아웃
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
          {accessibleMenuItems.map(({ label, path, icon }) => (
            <li key={path}>
              <Link
                to={path}
                className={`${styles.mobileMenuItem} ${isActivePage(path) ? styles.active : ""}`}
                onClick={closeMobileMenu}
              >
                <span className={styles.menuIcon}>{icon}</span>
                {label}
              </Link>
            </li>
          ))}

          {!isLoggedIn || !user ? (
            <li>
              <Link
                to={ROUTES.LOGIN}
                className={`${styles.mobileMenuItem} ${isActivePage(ROUTES.LOGIN) ? styles.active : ""}`}
                onClick={closeMobileMenu}
              >
                로그인
              </Link>
            </li>
          ) : (
            <>
              <li>
                <Link
                  to={ROUTES.MYPAGE}
                  className={`${styles.mobileMenuItem} ${isActivePage(ROUTES.MYPAGE) ? styles.active : ""}`}
                  onClick={closeMobileMenu}
                >
                  마이페이지
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className={styles.mobileMenuItem}
                >
                  로그아웃
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
  )
}
