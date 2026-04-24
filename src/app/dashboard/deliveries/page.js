"use client";

import { useEffect, useState } from "react";
import { getCustomerHeaders } from "@/components/customer-api";
import DataTable from "@/components/dashboard/DataTable";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

export default function DashboardDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [courierSettings, setCourierSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState("");
  const [selectedCourierType, setSelectedCourierType] = useState("");
  const [sending, setSending] = useState(false);
  const [trackingDeliveryId, setTrackingDeliveryId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/deliveries", { headers: getCustomerHeaders() }).then((r) => r.json()),
      fetch("/api/courier-settings", { headers: getCustomerHeaders() }).then((r) => r.json()),
    ])
      .then(([deliveriesRes, settingsRes]) => {
        setDeliveries(Array.isArray(deliveriesRes?.data) ? deliveriesRes.data : []);
        setCourierSettings(
          Array.isArray(settingsRes?.data)
            ? settingsRes.data.filter((item) => item.isActive)
            : []
        );
      })
      .catch(() => setError("Failed to load deliveries"))
      .finally(() => setLoading(false));
  }, []);

  function openSendModal(deliveryId) {
    const activeSettings = courierSettings.filter((item) => item.isActive);
    const defaultSetting = activeSettings.find((item) => item.isDefault);

    if (defaultSetting) {
      setSelectedDeliveryId(deliveryId);
      setSelectedCourierType(defaultSetting.courierType);
      setError("");
      setMessage("");

      fetch(`/api/delivery/send/${deliveryId}`, {
        method: "POST",
        headers: getCustomerHeaders(),
        body: JSON.stringify({ courierType: defaultSetting.courierType }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.error) throw new Error(json.error);
          setDeliveries((state) =>
            state.map((delivery) => (delivery._id === json?.data?._id ? json.data : delivery))
          );
          setMessage(`Sent by default courier: ${defaultSetting.courierType}`);
        })
        .catch((err) => setError(err.message || "Failed to send to courier"));
      return;
    }

    const firstActive = activeSettings[0];
    if (!firstActive) {
      setError("No active courier settings found. Please configure courier settings first.");
      return;
    }

    setSelectedDeliveryId(deliveryId);
    setSelectedCourierType(firstActive.courierType);
    setShowModal(true);
    setMessage("");
    setError("");
  }

  function closeModal() {
    setShowModal(false);
    setSelectedDeliveryId("");
    setSending(false);
  }

  function sendToCourier() {
    if (!selectedDeliveryId || !selectedCourierType) return;
    setSending(true);
    setError("");
    setMessage("");

    fetch(`/api/delivery/send/${selectedDeliveryId}`, {
      method: "POST",
      headers: getCustomerHeaders(),
      body: JSON.stringify({ courierType: selectedCourierType }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setDeliveries((state) =>
          state.map((delivery) => (delivery._id === json?.data?._id ? json.data : delivery))
        );
        setMessage("Delivery sent to courier successfully.");
        closeModal();
      })
      .catch((err) => setError(err.message || "Failed to send to courier"))
      .finally(() => setSending(false));
  }

  function extractTrackingStatus(trackingPayload) {
    return (
      trackingPayload?.delivery_status ||
      trackingPayload?.status ||
      trackingPayload?.consignment?.status ||
      trackingPayload?.data?.status ||
      trackingPayload?.current_status ||
      null
    );
  }

  function trackDelivery(deliveryId) {
    setTrackingDeliveryId(deliveryId);
    setError("");
    setMessage("");

    fetch(`/api/delivery/track/${deliveryId}`, {
      method: "POST",
      headers: getCustomerHeaders(),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        const nextTrackingId = json?.data?.trackingId;
        if (nextTrackingId) {
          setDeliveries((state) =>
            state.map((delivery) =>
              delivery._id === deliveryId ? { ...delivery, trackingId: nextTrackingId } : delivery
            )
          );
        }
        const statusText = extractTrackingStatus(json?.data?.tracking);
        setMessage(statusText ? `Tracking status: ${statusText}` : "Tracking data fetched successfully.");
      })
      .catch((err) => setError(err.message || "Failed to fetch tracking"))
      .finally(() => setTrackingDeliveryId(""));
  }

  const columns = [
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
    },
    { 
      header: "Tracking", 
      accessor: "trackingId",
      render: (row) => <span className="font-mono text-xs text-slate-500">{row.trackingId || "-"}</span>
    },
    { 
      header: "Action", 
      accessor: "_id",
      render: (row) => (
        <div className="flex items-center gap-2">
          {["pending", "failed"].includes(row.status) && (
            <button
              onClick={() => openSendModal(row._id)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700"
            >
              Send to Courier
            </button>
          )}
          {row.trackingId && (
            <button
              onClick={() => trackDelivery(row._id)}
              disabled={trackingDeliveryId === row._id}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
            >
              {trackingDeliveryId === row._id ? "Tracking..." : "Track"}
            </button>
          )}
          {!["pending", "failed"].includes(row.status) && !row.trackingId && (
            <span className="text-xs text-slate-400">Ready</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Deliveries</h1>
        <p className="mt-2 text-slate-500">Track and manage your courier shipments in real-time.</p>
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

      <section>
        <DataTable 
          title="Active Shipments" 
          subtitle="View and track all ongoing deliveries."
          columns={columns} 
          data={deliveries} 
          emptyMessage="No shipments found. Your deliveries will appear here once created."
        />
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-slate-900">Choose Courier</h3>
            <p className="mt-2 text-sm text-slate-500">Select a courier service to fulfill this delivery.</p>

            <div className="mt-6 space-y-3">
              {courierSettings.map((item) => (
                <button
                  key={item._id}
                  onClick={() => setSelectedCourierType(item.courierType)}
                  className={`w-full flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                    selectedCourierType === item.courierType 
                      ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600/20" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <span className="block font-bold text-slate-900">{item.courierType}</span>
                    {item.isDefault && <span className="text-[10px] font-bold uppercase text-indigo-600">Default Courier</span>}
                  </div>
                  <div className={`h-5 w-5 rounded-full border-2 transition-all ${
                    selectedCourierType === item.courierType ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                  }`}>
                    {selectedCourierType === item.courierType && (
                      <Check className="h-full w-full p-0.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={closeModal} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button 
                onClick={sendToCourier} disabled={sending}
                className="flex-1 rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Confirm"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
