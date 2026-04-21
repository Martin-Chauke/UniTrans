"use client";

import { useState } from "react";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [timeFormat, setTimeFormat] = useState("12h");

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Configure system preferences and options</p>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>General Settings</h2>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingName}>Auto-refresh alerts</span>
            <span className={styles.settingDesc}>Automatically refresh alerts every 10 seconds</span>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className={styles.slider} />
          </label>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingName}>Email notifications</span>
            <span className={styles.settingDesc}>Receive email alerts for incidents and warnings</span>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />
            <span className={styles.slider} />
          </label>
        </div>

        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingName}>SMS notifications</span>
            <span className={styles.settingDesc}>Receive SMS for critical incidents</span>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={smsNotifications}
              onChange={(e) => setSmsNotifications(e.target.checked)}
            />
            <span className={styles.slider} />
          </label>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Display Preferences</h2>

        <div className={styles.prefRow}>
          <div className={styles.prefField}>
            <label className={styles.prefLabel}>Items per page</label>
            <select
              className={styles.prefSelect}
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(e.target.value)}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className={styles.prefField}>
            <label className={styles.prefLabel}>Time format</label>
            <select
              className={styles.prefSelect}
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
            >
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        {saved && <span className={styles.savedMsg}>Settings saved!</span>}
        <button className={styles.saveBtn} onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
