"use client";

import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { Modal } from "@/components/ui/Modal";
import { useLines } from "@/hooks/useLines";
import { authApi } from "@/api";
import { subscriptionsApi } from "@/api";
import styles from "./BulkImportStudentsModal.module.css";

interface BulkImportStudentsModalProps {
  open: boolean;
  onClose: () => void;
}

interface ParsedRow {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  registration_number: string;
  line: string; // line name from file — resolved to id during import
  password: string;
  // runtime state
  _status: "pending" | "success" | "error";
  _error: string;
}

const REQUIRED_COLS = ["first_name", "last_name", "email", "registration_number"];

const COL_ALIASES: Record<string, string> = {
  firstname: "first_name",
  "first name": "first_name",
  lastname: "last_name",
  "last name": "last_name",
  "registration number": "registration_number",
  reg: "registration_number",
  regno: "registration_number",
  "reg no": "registration_number",
  telephone: "phone",
  mobile: "phone",
  line: "line",
  "bus line": "line",
  pass: "password",
};

function normalizeKey(raw: string): string {
  const lower = raw.trim().toLowerCase();
  return COL_ALIASES[lower] ?? lower.replace(/\s+/g, "_");
}

function parseSheet(sheet: XLSX.WorkSheet): ParsedRow[] | string {
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  if (!json.length) return "The file appears to be empty.";

  // Normalise column headers
  const rows = json.map((raw) => {
    const normalized: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      normalized[normalizeKey(k)] = String(v ?? "").trim();
    }
    return normalized;
  });

  // Validate required columns exist in the first row
  const firstRow = rows[0];
  const missing = REQUIRED_COLS.filter((c) => !(c in firstRow));
  if (missing.length) {
    return `Missing required columns: ${missing.join(", ")}. Make sure your file has: first_name, last_name, email, registration_number.`;
  }

  return rows.map((r) => ({
    first_name: r.first_name ?? "",
    last_name: r.last_name ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    registration_number: r.registration_number ?? "",
    line: r.line ?? "",
    password: r.password ?? "",
    _status: "pending",
    _error: "",
  }));
}

