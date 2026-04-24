"use client";

import { useEffect, useState } from "react";
import { getCustomerHeaders } from "@/components/customer-api";
import { motion, AnimatePresence } from "framer-motion";

const USAGE_FIELDS = [
  { key: "users", label: "Users", limitKey: "users" },
  { key: "orders", label: "Orders", limitKey: "orders_per_month" },
  { key: "courierOrders", label: "Courier Orders", limitKey: "courier_orders_per_month" },
  { key: "emails", label: "Emails", limitKey: "emails_per_month" },
  { key: "campaigns", label: "Campaigns", limitKey: "campaigns_per_month" },
  { key: "wpPromotions", label: "WP Promotions", limitKey: "wp_promotions_per_month" },
];

export default function DashboardUsagePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usageData, setUsageData] = useState(null);

  useEffect(() => {
    fetch("/api/usage/me", { headers: getCustomerHeaders() })
      .then(r => r.json())
      .then(json => {
        if (json.data) setUsageData(json.data);
        else throw new Error(json.error || "Failed to load usage");
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resource Usage</h1>
          <p className="mt-2 text-slate-500">Monitor your resource consumption for the current billing cycle.</p>
        </div>
        {!loading && (
          <div className="rounded-2xl bg-indigo-50 px-6 py-3 ring-1 ring-indigo-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Current Period</span>
            <p className="text-sm font-bold text-indigo-900">{usageData?.month || "-"}</p>
          </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {USAGE_FIELDS.map((field, i) => {
            const used = Number(usageData?.usage?.[field.key] || 0);
            const limit = Number(usageData?.limits?.[field.limitKey] || 0);
            const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
            const remaining = Math.max(0, limit - used);

            return (
              <motion.div 
                key={field.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{field.label}</h3>
                  <span className={`text-xs font-bold ${percentage > 90 ? "text-rose-600" : "text-indigo-600"}`}>
                    {Math.round(percentage)}%
                  </span>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-full ${percentage > 90 ? "bg-rose-500" : "bg-indigo-600"}`}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Used</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{used}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Limit</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{limit || "∞"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-50 pt-6">
                  <p className="text-xs text-slate-500">
                    <span className="font-bold text-slate-900">{remaining}</span> remaining for this month
                  </p>
                </div>
              </motion.div>
            );
          })}
        </section>
      )}
    </div>
  );
}
