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
      className="group relative flex h-full items-center justify-between overflow-hidden rounded-[22px] border border-[#ececf2] bg-white px-4 py-3.5 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-[1px]"
    >
      <div className="min-w-0">
        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
          {title}
        </div>

        <div className="mt-2.5 flex flex-wrap items-end gap-2">
          <div className="text-[26px] font-black leading-none tracking-[-0.03em] text-slate-900 sm:text-[28px]">
            {value}
          </div>

          {sub ? (
            <div className={`rounded-full border px-2.5 py-1 text-[10px] font-black shadow-sm ${toneCls}`}>
              {sub}
            </div>
          ) : null}
        </div>
      </div>

      <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-red-100 bg-red-50 text-red-500 shadow-[0_10px_20px_rgba(239,68,68,0.08)] transition group-hover:scale-[1.03]">
        {icon}
      </div>
    </motion.div>
  );
}