export function BulkImportStudentsModal({ open, onClose }: BulkImportStudentsModalProps) {
  const { data: linesData } = useLines();
  const lines = linesData?.results ?? [];

  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [defaultLine, setDefaultLine] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Build a name→id map for quick lookup
  const lineByName = Object.fromEntries(
    lines.map((l) => [l.name.toLowerCase().trim(), l.line_id])
  );

  const processFile = useCallback((file: File) => {
    setParseError("");
    setRows([]);
    setImportDone(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const result = parseSheet(sheet);
        if (typeof result === "string") {
          setParseError(result);
        } else {
          setRows(result);
        }
      } catch {
        setParseError("Failed to parse the file. Make sure it is a valid CSV or XLSX.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const resolveLineId = (lineName: string): number | null => {
    if (!lineName) {
      return defaultLine ? Number(defaultLine) : null;
    }
    const id = lineByName[lineName.toLowerCase().trim()];
    return id ?? (defaultLine ? Number(defaultLine) : null);
  };

  const handleImport = async () => {
    setImporting(true);
    const updated = [...rows];

    for (let i = 0; i < updated.length; i++) {
      const row = updated[i];
      if (row._status === "success") continue;

      if (!row.first_name || !row.last_name || !row.email || !row.registration_number) {
        updated[i] = { ...row, _status: "error", _error: "Missing required field(s)" };
        setRows([...updated]);
        continue;
      }

      const password = row.password || `Uni${Math.random().toString(36).slice(2, 10)}!`;
      try {
        const res = await authApi.register({
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          phone: row.phone,
          registration_number: row.registration_number,
          password,
          password_confirm: password,
        });

        // Assign line if provided
        const lineId = resolveLineId(row.line);
        if (lineId && res.data?.student_id) {
          try {
            await subscriptionsApi.managerAssignLine(res.data.student_id, lineId);
          } catch {
            // Line assignment failed but student was created — mark partial
            updated[i] = {
              ...row, _status: "success",
              _error: "Student created but line assignment failed.",
            };
            setRows([...updated]);
            continue;
          }
        }

        updated[i] = { ...row, _status: "success", _error: "" };
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: Record<string, unknown> } })?.response?.data
            ? JSON.stringify(
                (err as { response: { data: Record<string, unknown> } }).response.data
              ).slice(0, 120)
            : "Failed to create student";
        updated[i] = { ...row, _status: "error", _error: msg };
      }

      setRows([...updated]);
    }

    setImporting(false);
    setImportDone(true);
  };

  const handleClose = () => {
    setRows([]);
    setParseError("");
    setImportDone(false);
    setImporting(false);
    setDefaultLine("");
    onClose();
  };

  const successCount = rows.filter((r) => r._status === "success").length;
  const errorCount = rows.filter((r) => r._status === "error").length;
  const pendingCount = rows.filter((r) => r._status === "pending").length;

  return (
    <Modal open={open} onClose={handleClose} title="Import Students from File">
      <div className={styles.container}>

        {/* Template download hint */}
        <p className={styles.hint}>
          Upload a <strong>.csv</strong> or <strong>.xlsx</strong> file with columns:{" "}
          <code>first_name</code>, <code>last_name</code>, <code>email</code>,{" "}
          <code>registration_number</code>, <code>phone</code> (optional),{" "}
          <code>line</code> (optional), <code>password</code> (optional).
        </p>

        {/* Drop zone */}
        {!rows.length && !parseError && (
          <div
            className={`${styles.dropZone} ${dragging ? styles.dropZoneDragging : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className={styles.dropText}>Drop your CSV or XLSX file here</p>
            <p className={styles.dropSub}>or click to browse</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className={styles.fileInput}
              onChange={handleFileChange}
            />
          </div>
        )}

        {parseError && (
          <div className={styles.parseError}>
            <strong>Parse error:</strong> {parseError}
            <button className={styles.retryBtn} onClick={() => { setParseError(""); setRows([]); }}>
              Try another file
            </button>
          </div>
        )}

        {/* Default line picker */}
        {rows.length > 0 && (
          <div className={styles.defaultLineRow}>
            <label className={styles.label}>
              Default line for rows without a line specified:
            </label>
            {lines.length === 0 ? (
              <span className={styles.noLinesWarn}>
                ⚠ No lines available — go to Lines/Trips to add one first.
              </span>
            ) : (
              <select
                className={styles.select}
                value={defaultLine}
                onChange={(e) => setDefaultLine(e.target.value)}
              >
                <option value="">— None —</option>
                {lines.map((l) => (
                  <option key={l.line_id} value={l.line_id}>{l.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Preview table */}
        {rows.length > 0 && (
          <>
            <div className={styles.summary}>
              <span>{rows.length} row{rows.length !== 1 ? "s" : ""} detected</span>
              {importDone && (
                <>
                  <span className={styles.successCount}>✓ {successCount} imported</span>
                  {errorCount > 0 && <span className={styles.errorCount}>✗ {errorCount} failed</span>}
                </>
              )}
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Reg. No.</th>
                    <th>Line</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className={r._status === "error" ? styles.rowError : r._status === "success" ? styles.rowSuccess : ""}>
                      <td>{i + 1}</td>
                      <td>{r.first_name}</td>
                      <td>{r.last_name}</td>
                      <td>{r.email}</td>
                      <td>{r.registration_number}</td>
                      <td>{r.line || "—"}</td>
                      <td className={styles.statusCell}>
                        {r._status === "pending" && <span className={styles.badgePending}>Pending</span>}
                        {r._status === "success" && <span className={styles.badgeSuccess}>
                          {r._error ? "✓ (partial)" : "✓ Done"}
                        </span>}
                        {r._status === "error" && (
                          <span className={styles.badgeError} title={r._error}>✗ Error</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.footer}>
              {!importDone ? (
                <>
                  <button
                    className={styles.importBtn}
                    onClick={handleImport}
                    disabled={importing}
                  >
                    {importing
                      ? `Importing… (${successCount + errorCount}/${rows.length})`
                      : `Import ${rows.length} Student${rows.length !== 1 ? "s" : ""}`}
                  </button>
                  <button className={styles.cancelBtn} onClick={() => { setRows([]); setParseError(""); }} disabled={importing}>
                    Change file
                  </button>
                </>
              ) : (
                <>
                  {pendingCount > 0 && (
                    <button className={styles.importBtn} onClick={handleImport} disabled={importing}>
                      Retry {pendingCount + errorCount} failed
                    </button>
                  )}
                  <button className={styles.doneBtn} onClick={handleClose}>
                    Done
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
