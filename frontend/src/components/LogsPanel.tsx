import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import type { FitHistoryEntry } from '../store/avatar.store';
import styles from './LogsPanel.module.css';

interface LogsPanelProps {
  logs: FitHistoryEntry[];
  onClear: () => void;
  className?: string;
}

const combineClass = (...values: Array<string | undefined>) => values.filter(Boolean).join(' ');

export function LogsPanel({ logs, onClear, className }: LogsPanelProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [logs]);

  return (
    <div ref={containerRef} className={combineClass(styles.panelWrapper, className)}>
      <div className={styles.header}>
        <strong>최근 피팅 로그</strong>
        <button type="button" className={styles.clearButton} onClick={onClear}>
          로그 비우기
        </button>
      </div>
      {logs.length === 0 ? (
        <p className={styles.empty}>아직 기록이 없습니다. 의상을 착용해보세요.</p>
      ) : (
        <ul className={styles.list}>
          {logs.map((entry) => (
            <li
              key={`${entry.timestamp}-${entry.garmentId}-${entry.message}`}
              className={styles.logItem}
            >
              <span className={styles.timestamp}>{entry.timestamp}</span>
              <span className={styles.tier}>{entry.tier}</span>
              <span>{`${entry.garmentId} — ${entry.message}`}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LogsPanel;
