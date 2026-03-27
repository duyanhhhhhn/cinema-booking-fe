"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { Be_Vietnam_Pro } from "next/font/google";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import MovieRoundedIcon from "@mui/icons-material/MovieRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import {
  RevenueAdmin,
  type IAdminRevenueReport,
  type IAdminRevenueReportFilterParams,
} from "@/types/data/revenue";
import { Cinema } from "@/types/data/cinema/cinema";
import { useAuth } from "@/contexts/AuthContext";
import { IResponse } from "@/types/core/api";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

type RevenueMovieOption = {
  movieId: number;
  movieTitle: string;
  posterUrl?: string | null;
};

type CinemaOption = {
  id: number;
  name: string;
  imageUrl?: string | null;
};

type ManagerMovieCatalogItem = {
  movieId: number;
  movieTitle: string;
  posterUrl?: string | null;
  totalRevenue?: number;
  totalTicketsSold?: number;
  totalPaidBookings?: number;
  revenueSharePercent?: number;
  rank?: number;
};

const MOVIE_PLACEHOLDER = "/poster/placeholder.jpg";
const CINEMA_PLACEHOLDER = "/cinema/placeholder.jpg";

const PIE_COLORS = [
  "#dc2626",
  "#ef4444",
  "#f87171",
  "#fb7185",
  "#fca5a5",
  "#fecaca",
  "#e11d48",
  "#be123c",
];

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultFilters(): IAdminRevenueReportFilterParams {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    startDate: toDateInputValue(firstDayOfMonth),
    endDate: toDateInputValue(now),
    cinemaId: null,
    movieId: null,
  };
}

function normalizeFilters(
  filters: IAdminRevenueReportFilterParams,
): IAdminRevenueReportFilterParams {
  return {
    startDate: (filters.startDate ?? "").trim(),
    endDate: (filters.endDate ?? "").trim(),
    cinemaId:
      typeof filters.cinemaId === "number" && !Number.isNaN(filters.cinemaId)
        ? filters.cinemaId
        : null,
    movieId:
      typeof filters.movieId === "number" && !Number.isNaN(filters.movieId)
        ? filters.movieId
        : null,
  };
}

function getRoleCode(user: any) {
  const rawRole =
    typeof user?.role === "string"
      ? user.role
      : typeof user?.role?.code === "string"
        ? user.role.code
        : typeof user?.role?.name === "string"
          ? user.role.name
          : "";

  const normalized = String(rawRole).trim().toUpperCase();
  return normalized.startsWith("ROLE_")
    ? normalized.replace(/^ROLE_/, "")
    : normalized;
}

function normalizeNumericId(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isNaN(value) ? null : value;

  const parsed = Number(String(value).trim());
  return Number.isNaN(parsed) ? null : parsed;
}

function getUserCinemaId(user: any) {
  return (
    normalizeNumericId(user?.cinemaId) ??
    normalizeNumericId(user?.cinema?.id) ??
    normalizeNumericId(user?.cinema_id)
  );
}

function getUserCinemaName(user: any) {
  if (typeof user?.cinemaName === "string" && user.cinemaName.trim()) {
    return user.cinemaName.trim();
  }
  if (typeof user?.cinema?.name === "string" && user.cinema.name.trim()) {
    return user.cinema.name.trim();
  }
  return "";
}

