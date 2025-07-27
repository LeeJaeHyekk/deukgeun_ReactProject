import styles from "./Navigation.module.css";

export const Navigation = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>DGG</div>
      <ul className={styles.navMenu}>
        <li className={styles.navMenuItem}>Search for Gym</li>
        <li className={styles.navMenuItem}>Machine Guide</li>
        <li className={styles.navMenuItem}>Community</li>
        <li className={styles.navMenuItem}>Challenge</li>
        <li className={styles.navMenuItem}>My Page</li>
      </ul>
    </nav>
  );
};
