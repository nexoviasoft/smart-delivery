"use client";

import { useEffect, useState } from "react";
import CustomerDashboardShell from "@/components/customer-dashboard-shell";
import { getCustomerHeaders } from "@/components/customer-api";

const EMPTY_FORM = {
  orderNumber: "",
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  codAmount: "",
  notes: "",
};

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function loadOrders() {
    setLoading(true);
    fetch("/api/orders", { headers: getCustomerHeaders() })
      .then((response) => response.json().then((json) => ({ response, json })))
      .then(({ response, json }) => {
        if (!response.ok) {
          setError(json?.error || "Failed to load orders");
          setLoading(false);
          return;
        }
        setOrders(Array.isArray(json?.data) ? json.data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders");
        setLoading(false);
      });
  }

  useEffect(() => {
    fetch("/api/orders", { headers: getCustomerHeaders() })
      .then((response) => response.json().then((json) => ({ response, json })))
      .then(({ response, json }) => {
        if (!response.ok) {
          setError(json?.error || "Failed to load orders");
          setLoading(false);
          return;
        }
        setOrders(Array.isArray(json?.data) ? json.data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load orders");
        setLoading(false);
      });
  }, []);

  function onChange(field, value) {
    setForm((state) => ({ ...state, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    fetch("/api/orders", {
      method: "POST",
      headers: getCustomerHeaders(),
      body: JSON.stringify({
        ...form,
        codAmount: Number(form.codAmount || 0),
      }),
    })
      .then((response) => response.json().then((json) => ({ response, json })))
      .then(async ({ response, json }) => {
        if (!response.ok) {
          setError(json?.error || "Failed to create order");
          setSubmitting(false);
          return;
        }
        setMessage("Order created successfully");
        setForm(EMPTY_FORM);
        setSubmitting(false);
        loadOrders();
      })
      .catch(() => {
        setError("Failed to create order");
        setSubmitting(false);
      });
  }

  return (
    <CustomerDashboardShell title="Orders">
      <form onSubmit={handleSubmit} className="rounded border p-4">
        <h2 className="text-lg font-semibold">Create Order</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="rounded border p-2"
            placeholder="Order number"
            value={form.orderNumber}
            onChange={(event) => onChange("orderNumber", event.target.value)}
            required
          />
          <input
            className="rounded border p-2"
            placeholder="Customer name"
            value={form.customerName}
            onChange={(event) => onChange("customerName", event.target.value)}
            required
          />
          <input
            className="rounded border p-2"
            placeholder="Customer phone"
            value={form.customerPhone}
            onChange={(event) => onChange("customerPhone", event.target.value)}
            required
          />
          <input
            className="rounded border p-2"
            placeholder="COD amount"
            type="number"
            min="0"
            value={form.codAmount}
            onChange={(event) => onChange("codAmount", event.target.value)}
            required
          />
          <input
            className="rounded border p-2 md:col-span-2"
            placeholder="Customer address"
            value={form.customerAddress}
            onChange={(event) => onChange("customerAddress", event.target.value)}
            required
          />
          <textarea
            className="rounded border p-2 md:col-span-2"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            rows={2}
          />
        </div>
        <button
          type="submit"
          className="mt-3 rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Order"}
        </button>
      </form>

      {message && <p className="mt-3 rounded bg-emerald-50 p-2 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 rounded border p-4">
        <h2 className="text-lg font-semibold">Order List</h2>
        {loading ? (
          <p className="mt-3 text-sm text-zinc-500">Loading orders...</p>
        ) : (
          <div className="mt-3 overflow-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-100 text-left">
                  <th className="border p-2">Order No</th>
                  <th className="border p-2">Customer</th>
                  <th className="border p-2">Phone</th>
                  <th className="border p-2">Address</th>
                  <th className="border p-2">COD</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="border p-2">{order.orderNumber}</td>
                    <td className="border p-2">{order.customerName}</td>
                    <td className="border p-2">{order.customerPhone}</td>
                    <td className="border p-2">{order.customerAddress}</td>
                    <td className="border p-2">{order.codAmount}</td>
                    <td className="border p-2 capitalize">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CustomerDashboardShell>
  );
}
