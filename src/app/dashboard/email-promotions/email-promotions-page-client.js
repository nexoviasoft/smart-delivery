"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import Link from "next/link";
import { getCustomerHeaders } from "@/components/customer-api";
import RichTextEditor from "@/components/rich-text-editor";
import { motion, AnimatePresence } from "framer-motion";
import DataTable from "@/components/dashboard/DataTable";

function renderPreview({ subject, bodyText, templateLink, name }) {
  let subj = String(subject || "").replaceAll("{{name}}", String(name || ""));
  let body = String(bodyText || "").replaceAll("{{name}}", String(name || ""));
  const link = String(templateLink || "");
  body = body.replaceAll("{{link}}", link);
  if (link && !body.includes(link)) body = `${body}\n\n${link}`;
  return { subject: subj.trim(), body: body.trim() };
}

function renderPreviewHtml({ bodyMode, bodyText, templateLink, name }) {
  let body = String(bodyText || "").replaceAll("{{name}}", String(name || ""));
  const link = String(templateLink || "");
  body = body.replaceAll("{{link}}", link);
  if (link && !body.includes(link)) body = `${body}\n\n${link}`;
  if (bodyMode === "html") return body;
  const escaped = body
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<u>$1</u>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replaceAll("\n", "<br/>");
}

function renderPreviewShell({ subject, name, bodyHtml, footerText }) {
  const esc = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  return `
<div style="margin:0; padding:16px; background:#f4f6fb; border-radius:10px; font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:640px; margin:0 auto;">
    <div style="background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:20px; box-shadow:0 8px 24px rgba(15,23,42,0.10);">
      <h3 style="margin:0 0 12px; font-size:18px; color:#0f172a;">${esc(subject)}</h3>
      <div style="font-size:14px; color:#1f2937; line-height:1.7;">
        <style>
          table { width: 100%; border-collapse: collapse; margin: 8px 0; }
          th, td { border: 1px solid #d1d5db; padding: 8px; vertical-align: top; text-align: left; }
          th { background: #f8fafc; font-weight: 600; }
        </style>
        ${bodyHtml}
      </div>
    </div>
    ${
      footerText
        ? `<div style="text-align:center; margin-top:10px; font-size:11px; color:#94a3b8;">${esc(footerText)}</div>`
        : ""
    }
  </div>
</div>`.trim();
}

function EmailPromotionsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const draftId = searchParams.get("draftId") || "";

  const [loadingUsage, setLoadingUsage] = useState(true);
  const [error, setError] = useState("");
  const [usageData, setUsageData] = useState(null);
  const [smtpLoading, setSmtpLoading] = useState(true);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpFromEmail, setSmtpFromEmail] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpMessage, setSmtpMessage] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [pdfPublicPath, setPdfPublicPath] = useState("");
  const [pdfUploading, setPdfUploading] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftCampaignName, setDraftCampaignName] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState("Hi {{name}} — your document");
  const [bodyMode, setBodyMode] = useState("text");
  const [bodyText, setBodyText] = useState("Hello {{name}},\n\nPlease find the PDF attached.\n\n{{link}}");
  const [templateLink, setTemplateLink] = useState("");
  const [footerText, setFooterText] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateBusy, setTemplateBusy] = useState(false);
  const [templateMessage, setTemplateMessage] = useState("");
  const [activeTab, setActiveTab] = useState("bulk");
  const intervalSeconds = 5;
  const [jobId, setJobId] = useState("");
  const [sendLogs, setSendLogs] = useState([]);
  const [excelUploading, setExcelUploading] = useState(false);
  const [jobState, setJobState] = useState({
    status: "", currentIndex: 0, sentCount: 0, total: 0, nextRunAt: null, lastError: ""
  });
  const timerRef = useRef(null);

  async function loadUsage() {
    try {
      const res = await fetch("/api/usage/me", { headers: getCustomerHeaders() });
      const json = await res.json();
      if (res.ok) setUsageData(json?.data || null);
    } catch { setError("Failed to load usage data"); }
    finally { setLoadingUsage(false); }
  }

  async function loadSmtp() {
    setSmtpLoading(true);
    try {
      const res = await fetch("/api/email-promotions/smtp", { headers: getCustomerHeaders() });
      const json = await res.json();
      if (res.ok) {
        const d = json?.data || {};
        setSmtpConfigured(Boolean(d.configured));
        setSmtpHost(d.host || "");
        setSmtpPort(String(d.port ?? 587));
        setSmtpSecure(Boolean(d.secure));
        setSmtpUser(d.user || "");
        setSmtpFromEmail(d.fromEmail || "");
        setSmtpFromName(d.fromName || "");
      }
    } finally { setSmtpLoading(false); }
  }

  async function loadTemplates() {
    try {
      const res = await fetch("/api/email-promotions/templates", { headers: getCustomerHeaders() });
      const json = await res.json();
      if (res.ok) setTemplates(Array.isArray(json?.data?.templates) ? json.data.templates : []);
    } catch {}
  }

  useEffect(() => {
    loadUsage(); loadSmtp(); loadTemplates();
  }, []);

  function handleSelectTemplate(templateId) {
    setSelectedTemplateId(templateId);
    const t = templates.find((item) => String(item._id) === String(templateId));
    if (!t) return;
    setTemplateName(t.name || "");
    setSubject(t.subject || "");
    setBodyMode(t.bodyMode || "text");
    setBodyText(t.bodyText || "");
    setTemplateLink(t.templateLink || "");
    setFooterText(t.footerText || "");
  }

  async function handleCreateTemplate() {
    if (!templateName.trim()) return;
    setTemplateBusy(true);
    try {
      const res = await fetch("/api/email-promotions/templates", {
        method: "POST",
        headers: getCustomerHeaders(),
        body: JSON.stringify({ name: templateName, subject, bodyMode, bodyText, templateLink, footerText }),
      });
      if (res.ok) { setTemplateMessage("Template saved."); loadTemplates(); }
    } finally { setTemplateBusy(false); }
  }

  async function handleUpdateTemplate() {
    if (!selectedTemplateId) return;
    setTemplateBusy(true);
    try {
      const res = await fetch(`/api/email-promotions/templates/${selectedTemplateId}`, {
        method: "PUT",
        headers: getCustomerHeaders(),
        body: JSON.stringify({ name: templateName, subject, bodyMode, bodyText, templateLink, footerText }),
      });
      if (res.ok) { setTemplateMessage("Template updated."); loadTemplates(); }
    } finally { setTemplateBusy(false); }
  }

  async function handleDeleteTemplate() {
    if (!selectedTemplateId) return;
    setTemplateBusy(true);
    try {
      const res = await fetch(`/api/email-promotions/templates/${selectedTemplateId}`, { method: "DELETE", headers: getCustomerHeaders() });
      if (res.ok) { setSelectedTemplateId(""); setTemplateName(""); setTemplateMessage("Template deleted."); loadTemplates(); }
    } finally { setTemplateBusy(false); }
  }

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!draftId) { setRecipients([]); setDraftCampaignName(""); return; }
    setDraftLoading(true);
    fetch(`/api/email-promotions/draft/${draftId}`, { headers: getCustomerHeaders() })
      .then(res => res.json())
      .then(json => {
        const data = json?.data || {};
        setDraftCampaignName(data?.campaignName || "");
        setRecipients(Array.isArray(data?.recipients) ? data.recipients : []);
      })
      .finally(() => setDraftLoading(false));
  }, [draftId]);

  async function handleSaveSmtp(event) {
    event.preventDefault();
    setSmtpSaving(true);
    setSmtpMessage("");
    try {
      const res = await fetch("/api/email-promotions/smtp", {
        method: "PUT",
        headers: getCustomerHeaders(),
        body: JSON.stringify({ host: smtpHost, port: Number(smtpPort) || 587, secure: smtpSecure, user: smtpUser, password: smtpPassword, fromEmail: smtpFromEmail, fromName: smtpFromName }),
      });
      if (res.ok) { setSmtpMessage("Saved."); setSmtpPassword(""); loadSmtp(); }
      else throw new Error("Save failed");
    } catch (err) { setSmtpMessage(err.message); }
    finally { setSmtpSaving(false); }
  }

  async function handleTestSmtp() {
    if (!testEmail.trim()) return;
    setTestSending(true);
    setSmtpMessage("");
    try {
      const res = await fetch("/api/email-promotions/smtp/test", {
        method: "POST",
        headers: getCustomerHeaders(),
        body: JSON.stringify({ testEmail: testEmail.trim() }),
      });
      if (res.ok) setSmtpMessage("Test email sent.");
      else throw new Error("Test failed");
    } catch (err) { setSmtpMessage(err.message); }
    finally { setTestSending(false); }
  }

  async function handlePdfUpload(file) {
    if (!file || file.type !== "application/pdf") return;
    setPdfUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/email-promotions/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (res.ok) setPdfPublicPath(json?.data?.publicPath || "");
    } finally { setPdfUploading(false); }
  }

  async function handleExcelUpload(file) {
    if (!file) return;
    setExcelUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      const keys = Object.keys(rows[0] || {});
      const nameKey = keys.find(k => /name/i.test(k));
      const emailKey = keys.find(k => /email|mail/i.test(k));
      if (!nameKey || !emailKey) throw new Error("Excel must have Name and Email columns.");
      const list = rows.map(r => ({ name: String(r[nameKey]).trim(), email: String(r[emailKey]).trim().toLowerCase() })).filter(r => r.email);
      const res = await fetch("/api/email-promotions/draft/from-recipients", {
        method: "POST",
        headers: getCustomerHeaders(),
        body: JSON.stringify({ recipients: list }),
      });
      const json = await res.json();
      if (json.data?.draftId) router.push(`/dashboard/email-promotions?draftId=${json.data.draftId}`);
    } catch (err) { setError(err.message); }
    finally { setExcelUploading(false); }
  }

  async function runJobOnce(activeJobId) {
    if (!activeJobId) return;
    const res = await fetch(`/api/email-promotions/jobs/${activeJobId}/run`, { method: "POST", headers: getCustomerHeaders() });
    const json = await res.json();
    const data = json?.data || {};
    if (data?.lastLog) setSendLogs(prev => [...prev, data.lastLog].slice(-200));
    setJobState(s => ({ ...s, ...data }));
    if (data?.status === "completed" || data?.status === "failed") {
      if (timerRef.current) clearInterval(timerRef.current);
      setJobId("");
      loadUsage();
    }
  }

  async function handleBulkSend() {
    if (!draftId || !recipients.length || !selectedTemplateId || !smtpConfigured) return;
    try {
      const res = await fetch("/api/email-promotions/jobs", {
        method: "POST",
        headers: getCustomerHeaders(),
        body: JSON.stringify({ draftId, subject, bodyMode, bodyText, templateLink, footerText, intervalSeconds, attachmentPublicPath: pdfPublicPath || "" }),
      });
      const json = await res.json();
      if (json.data?.jobId) {
        setJobId(json.data.jobId);
        setSendLogs([]);
        setJobState({ status: "running", currentIndex: 0, sentCount: 0, total: recipients.length, nextRunAt: null, lastError: "" });
        timerRef.current = setInterval(() => runJobOnce(json.data.jobId), intervalSeconds * 1000);
        runJobOnce(json.data.jobId);
      }
    } catch { setError("Failed to start bulk send"); }
  }

  const used = Number(usageData?.usage?.emails || 0);
  const limit = Number(usageData?.limits?.emails_per_month || 0);
  const remaining = Math.max(0, limit - used);
  const preview = renderPreview({ subject, bodyText, templateLink, name: recipients[0]?.name || "Customer" });
  const previewHtml = renderPreviewHtml({ bodyMode, bodyText, templateLink, name: recipients[0]?.name || "Customer" });
  const previewShellHtml = renderPreviewShell({ subject: preview.subject || "Promotion", name: recipients[0]?.name || "Customer", bodyHtml: previewHtml || "", footerText: footerText || "" });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Email Promotions</h1>
          <p className="mt-2 text-slate-500">Scale your outreach with automated email campaigns.</p>
        </div>
        <div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5">
          {["bulk", "template", "smtp"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-bold transition-all capitalize ${activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{tab === "smtp" ? "SMTP Setup" : tab === "bulk" ? "Bulk Send" : "Templates"}</button>
          ))}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Used", val: used, color: "text-slate-900" },
          { label: "Limit", val: limit, color: "text-slate-900" },
          { label: "Remaining", val: remaining, color: "text-indigo-600" }
        ].map((s, i) => (
          <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</span>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </section>

      <AnimatePresence mode="wait">
        {activeTab === "smtp" ? (
          <motion.section key="smtp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8">
              <h2 className="text-xl font-bold text-slate-900">SMTP Settings</h2>
              <form onSubmit={handleSaveSmtp} className="mt-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">SMTP Host</label>
                    <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-600" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Port</label>
                    <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-600" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} required />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" checked={smtpSecure} onChange={e => setSmtpSecure(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                    <span className="text-sm font-medium text-slate-700">Use SSL/TLS</span>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Username</label>
                    <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-600" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Password</label>
                    <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-600" type="password" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                </div>
                <button type="submit" disabled={smtpSaving} className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-black disabled:opacity-50">
                  {smtpSaving ? "Saving..." : "Save SMTP Settings"}
                </button>
              </form>
            </div>
            <div className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <h3 className="font-bold text-slate-900">Test Connection</h3>
                <p className="mt-2 text-xs text-slate-500">Send a test email to verify your configuration.</p>
                <div className="mt-6 space-y-4">
                  <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-600" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@example.com" />
                  <button onClick={handleTestSmtp} disabled={testSending || !smtpConfigured} className="w-full rounded-2xl bg-indigo-50 py-3 text-xs font-bold text-indigo-600 transition-all hover:bg-indigo-100 disabled:opacity-50">
                    {testSending ? "Sending..." : "Send Test Email"}
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        ) : activeTab === "template" ? (
          <motion.section key="template" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8">
              <h2 className="text-xl font-bold text-slate-900">Email Content</h2>
              <div className="mt-6 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject Line</label>
                  <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-600" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Hi {{name}}!" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Body Content</label>
                  <RichTextEditor value={bodyText} onChange={setBodyText} outputMode={bodyMode === "html" ? "html" : "text"} minHeight={300} />
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <h3 className="font-bold text-slate-900">Attachments</h3>
                <div className="mt-6 space-y-4">
                  <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 p-8 text-center cursor-pointer hover:bg-slate-50 transition-all">
                    <span className="text-xs font-bold text-slate-500">{pdfPublicPath ? "PDF Attached ✓" : "Upload PDF Attachment"}</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={e => handlePdfUpload(e.target.files?.[0])} />
                  </label>
                  {pdfPublicPath && <p className="text-[10px] truncate text-slate-400">{pdfPublicPath}</p>}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <h3 className="font-bold text-slate-900">Save as Template</h3>
                <div className="mt-6 space-y-4">
                  <input className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-600" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Template Name" />
                  <button onClick={handleCreateTemplate} disabled={templateBusy} className="w-full rounded-2xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700">Save Template</button>
                  {selectedTemplateId && (
                    <button onClick={handleUpdateTemplate} className="w-full rounded-2xl bg-slate-100 py-3 text-xs font-bold text-slate-900 hover:bg-slate-200">Update Selected</button>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section key="bulk" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-8">
              <section className="rounded-3xl border border-slate-200 bg-white p-8">
                <h2 className="text-xl font-bold text-slate-900">Campaign Details</h2>
                <div className="mt-6 space-y-6">
                  {!draftId ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 p-12 text-center">
                      <p className="text-sm font-medium text-slate-500">No recipients selected.</p>
                      <label className="mt-4 cursor-pointer rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-black">
                        {excelUploading ? "Processing..." : "Upload Excel"}
                        <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={(e) => handleExcelUpload(e.target.files?.[0])} disabled={excelUploading} />
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-200">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">{recipients.length}</div>
                      <div>
                        <p className="text-sm font-bold text-indigo-900">{draftCampaignName || "Selected Leads"}</p>
                        <p className="text-xs text-indigo-600">Ready for bulk send</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Select Template</label>
                    <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-600" value={selectedTemplateId} onChange={e => handleSelectTemplate(e.target.value)}>
                      <option value="">Choose a template</option>
                      {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                  <button onClick={handleBulkSend} disabled={!draftId || !selectedTemplateId || !smtpConfigured || !!jobId} className="w-full rounded-2xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50">
                    {jobId ? "Send in Progress..." : "Start Bulk Send"}
                  </button>
                </div>
              </section>
              {sendLogs.length > 0 && (
                <DataTable title="Recent Activity" subtitle="Real-time status of your email campaign." columns={[
                  { header: "Name", accessor: "name" },
                  { header: "Email", accessor: "email" },
                  { header: "Status", accessor: "status", render: (r) => <span className={`font-bold ${r.status === "sent" ? "text-emerald-600" : "text-rose-600"}`}>{r.status}</span> }
                ]} data={sendLogs.slice(-50).reverse()} />
              )}
            </div>
            <aside className="space-y-8">
              <section className="rounded-3xl border border-slate-200 bg-white p-8">
                <h3 className="font-bold text-slate-900">Email Preview</h3>
                <div className="mt-6 max-h-[600px] overflow-auto rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="p-4" dangerouslySetInnerHTML={{ __html: previewShellHtml }} />
                </div>
              </section>
              {jobState.status && (
                <section className="rounded-3xl border border-slate-200 bg-white p-8">
                  <h3 className="font-bold text-slate-900">Job Status</h3>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Progress</span>
                      <span className="text-[10px] font-bold text-indigo-600">{jobState.sentCount} / {jobState.total}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(jobState.sentCount / jobState.total) * 100}%` }} className="h-full bg-indigo-600" />
                    </div>
                  </div>
                </section>
              )}
            </aside>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardEmailPromotionsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>}>
      <EmailPromotionsPageContent />
    </Suspense>
  );
}
