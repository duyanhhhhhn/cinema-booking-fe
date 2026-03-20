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
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="flex h-full items-center justify-between rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur"
    >
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-bold">
          {title}
        </div>

        <div className="mt-2 flex flex-wrap items-end gap-2">
          <div className="text-3xl font-black leading-none tracking-[-0.03em] text-slate-900">
            {value}
          </div>

          {sub ? (
            <div className={`rounded-full border px-2 py-1 text-xs ${toneCls}`}>
              {sub}
            </div>
          ) : null}
        </div>
      </div>

      <div className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
        {icon}
      </div>
    </motion.div>
  );
}