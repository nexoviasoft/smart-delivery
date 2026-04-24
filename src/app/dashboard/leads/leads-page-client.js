"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import { getCustomerHeaders } from "@/components/customer-api";
import { motion, AnimatePresence } from "framer-motion";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LeadsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCampaignId = searchParams.get("campaignId") || "";

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaignId);
  const [leads, setLeads] = useState([]);
  const [count, setCount] = useState(0);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [error, setError] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [emailSending, setEmailSending] = useState(false);

  const selectedCampaign = campaigns.find((item) => String(item._id) === String(selectedCampaignId)) || null;
  const selectedLeadSet = useMemo(() => new Set(selectedLeadIds.map(String)), [selectedLeadIds]);
  const allLeadIds = useMemo(() => leads.map((lead) => String(lead._id)), [leads]);
  const allSelected = allLeadIds.length > 0 && allLeadIds.every((id) => selectedLeadSet.has(id));

  useEffect(() => {
    fetch("/api/campaigns", { headers: getCustomerHeaders() })
      .then((r) => r.json())
      .then((json) => {
        const items = Array.isArray(json?.data) ? json.data : [];
        setCampaigns(items);
        if (!selectedCampaignId && items.length) setSelectedCampaignId(String(items[0]._id));
      })
      .catch(() => setError("Failed to load campaigns"))
      .finally(() => setLoadingCampaigns(false));
  }, []);

  useEffect(() => {
    if (!selectedCampaignId) return;
    setLoadingLeads(true);
    setError("");
    setSelectedLeadIds([]);

    fetch(`/api/campaigns/${selectedCampaignId}/leads`, { headers: getCustomerHeaders() })
      .then((r) => r.json())
      .then((json) => {
        setLeads(Array.isArray(json?.data?.leads) ? json.data.leads : []);
        setCount(Number(json?.data?.count || 0));
      })
      .catch(() => setError("Failed to load leads"))
      .finally(() => setLoadingLeads(false));
  }, [selectedCampaignId]);

  function toggleLeadSelection(leadId) {
    const id = String(leadId);
    setSelectedLeadIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function toggleSelectAllLeads() {
    if (allSelected) setSelectedLeadIds([]);
    else setSelectedLeadIds(allLeadIds);
  }

  function normalizeKey(value) {
    return String(value || "").trim().replace(/\s+/g, " ").slice(0, 80);
  }

  function findAnswerByField(answers, field) {
    if (!answers || !field) return "";
    const baseKey = normalizeKey(field.label) || String(field.key || "");
    if (!baseKey) return "";
    if (Object.prototype.hasOwnProperty.call(answers, baseKey)) return answers[baseKey];
    const keys = Object.keys(answers);
    const matchedKey = keys.find((k) => k === baseKey || k.startsWith(baseKey));
    return matchedKey ? answers[matchedKey] : "";
  }

  function sanitizePhoneDigits(value) {
    return String(value || "").replace(/[^\d]/g, "");
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function handleExport(type) {
    setError("");
    if (!selectedCampaignId) return setError("Select a campaign first.");

    const leadSource = selectedLeadIds.length ? leads.filter((l) => selectedLeadSet.has(String(l._id))) : leads;
    
    if (type === "phone") {
      const phoneField = (selectedCampaign?.fields || []).find((f) => f.type === "phone");
      const nameField = (selectedCampaign?.fields || []).find((f) => f.type === "text" && /name/i.test(f.label || f.key)) || (selectedCampaign?.fields || []).find((f) => f.type === "text");
      if (!phoneField || !nameField) return setError("Campaign lacks name/phone fields.");
      
      const data = leadSource.map(l => ({ Name: findAnswerByField(l.answers, nameField), Phone: sanitizePhoneDigits(findAnswerByField(l.answers, phoneField)) })).filter(d => d.Phone);
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      XLSX.writeFile(wb, "wp-recipients.xlsx");
    } else {
      const emailField = (selectedCampaign?.fields || []).find((f) => f.type === "email");
      const nameField = (selectedCampaign?.fields || []).find((f) => f.type === "text" && /name/i.test(f.label || f.key)) || (selectedCampaign?.fields || []).find((f) => f.type === "text");
      if (!emailField || !nameField) return setError("Campaign lacks name/email fields.");

      const data = leadSource.map(l => ({ Name: findAnswerByField(l.answers, nameField), Email: normalizeEmail(findAnswerByField(l.answers, emailField)) })).filter(d => EMAIL_RE.test(d.Email));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      XLSX.writeFile(wb, "email-recipients.xlsx");
    }
  }

  async function handleSendToPromotions() {
    if (!selectedLeadIds.length) return setError("Select leads first.");
    setEmailSending(true);
    try {
      const res = await fetch("/api/email-promotions/draft", {
        method: "POST",
        headers: getCustomerHeaders(),
        body: JSON.stringify({ campaignId: selectedCampaignId, leadIds: selectedLeadIds }),
      });
      const json = await res.json();
      if (json.data?.draftId) router.push(`/dashboard/email-promotions?draftId=${json.data.draftId}`);
      else throw new Error(json.error || "Failed to create draft");
    } catch (err) { setError(err.message); } finally { setEmailSending(false); }
  }

  const columns = useMemo(() => {
    const keys = new Set();
    const ordered = [];
    (selectedCampaign?.fields || []).forEach(f => {
      const k = String(f.label || f.key).trim();
      if (k && !keys.has(k)) { keys.add(k); ordered.push(k); }
    });
    leads.forEach(l => {
      Object.keys(l.answers || {}).forEach(k => {
        if (!keys.has(k)) { keys.add(k); ordered.push(k); }
      });
    });
    return ordered;
  }, [leads, selectedCampaign]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leads</h1>
          <p className="mt-2 text-slate-500">Manage and export captured leads from your campaigns.</p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
            <span className="text-xl font-bold text-slate-900">{count}</span>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected</span>
            <span className="text-xl font-bold text-indigo-600">{selectedLeadIds.length}</span>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-200"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-200 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {campaigns.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCampaignId(String(c._id))}
                className={`relative whitespace-nowrap px-4 py-2 text-sm font-bold transition-all ${
                  selectedCampaignId === String(c._id) ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {c.name}
                {selectedCampaignId === String(c._id) && (
                  <motion.div layoutId="campaignTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleExport("phone")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">Export Phone</button>
            <button onClick={() => handleExport("email")} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">Export Email</button>
            <button 
              onClick={handleSendToPromotions} disabled={emailSending}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {emailSending ? "Opening..." : "Send to Promotions"}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedCampaignId}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4">
                      <input 
                        type="checkbox" checked={allSelected} onChange={toggleSelectAllLeads} 
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600/20"
                      />
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Submitted At</th>
                    {columns.map((c) => (
                      <th key={c} className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px]">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingLeads ? (
                    <tr><td colSpan={columns.length + 2} className="px-6 py-12 text-center text-slate-400">Loading leads...</td></tr>
                  ) : leads.length === 0 ? (
                    <tr><td colSpan={columns.length + 2} className="px-6 py-12 text-center text-slate-400">No leads found for this campaign.</td></tr>
                  ) : (
                    leads.map((l) => (
                      <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" checked={selectedLeadSet.has(String(l._id))} onChange={() => toggleLeadSelection(l._id)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600/20"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                          {l.submittedAt ? new Date(l.submittedAt).toLocaleString() : "-"}
                        </td>
                        {columns.map((c) => {
                          const val = l.answers?.[c];
                          return (
                            <td key={c} className="px-6 py-4 text-slate-900 font-semibold">
                              {Array.isArray(val) ? val.join(", ") : val || "-"}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
