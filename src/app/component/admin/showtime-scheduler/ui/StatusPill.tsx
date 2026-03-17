import React from "react";
import { WarningAmber } from "@mui/icons-material";
import { statusVi } from "../helpers/SchedulerLogic";

export default function StatusPill({
  status,
  conflict,
}: {
  status: string;
  conflict: boolean;
}) {
  if (conflict) {
    return (
      <div className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-red-200 bg-red-50 text-red-700">
        <WarningAmber fontSize="inherit" />
        Xung đột
      </div>
    );
  }

  const s = String(status ?? "").trim().toUpperCase();
  const cls =
    s === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : s === "CANCELLED"
        ? "bg-gray-100 text-gray-600 border-gray-200"
        : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className={`text-xs px-2 py-1 rounded-full border ${cls}`}>
      {statusVi(s)}
    </div>
  );
}