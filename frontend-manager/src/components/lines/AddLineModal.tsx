"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useQueryClient } from "@tanstack/react-query";
import { linesApi } from "@/api";
import styles from "./AddLineModal.module.css";

interface StationEntry {
  id: string;
  name: string;
  address: string;
}

interface AddLineModalProps {
  open: boolean;
  onClose: () => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function AddLineModal({ open, onClose }: AddLineModalProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [stations, setStations] = useState<StationEntry[]>([
    { id: uid(), name: "", address: "" },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setError("");
    setLoading(true);

    try {
      const lineRes = await linesApi.managerCreateLine({ name: name.trim(), description: description.trim() });
      const lineId = lineRes.data.line_id;

      const validStations = stations.filter((s) => s.name.trim());
      for (let i = 0; i < validStations.length; i++) {
        const stationData = validStations[i];
        let stationId: number;
        try {
          const stationRes = await linesApi.managerCreateStation({
            name: stationData.name.trim(),
            address: stationData.address.trim() || stationData.name.trim(),
          });
          stationId = stationRes.data.station_id;
        } catch (stationErr: unknown) {
          const axiosErr = stationErr as { response?: { data?: unknown } };
          const detail = axiosErr?.response?.data
            ? JSON.stringify(axiosErr.response.data)
            : "Unknown error";
          setError(`Failed to create station "${stationData.name}": ${detail}`);
          setLoading(false);
          return;
        }

        try {
          await linesApi.managerAddStationToLine(lineId, { station_id: stationId, order_index: i + 1 });
        } catch (linkErr: unknown) {
          const axiosErr = linkErr as { response?: { data?: unknown } };
          const detail = axiosErr?.response?.data
            ? JSON.stringify(axiosErr.response.data)
            : "Unknown error";
          setError(`Failed to link station "${stationData.name}" to line: ${detail}`);
          setLoading(false);
          return;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["lines"] });
      handleClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      const detail = axiosErr?.response?.data
        ? JSON.stringify(axiosErr.response.data)
        : "Unknown error";
      setError(`Failed to create line: ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setStations([{ id: uid(), name: "", address: "" }]);
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Line" size="md">
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
            <p className={styles.emptyStations}>No stations added yet.</p>
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
              />
              <input
                type="text"
                className={styles.stationInput}
                value={station.address}
                onChange={(e) => updateStation(station.id, "address", e.target.value)}
                placeholder="Address (optional)"
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
            {loading ? "Creating..." : "Create Line"}
          </button>
          <button className={styles.cancelBtn} onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