function normalizeCinemaResponse(raw: any): CinemaOption[] {
  const list = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.data?.data)
      ? raw.data.data
      : Array.isArray(raw)
        ? raw
        : [];

  return list
    .map((item: any) => ({
      id: Number(item?.id),
      name: String(item?.name ?? "").trim(),
      imageUrl: item?.imageUrl ?? null,
    }))
    .filter((item: CinemaOption) => Number.isFinite(item.id) && item.name);
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function formatPercent(value?: number | null) {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

function formatShortDate(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[170px] flex-col items-center justify-center rounded-[22px] border border-dashed border-red-200 bg-gradient-to-b from-white to-red-50/40 px-6 py-10 text-center">
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <InsightsRoundedIcon />
      </div>
      <h3 className="text-[16px] font-extrabold tracking-tight text-slate-900">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-md text-[14px] font-medium text-slate-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  right,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.06)] ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold tracking-tight text-slate-900">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-[14px] font-medium leading-6 text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function StatCard({
  title,
  value,
  suffix,
  icon,
  accent = "red",
}: {
  title: string;
  value: string;
  suffix?: string;
  icon: ReactNode;
  accent?: "red" | "slate";
}) {
  const tone =
    accent === "red"
      ? "bg-gradient-to-br from-red-50 to-rose-50 border-red-100 text-red-600"
      : "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 text-slate-700";

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <div className="mt-3 flex items-end gap-2">
            <h3 className="text-[30px] font-extrabold tracking-tight text-slate-900">
              {value}
            </h3>
            {suffix ? (
              <span className="pb-1 text-[14px] font-bold text-slate-400">
                {suffix}
              </span>
            ) : null}
          </div>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border ${tone}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: { tickets?: number; bookings?: number };
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const value = payload[0]?.value ?? 0;
  const tickets = payload[0]?.payload?.tickets ?? 0;
  const bookings = payload[0]?.payload?.bookings ?? 0;

  return (
    <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
      <p className="text-[14px] font-extrabold text-slate-900">{label}</p>
      <p className="mt-1 text-[14px] font-extrabold text-red-600">
        {formatCurrency(value)} đ
      </p>
      <p className="mt-1 text-[12px] font-semibold text-slate-500">
        {formatNumber(tickets)} vé • {formatNumber(bookings)} booking
      </p>
    </div>
  );
}

function PieShareTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: { percentValue?: string };
  }>;
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
      <p className="text-[14px] font-extrabold text-slate-900">{item.name}</p>
      <p className="mt-1 text-[14px] font-extrabold text-red-600">
        {formatCurrency(item.value)} đ
      </p>
      <p className="mt-1 text-[12px] font-semibold text-slate-500">
        {item.payload?.percentValue ?? "0.00%"}
      </p>
    </div>
  );
}

