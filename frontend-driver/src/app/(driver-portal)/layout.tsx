"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DriverSidebar } from "@/components/driver-layout/DriverSidebar";
import { DriverTopBar } from "@/components/driver-layout/DriverTopBar";
import { useDriverAuth } from "@/context/DriverAuthContext";
import styles from "./layout.module.css";

export default function DriverPortalLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isLoading } = useDriverAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/driver/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
        <div style={{ fontSize: 14, color: "var(--color-muted)" }}>Loading…</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={styles.shell}>
      <DriverSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={styles.main}>
        <DriverTopBar onMenuOpen={() => setMobileOpen(true)} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
