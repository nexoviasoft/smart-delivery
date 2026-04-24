"use client";

import { useEffect, useState } from "react";
import { getCustomerHeaders } from "@/components/customer-api";
import DataTable from "@/components/dashboard/DataTable";
import { motion, AnimatePresence } from "framer-motion";

const COURIER_OPTIONS = [{ value: "steadfast", label: "Steadfast Courier" }];

const EMPTY_FORM = {
  id: "",
  courierType: "steadfast",
  apiKey: "",
  secretKey: "",
  baseUrl: "",
  isActive: true,
  isDefault: false,
};

function mapSettingToForm(setting) {
  return {
    id: setting._id ? String(setting._id) : "",
    courierType: setting.courierType || "steadfast",
    apiKey: setting.apiKey || "",
    secretKey: setting.secretKey || "",
    baseUrl: setting.baseUrl || "",
    isActive: Boolean(setting.isActive),
    isDefault: Boolean(setting.isDefault),
  };
}

export default function DashboardCourierSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSettings() {
    setLoading(true);
    try {
      const response = await fetch("/api/courier-settings", { headers: getCustomerHeaders() });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || "Failed to load settings");
      const fetchedSettings = Array.isArray(json?.data) ? json.data : [];
      setSettings(fetchedSettings);
      const selected = fetchedSettings.find((i) => i.courierType === form.courierType) || fetchedSettings.find((i) => i.isDefault) || fetchedSettings[0];
      if (selected) setForm(mapSettingToForm(selected));
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  useEffect(() => { loadSettings(); }, []);

  function handleChange(field, value) {
    if (field === "courierType") {
      const existing = settings.find((i) => i.courierType === value);
      setForm(existing ? mapSettingToForm(existing) : { ...EMPTY_FORM, courierType: value });
    } else {
      setForm((s) => ({ ...s, [field]: value }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/courier-settings", {
        method: "PATCH",
        headers: getCustomerHeaders(),
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save setting");
      setMessage("Courier setting saved successfully");
      loadSettings();
    } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  }

  const columns = [
    { 
      header: "Courier", 
      accessor: "courierType",
      render: (row) => <span className="font-bold text-slate-900 capitalize">{row.courierType}</span>
    },
    { header: "Base URL", accessor: "baseUrl" },
    { header: "API Key", accessor: "apiKey" },
    { 
      header: "Status", 
      accessor: "isActive",
      render: (row) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
          row.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
        }`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      )
    },
    { 
      header: "Default", 
      accessor: "isDefault",
      render: (row) => row.isDefault ? (
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600">Default</span>
      ) : <span className="text-slate-400 text-xs">-</span>
    }
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Courier Settings</h1>
        <p className="mt-2 text-slate-500">Configure your courier integrations and API keys.</p>
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

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-lg font-bold text-slate-900">Setup Integration</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Courier Service</label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 transition-all"
                  value={form.courierType}
                  onChange={(e) => handleChange("courierType", e.target.value)}
                >
                  {COURIER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Base URL</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 transition-all"
                  placeholder="https://api.steadfast.com.bd"
                  value={form.baseUrl}
                  onChange={(e) => handleChange("baseUrl", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">API Key</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 transition-all"
                  placeholder="Enter API Key"
                  value={form.apiKey}
                  onChange={(e) => handleChange("apiKey", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Secret Key</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-600 transition-all"
                  placeholder="Enter Secret Key"
                  value={form.secretKey}
                  onChange={(e) => handleChange("secretKey", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-6">
              <label className="flex cursor-pointer items-center justify-between">
                <div>
                  <span className="block font-bold text-slate-900">Active Integration</span>
                  <span className="text-xs text-slate-500">Enable this courier for shipments.</span>
                </div>
                <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-indigo-600" checked={form.isActive} onChange={(e) => handleChange("isActive", e.target.checked)} />
              </label>
              <div className="h-px bg-slate-200" />
              <label className="flex cursor-pointer items-center justify-between">
                <div>
                  <span className="block font-bold text-slate-900">Set as Default</span>
                  <span className="text-xs text-slate-500">Automatically use this for new orders.</span>
                </div>
                <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-indigo-600" checked={form.isDefault} onChange={(e) => handleChange("isDefault", e.target.checked)} />
              </label>
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-black disabled:opacity-50"
            >
              {submitting ? "Saving Configuration..." : "Save Configuration"}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <h3 className="font-bold text-slate-900">Quick Guide</h3>
            <ul className="mt-4 space-y-4 text-sm text-slate-500">
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">1</span>
                Get your API & Secret keys from your courier dashboard.
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">2</span>
                Enter the Base URL provided in their API documentation.
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">3</span>
                Test with a single order before bulk sending.
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <section>
        <DataTable 
          title="Saved Settings" 
          subtitle="Manage your connected courier services."
          columns={columns} 
          data={settings} 
          emptyMessage="No courier settings found. Add your first integration above."
        />
      </section>
    </div>
  );
}
