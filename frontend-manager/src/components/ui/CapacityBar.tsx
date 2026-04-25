import styles from "./CapacityBar.module.css";

interface CapacityBarProps {
  current: number;
  max: number;
  showLabel?: boolean;
}

export function CapacityBar({ current, max, showLabel = true }: CapacityBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  const variant = pct >= 90 ? "critical" : pct >= 70 ? "high" : "normal";

  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        <div
          className={`${styles.fill} ${styles[variant]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className={styles.label}>
          {current}/{max} ({pct}%)
        </span>
      )}
    </div>
  );
}
