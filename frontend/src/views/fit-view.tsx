import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, type JSX } from 'react';
import { Link } from 'react-router-dom';
import styles from './fit-view.module.css';
import { useAvatarParameters, useAvatarWarnings } from '../engine/avatar/useAvatarParams';
import { applyAvatarParams, createLoggingRig } from '../engine/avatar/applyAvatarParams';
import type { AvatarRig } from '../engine/avatar/types';

function PlaceholderAvatar(): JSX.Element {
  return (
    <mesh>
      <capsuleGeometry args={[0.4, 1.6, 16, 32]} />
      <meshStandardMaterial color="#4b8cff" wireframe opacity={0.6} transparent />
    </mesh>
  );
}

export function FitView(): JSX.Element {
  const rigRef = useRef<AvatarRig>(createLoggingRig());
  const avatarParams = useAvatarParameters();
  const warnings = useAvatarWarnings();

  useEffect(() => {
    if (!avatarParams) {
      return;
    }

    const timer = window.setTimeout(() => {
      applyAvatarParams(rigRef.current, avatarParams);
    }, 100);

    return () => window.clearTimeout(timer);
  }, [avatarParams]);

  const formattedParams = useMemo(() => {
    if (!avatarParams) {
      return null;
    }

    return {
      height: avatarParams.scale.height,
      morphTargets: Object.entries(avatarParams.morphTargets)
        .slice(0, 5)
        .map(([name, value]) => `${name}: ${value}`),
    };
  }, [avatarParams]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <h1>피팅 스테이지</h1>
          <p>3D 마네킹과 의상 카탈로그를 활용해 착용 상태를 확인하세요.</p>
        </div>
        <Link className={styles.reconfigure} to="/onboarding/gender">
          온보딩 다시 진행
        </Link>
      </header>

      <main className={styles.stage}>
        <section className={styles.viewer}>
          <Canvas camera={{ position: [0, 1.6, 3.5], fov: 45 }}>
            <color attach="background" args={[0.03, 0.05, 0.08]} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[4, 6, 2]} intensity={1.2} />
            <Suspense fallback={null}>
              <PlaceholderAvatar />
            </Suspense>
          </Canvas>
        </section>

        <aside className={styles.controlPanel}>
          <h2>치수 & 물리 옵션</h2>
          <p>치수 조정과 물리 레벨(L0/L1) 토글 UI가 여기에 들어갑니다.</p>
          {formattedParams ? (
            <div className={styles.paramCard}>
              <p>
                <strong>신장 배율</strong>: {formattedParams.height}
              </p>
              <p>
                <strong>주요 모프</strong>
              </p>
              <ul>
                {formattedParams.morphTargets.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className={styles.placeholder}>온보딩을 완료하면 마네킹 파라미터가 표시됩니다.</p>
          )}
          {warnings.length > 0 ? (
            <div className={styles.warningCard}>
              <strong>치수 확인 필요</strong>
              <ul>
                {warnings.slice(0, 4).map((warning) => (
                  <li key={warning.key}>{warning.message}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </main>

      <footer className={styles.catalogBar}>
        <div>
          <h3>의상 카탈로그</h3>
          <p>썸네일 목록, 착용/벗기기 토글이 배치될 자리입니다.</p>
        </div>
        <button className={styles.snapshotBtn} type="button">
          스냅샷 저장 (준비 중)
        </button>
      </footer>
    </div>
  );
}
