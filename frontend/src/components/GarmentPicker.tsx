import { useEffect, useMemo, useState } from 'react';
import type { JSX } from 'react';
import type { GarmentCatalog } from '../data/garments';
import { useAvatarStore } from '../store/avatar.store';
import styles from './GarmentPicker.module.css';

interface GarmentPickerProps {
  className?: string;
  catalog: GarmentCatalog;
  loading?: boolean;
  error?: string | null;
}

type GarmentSection = 'top' | 'bottom' | 'other';

const sectionLabels: Record<GarmentSection, string> = {
  top: '상의',
  bottom: '하의',
  other: '기타',
};

const combineClass = (...values: Array<string | undefined>) => values.filter(Boolean).join(' ');

export function GarmentPicker({
  className,
  catalog,
  loading,
  error,
}: GarmentPickerProps): JSX.Element {
  const selections = useAvatarStore((state) => state.garmentSelections);
  const setSelections = useAvatarStore((state) => state.setGarmentSelections);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { items } = catalog;

  const grouped = useMemo(() => {
    const groups: Record<GarmentSection, typeof items> = {
      top: [],
      bottom: [],
      other: [],
    };
    for (const item of items) {
      const key: GarmentSection =
        item.category === 'top' ? 'top' : item.category === 'bottom' ? 'bottom' : 'other';
      groups[key].push(item);
    }
    return groups;
  }, [items]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    const timer = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const toggleGarment = (garmentId: string) => {
    try {
      setSelections(
        selections.includes(garmentId)
          ? selections.filter((id) => id !== garmentId)
          : [...selections, garmentId],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : '의상 적용에 실패했습니다.';
      setToastMessage(message);
      console.error('[GarmentPicker] failed to toggle garment', err);
    }
  };

  return (
    <div className={combineClass(styles.picker, className)}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>의상 선택</h2>
        <p className={styles.headerInfo}>
          {loading
            ? '카탈로그를 불러오는 중입니다…'
            : `총 ${catalog.items.length}개 아이템이 준비돼 있어요.`}
        </p>
        {error ? <p className={styles.error}>카탈로그 오류: {error}</p> : null}
      </div>

      {(['top', 'bottom', 'other'] as GarmentSection[]).map((section) => {
        const items = grouped[section];
        if (!items.length) {
          return null;
        }
        return (
          <div key={section} className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>{sectionLabels[section]}</h3>
              <span className={styles.sectionMeta}>{items.length}개</span>
            </div>
            <div className={styles.cardGrid}>
              {items.map((item) => {
                const active = selections.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={combineClass(styles.card, active ? styles.cardActive : undefined)}
                  >
                    <div className={styles.cardHeader}>
                      <div className={styles.thumb}>
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.name ?? item.label ?? item.id}
                            loading="lazy"
                          />
                        ) : (
                          (item.name ?? item.label ?? item.id)
                        )}
                      </div>
                      <div className={styles.cardBody}>
                        <strong>{item.name ?? item.label ?? item.id}</strong>
                        <p>{item.license?.author ?? '제공자 미상'}</p>
                        {active ? <p className={styles.sectionMeta}>착용 중</p> : null}
                      </div>
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => toggleGarment(item.id)}
                      >
                        {active ? '벗기기' : '착용'}
                      </button>
                    </div>
                    {active && item.anchors?.length ? (
                      <div className={styles.anchors}>
                        앵커: {item.anchors.slice(0, 6).join(', ')}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {toastMessage ? <div className={styles.toast}>{toastMessage}</div> : null}
    </div>
  );
}

export default GarmentPicker;
