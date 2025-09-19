import { useNavigate } from 'react-router-dom';
import { GENDER_LABELS, type Gender } from '../../../constants/measurements';
import { useAvatarStore } from '../../../store/avatar.store';
import styles from './steps.module.css';

const genderOptions: Gender[] = ['female', 'male'];

export function GenderStep(): JSX.Element {
  const navigate = useNavigate();
  const selectedGender = useAvatarStore((state) => state.gender);
  const setGender = useAvatarStore((state) => state.setGender);

  const handleSelect = (gender: Gender) => {
    setGender(gender);
    navigate('/onboarding/preset');
  };

  return (
    <div className={styles.stepContainer}>
      <header className={styles.stepHeader}>
        <h2>성별을 선택하세요</h2>
        <p>성별에 따라 기본 치수와 체형 프리셋이 달라집니다.</p>
      </header>
      <div className={styles.cardGrid}>
        {genderOptions.map((gender) => {
          const isActive = selectedGender === gender;
          return (
            <button
              key={gender}
              type="button"
              className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
              onClick={() => handleSelect(gender)}
            >
              <strong>{GENDER_LABELS[gender]}</strong>
              <span>{gender === 'female' ? '여성 베이스 아바타' : '남성 베이스 아바타'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
