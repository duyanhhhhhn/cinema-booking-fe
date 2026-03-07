import React from "react";
import { motion } from "framer-motion";

export default function MetricCard({
  title,
  value,
  sub,
  icon,
  tone = "neutral",
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  tone?: "neutral" | "danger" | "success";
}) {
  const toneCls =
    tone === "danger"
      ? "bg-red-50 text-red-700 border-red-200"
      : tone === "success"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex items-center justify-between"
    >
      <div>
        <div className="text-xs tracking-wide text-gray-500 uppercase">
          {title}
        </div>
        <div className="mt-2 flex items-end gap-2">
          <div className="text-3xl font-extrabold text-gray-900">{value}</div>
          {sub ? (
            <div className={`text-xs px-2 py-1 rounded-full border ${toneCls}`}>
              {sub}
            </div>
          ) : null}
        </div>
      </div>
      <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-700">
        {icon}
      </div>
    </motion.div>
  );
}