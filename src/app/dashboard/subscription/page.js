"use client";

import { useEffect, useState } from "react";
import { getCustomerHeaders } from "@/components/customer-api";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Check } from "lucide-react";

export default function DashboardSubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/subscription/me", { headers: getCustomerHeaders() }).then(r => r.json()),
      fetch("/api/packages").then(r => r.json()),
    ])
      .then(([subRes, pkgRes]) => {
        const sub = subRes?.data || null;
        setSubscription(sub);
        if (sub?.packageId?._id) setSelectedPackageId(String(sub.packageId._id));
        setPackages(pkgRes?.packages || []);
      })
      .catch(() => setError("Failed to load subscription info"))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgradeRequest(event) {
    event.preventDefault();
    if (!selectedPackageId) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: getCustomerHeaders(),
        body: JSON.stringify({ packageId: selectedPackageId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upgrade request failed");
      setMessage(json?.data?.message || "Upgrade request submitted successfully.");
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Subscription</h1>
        <p className="mt-2 text-slate-500">Manage your plan and billing preferences.</p>
      </header>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <section className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Current Plan</h2>
            {loading ? (
              <div className="mt-6 flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              </div>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {[
                  { label: "Plan Name", val: subscription?.packageId?.name || "No active plan" },
                  { label: "Billing Cycle", val: subscription?.billingType || "-" },
                  { label: "Status", val: subscription?.status || "-", color: "text-emerald-600" },
                  { label: "Next Billing", val: subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : "-" }
                ].map((item, i) => (
                  <div key={i} className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                    <p className={`mt-1 text-lg font-bold ${item.color || "text-slate-900"}`}>{item.val}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Available Packages</h2>
              <p className="text-sm text-slate-500">Choose a plan that fits your growth</p>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => {
                const isActive = subscription?.packageId?._id === pkg._id;
                const isSelected = selectedPackageId === pkg._id;
                
                return (
                  <motion.div
                    key={pkg._id}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => !isActive && setSelectedPackageId(pkg._id)}
                    className={`relative cursor-pointer rounded-[2rem] border-2 p-6 transition-all ${
                      isActive 
                        ? "border-emerald-500 bg-emerald-50/30 ring-4 ring-emerald-500/10" 
                        : isSelected
                          ? "border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-600/10"
                          : "border-slate-100 bg-white hover:border-slate-200 shadow-sm"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -top-3 left-6 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase text-white shadow-lg">
                        Active Plan
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-slate-900">{pkg.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">{pkg.description || "Perfect for growing businesses"}</p>
                      </div>
                      
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900">${pkg.priceMonthly}</span>
                        <span className="text-xs text-slate-500">/mo</span>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { label: "Users", val: pkg.limits?.users },
                            { label: "Orders/mo", val: pkg.limits?.orders_per_month },
                            { label: "Courier Orders/mo", val: pkg.limits?.courier_orders_per_month },
                            { label: "Emails/mo", val: pkg.limits?.emails_per_month },
                            { label: "Campaigns/mo", val: pkg.limits?.campaigns_per_month },
                            { label: "WP Promotions/mo", val: pkg.limits?.wp_promotions_per_month },
                          ].map((limit, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              <span className="font-bold text-slate-900">{limit.val}</span> {limit.label}
                            </div>
                          ))}
                        </div>
                        
                        <div className="h-px bg-slate-100 my-2" />
                        
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { label: "Order System", enabled: pkg.features?.order_system },
                            { label: "Courier System", enabled: pkg.features?.courier_system },
                            { label: "Email Marketing", enabled: pkg.features?.email_marketing },
                            { label: "WP Promotion", enabled: pkg.features?.wp_promotion },
                          ].map((feature, idx) => (
                            <div key={idx} className={`flex items-center gap-2 text-[11px] font-medium ${feature.enabled ? "text-slate-600" : "text-slate-300 line-through"}`}>
                              <BadgeCheck className={`h-3.5 w-3.5 shrink-0 ${feature.enabled ? "text-indigo-500" : "text-slate-200"}`} />
                              {feature.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`mt-4 rounded-xl py-2.5 text-center text-xs font-bold transition-all ${
                        isActive 
                          ? "bg-emerald-100 text-emerald-700" 
                          : isSelected
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                            : "bg-slate-50 text-slate-600 group-hover:bg-slate-100"
                      }`}>
                        {isActive ? "Currently Active" : isSelected ? "Selected Plan" : "Select Plan"}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {!loading && packages.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <h2 className="text-lg font-bold text-slate-900">Confirm Upgrade</h2>
                <p className="mt-1 text-sm text-slate-500">Submit your request to upgrade to the selected plan.</p>
                
                <form onSubmit={handleUpgradeRequest} className="mt-6">
                  <button 
                    type="submit" 
                    disabled={submitting || !selectedPackageId || subscription?.packageId?._id === selectedPackageId} 
                    className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-black disabled:opacity-50"
                  >
                    {submitting ? "Processing Request..." : "Submit Upgrade Request"}
                  </button>
                </form>
              </div>
            )}
          </section>
        </section>

        <aside className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <h3 className="font-bold text-slate-900">Billing FAQ</h3>
            <div className="mt-6 space-y-4">
              {[
                { q: "How do I cancel?", a: "Contact support at least 3 days before your next billing cycle." },
                { q: "Can I switch cycles?", a: "Yes, you can switch between monthly and yearly billing anytime." }
              ].map((faq, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs font-bold text-slate-900">{faq.q}</p>
                  <p className="text-xs text-slate-500">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
