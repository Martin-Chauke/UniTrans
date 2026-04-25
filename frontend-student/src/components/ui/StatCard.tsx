import Link from "next/link";
import styles from "./StatCard.module.css";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  /** Optional secondary metric shown below the main value */
  secondary?: { label: string; value: number | string };
  icon?: React.ReactNode;
  href?: string;
}

export function StatCard({ title, value, subtitle, secondary, icon, href }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{value}</span>
        {secondary && (
          <div className={styles.secondary}>
            <span className={styles.secondaryValue}>{secondary.value}</span>
            <span className={styles.secondaryLabel}>{secondary.label}</span>
          </div>
        )}
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
      {(icon || href) && (
        <div className={styles.iconCol}>
          {href && (
            <Link href={href} className={styles.viewAll}>
              View all
            </Link>
          )}
          {icon && <div className={styles.icon}>{icon}</div>}
        </div>
      )}
    </div>
  );
}
