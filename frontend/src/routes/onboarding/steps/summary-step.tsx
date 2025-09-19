import { useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GENDER_LABELS, MEASUREMENT_DEFINITIONS, PRESETS } from '../../../constants/measurements';
import { useAvatarStore } from '../../../store/avatar.store';
import styles from './steps.module.css';

export function SummaryStep(): JSX.Element {
  const navigate = useNavigate();
  const gender = useAvatarStore((state) => state.gender);
  const preset = useAvatarStore((state) => state.preset);
  const measurements = useAvatarStore((state) => state.measurements);

  const summaryList = useMemo(() => {
    return MEASUREMENT_DEFINITIONS.map((definition) => ({
      label: definition.label,
      value: `${measurements[definition.key]}${definition.unit}`,
    }));
  }, [measurements]);

  if (!gender || !preset) {
    return <Navigate to="/onboarding/gender" replace />;
  }

  const presetLabel = PRESETS[gender][preset].label;

  return (
    <div className={styles.stepContainer}>
      <header className={styles.stepHeader}>
        <h2>마네킹 생성 준비 완료</h2>
        <p>선택한 정보를 확인하고 피팅 씬으로 이동하세요.</p>
      </header>

      <div className={styles.summaryCard}>
        <h3>
          {GENDER_LABELS[gender]} · {presetLabel}
        </h3>
        <ul>
          {summaryList.map((item) => (
            <li key={item.label}>
              <strong>{item.label}</strong> — {item.value}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.footerActions}>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => navigate('/onboarding/measurements')}
        >
          이전 단계
        </button>
        <button type="button" className={styles.primaryButton} onClick={() => navigate('/fit')}>
          마네킹 생성하기
        </button>
      </div>
    </div>
  );
}
