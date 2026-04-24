"use client";

import { useEffect, useState } from "react";
import { getCustomerHeaders } from "@/components/customer-api";
import StatsCard from "@/components/dashboard/StatsCard";
import DataTable from "@/components/dashboard/DataTable";
import { 
  OrderIcon, DeliveryIcon, CampaignIcon, 
  UserIcon, PromotionIcon, UsageIcon 
} from "@/components/dashboard/DashboardIcons";
import { motion } from "framer-motion";

const SUMMARY_CONFIG = [
  { key: "orders", label: "Total Orders", endpoint: "/api/orders", icon: OrderIcon, color: "indigo" },
  { key: "deliveries", label: "Total Deliveries", endpoint: "/api/deliveries", icon: DeliveryIcon, color: "emerald" },
  {
    key: "deliverySuccess",
    label: "Success Deliveries",
    endpoint: "/api/deliveries",
    statusEquals: "sent",
    icon: DeliveryIcon,
    color: "emerald"
  },
  { key: "campaigns", label: "Total Campaigns", endpoint: "/api/campaigns", icon: CampaignIcon, color: "amber" },
  { key: "users", label: "Total Users", endpoint: "/api/users", icon: UserIcon, color: "sky" },
  { key: "emailTemplates", label: "Email Templates", endpoint: "/api/email-promotions/templates", icon: PromotionIcon, color: "rose" },
  {
    key: "emailsSent",
    label: "Emails Sent",
    endpoint: "/api/usage/me",
    usageKey: "emails",
    icon: PromotionIcon,
    color: "rose"
  },
  {
    key: "wpSent",
    label: "WP Sent",
    endpoint: "/api/usage/me",
    usageKey: "wpPromotions",
    icon: PromotionIcon,
    color: "emerald"
  },
  {
    key: "courierSent",
    label: "Courier Sent",
    endpoint: "/api/usage/me",
    usageKey: "courierOrders",
    icon: OrderIcon,
    color: "indigo"
  },
];

function formatRelativeTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Unknown time";
  const nowMs = Date.now();
  const diffMs = nowMs - date.getTime();
  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  if (diffMs < minuteMs) return "Just now";
  if (diffMs < hourMs) return `${Math.floor(diffMs / minuteMs)} min ago`;
  if (diffMs < dayMs) return `${Math.floor(diffMs / hourMs)} hr ago`;
  return `${Math.floor(diffMs / dayMs)} day ago`;
}

function parseItemsFromResponse(configKey, payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (configKey === "emailTemplates" && Array.isArray(payload?.data?.templates)) {
    return payload.data.templates;
  }
  return [];
}

function parseCountFromResponse(config, payload) {
  if (config.usageKey) {
    return Number(payload?.data?.usage?.[config.usageKey] || 0);
  }
  const items = parseItemsFromResponse(config.key, payload);
  if (config.statusEquals) {
    return items.filter((item) => String(item?.status || "") === config.statusEquals).length;
  }
  return items.length;
}

export default function DashboardOverviewPage() {
  const [counts, setCounts] = useState(
    SUMMARY_CONFIG.reduce((acc, item) => ({ ...acc, [item.key]: 0 }), {})
  );
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tenantCompany, setTenantCompany] = useState(null);

  useEffect(() => {
    async function loadSummaryAndUpdates() {
      try {
        const meResponse = await fetch("/api/auth/me", { credentials: "include" });
        const meJson = await meResponse.json().catch(() => ({}));
        if (!meResponse.ok || !meJson?.success) {
          setError("Login required to load dashboard data.");
          return;
        }
        setTenantCompany(meJson?.data?.company || null);

        const fetchOpts = { headers: getCustomerHeaders(), credentials: "include" };
        const results = await Promise.all(
          SUMMARY_CONFIG.map(async (config) => {
            const response = await fetch(config.endpoint, fetchOpts);
            const json = await response.json().catch(() => ({}));
            return { config, response, json };
          })
        );

        let allFailed = true;
        const nextCounts = {};
        const updatePool = [];

        results.forEach(({ config, response, json }) => {
          if (!response.ok || !json?.success) {
            nextCounts[config.key] = 0;
            return;
          }

          allFailed = false;
          const items = parseItemsFromResponse(config.key, json);
          nextCounts[config.key] = parseCountFromResponse(config, json);

          const latestItems = items.slice(0, 4);
          latestItems.forEach((item) => {
            const timestamp = item?.updatedAt || item?.createdAt || null;
            const title =
              item?.name || item?.orderNumber || item?.email || item?.customerName || "Updated item";
            updatePool.push({
              id: `${config.key}-${item?._id || `${title}-${timestamp || "na"}`}`,
              title,
              meta: config.label,
              timestamp,
            });
          });
        });

        const sortedUpdates = updatePool
          .sort((a, b) => {
            const aTs = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const bTs = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return bTs - aTs;
          })
          .slice(0, 8);

        setCounts(nextCounts);
        setRecentUpdates(sortedUpdates);
        if (allFailed) {
          setError("Login required to load dashboard data.");
        }
      } catch {
        setError("Failed to load dashboard summary.");
      } finally {
        setLoading(false);
      }
    }

    loadSummaryAndUpdates();
  }, []);

  const columns = [
    { 
      header: "Update", 
      accessor: "title",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.title}</span>
          <span className="text-xs text-slate-500">{row.meta}</span>
        </div>
      )
    },
    { 
      header: "Category", 
      accessor: "meta",
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
          {row.meta}
        </span>
      )
    },
    { 
      header: "Time", 
      accessor: "timestamp",
      render: (row) => (
        <span className="text-slate-500">{formatRelativeTime(row.timestamp)}</span>
      )
    }
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="mt-2 text-slate-500">
          {tenantCompany?.name
            ? `Welcome back! Here's what's happening at ${tenantCompany.name}.`
            : "Welcome back! Here's an overview of your account activity."}
        </p>
      </header>

      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-3xl bg-white ring-1 ring-slate-200"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SUMMARY_CONFIG.map((item) => (
              <StatsCard 
                key={item.key} 
                label={item.label} 
                value={counts[item.key] || 0} 
                icon={item.icon}
                color={item.color}
              />
            ))}
          </section>

          <section>
            <DataTable 
              title="Recent Activity" 
              subtitle="Latest updates from your orders, campaigns, and more."
              columns={columns} 
              data={recentUpdates} 
              emptyMessage="No recent updates found."
            />
          </section>
        </div>
      )}
    </div>
  );
}
