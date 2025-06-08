import styles from "./MachineGuideSection.module.css";

export const MachineGuideSection = () => (
  <section className={styles.section}>
    <h2 className={styles.title}>🏋️ 기구 사용법이 궁금하신가요?</h2>
    <p className={styles.desc}>머신별 설명과 운동 부위별 추천 영상을 제공합니다.</p>
    <button className={styles.button}>기구 가이드 보러가기 →</button>
  </section>
);
