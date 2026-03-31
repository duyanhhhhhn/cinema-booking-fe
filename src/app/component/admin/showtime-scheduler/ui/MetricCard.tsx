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
        ? "border-[#ececf2] bg-white text-slate-600"
        : "border-[#ececf2] bg-white text-slate-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="group relative flex h-full items-center justify-between overflow-hidden rounded-[30px] border border-[#ececf2] bg-white p-5 shadow-[0_20px_52px_rgba(15,23,42,0.06)] transition-transform hover:-translate-y-[2px]"
    >
      <div className="min-w-0">
        <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
          {title}
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="text-[34px] font-black leading-none tracking-[-0.04em] text-slate-900">
            {value}
          </div>

          {sub ? (
            <div className={`rounded-full border px-3 py-1.5 text-[11px] font-black shadow-sm ${toneCls}`}>
              {sub}
            </div>
          ) : null}
        </div>
      </div>

      <div className="ml-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] border border-red-100 bg-red-50 text-red-500 shadow-[0_12px_28px_rgba(239,68,68,0.08)] transition group-hover:scale-[1.04]">
        {icon}
      </div>
    </motion.div>
  );
}
