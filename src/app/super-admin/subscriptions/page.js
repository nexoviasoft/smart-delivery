"use client";

import { useEffect, useState } from "react";
import SuperAdminShell from "@/components/super-admin-shell";

const SUPER_ADMIN_TOKEN = "hardcoded-super-admin-token";

export default function SuperAdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadSubscriptions() {
    setError("");
    const response = await fetch("/api/super-admin/subscriptions", {
      headers: {
        "x-super-admin-token": SUPER_ADMIN_TOKEN,
      },
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json?.error || "Failed to load subscriptions");
      setLoading(false);
      return;
    }
    setSubscriptions(json?.data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function handleApprove(id) {
    setApprovingId(id);
    setError("");
    setMessage("");

    const response = await fetch(`/api/super-admin/subscriptions/${id}/approve`, {
      method: "POST",
      headers: {
        "x-super-admin-token": SUPER_ADMIN_TOKEN,
      },
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json?.error || "Approve failed");
      setApprovingId("");
      return;
    }

    setMessage("Subscription approved successfully");
    setApprovingId("");
    setLoading(true);
    await loadSubscriptions();
  }

  const filteredSubscriptions = subscriptions.filter(s => {
    const term = search.toLowerCase();
    return (
      s.companyId?.name?.toLowerCase().includes(term) ||
      s.companyId?.email?.toLowerCase().includes(term) ||
      s.packageId?.name?.toLowerCase().includes(term)
    );
  });

  const pendingCount = subscriptions.filter(s => s.status === "pending").length;
  const activeCount = subscriptions.filter(s => s.status === "active").length;

  if (loading && subscriptions.length === 0) {
    return (
      <SuperAdminShell title="Subscription Governance">
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
        </div>
      </SuperAdminShell>
    );
  }

  return (
    <SuperAdminShell title="Revenue & Subscriptions">
      {/* Summary Cards */}
      <div className="mb-10 grid gap-6 sm:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl border bg-white p-8 transition-all hover:shadow-2xl hover:shadow-indigo-500/10">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-50 opacity-50 transition-transform group-hover:scale-150"></div>
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-2xl text-white shadow-lg shadow-indigo-200">
              ⚡
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-500">Active Licenses</p>
            <p className="mt-2 text-4xl font-black text-slate-900">{activeCount}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border bg-white p-8 transition-all hover:shadow-2xl hover:shadow-amber-500/10">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-50 opacity-50 transition-transform group-hover:scale-150"></div>
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-2xl text-white shadow-lg shadow-amber-200">
              ⏳
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-500">Pending Approvals</p>
            <p className="mt-2 text-4xl font-black text-slate-900">{pendingCount}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white transition-all hover:shadow-2xl hover:shadow-emerald-500/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 transition-transform group-hover:scale-150"></div>
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-md">
              💎
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-emerald-50">Total Accounts</p>
            <p className="mt-2 text-4xl font-black">{subscriptions.length}</p>
          </div>
        </div>
      </div>

      {message && <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-600 border border-emerald-100">{message}</div>}
      {error && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100">{error}</div>}

      {/* Main Table */}
      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col items-start justify-between gap-6 border-b p-8 bg-slate-50/50 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Subscription Registry</h2>
            <p className="text-sm text-slate-500">Authorized control for partner access</p>
          </div>
          <div className="relative w-full max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search companies or packages..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-8 py-5">Partner Identity</th>
                <th className="px-8 py-5">Selected Tier</th>
                <th className="px-8 py-5">Billing Cycle</th>
                <th className="px-8 py-5">Lifecycle Status</th>
                <th className="px-8 py-5 text-right">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub._id} className="group hover:bg-indigo-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900">{sub?.companyId?.name || "Unknown"}</div>
                    <div className="text-[10px] font-mono text-slate-400">{sub?.companyId?.email}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-600 ring-1 ring-inset ring-indigo-200">
                      {sub?.packageId?.name || "No Tier"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-bold text-slate-700 capitalize">{sub.billingType}</div>
                    <div className="text-[10px] text-slate-400">Recurring Settlement</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        sub.status === 'active' ? 'bg-emerald-500 animate-pulse' : 
                        sub.status === 'pending' ? 'bg-amber-500' : 'bg-slate-300'
                      }`}></div>
                      <span className={`text-[11px] font-bold uppercase tracking-wide ${
                        sub.status === 'active' ? 'text-emerald-600' : 
                        sub.status === 'pending' ? 'text-amber-600' : 'text-slate-500'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {sub.expiresAt ? `Expires ${new Date(sub.expiresAt).toLocaleDateString()}` : 'No Expiry'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {sub.status === "pending" ? (
                      <button
                        onClick={() => handleApprove(sub._id)}
                        disabled={approvingId === sub._id}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-[11px] font-bold text-white shadow-lg transition-all hover:bg-indigo-600 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                      >
                        {approvingId === sub._id ? "Processing..." : "Approve License"}
                      </button>
                    ) : (
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Validated
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredSubscriptions.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-500">
                    No subscriptions found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminShell>
  );
}
