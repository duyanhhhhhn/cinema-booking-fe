/* eslint-disable @next/next/no-img-element */
"use client";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentsIcon from "@mui/icons-material/Payments";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import PrintIcon from "@mui/icons-material/Print";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import MovieSelection from "@/app/component/Selection/MovieSelection";
import { useRouteQuery } from "@/hooks/useRouteQuery";
import CinemasSelection from "@/app/component/Selection/CinemasSelection";
import { useQuery } from "@tanstack/react-query";
import { ShowtimePublic } from "@/types/data/showtime-public/showtime-public";
import type { IShowtimePublic } from "@/types/data/showtime-public/type";
import { useAuth } from "@/contexts/AuthContext";
import React, { useCallback, useMemo, useState } from "react";
import { Seat } from "@/types/data/seat/seat";
import { Combo, IComboItem } from "@/types/data/combo/combo";
import { Schedule, ScheduleStatus } from "@/types/data/staff/schedule/schedule";
import {
  addDays,
  isShiftActiveAt,
  toIsoDate,
} from "@/app/component/admin/StaffSchedule/staffScheduleUtils";
import {
  ICreateBookingForAdminForm,
  useCreateBookingForAdminMutation,
} from "@/types/data/booking/booking";
import { useNotification } from "@/hooks/useNotification";

function isTicketSellerPosition(value?: string | null) {
  return String(value || "").toUpperCase() === "TICKET_SELLER";
}

function flattenShowtimes(
  data: unknown,
): { id: number; price: number; roomName: string; startTime: string }[] {
  if (!data) return [];
  const arr = Array.isArray(data) ? data : (data as { data?: unknown })?.data;
  if (!Array.isArray(arr)) return [];
  const first = arr[0];
  if (first && typeof first === "object" && "showtimes" in first) {
    return (arr as { showtimes?: IShowtimePublic[] }[]).flatMap((g) =>
      Array.isArray(g.showtimes) ? g.showtimes : [],
    );
  }
  return arr as {
    id: number;
    price: number;
    roomName: string;
    startTime: string;
  }[];
}

