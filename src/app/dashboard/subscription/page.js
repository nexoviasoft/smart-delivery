"use client";

import { useEffect, useState } from "react";
import CustomerDashboardShell from "@/components/customer-dashboard-shell";
import { getCustomerHeaders } from "@/components/customer-api";

export default function DashboardSubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/subscription/me", { headers: getCustomerHeaders() })
      .then((response) => response.json().then((json) => ({ response, json })))
      .then(({ response, json }) => {
        if (!response.ok) {
          setError(json?.error || "No active subscription found");
          setLoading(false);
          return;
        }
        setSubscription(json?.data || null);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load subscription");
        setLoading(false);
      });
  }, []);

  return (
    <CustomerDashboardShell title="Subscription">
      {loading ? (
        <p className="text-sm text-zinc-500">Loading subscription...</p>
      ) : subscription ? (
        <div className="grid gap-3 rounded border p-4 text-sm">
          <p>
            <span className="font-semibold">Package:</span> {subscription?.packageId?.name || "-"}
          </p>
          <p>
            <span className="font-semibold">Billing:</span> {subscription.billingType}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {subscription.status}
          </p>
          <p>
            <span className="font-semibold">Start:</span>{" "}
            {subscription.startsAt ? new Date(subscription.startsAt).toLocaleDateString() : "-"}
          </p>
          <p>
            <span className="font-semibold">Expire:</span>{" "}
            {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : "-"}
          </p>
        </div>
      ) : (
        <p className="rounded bg-amber-50 p-3 text-sm text-amber-700">
          {error || "Subscription not available yet. Please wait for approval."}
        </p>
      )}
    </CustomerDashboardShell>
  );
}
