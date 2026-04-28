"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useStudents } from "@/hooks/useStudents";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { StudentDetailPanel } from "@/components/students/StudentDetail";
import { AddStudentModal } from "@/components/students/AddStudentModal";
import { BulkImportStudentsModal } from "@/components/students/BulkImportStudentsModal";
import type { StudentDetail } from "@/api/types";
import styles from "./students.module.css";

function StudentsContent() {
  const { data, isLoading } = useStudents();
  const students = data?.results ?? [];
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<StudentDetail | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const full = `${s.first_name} ${s.last_name} ${s.registration_number} ${s.email}`.toLowerCase();
      const matchSearch = full.includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && s.user?.is_active !== false) ||
        (statusFilter === "inactive" && s.user?.is_active === false);
      return matchSearch && matchStatus;
    });
  }, [students, search, statusFilter]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Students</h1>
          <p className={styles.subtitle}>Manage student profiles and subscriptions</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.importBtn} onClick={() => setImportOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import CSV / XLSX
          </button>
          <button className={styles.addBtn} onClick={() => setAddOpen(true)}>
            + Add Student
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.listPanel}>
          <div className={styles.filters}>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by name, registration, or email..."
            />
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {isLoading ? (
            <div className={styles.loading}>Loading students...</div>
          ) : (
            <div className={styles.list}>
              {filtered.map((s) => {
                const isActive = selected?.student_id === s.student_id;
                return (
                  <div
                    key={s.student_id}
                    className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                    onClick={() => setSelected(isActive ? null : s)}
                  >
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{s.first_name} {s.last_name}</span>
                      <span className={styles.itemId}>{s.registration_number}</span>
                      <span className={styles.itemLine}>{s.email}</span>
                    </div>
                    <Badge variant={s.user?.is_active !== false ? "active" : "expired"}>
                      {s.user?.is_active !== false ? "active" : "inactive"}
                    </Badge>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className={styles.empty}>No students found</p>
              )}
            </div>
          )}
        </div>

        {selected && (
          <div className={styles.detailPanel}>
            <StudentDetailPanel
              student={selected}
              onClose={() => setSelected(null)}
              onDeleted={() => setSelected(null)}
            />
          </div>
        )}
      </div>

      <AddStudentModal open={addOpen} onClose={() => setAddOpen(false)} />
      <BulkImportStudentsModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "var(--color-muted)" }}>Loading...</div>}>
      <StudentsContent />
    </Suspense>
  );
}
