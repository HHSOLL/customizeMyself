import { Link } from 'react-router-dom';
import styles from './landing-view.module.css';

export function LandingView(): JSX.Element {
  return (
    <main className={styles.container}>
      <section className={styles.heroCard}>
        <h1 className={styles.title}>커스터마이즈 마이셀프</h1>
        <p className={styles.subtitle}>
          한국어로 즐기는 3D 피팅 MVP. 온보딩 단계를 따라 자신의 치수를 입력하고 마네킹을 만들어
          보세요.
        </p>
        <Link className={styles.ctaButton} to="/onboarding/gender">
          온보딩 시작하기
        </Link>
      </section>
    </main>
  );
}
