import { useEffect, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GENDER_LABELS,
  PRESET_ORDER,
  type BodyPreset,
  PRESETS,
} from '../../../constants/measurements';
import { useAvatarStore } from '../../../store/avatar.store';
import styles from './steps.module.css';

export function PresetStep(): JSX.Element {
  const navigate = useNavigate();
  const gender = useAvatarStore((state) => state.gender);
  const preset = useAvatarStore((state) => state.preset);
  const setPreset = useAvatarStore((state) => state.setPreset);

  useEffect(() => {
    if (!gender) {
      navigate('/onboarding/gender', { replace: true });
    }
  }, [gender, navigate]);

  if (!gender) {
    return null;
  }

  const genderPresets = PRESETS[gender];

  const handleSelect = (value: BodyPreset) => {
    setPreset(value);
    navigate('/onboarding/measurements');
  };

  return (
    <div className={styles.stepContainer}>
      <header className={styles.stepHeader}>
        <h2>체형 프리셋</h2>
        <p>{GENDER_LABELS[gender]} 기본 체형 중 하나를 선택하세요.</p>
      </header>
      <div className={styles.cardGrid}>
        {PRESET_ORDER.map((value) => {
          const definition = genderPresets[value];
          const isActive = preset === value;
          return (
            <button
              key={value}
              type="button"
              className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
              onClick={() => handleSelect(value)}
            >
              <strong>{definition.label}</strong>
              <span>{definition.description}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.footerActions}>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => navigate('/onboarding/gender')}
        >
          이전 단계
        </button>
      </div>
    </div>
  );
}
