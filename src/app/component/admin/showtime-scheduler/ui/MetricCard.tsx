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
      ? "border-red-200 bg-red-50 text-red-700"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-gray-200 bg-gray-50 text-gray-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="flex h-full items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-[0.12em] text-gray-500">
          {title}
        </div>

        <div className="mt-2 flex flex-wrap items-end gap-2">
          <div className="text-3xl font-extrabold leading-none text-gray-900">
            {value}
          </div>

          {sub ? (
            <div className={`rounded-full border px-2 py-1 text-xs ${toneCls}`}>
              {sub}
            </div>
          ) : null}
        </div>
      </div>

      <div className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 text-gray-700">
        {icon}
      </div>
    </motion.div>
  );
}