"use client";

import { motion } from "framer-motion";

export default function DataTable({ title, subtitle, columns, data, emptyMessage = "No items found." }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  key={rowIndex} 
                  className="group transition-colors hover:bg-slate-50/80"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-slate-600">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-slate-400 italic">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
