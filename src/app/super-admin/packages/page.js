"use client";

import { useEffect, useState } from "react";
import SuperAdminShell from "@/components/super-admin-shell";

const SUPER_ADMIN_TOKEN = "hardcoded-super-admin-token";

const EMPTY_FORM = {
  name: "",
  priceMonthly: "",
  priceYearly: "",
  users: "",
  ordersPerMonth: "",
  courierOrdersPerMonth: "",
};

export default function SuperAdminPackagesPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadPackages() {
    const response = await fetch("/api/packages");
    const json = await response.json();
    if (!response.ok) {
      setError(json?.message || "Failed to load packages");
      setLoading(false);
      return;
    }
    setPackages(json?.packages || []);
    setLoading(false);
  }

  useEffect(() => {
    fetch("/api/packages")
      .then((response) => response.json().then((json) => ({ response, json })))
      .then(({ response, json }) => {
        if (!response.ok) {
          setError(json?.message || "Failed to load packages");
          setLoading(false);
          return;
        }
        setPackages(json?.packages || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load packages");
        setLoading(false);
      });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/packages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-super-admin-token": SUPER_ADMIN_TOKEN,
      },
      body: JSON.stringify({
        name: form.name,
        priceMonthly: Number(form.priceMonthly || 0),
        priceYearly: Number(form.priceYearly || 0),
        limits: {
          users: Number(form.users || 1),
          orders_per_month: Number(form.ordersPerMonth || 0),
          courier_orders_per_month: Number(form.courierOrdersPerMonth || 0),
        },
      }),
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json?.message || "Failed to create package");
      setSubmitting(false);
      return;
    }

    setMessage("Package created successfully");
    setForm(EMPTY_FORM);
    setSubmitting(false);
    setLoading(true);
    await loadPackages();
  }

  return (
    <SuperAdminShell title="Packages">
      <form onSubmit={handleSubmit} className="grid gap-3 rounded border p-4">
        <h2 className="text-lg font-semibold">Create Package</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded border p-2"
            placeholder="Package name"
            value={form.name}
            onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
            required
          />
          <input
            className="rounded border p-2"
            placeholder="Monthly price"
            type="number"
            min="0"
            value={form.priceMonthly}
            onChange={(event) =>
              setForm((state) => ({ ...state, priceMonthly: event.target.value }))
            }
          />
          <input
            className="rounded border p-2"
            placeholder="Yearly price"
            type="number"
            min="0"
            value={form.priceYearly}
            onChange={(event) => setForm((state) => ({ ...state, priceYearly: event.target.value }))}
          />
          <input
            className="rounded border p-2"
            placeholder="Users limit"
            type="number"
            min="1"
            value={form.users}
            onChange={(event) => setForm((state) => ({ ...state, users: event.target.value }))}
          />
          <input
            className="rounded border p-2"
            placeholder="Orders/month limit"
            type="number"
            min="0"
            value={form.ordersPerMonth}
            onChange={(event) =>
              setForm((state) => ({ ...state, ordersPerMonth: event.target.value }))
            }
          />
          <input
            className="rounded border p-2"
            placeholder="Courier orders/month limit"
            type="number"
            min="0"
            value={form.courierOrdersPerMonth}
            onChange={(event) =>
              setForm((state) => ({ ...state, courierOrdersPerMonth: event.target.value }))
            }
          />
        </div>
        <button
          className="w-fit rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Package"}
        </button>
        {message && <p className="rounded bg-emerald-50 p-2 text-sm text-emerald-700">{message}</p>}
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      </form>

      <div className="mt-6 rounded border p-4">
        <h2 className="text-lg font-semibold">Package Table</h2>
        {loading ? (
          <p className="mt-3 text-sm text-zinc-500">Loading packages...</p>
        ) : (
          <div className="mt-3 overflow-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-100 text-left">
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Monthly</th>
                  <th className="border p-2">Yearly</th>
                  <th className="border p-2">Users</th>
                  <th className="border p-2">Orders/Month</th>
                  <th className="border p-2">Courier/Month</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg._id}>
                    <td className="border p-2">{pkg.name}</td>
                    <td className="border p-2">{pkg.priceMonthly}</td>
                    <td className="border p-2">{pkg.priceYearly}</td>
                    <td className="border p-2">{pkg?.limits?.users ?? "-"}</td>
                    <td className="border p-2">{pkg?.limits?.orders_per_month ?? "-"}</td>
                    <td className="border p-2">{pkg?.limits?.courier_orders_per_month ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SuperAdminShell>
  );
}
