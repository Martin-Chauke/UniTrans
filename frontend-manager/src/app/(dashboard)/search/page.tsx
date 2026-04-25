"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStudents } from "@/hooks/useStudents";
import { useBuses } from "@/hooks/useBuses";
import { useDrivers } from "@/hooks/useDrivers";
import { useLines } from "@/hooks/useLines";
import { Badge, statusToBadge } from "@/components/ui/Badge";
import styles from "./search.module.css";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const q = query.toLowerCase().trim();
  const router = useRouter();

  const { data: studentsData } = useStudents();
  const { data: busesData } = useBuses();
  const { data: driversData } = useDrivers();
  const { data: linesData } = useLines();

  const students = studentsData?.results ?? [];
  const buses = busesData?.results ?? [];
  const drivers = driversData?.results ?? [];
  const lines = linesData?.results ?? [];

  const matchedStudents = useMemo(() => {
    if (!q) return [];
    return students.filter((s) =>
      `${s.first_name} ${s.last_name} ${s.registration_number} ${s.email}`.toLowerCase().includes(q)
    );
  }, [students, q]);

  const matchedBuses = useMemo(() => {
    if (!q) return [];
    return buses.filter((b) =>
      `${b.registration_number} ${b.model}`.toLowerCase().includes(q)
    );
  }, [buses, q]);

  const matchedDrivers = useMemo(() => {
    if (!q) return [];
    return drivers.filter((d) =>
      `${d.first_name} ${d.last_name} ${d.email} ${d.license_number}`.toLowerCase().includes(q)
    );
  }, [drivers, q]);

  const matchedLines = useMemo(() => {
    if (!q) return [];
    return lines.filter((l) =>
      `${l.name} ${l.description ?? ""}`.toLowerCase().includes(q)
    );
  }, [lines, q]);

  const totalResults =
    matchedStudents.length + matchedBuses.length + matchedDrivers.length + matchedLines.length;

  if (!q) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Search</h1>
          <p className={styles.subtitle}>Enter a keyword in the search bar above to search across the system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Search Results</h1>
        <p className={styles.subtitle}>
          {totalResults} result{totalResults !== 1 ? "s" : ""} for{" "}
          <span className={styles.queryHighlight}>&ldquo;{query}&rdquo;</span>
        </p>
      </div>

      {totalResults === 0 && (
        <div className={styles.noResults}>
          No results found for &ldquo;{query}&rdquo;. Try a different keyword.
        </div>
      )}

      {matchedStudents.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              Students
              <span className={styles.sectionCount}>{matchedStudents.length}</span>
            </span>
            <Link href="/students" className={styles.sectionLink}>View all students</Link>
          </div>
          {matchedStudents.map((s) => (
            <Link
              key={s.student_id}
              href={`/students?search=${encodeURIComponent(query)}`}
              className={styles.resultItem}
            >
              <div className={styles.resultMain}>
                <span className={styles.resultName}>{s.first_name} {s.last_name}</span>
                <span className={styles.resultSub}>{s.email}</span>
              </div>
              <div className={styles.resultMeta}>
                <span className={styles.resultId}>STU{String(s.student_id).padStart(3, "0")}</span>
                <Badge variant={s.user?.is_active !== false ? "active" : "expired"}>
                  {s.user?.is_active !== false ? "active" : "inactive"}
                </Badge>
                <span className={styles.arrow}>›</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {matchedBuses.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              Buses
              <span className={styles.sectionCount}>{matchedBuses.length}</span>
            </span>
            <Link href="/buses" className={styles.sectionLink}>View all buses</Link>
          </div>
          {matchedBuses.map((b) => (
            <Link
              key={b.bus_id}
              href="/buses"
              className={styles.resultItem}
            >
              <div className={styles.resultMain}>
                <span className={styles.resultName}>{b.registration_number}</span>
                <span className={styles.resultSub}>{b.model}</span>
              </div>
              <div className={styles.resultMeta}>
                <Badge variant={statusToBadge(b.status ?? "available")}>
                  {b.status ?? "available"}
                </Badge>
                <span className={styles.arrow}>›</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {matchedDrivers.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              Drivers
              <span className={styles.sectionCount}>{matchedDrivers.length}</span>
            </span>
            <Link href="/drivers" className={styles.sectionLink}>View all drivers</Link>
          </div>
          {matchedDrivers.map((d) => (
            <Link
              key={d.driver_id}
              href="/drivers"
              className={styles.resultItem}
            >
              <div className={styles.resultMain}>
                <span className={styles.resultName}>{d.first_name} {d.last_name}</span>
                <span className={styles.resultSub}>{d.email} · {d.license_number}</span>
              </div>
              <div className={styles.resultMeta}>
                <span className={styles.resultId}>DRV{String(d.driver_id).padStart(3, "0")}</span>
                <Badge variant={d.is_active ? "active" : "expired"}>
                  {d.is_active ? "active" : "inactive"}
                </Badge>
                <span className={styles.arrow}>›</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {matchedLines.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              Lines
              <span className={styles.sectionCount}>{matchedLines.length}</span>
            </span>
            <Link href="/lines-trips" className={styles.sectionLink}>View all lines</Link>
          </div>
          {matchedLines.map((l) => (
            <Link
              key={l.line_id}
              href="/lines-trips"
              className={styles.resultItem}
            >
              <div className={styles.resultMain}>
                <span className={styles.resultName}>{l.name}</span>
                {l.description && (
                  <span className={styles.resultSub}>{l.description}</span>
                )}
              </div>
              <div className={styles.resultMeta}>
                <span className={styles.resultId}>LINE{String(l.line_id).padStart(3, "0")}</span>
                <span className={styles.resultSub}>{l.stations?.length ?? 0} stations</span>
                <span className={styles.arrow}>›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: 40, textAlign: "center", color: "var(--color-muted)" }}>
        Searching...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
