"use client";

import { useEffect, useState } from "react";
import SuperAdminShell from "@/components/super-admin-shell";

export default function SuperAdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("super_admin_token");
      const response = await fetch("/api/super-admin/orders", {
        headers: {
          "x-super-admin-token": token,
        },
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json?.error || "Failed to load orders");
        return;
      }
      setOrders(json.data || []);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const s = search.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(s) ||
      order.customerName?.toLowerCase().includes(s) ||
      order.companyName?.toLowerCase().includes(s)
    );
  });

  const totalCod = orders.reduce((sum, o) => sum + (o.codAmount || 0), 0);
  const uniqueCompanies = new Set(orders.map((o) => o.companyId)).size;

  if (loading) {
    return (
      <SuperAdminShell title="Orders Analytics">
        <div className="flex h-96 items-center justify-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-20"></div>
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-xl">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600"></div>
            </div>
          </div>
        </div>
      </SuperAdminShell>
    );
  }

  return (
    <SuperAdminShell title="Orders Overview">
      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
          <span className="text-lg">⚠️</span>
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="mb-10 grid gap-6 sm:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl border bg-white p-8 transition-all hover:shadow-2xl hover:shadow-indigo-500/10">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-indigo-50 opacity-50 transition-transform group-hover:scale-150"></div>
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-2xl text-white shadow-lg shadow-indigo-200">
              📦
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-500">Total Orders</p>
            <p className="mt-2 text-4xl font-black text-slate-900">{orders.length}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white transition-all hover:shadow-2xl hover:shadow-purple-500/20">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 transition-transform group-hover:scale-150"></div>
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-md">
              💰
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-indigo-100">Total COD Volume</p>
            <p className="mt-2 text-4xl font-black">
              {totalCod.toLocaleString()}<span className="ml-2 text-sm font-medium opacity-70">BDT</span>
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border bg-white p-8 transition-all hover:shadow-2xl hover:shadow-emerald-500/10">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50 transition-transform group-hover:scale-150"></div>
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-2xl text-white shadow-lg shadow-emerald-200">
              🏢
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-500">Partner Companies</p>
            <p className="mt-2 text-4xl font-black text-slate-900">{uniqueCompanies}</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-3xl border bg-white shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col items-start justify-between gap-6 border-b p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Live Order Stream</h2>
            <p className="text-sm text-slate-500">Real-time monitoring of all platform transactions</p>
          </div>
          <div className="relative w-full max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Filter by ID, Customer, or Company..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-8 py-5">Order Context</th>
                <th className="px-8 py-5">Customer Intelligence</th>
                <th className="px-8 py-5">Vendor</th>
                <th className="px-8 py-5 text-right">Settlement</th>
                <th className="px-8 py-5 text-center">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="group hover:bg-indigo-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-indigo-400 opacity-0 transition-opacity group-hover:opacity-100"></div>
                        <div>
                          <div className="font-bold text-slate-900">{order.orderNumber}</div>
                          <div className="text-[10px] font-mono text-slate-400">{order._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-semibold text-slate-700">{order.customerName}</div>
                      <div className="text-xs text-slate-400">{order.customerPhone}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-inset ring-slate-200">
                        {order.companyName}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="text-base font-bold text-slate-900">
                        {order.codAmount?.toLocaleString()}
                        <span className="ml-1 text-[10px] font-medium text-slate-400">BDT</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center text-slate-500">
                      <div className="text-xs font-medium">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] opacity-60">
                        {new Date(order.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl">🔎</span>
                      <p className="mt-4 text-lg font-medium text-slate-900">No matching orders</p>
                      <p className="text-sm text-slate-400">Try adjusting your filters or search terms</p>
                    </div>
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
