"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { useUpdateLine } from "@/hooks/useLines";
import { useQueryClient } from "@tanstack/react-query";
import { linesApi } from "@/api";
import type { Line } from "@/api/types";
import styles from "./AddLineModal.module.css";

interface EditLineModalProps {
  open: boolean;
  onClose: () => void;
  line: Line | null;
}

interface StationEntry {
  id: string;
  name: string;
  address: string;
  existingStationId?: number;
  lineStationId?: number;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function EditLineModal({ open, onClose, line }: EditLineModalProps) {
  const { mutateAsync: updateLine } = useUpdateLine();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stations, setStations] = useState<StationEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (line) {
      setName(line.name);
      setDescription(line.description ?? "");
      setStations(
        (line.stations ?? []).map((ls) => ({
          id: uid(),
          name: ls.station.name,
          address: ls.station.address,
          existingStationId: ls.station.station_id,
          lineStationId: ls.line_station_id,
        }))
      );
      setError("");
    }
  }, [line, open]);

  const addStation = () => {
    setStations((prev) => [...prev, { id: uid(), name: "", address: "" }]);
  };

  const removeStation = (id: string) => {
    setStations((prev) => prev.filter((s) => s.id !== id));
  };

  const updateStation = (id: string, field: "name" | "address", value: string) => {
    setStations((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Line name is required.");
      return;
    }
    if (!line) return;
    setError("");
    setLoading(true);

    try {
      await updateLine({ id: line.line_id, data: { name: name.trim(), description: description.trim() } });

      const existingLineStationIds = new Set((line.stations ?? []).map((ls) => ls.line_station_id));
      const keptIds = new Set(stations.filter((s) => s.lineStationId).map((s) => s.lineStationId!));

      for (const ls of line.stations ?? []) {
        if (!keptIds.has(ls.line_station_id)) {
          try {
            await linesApi.managerRemoveStationFromLine(line.line_id, ls.line_station_id);
          } catch {
            // ignore removal errors
          }
        }
      }

      const newStations = stations.filter((s) => !s.lineStationId && s.name.trim());
      const nextOrder = (line.stations?.length ?? 0) - (existingLineStationIds.size - keptIds.size) + 1;

      for (let i = 0; i < newStations.length; i++) {
        const stationData = newStations[i];
        try {
          const stationRes = await linesApi.managerCreateStation({
            name: stationData.name.trim(),
            address: stationData.address.trim() || stationData.name.trim(),
          });
          await linesApi.managerAddStationToLine(line.line_id, {
            station_id: stationRes.data.station_id,
            order_index: nextOrder + i,
          });
        } catch (err: unknown) {
          const axiosErr = err as { response?: { data?: unknown } };
          const detail = axiosErr?.response?.data
            ? JSON.stringify(axiosErr.response.data)
            : "Unknown error";
          setError(`Failed to add station "${stationData.name}": ${detail}`);
          setLoading(false);
          return;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["lines"] });
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      const detail = axiosErr?.response?.data
        ? JSON.stringify(axiosErr.response.data)
        : "Unknown error";
      setError(`Failed to update line: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  if (!line) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Edit Line — ${line.name}`} size="md">
      <div className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label}>
            Line Name <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Line A — University to Downtown"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this route..."
            rows={2}
          />
        </div>

        <div className={styles.stationsSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Stations</span>
            <button type="button" className={styles.addStationBtn} onClick={addStation}>
              + Add Station
            </button>
          </div>

          {stations.length === 0 && (
            <p className={styles.emptyStations}>No stations. Click &quot;+ Add Station&quot; to add one.</p>
          )}

          {stations.map((station, index) => (
            <div key={station.id} className={styles.stationRow}>
              <div className={styles.stationOrder}>{index + 1}</div>
              <input
                type="text"
                className={styles.stationInput}
                value={station.name}
                onChange={(e) => updateStation(station.id, "name", e.target.value)}
                placeholder="Station name"
                readOnly={!!station.existingStationId}
                style={station.existingStationId ? { background: "var(--color-bg)", color: "var(--color-muted)" } : undefined}
              />
              <input
                type="text"
                className={styles.stationInput}
                value={station.address}
                onChange={(e) => updateStation(station.id, "address", e.target.value)}
                placeholder="Address"
                readOnly={!!station.existingStationId}
                style={station.existingStationId ? { background: "var(--color-bg)", color: "var(--color-muted)" } : undefined}
              />
              <button
                type="button"
                className={styles.removeStationBtn}
                onClick={() => removeStation(station.id)}
                aria-label="Remove station"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.submitBtn} onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
