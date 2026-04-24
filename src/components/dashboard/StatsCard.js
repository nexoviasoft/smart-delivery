"use client";

import { motion } from "framer-motion";

export default function StatsCard({ label, value, icon: Icon, trend, color = "indigo" }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-500/20",
    amber: "bg-amber-50 text-amber-600 ring-amber-500/20",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-500/20",
    rose: "bg-rose-50 text-rose-600 ring-rose-500/20",
    sky: "bg-sky-50 text-sky-600 ring-sky-500/20",
  };

  const selectedColor = colorMap[color] || colorMap.indigo;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:shadow-xl hover:shadow-slate-200/50"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
          
          {trend && (
            <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
              {trend > 0 ? "+" : ""}{trend}%
              <svg className={`h-3 w-3 ${trend < 0 ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          )}
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${selectedColor}`}>
          <Icon />
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-slate-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
    </motion.div>
  );
}
