import { type ChangeEvent, type JSX } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { MEASUREMENT_DEFINITIONS, type MeasurementKey } from '../../../constants/measurements';
import { useAvatarStore } from '../../../store/avatar.store';
import styles from './steps.module.css';

export function MeasurementsStep(): JSX.Element {
  const navigate = useNavigate();
  const gender = useAvatarStore((state) => state.gender);
  const preset = useAvatarStore((state) => state.preset);
  const measurements = useAvatarStore((state) => state.measurements);
  const setMeasurement = useAvatarStore((state) => state.setMeasurement);
  const resetMeasurements = useAvatarStore((state) => state.resetMeasurementsToPreset);

  if (!gender || !preset) {
    return <Navigate to="/onboarding/gender" replace />;
  }

  const handleSlide = (key: MeasurementKey) => (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    if (rawValue === '') {
      return;
    }
    const value = Number(rawValue);
    if (Number.isNaN(value)) {
      return;
    }
    setMeasurement(key, value);
  };

  return (
    <div className={styles.stepContainer}>
      <header className={styles.stepHeader}>
        <h2>치수를 입력하세요</h2>
        <p>
          프리셋을 기반으로 값이 채워졌습니다. 슬라이더 또는 직접 입력으로 세부 조정이 가능합니다.
        </p>
      </header>

      <div className={styles.measurementGrid}>
        {MEASUREMENT_DEFINITIONS.map((definition) => {
          const currentValue = measurements[definition.key];
          return (
            <div className={styles.measurementCard} key={definition.key}>
              <div className={styles.measurementHeader}>
                <h3>{definition.label}</h3>
                <span>
                  {currentValue}
                  {definition.unit}
                </span>
              </div>
              <input
                className={styles.slider}
                type="range"
                min={definition.min}
                max={definition.max}
                step={definition.step}
                value={currentValue}
                onChange={handleSlide(definition.key)}
              />
              <input
                className={styles.numberInput}
                type="number"
                value={currentValue}
                min={definition.min}
                max={definition.max}
                step={definition.step}
                onChange={handleSlide(definition.key)}
              />
            </div>
          );
        })}
      </div>

      <div className={styles.footerActions}>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => navigate('/onboarding/preset')}
        >
          이전 단계
        </button>
        <div>
          <button type="button" className={styles.linkButton} onClick={resetMeasurements}>
            프리셋 값으로 초기화
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/onboarding/summary')}
          >
            다음 단계
          </button>
        </div>
      </div>
    </div>
  );
}
