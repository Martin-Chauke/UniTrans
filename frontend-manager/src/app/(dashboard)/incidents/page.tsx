"use client";

import { useState, useMemo, useEffect, useRef, FormEvent } from "react";
import { useIncidents, useResolveIncident, useRespondToIncident, useDeleteIncidents } from "@/hooks/useIncidents";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ReportIncidentModal } from "@/components/incidents/ReportIncidentModal";
import styles from "./incidents.module.css";

const INCIDENT_TYPE_ICONS: Record<string, React.ReactNode> = {
  delay: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#f59e0b" }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  ),
  breakdown: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#ef4444" }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  capacity: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#f59e0b" }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const getIcon = (type: string) =>
  INCIDENT_TYPE_ICONS[type] ?? INCIDENT_TYPE_ICONS.delay;

export default function IncidentsPage() {
  const { data, isLoading } = useIncidents();
  const { mutate: resolve } = useResolveIncident();
  const { mutate: respond, isPending: respondPending } = useRespondToIncident();
  const { mutateAsync: deleteIncidents, isPending: deletePending } = useDeleteIncidents();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [reportOpen, setReportOpen] = useState(false);
  const [respondId, setRespondId] = useState<number | null>(null);
  const [respondMessage, setRespondMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[] | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const selectAllRef = useRef<HTMLInputElement>(null);

  const incidents = data?.results ?? [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return incidents.filter((inc) => {
      const lineFromTrip = (inc.trip_detail?.line_name ?? "").toLowerCase();
      const lineFromLine = (inc.line_detail?.name ?? "").toLowerCase();
      const tripToken =
        inc.trip != null && inc.trip > 0
          ? `trp${String(inc.trip).padStart(3, "0")}`
          : "";
      const matchSearch =
        (tripToken && tripToken.includes(q)) ||
        inc.description.toLowerCase().includes(q) ||
        inc.name.toLowerCase().includes(q) ||
        lineFromTrip.includes(q) ||
        lineFromLine.includes(q);
      const matchType = typeFilter === "all" || inc.incident_type === typeFilter;
      return matchSearch && matchType;
    });
  }, [incidents, search, typeFilter]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((inc) => selectedIds.has(inc.incident_id));
  const someFilteredSelected = filtered.some((inc) => selectedIds.has(inc.incident_id));

  useEffect(() => {
    const el = selectAllRef.current;
    if (el) {
      el.indeterminate = someFilteredSelected && !allFilteredSelected;
    }
  }, [someFilteredSelected, allFilteredSelected]);

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filtered.forEach((inc) => next.delete(inc.incident_id));
      } else {
        filtered.forEach((inc) => next.add(inc.incident_id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const openDeleteConfirm = (ids: number[]) => {
    setDeleteError("");
    setPendingDeleteIds(ids);
  };

  const closeDeleteConfirm = () => {
    if (!deletePending) setPendingDeleteIds(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteIds?.length) return;
    const ids = [...pendingDeleteIds];
    setDeleteError("");
    try {
      await deleteIncidents(ids);
      setPendingDeleteIds(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } catch {
      setDeleteError("Could not delete. Try again or refresh the page.");
    }
  };

  const closeRespond = () => {
    setRespondId(null);
    setRespondMessage("");
  };

  const handleRespondSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!respondId || !respondMessage.trim()) return;
    respond(
      { incidentId: respondId, message: respondMessage.trim() },
      { onSuccess: () => closeRespond() }
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Incidents</h1>
          <p className={styles.subtitle}>Track and manage system incidents</p>
        </div>
        <button className={styles.addBtn} onClick={() => setReportOpen(true)}>
          + Report Incident
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.filters}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by trip ID, line name, or description..." />
          <select className={styles.select} value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="delay">Delay</option>
            <option value="breakdown">Breakdown</option>
            <option value="accident">Accident</option>
            <option value="capacity">Capacity</option>
            <option value="other">Other</option>
          </select>
        </div>

        {!isLoading && incidents.length > 0 && (
          <div className={styles.bulkBar}>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                cursor: filtered.length ? "pointer" : "default",
              }}
            >
              <input
                ref={selectAllRef}
                type="checkbox"
                className={styles.checkbox}
                checked={allFilteredSelected}
                disabled={filtered.length === 0}
                onChange={toggleSelectAllFiltered}
                aria-label="Select all incidents matching current filters"
              />
              <span>
                Select all matching filter
                {filtered.length !== incidents.length ? ` (${filtered.length})` : ""}
              </span>
            </label>
            <span style={{ color: "var(--color-muted)" }}>{selectedIds.size} selected</span>
            <button
              type="button"
              className={styles.deleteSelectedBtn}
              disabled={selectedIds.size === 0 || deletePending}
              onClick={() => openDeleteConfirm(Array.from(selectedIds))}
            >
              Delete selected
            </button>
            <button
              type="button"
              className={styles.bulkLinkBtn}
              disabled={selectedIds.size === 0}
              onClick={clearSelection}
            >
              Clear selection
            </button>
          </div>
        )}

        {isLoading ? (
          <div className={styles.loading}>Loading incidents...</div>
        ) : (
          <div className={styles.list}>
            {filtered.map((inc) => {
              let tripLabel: string;
              const lineFromTrip = inc.trip_detail?.line_name?.trim() ?? "";
              if (inc.trip != null && inc.trip > 0) {
                const tripId = `TRP${String(inc.trip).padStart(3, "0")}`;
                tripLabel = lineFromTrip ? `Trip: ${tripId} — ${lineFromTrip}` : `Trip: ${tripId}`;
              } else {
                const ln = inc.line_detail?.name?.trim() ?? "";
                tripLabel = ln ? `Line: ${ln}` : "Line";
              }
              return (
                <div key={inc.incident_id} className={styles.item}>
                  <div className={styles.checkCell}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedIds.has(inc.incident_id)}
                      onChange={() => toggleSelectOne(inc.incident_id)}
                      aria-label={`Select incident: ${inc.name}`}
                    />
                  </div>
                  <div className={styles.iconCell}>
                    {getIcon(inc.incident_type ?? "other")}
                  </div>
                  <div className={styles.info}>
                    <div className={styles.topRow}>
                      <span className={styles.incidentName}>{inc.name}</span>
                      <Badge variant={inc.resolved ? "resolved" : "open"}>
                        {inc.resolved ? "resolved" : "open"}
                      </Badge>
                    </div>
                    <span className={styles.tripRef}>{tripLabel}</span>
                    <span className={styles.desc}>{inc.description}</span>
                    <span className={styles.date}>
                      Reported: {new Date(inc.reported_at).toLocaleString()}
                    </span>
                    {inc.reported_by_driver_detail && (
                      <span className={styles.driverTag}>
                        Driver: {inc.reported_by_driver_detail.name}
                      </span>
                    )}
                    {inc.manager_response && (
                      <div className={styles.managerReply}>
                        <strong>Your reply: </strong>
                        {inc.manager_response}
                        {inc.manager_responded_at && (
                          <span style={{ display: "block", marginTop: 4, fontSize: 11, color: "var(--color-muted)" }}>
                            {new Date(inc.manager_responded_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={styles.rowActions}>
                    {inc.reported_by_driver_detail && (
                      <button
                        type="button"
                        className={styles.replyBtn}
                        onClick={() => {
                          setRespondId(inc.incident_id);
                          setRespondMessage(inc.manager_response ?? "");
                        }}
                      >
                        {inc.manager_response ? "Edit reply" : "Reply to driver"}
                      </button>
                    )}
                    {!inc.resolved && (
                      <button
                        type="button"
                        className={styles.resolveBtn}
                        onClick={() => resolve(inc.incident_id)}
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => openDeleteConfirm([inc.incident_id])}
                      disabled={deletePending}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className={styles.empty}>No incidents found</div>
            )}
          </div>
        )}
      </div>

      <ReportIncidentModal open={reportOpen} onClose={() => setReportOpen(false)} />

      <Modal open={respondId !== null} onClose={closeRespond} title="Reply to driver" size="md">
        <form className={styles.modalForm} onSubmit={handleRespondSubmit}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
            Your message is shown to the driver on their incident report.
          </p>
          <textarea
            className={styles.modalTextarea}
            value={respondMessage}
            onChange={(e) => setRespondMessage(e.target.value)}
            placeholder="Type your response…"
            required
          />
          <button type="submit" className={styles.modalSubmit} disabled={respondPending}>
            {respondPending ? "Sending…" : "Send reply"}
          </button>
        </form>
      </Modal>

      <Modal
        open={pendingDeleteIds !== null && pendingDeleteIds.length > 0}
        onClose={closeDeleteConfirm}
        title={pendingDeleteIds && pendingDeleteIds.length === 1 ? "Delete incident?" : "Delete incidents?"}
        size="sm"
      >
        <div className={styles.modalForm}>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
            {pendingDeleteIds && pendingDeleteIds.length === 1
              ? "This permanently removes the incident. It will disappear from the driver portal and this list."
              : `This permanently removes ${pendingDeleteIds?.length} incidents. They will disappear from driver portals and this list.`}
          </p>
          {deleteError && (
            <p style={{ fontSize: 13, color: "var(--color-red)", margin: 0 }}>{deleteError}</p>
          )}
          <div className={styles.modalActions}>
            <button type="button" className={styles.modalCancelBtn} onClick={closeDeleteConfirm} disabled={deletePending}>
              Cancel
            </button>
            <button type="button" className={styles.modalDeleteBtn} onClick={() => void confirmDelete()} disabled={deletePending}>
              {deletePending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
