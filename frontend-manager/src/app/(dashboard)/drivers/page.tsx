"use client";

import { useState, useMemo } from "react";
import { useDrivers, useDeleteDriver } from "@/hooks/useDrivers";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { AddDriverModal } from "@/components/drivers/AddDriverModal";
import { EditDriverModal } from "@/components/drivers/EditDriverModal";
import type { Driver } from "@/api/types";
import styles from "./drivers.module.css";

export default function DriversPage() {
  const { data, isLoading } = useDrivers();
  const drivers = data?.results ?? [];
  const { mutate: deleteDriver } = useDeleteDriver();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      const full = `${d.first_name} ${d.last_name} ${d.license_number} ${d.email}`.toLowerCase();
      const matchSearch = full.includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && d.is_active) ||
        (statusFilter === "inactive" && !d.is_active);
      return matchSearch && matchStatus;
    });
  }, [drivers, search, statusFilter]);

  const handleDelete = (driver: Driver) => {
    if (confirm(`Delete driver "${driver.first_name} ${driver.last_name}"? This cannot be undone.`)) {
      deleteDriver(driver.driver_id);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Drivers</h1>
          <p className={styles.subtitle}>Manage driver profiles and bus assignments</p>
        </div>
        <button className={styles.addBtn} onClick={() => setAddOpen(true)}>
          + Add Driver
        </button>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.filters}>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, license, or email..."
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
          <div className={styles.loading}>Loading drivers...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>LICENSE NO.</th>
                <th>ASSIGNED BUS</th>
                <th>PORTAL PASSWORD</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((driver) => {
                const driverId = `DRV${String(driver.driver_id).padStart(3, "0")}`;
                const busLabel = driver.assigned_bus_detail
                  ? `${driver.assigned_bus_detail.registration_number} — ${driver.assigned_bus_detail.model}`
                  : driver.assigned_bus
                  ? `BUS${String(driver.assigned_bus).padStart(3, "0")}`
                  : "—";
                return (
                  <tr key={driver.driver_id}>
                    <td className={styles.driverId}>{driverId}</td>
                    <td style={{ fontWeight: 600 }}>
                      {driver.first_name} {driver.last_name}
                    </td>
                    <td>{driver.email}</td>
                    <td>{driver.phone || "—"}</td>
                    <td>{driver.license_number}</td>
                    <td>{busLabel}</td>
                    <td className={styles.portalPassword}>
                      {driver.password?.trim() ? driver.password : "—"}
                    </td>
                    <td>
                      <Badge variant={driver.is_active ? "active" : "expired"}>
                        {driver.is_active ? "active" : "inactive"}
                      </Badge>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => setEditDriver(driver)}
                        >
                          Edit
                        </button>
                        <span className={styles.actionDivider}>|</span>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(driver)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className={styles.empty}>
                    {drivers.length === 0
                      ? 'No drivers yet. Click "+ Add Driver" to add one.'
                      : "No drivers match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AddDriverModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditDriverModal
        open={!!editDriver}
        onClose={() => setEditDriver(null)}
        driver={editDriver}
      />
    </div>
  );
}
