import styles from "./Badge.module.css";

type BadgeVariant =
  | "active"
  | "inactive"
  | "expired"
  | "delayed"
  | "maintenance"
  | "available"
  | "in_service"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "open"
  | "resolved"
  | "incident"
  | "warning"
  | "info"
  | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantMap: Record<string, BadgeVariant> = {
  active: "active",
  inactive: "inactive",
  expired: "expired",
  delayed: "delayed",
  maintenance: "maintenance",
  available: "available",
  in_service: "in_service",
  scheduled: "scheduled",
  in_progress: "in_progress",
  completed: "completed",
  cancelled: "cancelled",
  open: "open",
  resolved: "resolved",
  incident: "incident",
  warning: "warning",
};

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
  );
}

export function statusToBadge(status: string): BadgeVariant {
  return (variantMap[status.toLowerCase()] as BadgeVariant) ?? "default";
}
