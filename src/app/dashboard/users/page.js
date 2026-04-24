"use client";

import { useEffect, useState } from "react";
import { getCustomerHeaders } from "@/components/customer-api";
import DataTable from "@/components/dashboard/DataTable";
import { motion, AnimatePresence } from "framer-motion";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "staff",
};

export default function DashboardUsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users", { headers: getCustomerHeaders() });
      const json = await res.json();
      if (res.ok) setUsers(Array.isArray(json?.data) ? json.data : []);
      else throw new Error(json?.error || "Failed to load users");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadUsers(); }, []);

  function handleChange(field, value) {
    setForm((state) => ({ ...state, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: getCustomerHeaders(),
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create user");
      setMessage("User created successfully");
      setForm(EMPTY_FORM);
      loadUsers();
      setActiveTab("list");
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  const columns = [
    { 
      header: "Name", 
      accessor: "name",
      render: (row) => <span className="font-bold text-slate-900">{row.name}</span>
    },
    { header: "Email", accessor: "email" },
    { 
      header: "Role", 
      accessor: "role",
      render: (row) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
          row.role === "admin" ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-600"
        }`}>
          {row.role}
        </span>
      )
    },
    { 
      header: "Status", 
      accessor: "isActive",
      render: (row) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
          row.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
        }`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="mt-2 text-slate-500">Add and manage staff members for your dashboard.</p>
        </div>
        <div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5">
          <button 
            onClick={() => setActiveTab("list")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            User List
          </button>
          <button 
            onClick={() => setActiveTab("create")}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === "create" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Create User
          </button>
        </div>
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

      <AnimatePresence mode="wait">
        {activeTab === "create" ? (
          <motion.div 
            key="create"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="max-w-xl mx-auto"
          >
            <section className="rounded-3xl border border-slate-200 bg-white p-8">
              <h2 className="text-xl font-bold text-slate-900">Create New User</h2>
              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                  <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-600 transition-all" placeholder="e.g. John Doe" value={form.name} onChange={e => handleChange("name", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                  <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-600 transition-all" type="email" placeholder="john@example.com" value={form.email} onChange={e => handleChange("email", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                  <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-600 transition-all" type="password" placeholder="••••••••" value={form.password} onChange={e => handleChange("password", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Role</label>
                  <select className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-600 transition-all" value={form.role} onChange={e => handleChange("role", e.target.value)}>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-black disabled:opacity-50">
                  {submitting ? "Creating User..." : "Create User"}
                </button>
              </form>
            </section>
          </motion.div>
        ) : (
          <motion.section 
            key="list"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
          >
            <DataTable title="System Users" subtitle="List of all accounts with access to this dashboard." columns={columns} data={users} emptyMessage="No users found. Create your first user account using the form." />
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
