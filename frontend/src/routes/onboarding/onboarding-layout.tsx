import { useMemo, type JSX } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAvatarStore } from '../../store/avatar.store';
import styles from './onboarding-layout.module.css';

const steps = [
  { path: '/onboarding/gender', label: '성별 선택' },
  { path: '/onboarding/preset', label: '체형 프리셋' },
  { path: '/onboarding/measurements', label: '치수 입력' },
  { path: '/onboarding/summary', label: '마네킹 생성' },
];

export function OnboardingLayout(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const reset = useAvatarStore((state) => state.resetAll);

  const activeIndex = useMemo(() => {
    const foundIndex = steps.findIndex((step) => location.pathname.startsWith(step.path));
    return foundIndex === -1 ? 0 : foundIndex;
  }, [location.pathname]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1>맞춤 마네킹 생성</h1>
          <p>4단계를 따라 치수를 입력하면 맞춤형 마네킹을 바로 확인할 수 있어요.</p>
        </div>
        <button
          type="button"
          className={styles.resetBtn}
          onClick={() => {
            reset();
            navigate('/onboarding/gender');
          }}
        >
          초기화
        </button>
      </header>

      <nav className={styles.progress} aria-label="온보딩 단계">
        {steps.map((step, index) => {
          const state =
            index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'upcoming';

          return (
            <button
              key={step.path}
              type="button"
              className={`${styles.progressStep} ${styles[state]}`}
              onClick={() => navigate(step.path)}
            >
              <span className={styles.stepIndex}>{index + 1}</span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </nav>

      <section className={styles.content}>
        <Outlet />
      </section>
    </div>
  );
}
