"use client";

import Link from "next/link";
import React from "react";
import {
  ApprovalRounded,
  AssessmentRounded,
  ChecklistRtl,
  FactCheckRounded,
  ViewWeek,
} from "@mui/icons-material";

type ManagerScheduleRole = "ADMIN" | "MANAGER" | string;

interface ManagerScheduleTabsProps {
  activeHref: string;
  role: ManagerScheduleRole;
}

interface ManagerScheduleTabItem {
  href: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  roles: string[];
}

const managerScheduleTabs: ManagerScheduleTabItem[] = [
  {
    href: "/admin/staff-schedules",
    label: "Xem bảng lịch",
    description: "Theo dõi lịch tuần của nhân viên trong chi nhánh.",
    icon: <ViewWeek fontSize="small" />,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/admin/staff-schedules/registrations",
    label: "Lịch nhân viên đăng ký",
    description: "Duyệt nhanh các ca staff đã tự đăng ký theo tuần.",
    icon: <FactCheckRounded fontSize="small" />,
    roles: ["MANAGER"],
  },
  {
    href: "/admin/staff-schedules/assign",
    label: "Phân công và duyệt",
    description: "Tạo mới hoặc chỉnh lại lịch khi cần thao tác thủ công.",
    icon: <ChecklistRtl fontSize="small" />,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    href: "/admin/staff-schedules/swaps",
    label: "Duyệt làm thay",
    description: "Kiểm tra và phản hồi các yêu cầu đổi ca của staff.",
    icon: <ApprovalRounded fontSize="small" />,
    roles: ["MANAGER"],
  },
  {
    href: "/admin/staff-schedules/stats",
    label: "Thống kê lịch làm",
    description: "So sánh số ca đã chốt và nhịp làm việc giữa nhân viên.",
    icon: <AssessmentRounded fontSize="small" />,
    roles: ["MANAGER"],
  },
] as const;

export default function ManagerScheduleTabs({
  activeHref,
  role,
}: ManagerScheduleTabsProps) {
  const normalizedRole = String(role || "").toUpperCase();
  const tabs = managerScheduleTabs.filter((item) =>
    item.roles.includes(normalizedRole),
  );

  return (
    <div className="grid gap-3 px-6 py-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {tabs.map((item) => {
        const active = activeHref === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group block border px-4 py-4 text-left transition ${
              active
                ? "border-red-600 bg-red-600 text-white shadow-[0_18px_38px_rgba(220,38,38,0.18)]"
                : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center border transition ${
                active
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-red-100 bg-red-50 text-red-600 group-hover:border-red-200"
              }`}
            >
              {item.icon}
            </div>
            <div className="mt-4 text-sm font-black leading-5">{item.label}</div>
            <div
              className={`mt-2 text-sm leading-6 ${
                active ? "text-white/85" : "text-slate-500"
              }`}
            >
              {item.description}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
