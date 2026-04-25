"use client";

import { useState, useEffect } from "react";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [timeFormat, setTimeFormat] = useState("12h");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("unitrans_theme");
    if (stored === "dark") {
      setTheme("dark");
      document.documentElement.dataset.theme = "dark";
    } else {
      setTheme("light");
    }
  }, []);

  const handleThemeChange = (val: "light" | "dark") => {
    setTheme(val);
    if (val === "dark") {
      document.documentElement.dataset.theme = "dark";
    } else {
      delete document.documentElement.dataset.theme;
    }
    localStorage.setItem("unitrans_theme", val);
  };

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
            <span className={styles.settingName}>Appearance</span>
            <span className={styles.settingDesc}>Choose between light and dark color theme for the portal</span>
          </div>
          <div className={styles.themeSelector}>
            <button
              className={`${styles.themeBtn} ${theme === "light" ? styles.themeBtnActive : ""}`}
              onClick={() => handleThemeChange("light")}
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              Light
            </button>
            <button
              className={`${styles.themeBtn} ${theme === "dark" ? styles.themeBtnActive : ""}`}
              onClick={() => handleThemeChange("dark")}
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              Dark
            </button>
          </div>
        </div>

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
