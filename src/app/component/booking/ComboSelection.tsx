/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setStep, setCombos, resetBooking } from "@/store/bookingSlice";
import { selectBooking, selectHoldExpiresAt } from "@/store/selectors";
import { useNotification } from "@/hooks/useNotification";
import {  useQuery, useQueryClient } from "@tanstack/react-query";
import { Seat } from "@/types/data/seat/seat";
import {
  ICalculateBookingFeeForm,
  ICombo,
  useCalculateBookingFeeMutation,
  useReleaseSeatMutation,
} from "@/types/data/booking/booking";
import StepIndicator from "./StepIndicator";
import BookingSidebar from "./BookingSidebar";
import {
  ArrowBack,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import ConfirmBackStep from "../popup/ConfirmBackStep";
import { Combo, IComboItem } from "@/types/data/combo/combo";
import { useRouteQuery } from "@/hooks/useRouteQuery";

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_URL || "";

/** Map item từ API (chỉ COMBO) sang ICombo dùng trong booking */
function mapApiComboToBooking(item: IComboItem): ICombo {
  const base = IMAGE_BASE.replace(/\/$/, "");
  const image =
    item.imageUrl?.startsWith("http") || !item.imageUrl
      ? item.imageUrl || ""
      : `${base}${item.imageUrl.startsWith("/") ? item.imageUrl : `/${item.imageUrl}`}`;
  return {
    id: String(item.id),
    name: item.name,
    description: item.description ?? "",
    price: item.price,
    image,
    quantity: 0,
  };
}

function formatRemaining(secondsLeft: number): string {
  if (secondsLeft <= 0) return "00:00";
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ComboSelectionStep() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { searchQuery, serializeQuery } = useRouteQuery();
  const params = useMemo(() => {
    return serializeQuery({
      page: Number(searchQuery.get("page")) || 1,
      perPage: Number(searchQuery.get("perPage")) || 10,
      filterType:  "Combo",
    });
  }, [searchQuery, serializeQuery]);

  const { data: combosData } = useQuery({
    ...Combo.getCombos(params),
  });

  const apiComboList = useMemo(() => {
    const raw = combosData?.data?.data;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item: IComboItem) => item.type === "COMBO")
      .map(mapApiComboToBooking);
  }, [combosData?.data?.data]);

  const n = useNotification();
  const bookingState = useAppSelector(selectBooking);
  const holdExpiresAt = useAppSelector(selectHoldExpiresAt);
  const [combos, setCombosLocal] = useState<ICombo[]>([]);

  const [openConfirmBackStep, setOpenConfirmBackStep] = useState(false);
  const { mutate: releaseSeat } = useReleaseSeatMutation();
  const [now, setNow] = useState(() => Date.now());

  const remainingSeconds = useMemo(() => {
    if (!holdExpiresAt) return null;
    const end = new Date(holdExpiresAt).getTime();
    return Math.max(0, Math.floor((end - now) / 1000));
  }, [holdExpiresAt, now]);

  const timer =
    remainingSeconds != null ? formatRemaining(remainingSeconds) : "—";

  const prevApiIdsRef = useRef<string>("");
  useEffect(() => {
    if (apiComboList.length === 0) return;
    const ids = apiComboList.map((c) => c.id).join(",");
    if (prevApiIdsRef.current === ids) return;
    prevApiIdsRef.current = ids;
    const merged =
      bookingState.combos.length > 0
        ? apiComboList.map((apiCombo) => {
            const fromStore = bookingState.combos.find((c) => c.id === apiCombo.id);
            return fromStore ? { ...apiCombo, quantity: fromStore.quantity } : apiCombo;
          })
        : apiComboList;
    queueMicrotask(() => {
      setCombosLocal(merged);
      dispatch(setCombos(merged));
    });
  }, [apiComboList, bookingState.combos, dispatch]);

  useEffect(() => {
    if (holdExpiresAt == null) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const hasExpiredRef = useRef(false);
  useEffect(() => {
    if (
      remainingSeconds !== null &&
      remainingSeconds <= 0 &&
      !hasExpiredRef.current
    ) {
      hasExpiredRef.current = true;
      dispatch(resetBooking());
      queryClient.removeQueries({ queryKey: [Seat.queryKeys.getSeatMap] });
      n.error("Hết thời gian giữ ghế. Vui lòng đặt vé lại.");
      window.location.href = "/";
    }
  }, [remainingSeconds, dispatch, queryClient, n]);

  const updateQuantity = (comboId: string, change: number) => {
    setCombosLocal((prev) => {
      const next = prev.map((combo) => {
        if (combo.id === comboId) {
          const newQuantity = Math.max(0, combo.quantity + change);
          return { ...combo, quantity: newQuantity };
        }
        return combo;
      });
      dispatch(setCombos(next));
      return next;
    });
  };

  const handleProceed = () => {
    const seatIds = bookingState.heldSeatIds ?? [];
    if (seatIds.length === 0) {
      n.error("Không có thông tin ghế. Vui lòng quay lại bước chọn ghế.");
      return;
    }
    const combosPayload = combos
      .filter((c) => c.quantity > 0)
      .map((c) => ({
        id: c.id,
        comboId: c.id,
        productId: c.id,
        quantity: c.quantity,
      }));
    const payload: ICalculateBookingFeeForm = {
      showtimeId: Number(bookingState.showtimeId),
      seatIds,
      combos: combosPayload,
      voucherCode: "",
    };
    dispatch(setCombos(combos));
    caculateBookingFee(payload, {
      onSuccess: () => {
        n.success("Thành công chuyển đến thanh toán.");
        dispatch(setStep(3));
      },
      onError: (error) => {
        n.error(error.message);
      },
    });
  };

  const handleBack = () => {
    const showtimeIdNum = Number(bookingState.showtimeId);
    releaseSeat(
      {
        showtimeId: showtimeIdNum,
        seatIds: bookingState.heldSeatIds ?? [],
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [Seat.queryKeys.getSeatMap, showtimeIdNum],
          });
          dispatch(setStep(1));
        },
        onError: (error) => {
          n.error(error.message);
        },
      },
    );
  };
  const { mutate: caculateBookingFee } = useCalculateBookingFeeMutation();

  return (
    <div className="min-h-screen bg-[#0f0f1e]">
      <StepIndicator currentStep={2} />

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-white text-4xl font-bold mb-2">
                Chọn Combo Của Bạn
              </h1>
              <p className="text-gray-400">
                Chọn combo đồ ăn & thức uống yêu thích của bạn.
              </p>
              <button
                onClick={() => setOpenConfirmBackStep(true)}
                className="text-white cursor-pointer text-sm bg-[#1a1a2e] p-4 rounded-lg mr-4"
              >
                <ArrowBack />
              </button>

              <div className="bg-[#1a1a2e] rounded-lg p-4 mt-4 inline-flex items-center gap-2">
                <span className="text-white text-sm">
                  Ghế đang được giữ trong
                </span>
                <span className="text-red-500 font-bold">{timer}</span>
              </div>
            </div>

            <div className="space-y-4">
              {combos.map((combo) => (
                <div
                  key={combo.id}
                  className="bg-[#1a1a2e] rounded-xl p-6 flex items-center gap-6"
                >
                  <div className="w-24 h-24 bg-gray-700 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={combo.image}
                      alt={combo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white text-lg font-bold mb-1">
                      {combo.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {combo.description}
                    </p>
                    <span className="text-red-500 text-xl font-bold">
                      {combo.price.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(combo.id, -1)}
                      disabled={combo.quantity === 0}
                      className="cursor-pointer w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <KeyboardArrowLeft />
                    </button>

                    <span className="text-white text-xl font-bold w-8 text-center">
                      {combo.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(combo.id, 1)}
                      className="cursor-pointer w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition"
                    >
                      <KeyboardArrowRight />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <BookingSidebar
              step={2}
              actionButton={{
                label: "TIẾP TỤC",
                onClick: handleProceed,
              }}
            />
          </div>
          <ConfirmBackStep
            open={openConfirmBackStep}
            onClose={() => setOpenConfirmBackStep(false)}
            onConfirm={handleBack}
          />
        </div>
      </div>
    </div>
  );
}
