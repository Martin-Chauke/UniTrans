"use client";

import { useState, useMemo } from "react";
import { useBuses, useBusAssignments, useDeleteBus } from "@/hooks/useBuses";
import { useDrivers } from "@/hooks/useDrivers";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge, statusToBadge } from "@/components/ui/Badge";
import { CapacityBar } from "@/components/ui/CapacityBar";
import { AssignBusModal } from "@/components/buses/AssignBusModal";
import { AddBusModal } from "@/components/buses/AddBusModal";
import { EditBusModal } from "@/components/buses/EditBusModal";
import type { Bus } from "@/api/types";
import styles from "./buses.module.css";

export default function BusesPage() {
  const { data: busesData, isLoading } = useBuses();
  const { data: assignmentsData } = useBusAssignments();
  const { data: driversData } = useDrivers();
  const { mutate: deleteBus } = useDeleteBus();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [addBusOpen, setAddBusOpen] = useState(false);
  const [editBus, setEditBus] = useState<Bus | null>(null);

  const buses = busesData?.results ?? [];
  const assignments = assignmentsData?.results ?? [];
  const drivers = driversData?.results ?? [];

  const filtered = useMemo(() => {
    return buses.filter((b) => {
      const matchSearch =
        b.registration_number.toLowerCase().includes(search.toLowerCase()) ||
        b.model.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [buses, search, statusFilter]);

  const getAssignment = (busId: number) =>
    assignments.find((a) => a.bus === busId && a.is_active);

  const getDriverForBus = (busId: number) => {
    const driver = drivers.find((d) => d.assigned_bus === busId);
    return driver ? `${driver.first_name} ${driver.last_name}` : "—";
  };

  const handleAssign = (bus: Bus) => {
    setSelectedBus(bus);
    setAssignOpen(true);
  };

  const handleDelete = (bus: Bus) => {
    if (confirm(`Delete bus "${bus.registration_number}"? This cannot be undone.`)) {
      deleteBus(bus.bus_id);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Buses</h1>
          <p className={styles.subtitle}>Manage fleet and driver assignments</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={() => { setSelectedBus(null); setAssignOpen(true); }}>
            Assign Bus to Line
          </button>
          <button className={styles.addBtn} onClick={() => setAddBusOpen(true)}>
            + Add Bus
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.filters}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by registration or model..." />
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="in_service">In Service</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading buses...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>BUS ID</th>
                <th>MODEL</th>
                <th>DRIVER</th>
                <th>LINE</th>
                <th>STATUS</th>
                <th>CAPACITY</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bus) => {
                const assignment = getAssignment(bus.bus_id);
                return (
                  <tr key={bus.bus_id}>
                    <td className={styles.busId}>{bus.registration_number}</td>
                    <td>{bus.model}</td>
                    <td>{getDriverForBus(bus.bus_id)}</td>
                    <td>{assignment ? assignment.line_detail.name : "—"}</td>
                    <td>
                      <Badge variant={statusToBadge(bus.status ?? "available")}>
                        {bus.status ?? "available"}
                      </Badge>
                    </td>
                    <td>
                      <CapacityBar current={0} max={bus.capacity} />
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button className={styles.actionBtn} onClick={() => handleAssign(bus)}>
                          Change Line
                        </button>
                        <span className={styles.actionDivider}>|</span>
                        <button className={styles.actionBtn} onClick={() => setEditBus(bus)}>
                          Edit
                        </button>
                        <span className={styles.actionDivider}>|</span>
                        <button className={styles.deleteBtnInline} onClick={() => handleDelete(bus)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.empty}>
                    {buses.length === 0
                      ? 'No buses yet. Click "+ Add Bus" to add one.'
                      : "No buses match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <AssignBusModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        busId={selectedBus?.bus_id}
      />

      <AddBusModal open={addBusOpen} onClose={() => setAddBusOpen(false)} />

      <EditBusModal
        open={!!editBus}
        onClose={() => setEditBus(null)}
        bus={editBus}
      />
    </div>
  );
}
