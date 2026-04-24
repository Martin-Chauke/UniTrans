"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StudentSidebar } from "@/components/student-layout/StudentSidebar";
import { StudentTopBar } from "@/components/student-layout/StudentTopBar";
import { useStudentAuth } from "@/context/StudentAuthContext";
import styles from "./layout.module.css";

export default function StudentPortalLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isLoading } = useStudentAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/student/login");
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
      <StudentSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={styles.main}>
        <StudentTopBar onMenuOpen={() => setMobileOpen(true)} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
