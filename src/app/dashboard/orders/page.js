"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { getCustomerHeaders } from "@/components/customer-api";
import DataTable from "@/components/dashboard/DataTable";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload } from "lucide-react";

const EMPTY_FORM = {
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  codAmount: "",
  itemName: "",
  itemQuantity: "1",
  itemPrice: "0",
  notes: "",
};

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  async function loadOrders() {
    setLoading(true);
    try {
      const response = await fetch("/api/orders", { headers: getCustomerHeaders() });
      const json = await response.json();
      if (!response.ok) {
        setError(json?.error || "Failed to load orders");
        return;
      }
      setOrders(Array.isArray(json?.data) ? json.data : []);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function onChange(field, value) {
    setForm((state) => ({ ...state, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: getCustomerHeaders(),
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerAddress: form.customerAddress,
          codAmount: Number(form.codAmount || 0),
          orderItems: [
            {
              name: form.itemName.trim(),
              quantity: Math.max(1, Number(form.itemQuantity || 1)),
              price: Math.max(0, Number(form.itemPrice || 0)),
            },
          ],
          notes: form.notes,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json?.error || "Failed to create order");
        setSubmitting(false);
        return;
      }
      setMessage("Order created successfully");
      setForm(EMPTY_FORM);
      loadOrders();
      setActiveTab("list");
    } catch {
      setError("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setMessage("");
    setUploadFileName(file.name);

    try {
      const reader = new FileReader();
      const buffer = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsArrayBuffer(file);
      });
      
      const workbook = XLSX.read(buffer, { type: "array" });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });

      if (!rows.length) {
        setError("No data found in file");
        setUploading(false);
        return;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: getCustomerHeaders(),
        body: JSON.stringify({ orders: rows }),
      });
      const json = await response.json();

      if (!response.ok) {
        setError(json?.error || "Bulk upload failed");
        setUploading(false);
        return;
      }

      const createdCount = Number(json?.data?.createdCount || 0);
      const failedCount = Number(json?.data?.failedCount || 0);
      setMessage(`Bulk upload complete: ${createdCount} created, ${failedCount} failed.`);
      loadOrders();
      setActiveTab("list");
    } catch {
      setError("Failed to parse file. Please upload a valid Excel/CSV file.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const columns = [
    { 
      header: "Order No", 
      accessor: "orderNumber",
      render: (row) => <span className="font-mono font-bold text-slate-900">{row.orderNumber}</span>
    },
    { 
      header: "Customer", 
      accessor: "customerName",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.customerName}</span>
          <span className="text-xs text-slate-500">{row.customerPhone}</span>
        </div>
      )
    },
    { header: "Address", accessor: "customerAddress" },
    { 
      header: "COD", 
      accessor: "codAmount",
      render: (row) => <span className="font-bold text-slate-900">${row.codAmount}</span>
    },
    { 
      header: "Status", 
      accessor: "status",
      render: (row) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
          row.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
        }`}>
          {row.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Orders</h1>
          <p className="mt-2 text-slate-500">Create, manage, and track your customer orders.</p>
        </div>
        <div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5">
          <button 
            onClick={() => setActiveTab("list")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Order List
          </button>
          <button 
            onClick={() => setActiveTab("create")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === "create" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Create Order
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200"
          >
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-200"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab === "create" ? (
          <motion.div 
            key="create"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="grid gap-8 lg:grid-cols-2"
          >
            <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8">
              <h2 className="text-lg font-bold text-slate-900">Create New Order</h2>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Name</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-600"
                    placeholder="John Doe"
                    value={form.customerName}
                    onChange={(e) => onChange("customerName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-600"
                    placeholder="+1 234 567 890"
                    value={form.customerPhone}
                    onChange={(e) => onChange("customerPhone", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">COD Amount</label>
                  <input
                    type="number" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-600"
                    placeholder="0.00"
                    value={form.codAmount}
                    onChange={(e) => onChange("codAmount", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Address</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-600"
                    placeholder="123 Main St, City"
                    value={form.customerAddress}
                    onChange={(e) => onChange("customerAddress", e.target.value)}
                    required
                  />
                </div>
                <div className="sm:col-span-2 space-y-4 rounded-2xl bg-slate-50 p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-1 space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Item</label>
                      <input className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none" value={form.itemName} onChange={(e) => onChange("itemName", e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Qty</label>
                      <input type="number" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none" value={form.itemQuantity} onChange={(e) => onChange("itemQuantity", e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Price</label>
                      <input type="number" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none" value={form.itemPrice} onChange={(e) => onChange("itemPrice", e.target.value)} required />
                    </div>
                  </div>
                </div>
                <button
                  type="submit" disabled={submitting}
                  className="sm:col-span-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-black disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Create Order"}
                </button>
              </form>
            </section>

            <section className="flex flex-col space-y-6 rounded-3xl border border-slate-200 bg-white p-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Bulk Upload</h2>
                <p className="mt-1 text-sm text-slate-500">Import orders from Excel or CSV files.</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-8 transition-colors hover:border-indigo-400">
                <input
                  type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkUpload} disabled={uploading}
                  className="hidden" id="bulk-upload"
                />
                <label htmlFor="bulk-upload" className="flex cursor-pointer flex-col items-center gap-3">
                  <div className="rounded-full bg-slate-100 p-4 text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <CloudUpload className="h-8 w-8" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">Click to upload or drag and drop</span>
                  <span className="text-xs text-slate-500">Support for .xlsx, .xls, .csv</span>
                </label>
                {uploadFileName && (
                  <p className="mt-4 text-xs font-medium text-indigo-600">Selected: {uploadFileName}</p>
                )}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.section 
            key="list"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
          >
            <DataTable 
              title="Order List" 
              subtitle="View and manage all your customer orders."
              columns={columns} 
              data={orders} 
              emptyMessage="No orders found. Create your first order above."
            />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
