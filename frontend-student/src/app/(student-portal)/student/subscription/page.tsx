"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getActiveSubscription, getSubscriptionHistory } from "@/api/modules/student/student.api";
import type { Subscription, SubscriptionHistory } from "@/api/types";
import styles from "../subpage.module.css";

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [subRes, histRes] = await Promise.allSettled([
          getActiveSubscription(),
          getSubscriptionHistory(),
        ]);
        if (subRes.status === "fulfilled") setSubscription(subRes.value.data);
        if (histRes.status === "fulfilled") setHistory(histRes.value.data.results ?? []);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className={styles.loading}><div className={styles.spinner} /></div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}> Subscription</h1>
        <p className={styles.pageSub}>Manage your active transport subscription</p>
      </div>

      {subscription ? (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Active Subscription</div>
          <div className={styles.grid2}>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Line</div>
              <div className={styles.detailValue}>{subscription.line_detail?.name ?? "—"}</div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Status</div>
              <div className={styles.detailValue}>
                <span className={subscription.is_active ? styles.badgeGreen : styles.badgeRed}>
                  {subscription.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>Start Date</div>
              <div className={styles.detailValue}>
                {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString("en-GB") : "—"}
              </div>
            </div>
            <div className={styles.detailItem}>
              <div className={styles.detailLabel}>End Date</div>
              <div className={styles.detailValue}>
                {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString("en-GB") : "Ongoing"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <p>No active subscription found.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Contact your transport manager to get assigned to a line.</p>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <Link href="/student/request-change" className={styles.btnPrimary}>Request Line Change</Link>
        <Link href="/student/subscription-history" className={styles.btnSecondary}>View History</Link>
      </div>
    </div>
  );
}
