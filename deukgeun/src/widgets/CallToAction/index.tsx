import styles from "./CallToAction.module.css";

export const CallToAction = () => (
  <section className={styles.section}>
    <h2 className={styles.title}>지금 바로 시작해보세요</h2>
    <p className={styles.desc}>득근득근에서 당신의 운동 루틴을 완성하세요.</p>
    <a href="/register" className={styles.link}>회원가입 →</a>
  </section>
);