function CinemaInfoCard({
  cinema,
  managerCinemaName,
  resolveCinemaImageUrl,
  onImageError,
}: {
  cinema: {
    cinemaId?: number;
    cinemaName?: string;
    cinemaImageUrl?: string | null;
    totalRevenue?: number | null;
    totalTicketsSold?: number | null;
    totalPaidBookings?: number | null;
  } | null;
  managerCinemaName: string;
  resolveCinemaImageUrl: (raw?: string | null) => string;
  onImageError: (
    e: SyntheticEvent<HTMLImageElement, Event>,
    fallback: string,
  ) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
      <div className="relative h-[200px] overflow-hidden bg-slate-100">
        <img
          src={resolveCinemaImageUrl(cinema?.cinemaImageUrl)}
          alt={managerCinemaName}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => onImageError(e, CINEMA_PLACEHOLDER)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/25 to-transparent" />

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white backdrop-blur">
          <StorefrontRoundedIcon sx={{ fontSize: 16 }} />
          Rạp của bạn
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-[26px] font-extrabold tracking-tight text-white">
            {managerCinemaName || cinema?.cinemaName || "Rạp quản lý"}
          </h3>
          <p className="mt-1 text-[13px] font-medium text-white/80">
            Manager chỉ được xem dữ liệu của chi nhánh này.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
        <div className="rounded-[18px] border border-red-100 bg-red-50 p-4">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-red-500">
            Doanh thu
          </p>
          <p className="mt-2 text-[22px] font-extrabold tracking-tight text-slate-900">
            {formatCurrency(cinema?.totalRevenue)} đ
          </p>
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
            Vé đã bán
          </p>
          <p className="mt-2 text-[22px] font-extrabold tracking-tight text-slate-900">
            {formatNumber(cinema?.totalTicketsSold)}
          </p>
        </div>

        <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
            Booking
          </p>
          <p className="mt-2 text-[22px] font-extrabold tracking-tight text-slate-900">
            {formatNumber(cinema?.totalPaidBookings)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const roleCode = useMemo(() => getRoleCode(user), [user]);
  const isAdmin = roleCode === "ADMIN";
  const isManager = roleCode === "MANAGER";
  const managerCinemaId = useMemo(() => getUserCinemaId(user), [user]);
  const managerCinemaNameFromUser = useMemo(() => getUserCinemaName(user), [user]);

  const initialFilters = useMemo(() => getDefaultFilters(), []);

  const getRoleScopedFilters = (
    baseFilters: IAdminRevenueReportFilterParams = getDefaultFilters(),
  ): IAdminRevenueReportFilterParams => {
    if (isManager) {
      return {
        ...baseFilters,
        cinemaId: managerCinemaId ?? null,
      };
    }

    return baseFilters;
  };

  const [draftFilters, setDraftFilters] =
    useState<IAdminRevenueReportFilterParams>(getRoleScopedFilters(initialFilters));
  const [appliedFilters, setAppliedFilters] =
    useState<IAdminRevenueReportFilterParams>(getRoleScopedFilters(initialFilters));

  const isDateRangeInvalid = (filters: IAdminRevenueReportFilterParams) => {
    const startDate = (filters.startDate ?? "").trim();
    const endDate = (filters.endDate ?? "").trim();

    if (!startDate || !endDate) return false;
    return startDate > endDate;
  };

  const IMAGE_BASE = useMemo(
    () =>
      (process.env.NEXT_PUBLIC_IMAGE_URL ?? "http://localhost:8080").replace(
        /\/+$/,
        "",
      ),
    [],
  );

  const resolveMoviePosterUrl = useMemo(() => {
    return (raw?: string | null) => {
      const v = typeof raw === "string" ? raw.trim() : "";
      if (!v) return MOVIE_PLACEHOLDER;
      if (/^https?:\/\//i.test(v)) return v;

      const clean = v.replace(/^\/+/, "");
      const withMedia = clean.startsWith("media/") ? clean : `media/${clean}`;
      return `${IMAGE_BASE}/${withMedia}`;
    };
  }, [IMAGE_BASE]);

  const resolveCinemaImageUrl = useMemo(() => {
    return (raw?: string | null) => {
      const v = typeof raw === "string" ? raw.trim() : "";
      if (!v) return CINEMA_PLACEHOLDER;
      if (/^https?:\/\//i.test(v)) return v;

      const clean = v.replace(/^\/+/, "");
      const withMedia = clean.startsWith("media/") ? clean : `media/${clean}`;
      return `${IMAGE_BASE}/${withMedia}`;
    };
  }, [IMAGE_BASE]);

  const handleImageError = (
    e: SyntheticEvent<HTMLImageElement, Event>,
    fallback: string,
  ) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackApplied === "true") return;
    img.dataset.fallbackApplied = "true";
    img.src = fallback;
  };

  const effectiveAppliedFilters = useMemo(() => {
    const normalized = normalizeFilters(appliedFilters);

    if (isManager) {
      return {
        ...normalized,
        cinemaId: managerCinemaId ?? null,
      };
    }

    return normalized;
  }, [appliedFilters, isManager, managerCinemaId]);

  const movieOptionsCinemaId = useMemo(() => {
    if (isManager) {
      return managerCinemaId ?? null;
    }

    return draftFilters.cinemaId ?? null;
  }, [draftFilters.cinemaId, isManager, managerCinemaId]);

  const applyFiltersDirectly = (
    next: IAdminRevenueReportFilterParams,
    options?: { showErrorToast?: boolean },
  ) => {
    const normalized = normalizeFilters(next);
    setDraftFilters(normalized);

    if (isDateRangeInvalid(normalized)) {
      if (options?.showErrorToast !== false) {
        toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      }
      return false;
    }

    setAppliedFilters(normalized);
    return true;
  };

  const {
    data: revenueReportResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchRevenueReport,
  } = useQuery<IResponse<IAdminRevenueReport>>({
    ...RevenueAdmin.getReport(effectiveAppliedFilters),
    enabled: isAdmin || (isManager && managerCinemaId !== null),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const { data: movieOptionsResponse } = useQuery<IResponse<RevenueMovieOption[]>>({
    ...RevenueAdmin.getMovieOptions(movieOptionsCinemaId),
    enabled: isAdmin || (isManager && managerCinemaId !== null),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const { data: cinemaListRaw } = useQuery<any>({
    ...Cinema.getCinemaPublic({ page: 1, perPage: 100, search: "" }),
    enabled: isAdmin,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 1,
  });

  const revenueReportData = revenueReportResponse?.data ?? null;
  const movieOptions = movieOptionsResponse?.data ?? [];

  const cinemaCatalog = useMemo(() => {
    const fromApi = normalizeCinemaResponse(cinemaListRaw);
    const map = new Map<number, CinemaOption>();

    fromApi.forEach((item) => {
      map.set(item.id, item);
    });

    (revenueReportData?.cinemaRevenueRanking ?? []).forEach((item) => {
      if (!map.has(item.cinemaId)) {
        map.set(item.cinemaId, {
          id: item.cinemaId,
          name: item.cinemaName,
          imageUrl: item.cinemaImageUrl ?? null,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [cinemaListRaw, revenueReportData?.cinemaRevenueRanking]);

  const managerCinemaName = useMemo(() => {
    if (managerCinemaNameFromUser) return managerCinemaNameFromUser;
    if (managerCinemaId === null) return "Rạp quản lý";

    const matchedCinema = cinemaCatalog.find((item) => item.id === managerCinemaId);
    return (
      matchedCinema?.name ??
      revenueReportData?.cinemaRevenueRanking?.find((item) => item.cinemaId === managerCinemaId)?.cinemaName ??
      `Rạp #${managerCinemaId}`
    );
  }, [
    managerCinemaNameFromUser,
    managerCinemaId,
    cinemaCatalog,
    revenueReportData?.cinemaRevenueRanking,
  ]);

  useEffect(() => {
    if (!isManager) return;

    setDraftFilters((prev) => ({
      ...prev,
      cinemaId: managerCinemaId ?? null,
    }));

    setAppliedFilters((prev) => ({
      ...prev,
      cinemaId: managerCinemaId ?? null,
    }));
  }, [isManager, managerCinemaId]);

  useEffect(() => {
    if (!isError) return;
    toast.error("Không thể tải dữ liệu báo cáo dashboard.");
  }, [isError]);

  useEffect(() => {
    if (draftFilters.movieId == null) return;
    if (!movieOptions.length) return;

    const existed = movieOptions.some(
      (movie) => movie.movieId === draftFilters.movieId,
    );

    if (!existed) {
      applyFiltersDirectly({
        ...draftFilters,
        movieId: null,
      });
    }
  }, [movieOptions, draftFilters]);

  const report = revenueReportData ?? null;
  const summary = report?.summary ?? null;
  const dailyRevenue = report?.dailyRevenue ?? [];
  const movieRevenueRanking = report?.movieRevenueRanking ?? [];
  const cinemaRevenueRanking = report?.cinemaRevenueRanking ?? [];

  const topCinemas = [...cinemaRevenueRanking]
    .sort((a, b) => Number(b.totalRevenue ?? 0) - Number(a.totalRevenue ?? 0))
    .slice(0, 6);

  const chartData = dailyRevenue.map((item) => ({
    date: formatShortDate(item.date),
    revenue: item.totalRevenue,
    tickets: item.totalTicketsSold,
    bookings: item.totalPaidBookings,
  }));

  const pieData = useMemo(() => {
    if (!isAdmin || !cinemaRevenueRanking.length) return [];

    const positiveRows = cinemaRevenueRanking.filter(
      (item) => Number(item.totalRevenue ?? 0) > 0,
    );

    if (!positiveRows.length) return [];

    const total = positiveRows.reduce(
      (sum, item) => sum + Number(item.totalRevenue ?? 0),
      0,
    );

    return positiveRows.slice(0, 8).map((item) => ({
      name: item.cinemaName,
      value: Number(item.totalRevenue ?? 0),
      percentValue:
        total > 0
          ? `${((Number(item.totalRevenue ?? 0) / total) * 100).toFixed(2)}%`
          : "0.00%",
    }));
  }, [isAdmin, cinemaRevenueRanking]);

  const managerCinemaCard = useMemo(() => {
    if (!isManager) return null;
    return (
      cinemaRevenueRanking.find((item) => item.cinemaId === managerCinemaId) ??
      cinemaRevenueRanking[0] ??
      null
    );
  }, [isManager, cinemaRevenueRanking, managerCinemaId]);

  const managerCinemaDisplay = useMemo(() => {
    if (!isManager) return null;

    const fallbackCinema =
      managerCinemaCard ??
      summary?.topCinema ??
      (summary as any)?.lowestCinema ??
      cinemaRevenueRanking?.[0] ??
      null;

    if (fallbackCinema) {
      return fallbackCinema;
    }

    return {
      cinemaId: managerCinemaId ?? 0,
      cinemaName: managerCinemaName || "Rạp quản lý",
      cinemaImageUrl: null,
      totalRevenue: summary?.totalRevenue ?? 0,
      totalTicketsSold: summary?.totalTicketsSold ?? 0,
      totalPaidBookings: summary?.totalPaidBookings ?? 0,
      revenueSharePercent: 100,
      rank: 1,
    };
  }, [
    isManager,
    managerCinemaCard,
    summary,
    cinemaRevenueRanking,
    managerCinemaId,
    managerCinemaName,
  ]);

  const managerMovieCatalog = useMemo<ManagerMovieCatalogItem[]>(() => {
    if (!isManager) return [];

    return movieOptions.map((movie) => {
      const revenueMatched = movieRevenueRanking.find(
        (item) => item.movieId === movie.movieId,
      );

      return {
        movieId: movie.movieId,
        movieTitle: movie.movieTitle,
        posterUrl: movie.posterUrl ?? revenueMatched?.posterUrl ?? null,
        totalRevenue: revenueMatched?.totalRevenue ?? 0,
        totalTicketsSold: revenueMatched?.totalTicketsSold ?? 0,
        totalPaidBookings: revenueMatched?.totalPaidBookings ?? 0,
        revenueSharePercent: revenueMatched?.revenueSharePercent ?? 0,
        rank: revenueMatched?.rank ?? 0,
      };
    });
  }, [isManager, movieOptions, movieRevenueRanking]);

  const displayMovies = useMemo(() => {
    if (isManager) {
      return managerMovieCatalog;
    }

    return [...movieRevenueRanking]
      .sort((a, b) => Number(b.totalRevenue ?? 0) - Number(a.totalRevenue ?? 0))
      .slice(0, 5);
  }, [isManager, movieRevenueRanking, managerMovieCatalog]);

  const handleDateChange = (
    field: "startDate" | "endDate",
    value: string,
  ) => {
    applyFiltersDirectly(
      {
        ...draftFilters,
        [field]: value,
      },
      { showErrorToast: true },
    );
  };

  const handleMovieSelectChange = (value: string) => {
    const parsedValue = value.trim() === "" ? null : Number(value);

    applyFiltersDirectly({
      ...draftFilters,
      movieId:
        parsedValue === null || Number.isNaN(parsedValue) ? null : parsedValue,
    });
  };

  const handleCinemaSelectChange = (value: string) => {
    const parsedValue = value.trim() === "" ? null : Number(value);

    applyFiltersDirectly({
      ...draftFilters,
      cinemaId:
        parsedValue === null || Number.isNaN(parsedValue) ? null : parsedValue,
      movieId: null,
    });
  };

  const handleRefresh = async () => {
    if (isDateRangeInvalid(draftFilters)) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }

    await refetchRevenueReport();
    toast.success("Đã làm mới dữ liệu dashboard.");
  };

  const handleResetFilters = () => {
    const nextFilters = getRoleScopedFilters(getDefaultFilters());
    setDraftFilters(nextFilters);
    setAppliedFilters(nextFilters);
    toast.success("Đã đặt lại bộ lọc.");
  };

  return (
    <div className={`${beVietnamPro.className} min-h-screen bg-[#f6f8fb]`}>
      <main className="mx-auto flex w-full max-w-[1560px] flex-col gap-5 px-4 py-5 sm:px-6 xl:px-8">
        <header className="px-1 py-1">
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
            Tổng quan doanh thu rạp chiếu
          </h1>
        </header>

        <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
            <div className="relative">
              <CalendarMonthRoundedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={draftFilters.startDate ?? ""}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                className="h-11 w-full rounded-[14px] border border-slate-200 bg-white pl-10 pr-3 text-[14px] font-extrabold text-slate-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
              />
            </div>

            <div className="relative">
              <CalendarMonthRoundedIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={draftFilters.endDate ?? ""}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                className="h-11 w-full rounded-[14px] border border-slate-200 bg-white pl-10 pr-3 text-[14px] font-extrabold text-slate-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
              />
            </div>

            {isAdmin ? (
              <select
                value={draftFilters.cinemaId ?? ""}
                onChange={(e) => handleCinemaSelectChange(e.target.value)}
                className="h-11 w-full rounded-[14px] border border-slate-200 bg-white px-3 text-[14px] font-extrabold text-slate-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
              >
                <option value="">Tất cả rạp</option>
                {cinemaCatalog.map((cinema) => (
                  <option key={cinema.id} value={cinema.id}>
                    {cinema.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex h-11 items-center rounded-[14px] border border-slate-200 bg-white px-3 text-[14px] font-extrabold text-slate-700">
                <LocationOnRoundedIcon sx={{ fontSize: 18, marginRight: 8 }} />
                {managerCinemaName}
              </div>
            )}

            <select
              value={draftFilters.movieId ?? ""}
              onChange={(e) => handleMovieSelectChange(e.target.value)}
              className="h-11 w-full rounded-[14px] border border-slate-200 bg-white px-3 text-[14px] font-extrabold text-slate-800 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
            >
              <option value="">Tất cả phim</option>
              {movieOptions.map((movie) => (
                <option key={movie.movieId} value={movie.movieId}>
                  {movie.movieTitle}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-red-600 px-4 text-[13px] font-extrabold uppercase tracking-[0.10em] text-white transition hover:bg-red-700"
              >
                <RefreshRoundedIcon sx={{ fontSize: 18 }} />
                {isFetching ? "Đang tải" : "Làm mới"}
              </button>

              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 text-[13px] font-extrabold uppercase tracking-[0.10em] text-slate-700 transition hover:bg-slate-50"
              >
                <RestartAltRoundedIcon sx={{ fontSize: 18 }} />
                Reset
              </button>
            </div>
          </div>

          {isDateRangeInvalid(draftFilters) ? (
            <p className="mt-3 text-[13px] font-extrabold text-red-600">
              Ngày bắt đầu không được lớn hơn ngày kết thúc. Dữ liệu đang giữ theo bộ lọc hợp lệ gần nhất.
            </p>
          ) : null}
        </section>

        {isError ? (
          <EmptyState
            title="Không thể tải dữ liệu báo cáo"
            description="Kiểm tra lại API, query params hoặc cấu hình dữ liệu."
          />
        ) : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Doanh thu"
            value={formatCurrency(summary?.totalRevenue)}
            suffix="đ"
            icon={<PaidRoundedIcon />}
          />
          <StatCard
            title="Vé đã bán"
            value={formatNumber(summary?.totalTicketsSold)}
            suffix="vé"
            icon={<ConfirmationNumberRoundedIcon />}
          />
          <StatCard
            title="Booking"
            value={formatNumber(summary?.totalPaidBookings)}
            suffix="đơn"
            icon={<ReceiptLongRoundedIcon />}
          />
          <StatCard
            title="Phim"
            value={formatNumber(summary?.totalMovies)}
            suffix="phim"
            icon={<MovieRoundedIcon />}
            accent="slate"
          />
          <StatCard
            title="Rạp"
            value={formatNumber(summary?.totalCinemas)}
            suffix="rạp"
            icon={<LocationOnRoundedIcon />}
            accent="slate"
          />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:items-stretch">
          <div className="h-full">
            <SectionCard
              title="Biểu đồ doanh thu theo ngày"
              subtitle={
                isManager
                  ? `Biểu đồ doanh thu của chi nhánh ${managerCinemaName}.`
                  : "Biểu đồ thay đổi theo ngày, rạp và phim đã chọn."
              }
              className="h-full"
              right={
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-red-600">
                  {dailyRevenue.length} mốc
                </span>
              }
            >
              {isLoading ? (
                <EmptyState title="Đang tải dữ liệu biểu đồ..." />
              ) : !chartData.length ? (
                <EmptyState
                  title="Không có dữ liệu doanh thu"
                  description="Không tìm thấy booking đã thanh toán phù hợp với bộ lọc hiện tại."
                />
              ) : (
                <div className="h-[400px] w-full rounded-[20px] border border-slate-200 bg-slate-50 p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        tick={{
                          fontSize: 13,
                          fill: "#64748b",
                          fontWeight: 700,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{
                          fontSize: 13,
                          fill: "#64748b",
                          fontWeight: 700,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) =>
                          `${Math.round(Number(value) / 1000)}k`
                        }
                      />
                      <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ fill: "rgba(254, 242, 242, 0.9)" }}
                      />
                      <Bar dataKey="revenue" radius={[12, 12, 0, 0]} maxBarSize={54}>
                        {chartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === chartData.length - 1 ? "#dc2626" : "#f87171"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>
          </div>

          <div className="h-full">
            {isManager ? (
              <SectionCard
                title="Chi nhánh của bạn"
                subtitle="Manager chỉ được thấy tên rạp và dữ liệu của đúng chi nhánh mình quản lý."
                className="h-full"
              >
                <CinemaInfoCard
                  cinema={managerCinemaDisplay}
                  managerCinemaName={managerCinemaName}
                  resolveCinemaImageUrl={resolveCinemaImageUrl}
                  onImageError={handleImageError}
                />
              </SectionCard>
            ) : (
              <SectionCard
                title="Top rạp doanh thu"
                subtitle="Danh sách rạp nổi bật theo doanh thu trong khoảng lọc hiện tại."
                className="h-full"
                right={
                  <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-red-600">
                    Top {topCinemas.length}
                  </span>
                }
              >
                {!topCinemas.length ? (
                  <EmptyState title="Không có dữ liệu rạp." />
                ) : (
                  <div className="h-[400px] space-y-2 overflow-y-auto pr-1 [scrollbar-color:#ef4444_#e2e8f0] [scrollbar-width:thin]">
                    {topCinemas.map((cinema, index) => (
                      <div
                        key={cinema.cinemaId}
                        className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white p-3 transition hover:border-red-200 hover:bg-red-50/40"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-slate-100">
                          <img
                            src={resolveCinemaImageUrl(cinema.cinemaImageUrl)}
                            alt={cinema.cinemaName}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => handleImageError(e, CINEMA_PLACEHOLDER)}
                          />
                          <div className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white">
                            {index + 1}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-extrabold text-slate-900">
                            {cinema.cinemaName}
                          </p>
                          <p className="mt-1 text-[11px] font-semibold text-slate-500">
                            {formatNumber(cinema.totalTicketsSold)} vé • {formatNumber(cinema.totalPaidBookings)} booking
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[13px] font-extrabold text-red-600">
                            {formatCurrency(cinema.totalRevenue)}đ
                          </p>
                          <p className="text-[10px] font-semibold text-slate-500">
                            {formatPercent(cinema.revenueSharePercent)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            )}
          </div>
        </section>

        {isAdmin ? (
          <SectionCard
            title="Biểu đồ tròn tổng thể chi nhánh"
            subtitle="Tỷ trọng doanh thu của các chi nhánh trong khoảng lọc hiện tại."
          >
            {!pieData.length ? (
              <EmptyState
                title="Chưa có dữ liệu chi nhánh"
                description="Không có chi nhánh nào phát sinh doanh thu trong khoảng lọc hiện tại."
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.95fr]">
                <div className="h-[340px] rounded-[20px] border border-slate-200 bg-slate-50 p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={110}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`pie-cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieShareTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="max-h-[340px] overflow-y-auto pr-2 [scrollbar-color:#ef4444_#e2e8f0] [scrollbar-width:thin]">
                  <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1 [scrollbar-color:#ef4444_#e2e8f0] [scrollbar-width:thin]">
                    {pieData.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-[16px] border border-slate-200 bg-white px-3 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{
                              backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                            }}
                          />
                          <p className="truncate text-[14px] font-extrabold text-slate-900">
                            {item.name}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[13px] font-extrabold text-red-600">
                            {formatCurrency(item.value)}đ
                          </p>
                          <p className="text-[11px] font-semibold text-slate-500">
                            {item.percentValue}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        ) : null}

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:items-stretch">
          <div className="h-full">
            <SectionCard
              title={isManager ? "Tổng thể phim tại rạp" : "Top phim doanh thu"}
              subtitle={
                isManager
                  ? `Hiển thị toàn bộ phim thuộc chi nhánh ${managerCinemaName}, kể cả phim chưa phát sinh doanh thu trong bộ lọc hiện tại.`
                  : "Những phim có doanh thu nổi bật trong khoảng lọc hiện tại."
              }
              right={
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-red-600">
                  {isManager ? `${displayMovies.length} phim` : `Top ${displayMovies.length}`}
                </span>
              }
            >
              {!displayMovies.length ? (
                <EmptyState
                  title="Không có dữ liệu phim."
                  description={
                    isManager
                      ? "Rạp hiện chưa có phim hoặc API movie-options chưa trả dữ liệu."
                      : "Không có phim phù hợp với bộ lọc hiện tại."
                  }
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {displayMovies.map((movie) => (
                    <div
                      key={movie.movieId}
                      className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                    >
                      <div className="flex gap-4 p-4">
                        <div className="relative h-[132px] w-[96px] shrink-0 overflow-hidden rounded-[16px] bg-slate-100">
                          <img
                            src={resolveMoviePosterUrl(movie.posterUrl)}
                            alt={movie.movieTitle}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => handleImageError(e, MOVIE_PLACEHOLDER)}
                          />
                          <div className="absolute left-2 top-2 flex h-7 min-w-[28px] items-center justify-center rounded-full bg-white/95 px-2 text-[11px] font-extrabold text-red-600 shadow">
                            #{movie.rank || 0}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-[18px] font-extrabold leading-6 tracking-tight text-slate-900">
                            {movie.movieTitle}
                          </p>
                          <p className="mt-2 text-[24px] font-extrabold tracking-tight text-red-600">
                            {formatCurrency(movie.totalRevenue)} đ
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[13px] font-extrabold text-slate-700">
                              {formatNumber(movie.totalTicketsSold)} vé
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[13px] font-extrabold text-slate-700">
                              {formatNumber(movie.totalPaidBookings)} booking
                            </span>
                            <span className="rounded-full bg-red-50 px-3 py-1 text-[13px] font-extrabold text-red-600">
                              {formatPercent(movie.revenueSharePercent)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="h-full">
            <SectionCard
              title="Bảng xếp hạng nhanh"
              subtitle={
                isManager
                  ? `Bảng xếp hạng đang bám theo dữ liệu của chi nhánh ${managerCinemaName}.`
                  : "Tóm tắt nhanh top phim và top rạp."
              }
            >
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <WorkspacePremiumRoundedIcon className="text-red-600" />
                    <h3 className="text-[16px] font-extrabold tracking-tight text-slate-900">
                      Top phim
                    </h3>
                  </div>

                  {!displayMovies.length ? (
                    <EmptyState title="Không có dữ liệu phim." />
                  ) : (
                    <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1 [scrollbar-color:#ef4444_#e2e8f0] [scrollbar-width:thin]">
                      {displayMovies.map((movie, index) => (
                        <div
                          key={movie.movieId}
                          className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white px-3 py-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-red-600 text-white">
                            {index === 0 ? (
                              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <span className="text-[12px] font-extrabold">
                                #{movie.rank || 0}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-extrabold text-slate-900">
                              {movie.movieTitle}
                            </p>
                            <p className="mt-1 text-[12px] font-semibold text-slate-500">
                              {formatNumber(movie.totalTicketsSold)} vé • {formatNumber(movie.totalPaidBookings)} booking
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[14px] font-extrabold text-red-600">
                              {formatCurrency(movie.totalRevenue)}đ
                            </p>
                            <p className="text-[11px] font-semibold text-slate-500">
                              {formatPercent(movie.revenueSharePercent)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!isManager ? (
                  <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <StorefrontRoundedIcon className="text-red-600" />
                      <h3 className="text-[16px] font-extrabold tracking-tight text-slate-900">
                        Top rạp
                      </h3>
                    </div>

                    {!topCinemas.length ? (
                      <EmptyState title="Không có dữ liệu rạp." />
                    ) : (
                      <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1 [scrollbar-color:#ef4444_#e2e8f0] [scrollbar-width:thin]">
                        {topCinemas.map((cinema, index) => (
                          <div
                            key={cinema.cinemaId}
                            className="flex items-center gap-3 rounded-[16px] border border-slate-200 bg-white px-3 py-3"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-red-600 text-white">
                              {index === 0 ? (
                                <TrendingUpRoundedIcon sx={{ fontSize: 18 }} />
                              ) : (
                                <span className="text-[12px] font-extrabold">#{index + 1}</span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[15px] font-extrabold text-slate-900">
                                {cinema.cinemaName}
                              </p>
                              <p className="mt-1 text-[12px] font-semibold text-slate-500">
                                {formatNumber(cinema.totalTicketsSold)} vé • {formatNumber(cinema.totalPaidBookings)} booking
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-[14px] font-extrabold text-red-600">
                                {formatCurrency(cinema.totalRevenue)}đ
                              </p>
                              <p className="text-[11px] font-semibold text-slate-500">
                                {formatPercent(cinema.revenueSharePercent)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </SectionCard>
          </div>
        </section>
      </main>
    </div>
  );
}