export default function AdminSellTicketsPage() {
  const { user, isAdmin } = useAuth();
  const { searchQuery, updateQuery, serializeQuery } = useRouteQuery();
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [selectedShowtime, setSelectedShowtime] =
    useState<IShowtimePublic | null>(null);
  const { mutate: createBookingForAdmin } = useCreateBookingForAdminMutation();
  const n = useNotification();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "CASH" | "MOMO"
  >("CASH");

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const scheduleQueryRange = useMemo(() => {
    const now = new Date();
    return {
      startDate: toIsoDate(addDays(now, -1)),
      endDate: toIsoDate(addDays(now, 1)),
    };
  }, []);
  const normalizedRole = String(user?.role || "").toUpperCase();
  const normalizedPosition = String((user as any)?.position || "").toUpperCase();
  const isStaffUser = normalizedRole === "STAFF";

  const qMySchedule = useQuery({
    ...Schedule.getMySchedule({
      startDate: scheduleQueryRange.startDate,
      endDate: scheduleQueryRange.endDate,
    }),
    enabled: Boolean(user) && !isAdmin,
    refetchInterval: 15000,
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });

  const canAccessSellTickets = useMemo(() => {
    if (isAdmin || normalizedRole === "MANAGER") {
      return true;
    }
    if (!isStaffUser) {
      return false;
    }

    const items = Array.isArray(qMySchedule.data?.data) ? qMySchedule.data.data : [];
    const now = new Date();
    return items.some((item) => {
      const itemPosition = String(
        item.staff.position || item.staff.roleName || normalizedPosition || "",
      ).toUpperCase();

      return (
        item.status !== ScheduleStatus.CANCELLED &&
        isTicketSellerPosition(itemPosition) &&
        isShiftActiveAt(item.workDate, item.shift, now)
      );
    });
  }, [isAdmin, isStaffUser, normalizedPosition, normalizedRole, qMySchedule.data]);

  const showtimeIdNum = selectedShowtime?.id ?? 0;
  const hasValidShowtimeId = showtimeIdNum > 0;

  const dateFromUrl = searchQuery.get("date");
  const dateValue =
    dateFromUrl != null
      ? dateFromUrl.includes("T")
        ? dateFromUrl.slice(0, 10)
        : dateFromUrl
      : "";
  const movieIdFromUrl = searchQuery.get("movieId");
  const movieId =
    movieIdFromUrl && !isNaN(Number(movieIdFromUrl))
      ? Number(movieIdFromUrl)
      : null;
  const effectiveCinemaId = isAdmin
    ? selectedCinemaId
    : user?.cinemaId != null
      ? Number(user.cinemaId)
      : null;

  const showtimeParams = useMemo(
    () =>
      effectiveCinemaId != null && movieId != null && dateValue
        ? serializeQuery({
            cinemaId: effectiveCinemaId,
            movieId,
            date: dateValue,
          })
        : null,
    [effectiveCinemaId, movieId, dateValue, serializeQuery],
  );

  const { data: dataShowtime } = useQuery({
    ...ShowtimePublic.objects.paginateQueryFactory(showtimeParams ?? {}),
    enabled: showtimeParams != null,
  });

  const { data: dataSeatMap } = useQuery({
    ...Seat.getSeatMap(showtimeIdNum),
    enabled: hasValidShowtimeId,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const resetShowtimeAndSeats = useCallback(() => {
    setSelectedShowtime(null);
    setSelectedSeats([]);
  }, []);

  const handleSelectShowtime = useCallback((st: IShowtimePublic) => {
    setSelectedShowtime(st);
    setSelectedSeats([]);
  }, []);

  const handleCinemaChange = useCallback(
    (id: number | null) => {
      setSelectedCinemaId(id);
      resetShowtimeAndSeats();
    },
    [resetShowtimeAndSeats],
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateQuery({ date: e.target.value || undefined });
      resetShowtimeAndSeats();
    },
    [updateQuery, resetShowtimeAndSeats],
  );

  const toggleSeat = useCallback((seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId],
    );
  }, []);

  const seatPriceMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!dataSeatMap?.seatMap) return map;
    dataSeatMap.seatMap.forEach((row) => {
      row.seats?.forEach((seat) => {
        const code = seat.code || `${row.rowLabel}${seat.number}`;
        map[code] = seat.price ?? 0;
      });
    });
    return map;
  }, [dataSeatMap]);

  const seatCodeToIdMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!dataSeatMap?.seatMap) return map;
    dataSeatMap.seatMap.forEach((row) => {
      row.seats?.forEach((seat) => {
        const code = seat.code || `${row.rowLabel}${seat.number}`;
        map[code] = seat.id;
      });
    });
    return map;
  }, [dataSeatMap]);

  const [selectedComboQtys, setSelectedComboQtys] = useState<
    Record<number, number>
  >({});

  const updateComboQty = useCallback((comboId: number, delta: number) => {
    setSelectedComboQtys((prev) => {
      const next = (prev[comboId] ?? 0) + delta;
      if (next <= 0) {
        const nextState = { ...prev };
        delete nextState[comboId];
        return nextState;
      }
      return { ...prev, [comboId]: next };
    });
  }, []);

  const seatsSubtotal = useMemo(
    () => selectedSeats.reduce((sum, id) => sum + (seatPriceMap[id] ?? 0), 0),
    [selectedSeats, seatPriceMap],
  );

  const showtimes = useMemo(
    () => flattenShowtimes(dataShowtime),
    [dataShowtime],
  );
  const params = useMemo(() => {
    return serializeQuery({
      page: Number(searchQuery.get("page")) || 1,
      perPage: Number(searchQuery.get("perPage")) || 10,
    });
  }, [searchQuery, serializeQuery]);

  const { data: combosData } = useQuery({
    ...Combo.getCombos(params),
  });
  /** COMBO và SINGLE (product) tách riêng để tránh trùng id */
  const dataCombo = useMemo((): IComboItem[] => {
    const raw = combosData?.data?.data ?? [];
    return Array.isArray(raw)
      ? raw.filter((item: IComboItem) => item.type === "COMBO")
      : [];
  }, [combosData?.data?.data]);
  const dataProducts = useMemo((): IComboItem[] => {
    const raw = combosData?.data?.data ?? [];
    return Array.isArray(raw)
      ? raw.filter((item: IComboItem) => item.type === "SINGLE")
      : [];
  }, [combosData?.data?.data]);
  const imgUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

  const [selectedProductQtys, setSelectedProductQtys] = useState<
    Record<number, number>
  >({});
  const updateProductQty = useCallback((productId: number, delta: number) => {
    setSelectedProductQtys((prev) => {
      const next = (prev[productId] ?? 0) + delta;
      if (next <= 0) {
        const nextState = { ...prev };
        delete nextState[productId];
        return nextState;
      }
      return { ...prev, [productId]: next };
    });
  }, []);

  const combosSubtotal = useMemo(
    () =>
      dataCombo.reduce(
        (sum, c) => sum + c.price * (selectedComboQtys[c.id] ?? 0),
        0,
      ),
    [dataCombo, selectedComboQtys],
  );
  const productsSubtotal = useMemo(
    () =>
      dataProducts.reduce(
        (sum, p) => sum + p.price * (selectedProductQtys[p.id] ?? 0),
        0,
      ),
    [dataProducts, selectedProductQtys],
  );
  const totalSubtotal = seatsSubtotal + combosSubtotal + productsSubtotal;

  const seatIdsForPayload = useMemo(() => {
    return selectedSeats
      .map((code) => seatCodeToIdMap[code])
      .filter((id): id is number => id != null && id > 0);
  }, [selectedSeats, seatCodeToIdMap]);

  const combosForPayload = useMemo((): ICreateBookingForAdminForm["combos"] => {
    return dataCombo
      .filter((combo) => (selectedComboQtys[combo.id] ?? 0) > 0)
      .map((combo) => ({
        id: combo.id,
        comboId: combo.id,
        productId: combo.id,
        quantity: selectedComboQtys[combo.id] ?? 0,
      }));
  }, [dataCombo, selectedComboQtys]);

  /** Sản phẩm lẻ: gửi comboId: 0 để backend phân biệt với combo */
  const productsForPayload =
    useMemo((): ICreateBookingForAdminForm["combos"] => {
      return dataProducts
        .filter((product) => (selectedProductQtys[product.id] ?? 0) > 0)
        .map((product) => ({
          id: product.id,
          comboId: 0,
          productId: product.id,
          quantity: selectedProductQtys[product.id] ?? 0,
        }));
    }, [dataProducts, selectedProductQtys]);

  const allCombosAndProductsForPayload = useMemo(
    () => [...combosForPayload, ...productsForPayload],
    [combosForPayload, productsForPayload],
  );

  const onSubmit = useCallback(() => {
    if (seatIdsForPayload.length === 0) {
      n.error("Vui lòng chọn ít nhất một ghế");
      return;
    }
    const payload: ICreateBookingForAdminForm = {
      showtimeId: Number(selectedShowtime?.id),
      seatIds: seatIdsForPayload,
      combos: allCombosAndProductsForPayload,
      voucherCode: "",
      paymentMethod: selectedPaymentMethod,
      staffId: Number(user?.id),
    };
    createBookingForAdmin(payload, {
      onSuccess: (data) => {
        if (selectedPaymentMethod === "CASH") {
          n.success("Đặt vé thành công");
          resetShowtimeAndSeats();
          setSelectedComboQtys({});
          setSelectedProductQtys({});
          window.location.href = `/admin/tickets/${data.data?.bookingCode}`;
          return;
        } else if (data.data?.paymentUrl) {
          window.location.href = data.data.paymentUrl;
          return;
        }
        n.success("Đặt vé thành công");
        resetShowtimeAndSeats();
        setSelectedComboQtys({});
        setSelectedProductQtys({});
      },
      onError: (error) => {
        n.error(error.message);
      },
    });
  }, [
    seatIdsForPayload,
    allCombosAndProductsForPayload,
    selectedShowtime?.id,
    user?.id,
    createBookingForAdmin,
    n,
    resetShowtimeAndSeats,
    selectedPaymentMethod,
  ]);

  if (!canAccessSellTickets) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-6 text-sm text-amber-800">
        Chỉ nhân viên `TICKET_SELLER` đang trong ca làm hiện tại mới được mở màn hình bán vé.
      </div>
    );
  }

  return (
    <div className="flex flex-col text-gray-900 overflow-hidden min-h-0">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 shrink-0 shadow-sm z-10">
        <MovieSelection onMovieChange={resetShowtimeAndSeats} />
        <CinemasSelection
          value={selectedCinemaId}
          onChange={handleCinemaChange}
        />

        <div className="w-full sm:w-40 lg:w-48 shrink-0">
          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 ml-1">
            Ngày chiếu
          </label>
          <input
            type="date"
            value={dateValue}
            onChange={handleDateChange}
            className="w-full bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-10 px-3 outline-none cursor-pointer scheme-light"
          />
        </div>

        <div className="w-full sm:flex-1 min-w-0">
          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 ml-1">
            Suất chiếu
          </label>
          <div className="flex flex-wrap gap-2">
            {showtimes.length === 0 && showtimeParams && (
              <span className="text-sm text-gray-500 py-2">
                Không có suất chiếu
              </span>
            )}
            {showtimes.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectShowtime(st)}
                className={`px-3 sm:px-4 py-2 rounded-lg cursor-pointer text-xs font-bold transition-transform active:scale-95 ${
                  selectedShowtime?.id === st.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {st.startTime}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:ml-auto text-left sm:text-right shrink-0">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">
            Phòng chiếu
          </p>
          <p className="text-indigo-600 font-bold text-base sm:text-lg">
            {selectedShowtime?.roomName ?? "—"}
          </p>
        </div>
      </header>

      {/* MAIN: Sơ đồ ghế + Tóm tắt (mobile: stack dọc, desktop: 2 cột) */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
        {/* KHU VỰC SƠ ĐỒ GHẾ */}
        <section className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col items-center min-h-0">
          <div className="w-full max-w-full min-w-0">
            {/* Màn hình cong */}
            <div className="text-center mb-6 sm:mb-12">
              <div
                className="h-2 sm:h-3 w-4/5 max-w-md mx-auto bg-linear-to-b from-indigo-500 to-transparent rounded-t-[50%] mb-2 sm:mb-4"
                style={{
                  boxShadow: "0 -10px 20px -5px rgba(79, 70, 229, 0.4)",
                }}
              />
              <p className="text-gray-400 text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase">
                MÀN HÌNH CHIẾU
              </p>
            </div>

            {/* Grid Ghế - dữ liệu từ API theo showtimeId */}
            <div className="flex flex-col gap-2 sm:gap-3 items-center overflow-x-auto w-full">
              {!selectedShowtime && (
                <p className="text-gray-500 text-sm py-8">
                  Chọn suất chiếu để xem sơ đồ ghế
                </p>
              )}
              {selectedShowtime && !dataSeatMap?.seatMap?.length && (
                <p className="text-gray-500 text-sm py-8">
                  Đang tải sơ đồ ghế...
                </p>
              )}
              {dataSeatMap?.seatMap && dataSeatMap.seatMap.length > 0 && (
                <>
                  <div className="grid gap-1.5 sm:gap-2.5 min-w-max">
                    {dataSeatMap.seatMap.map((row, rowIndex) => {
                      const standardSeats = row.seats?.filter(
                        (s) => (s.type ?? "").toUpperCase() !== "COUPLE",
                      );
                      if (!standardSeats?.length) return null;
                      return (
                        <div
                          key={`row-${rowIndex}`}
                          className="flex gap-1 sm:gap-2 items-center"
                        >
                          <span className="w-3 sm:w-4 text-[9px] sm:text-[10px] font-bold text-gray-400 shrink-0">
                            {row.rowLabel}
                          </span>
                          {standardSeats.map((seat) => {
                            const seatId =
                              seat.code || `${row.rowLabel}${seat.number}`;
                            const isAvailable =
                              String(seat.status ?? "").toUpperCase() ===
                              "AVAILABLE";
                            const isSelected = selectedSeats.includes(seatId);
                            const isVip =
                              (seat.type ?? "").toUpperCase() === "VIP";
                            let seatClasses =
                              "w-6 h-5 sm:w-8 sm:h-7 rounded-t-md sm:rounded-t-lg flex items-center justify-center text-[8px] sm:text-[9px] font-bold border-b-2 sm:border-b-4 transition-all";
                            if (!isAvailable) {
                              seatClasses +=
                                " bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed";
                            } else {
                              seatClasses +=
                                " cursor-pointer hover:-translate-y-0.5 sm:hover:-translate-y-1";
                              if (isSelected) {
                                seatClasses +=
                                  " bg-indigo-600 text-white border-indigo-800 shadow-[0_0_8px_rgba(79,70,229,0.5)]";
                              } else if (isVip) {
                                seatClasses +=
                                  " bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200";
                              } else {
                                seatClasses +=
                                  " bg-white text-gray-500 border-gray-200 hover:bg-gray-100";
                              }
                            }
                            return (
                              <button
                                key={seat.id}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() =>
                                  isAvailable && toggleSeat(seatId)
                                }
                                className={seatClasses}
                              >
                                {seat.code || seat.number}
                              </button>
                            );
                          })}
                          <span className="w-3 sm:w-4 text-[9px] sm:text-[10px] font-bold text-gray-400 text-right shrink-0">
                            {row.rowLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Ghế đôi (Couple) */}
                  <div className="mt-4 sm:mt-8 flex flex-wrap gap-2 sm:gap-4 justify-center">
                    {dataSeatMap.seatMap.map((row, rowIndex) => {
                      const coupleSeats = row.seats?.filter(
                        (s) => (s.type ?? "").toUpperCase() === "COUPLE",
                      );
                      if (!coupleSeats?.length) return null;
                      return (
                        <div
                          key={`couple-row-${rowIndex}`}
                          className="flex gap-2 sm:gap-4"
                        >
                          {coupleSeats.map((seat) => {
                            const seatId =
                              seat.code || `${row.rowLabel}${seat.number}`;
                            const isAvailable =
                              String(seat.status ?? "").toUpperCase() ===
                              "AVAILABLE";
                            const isSelected = selectedSeats.includes(seatId);
                            let seatClasses =
                              "w-12 h-7 sm:w-16 sm:h-9 rounded-t-lg sm:rounded-t-xl flex items-center justify-center text-[9px] sm:text-[10px] font-bold border-b-2 sm:border-b-4 transition-all";
                            if (!isAvailable) {
                              seatClasses +=
                                " bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed";
                            } else {
                              seatClasses +=
                                " cursor-pointer hover:-translate-y-0.5 sm:hover:-translate-y-1 ";
                              seatClasses += isSelected
                                ? "bg-pink-200 text-pink-800 border-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.4)]"
                                : "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100";
                            }
                            return (
                              <button
                                key={seat.id}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() =>
                                  isAvailable && toggleSeat(seatId)
                                }
                                className={seatClasses}
                              >
                                {seat.code || seatId}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Chú thích màu ghế */}
            <div className="mt-6 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-8 py-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white border border-gray-200"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  Thường
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-rose-100 border border-rose-200"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  VIP
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 rounded bg-pink-50 border border-pink-200"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  Đôi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-indigo-600"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  Đang chọn
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  Đã bán
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG - mobile full width dưới sơ đồ */}
        <aside className="w-full lg:w-[400px] lg:border-l border-gray-200 flex flex-col shrink-0 bg-white lg:shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 border-t lg:border-t-0 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCartIcon className="text-indigo-600" fontSize="small" />
              TÓM TẮT ĐƠN HÀNG
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Box: Danh sách ghế */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Danh sách ghế
                </h4>
                <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                  {selectedSeats.length} vé
                </span>
              </div>
              {selectedSeats.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500">Chọn ghế trên sơ đồ</p>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {selectedSeats.join(", ")}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Tổng: {selectedSeats.length} ghế
                    </p>
                  </div>
                  <span className="text-base font-bold text-indigo-600">
                    {seatsSubtotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
            </div>

            {/* Box: Combo Bắp Nước */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Combo
              </h4>
              <div className="space-y-3">
                {/* Item Combo 1 */}
                {dataCombo?.map((combo, comboIndex) => {
                  const qty = selectedComboQtys[combo.id] ?? 0;
                  return (
                    <div
                      key={`combo-${combo.id}-${comboIndex}`}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 transition-colors"
                    >
                      <img
                        alt={combo.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg bg-gray-100 shrink-0"
                        src={`${imgUrl}${combo.imageUrl}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 leading-tight">
                          {combo.name}
                        </p>
                        <p className="text-[11px] font-semibold text-indigo-600 mt-1">
                          {combo.price.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateComboQty(combo.id, -1)}
                          disabled={qty <= 0}
                          className="w-6 h-6 rounded bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-100 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RemoveIcon sx={{ fontSize: 14 }} />
                        </button>
                        <span className="text-xs font-bold w-3 text-center text-gray-800 min-w-[12px]">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateComboQty(combo.id, 1)}
                          className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 shadow-sm"
                        >
                          <AddIcon sx={{ fontSize: 14 }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Box: Sản phẩm lẻ */}
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Sản phẩm lẻ
              </h4>
              <div className="space-y-3">
                {dataProducts?.map((product, productIndex) => {
                  const qty = selectedProductQtys[product.id] ?? 0;
                  return (
                    <div
                      key={`product-${product.id}-${productIndex}`}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-200 transition-colors"
                    >
                      <img
                        alt={product.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg bg-gray-100 shrink-0"
                        src={`${imgUrl}${product.imageUrl}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 leading-tight">
                          {product.name}
                        </p>
                        <p className="text-[11px] font-semibold text-indigo-600 mt-1">
                          {product.price.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateProductQty(product.id, -1)}
                          disabled={qty <= 0}
                          className="w-6 h-6 rounded bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-100 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RemoveIcon sx={{ fontSize: 14 }} />
                        </button>
                        <span className="text-xs font-bold w-3 text-center text-gray-800 min-w-[12px]">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateProductQty(product.id, 1)}
                          className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 shadow-sm"
                        >
                          <AddIcon sx={{ fontSize: 14 }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KHU VỰC THANH TOÁN */}
          <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200 space-y-4 sm:space-y-5">
            <div className="flex justify-between items-center text-gray-500">
              <span className="text-xs uppercase font-bold tracking-wider">
                Tạm tính (vé)
              </span>
              <span className="text-sm font-bold text-gray-700">
                {seatsSubtotal.toLocaleString("vi-VN")}đ
              </span>
            </div>
            {(combosSubtotal > 0 || productsSubtotal > 0) && (
              <>
                {combosSubtotal > 0 && (
                  <div className="flex justify-between items-center text-gray-500">
                    <span className="text-xs uppercase font-bold tracking-wider">
                      Combo
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {combosSubtotal.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                {productsSubtotal > 0 && (
                  <div className="flex justify-between items-center text-gray-500">
                    <span className="text-xs uppercase font-bold tracking-wider">
                      Sản phẩm lẻ
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {productsSubtotal.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between items-end border-b border-gray-200 pb-4 sm:pb-5">
              <span className="text-xs sm:text-sm uppercase font-bold text-gray-800">
                Tổng thanh toán
              </span>
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 leading-none">
                {totalSubtotal.toLocaleString("vi-VN")}đ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
              <button
                onClick={() => setSelectedPaymentMethod("CASH")}
                className={`flex ${selectedPaymentMethod === "CASH" ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-gray-200 text-gray-600"} cursor-pointer flex-col items-center justify-center py-3 px-2 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 rounded-xl border transition-all shadow-sm group`}
              >
                <PaymentsIcon className="mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold uppercase tracking-wide mt-1">
                  Tiền mặt
                </span>
              </button>
              <button
                onClick={() => setSelectedPaymentMethod("MOMO")}
                className={`flex ${selectedPaymentMethod === "MOMO" ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-gray-200 text-gray-600"} cursor-pointer flex-col items-center justify-center py-3 px-2 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 rounded-xl border transition-all shadow-sm group`}
              >
                <QrCode2Icon className="mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold uppercase tracking-wide mt-1">
                  Chuyển khoản
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={selectedSeats.length === 0}
              className="w-full bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 text-white font-bold py-3 sm:py-4 rounded-xl text-sm sm:text-base shadow-[0_8px_20px_-6px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              <PrintIcon fontSize="small" />
              XUẤT VÉ & THANH TOÁN
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
