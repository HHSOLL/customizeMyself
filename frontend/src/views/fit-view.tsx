import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import styles from './fit-view.module.css';
import { useAvatarParameters, useAvatarWarnings } from '../engine/avatar/useAvatarParams';
import { applyAvatarParams, createLoggingRig } from '../engine/avatar/applyAvatarParams';
import type { AvatarRig } from '../engine/avatar/types';
import { useAvatarStore } from '../store/avatar.store';
import { applyGarmentL0 } from '../engine/fit/L0';
import { applyGarmentL1 } from '../engine/fit/L1';
import { FitScene } from '../components/fitting/fit-scene';
import { postFitHistory } from '../services/api';
import { useGarmentCatalog } from '../hooks/useGarmentCatalog';
import { GarmentPicker } from '../components/GarmentPicker';
import fitCameraToObject from '../engine/scene/fitCamera';
import type { Group, PerspectiveCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

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
  const garmentSelections = useAvatarStore((state) => state.garmentSelections);
  const physicsTier = useAvatarStore((state) => state.physicsTier);
  const togglePhysicsTier = useAvatarStore((state) => state.togglePhysicsTier);
  const setPhysicsTier = useAvatarStore((state) => state.setPhysicsTier);
  const appendFitHistory = useAvatarStore((state) => state.appendFitHistory);
  const clearFitHistory = useAvatarStore((state) => state.clearFitHistory);

  const { catalog, loading: catalogLoading, error: catalogError } = useGarmentCatalog();

  const selectedGarments = useMemo(
    () => catalog.items.filter((item) => garmentSelections.includes(item.id)),
    [catalog.items, garmentSelections],
  );

  const [autoDowngradeMessage, setAutoDowngradeMessage] = useState<string | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const sceneContextRef = useRef<{
    root: Group | null;
    camera: PerspectiveCamera | null;
    controls: OrbitControlsImpl | null;
  }>({
    root: null,
    camera: null,
    controls: null,
  });

  const focusScene = useCallback(() => {
    const context = sceneContextRef.current;
    if (!context.root || !context.camera) {
      return;
    }
    fitCameraToObject(context.camera, context.controls, context.root);
  }, []);

  const handleSceneReady = useCallback(
    (payload: { root: Group; camera: PerspectiveCamera; controls: OrbitControlsImpl | null }) => {
      sceneContextRef.current = payload;
      focusScene();
    },
    [focusScene],
  );

  const handleContentChanged = useCallback(() => {
    focusScene();
  }, [focusScene]);

  useEffect(() => {
    if (selectedGarments.length === 0) {
      clearFitHistory();
      setAutoDowngradeMessage(null);
      return;
    }

    let downgraded = false;

    const recordFitHistory = async (
      tier: 'L0' | 'L1',
      garmentId: string,
      latencyMs: number,
      message: string,
      degraded = false,
      details?: Record<string, unknown>,
    ) => {
      appendFitHistory({
        timestamp: new Date().toISOString(),
        garmentId,
        tier,
        message,
      });

      void postFitHistory({ tier, garmentId, latencyMs, degraded, details });
    };

    for (const garment of selectedGarments) {
      if (physicsTier === 'L1') {
        const l1Result = applyGarmentL1(rigRef.current, garment);
        void recordFitHistory(
          'L1',
          garment.id,
          l1Result.estimatedLatencyMs,
          `anchors=${l1Result.anchorsUsed.length} latency=${l1Result.estimatedLatencyMs}ms iter=${l1Result.solverIterations}`,
          l1Result.degraded,
          {
            anchorsUsed: l1Result.anchorsUsed,
            solverIterations: l1Result.solverIterations,
          },
        );
        if (l1Result.degraded) {
          downgraded = true;
          const fallback = applyGarmentL0(rigRef.current, garment);
          void recordFitHistory(
            'L0',
            garment.id,
            fallback.estimatedLatencyMs,
            `fallback latency=${fallback.estimatedLatencyMs}ms`,
            true,
            {
              fallback: true,
              anchorsUsed: fallback.anchorsUsed,
            },
          );
        }
      } else {
        const l0Result = applyGarmentL0(rigRef.current, garment);
        void recordFitHistory(
          'L0',
          garment.id,
          l0Result.estimatedLatencyMs,
          `anchors=${l0Result.anchorsUsed.length} latency=${l0Result.estimatedLatencyMs}ms`,
          false,
          {
            anchorsUsed: l0Result.anchorsUsed,
          },
        );
      }
    }

    if (downgraded && physicsTier === 'L1') {
      setPhysicsTier('L0');
      setAutoDowngradeMessage('물리 성능 저하 감지: 자동으로 L0 모드로 전환되었습니다.');
      appendFitHistory({
        timestamp: new Date().toISOString(),
        garmentId: 'system',
        tier: 'L0',
        message: 'Auto downgrade triggered due to latency budget overflow',
      });
    } else {
      setAutoDowngradeMessage(null);
    }
  }, [selectedGarments, physicsTier, setPhysicsTier, appendFitHistory, clearFitHistory]);

  useEffect(() => {
    if (!avatarParams) {
      return;
    }

    const timer = window.setTimeout(() => {
      applyAvatarParams(rigRef.current, avatarParams);
    }, 100);

    return () => window.clearTimeout(timer);
  }, [avatarParams]);

  useEffect(() => {
    const listener = () => focusScene();
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [focusScene]);

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
        <div className={styles.headerText}>
          <h1>피팅 스테이지</h1>
          <p>3D 마네킹과 의상을 활용해 착용 상태를 확인하세요.</p>
        </div>
        <Link className={styles.reconfigure} to="/onboarding/gender">
          온보딩 다시 진행
        </Link>
      </header>

      <div className={styles.content}>
        <div className={styles.mainGrid}>
          <section className={styles.stagePanel}>
            <div ref={stageContainerRef} className={styles.stageViewport}>
              <Suspense fallback={<PlaceholderAvatar />}>
                <FitScene
                  garmentIds={garmentSelections}
                  catalog={catalog}
                  containerRef={stageContainerRef}
                  onSceneReady={handleSceneReady}
                  onContentChanged={handleContentChanged}
                />
              </Suspense>
            </div>
          </section>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <div>
                <h2 className={styles.sectionTitle}>치수 & 물리 옵션</h2>
                <p className={styles.sectionSubtitle}>
                  세부 치수와 물리 시뮬레이션 레벨을 관리하세요.
                </p>
              </div>
              <div className={styles.physicsCard}>
                <span>현재 물리 티어: {physicsTier}</span>
                <button type="button" onClick={togglePhysicsTier} className={styles.linkButton}>
                  물리 티어 전환
                </button>
              </div>
              {autoDowngradeMessage ? (
                <div className={styles.warningCard}>
                  <strong>자동 강등</strong>
                  <p>{autoDowngradeMessage}</p>
                </div>
              ) : null}
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
                <p className={styles.placeholder}>
                  온보딩을 완료하면 마네킹 파라미터가 표시됩니다.
                </p>
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
            </div>

            <GarmentPicker
              className={styles.sidebarSection}
              catalog={catalog}
              loading={catalogLoading}
              error={catalogError}
            />
          </aside>
        </div>
        {/* Logs panel will be mounted below in a follow-up commit */}
      </div>
    </div>
  );
}
