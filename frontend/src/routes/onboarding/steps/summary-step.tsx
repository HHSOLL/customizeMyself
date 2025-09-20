import { useMemo, useState, type JSX } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GENDER_LABELS, MEASUREMENT_DEFINITIONS, PRESETS } from '../../../constants/measurements';
import { useAvatarStore } from '../../../store/avatar.store';
import styles from './steps.module.css';
import { createMeasurement } from '../../../services/api';

export function SummaryStep(): JSX.Element {
  const navigate = useNavigate();
  const gender = useAvatarStore((state) => state.gender);
  const preset = useAvatarStore((state) => state.preset);
  const measurements = useAvatarStore((state) => state.measurements);
  const setMeasurementProfileId = useAvatarStore((state) => state.setMeasurementProfileId);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const summaryList = useMemo(() => {
    if (!gender || !preset) {
      return [];
    }
    return MEASUREMENT_DEFINITIONS.map((definition) => ({
      label: definition.label,
      value: `${measurements[definition.key]}${definition.unit}`,
    }));
  }, [gender, preset, measurements]);

  if (!gender || !preset) {
    return <Navigate to="/onboarding/gender" replace />;
  }

  const presetLabel = PRESETS[gender][preset].label;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        gender,
        preset,
        data: measurements,
      };
      const result = await createMeasurement(payload);
      setMeasurementProfileId(result.id);
      navigate('/fit');
    } catch (error) {
      const message = error instanceof Error ? error.message : '측정치 저장에 실패했습니다.';
      setSubmitError(message);
      console.error('[onboarding] measurement submit failed', error);
    } finally {
      setSubmitting(false);
    }
  };

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
        <button
          type="button"
          className={styles.primaryButton}
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? '저장 중…' : '마네킹 생성하기'}
        </button>
      </div>
      {submitError ? <p className={styles.errorMsg}>{submitError}</p> : null}
    </div>
  );
}
