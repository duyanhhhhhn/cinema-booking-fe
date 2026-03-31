import React from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { EditOutlined, LocalOffer, WarningAmber } from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  calcDurationMs,
  hhmmFromISO,
  pad2,
  statusVi,
} from "../helpers/SchedulerLogic";

function StatusPill({ status, conflict }: { status: string; conflict: boolean }) {
  if (conflict) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-700 shadow-sm">
        <WarningAmber fontSize="inherit" />
        Xung đột
      </div>
    );
  }

  const s = String(status ?? "").trim().toUpperCase();
  const cls =
    s === "COMPLETED"
      ? "border-red-100 bg-red-50 text-red-600"
      : s === "CANCELLED"
        ? "border-gray-200 bg-gray-100 text-gray-600"
        : "border-[#ececf2] bg-white text-slate-600";

  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black shadow-sm ${cls}`}>
      {statusVi(s)}
    </div>
  );
}

function DayDropZone({ id }: { id: "day-prev" | "day-next" }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const base =
    id === "day-prev"
      ? "absolute left-0 top-0 bottom-0 w-10"
      : "absolute right-0 top-0 bottom-0 w-10";

  return (
    <div
      ref={setNodeRef}
      className={`${base} ${
        isOver
          ? "pointer-events-auto bg-[linear-gradient(180deg,rgba(239,68,68,0.08),rgba(254,202,202,0.24))]"
          : "pointer-events-none bg-transparent"
      }`}
    />
  );
}

function DroppableRoomColumn({
  roomId,
  height,
  children,
}: {
  roomId: number;
  height: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `room:${roomId}` });

  return (
    <div
      ref={setNodeRef}
      className={`relative border-l border-[#eef0f3] bg-white ${
        isOver ? "bg-[linear-gradient(180deg,rgba(254,242,242,0.9),rgba(255,241,242,0.96))]" : ""
      }`}
      style={{ height }}
    >
      {children}
    </div>
  );
}

function StartMarker({ top, label }: { top: number; label: string }) {
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-[40]"
      style={{ top }}
    >
      <div className="relative">
        <div className="h-[2px] bg-[linear-gradient(90deg,#ef4444,#fda4af)] shadow-[0_0_16px_rgba(239,68,68,0.18)]" />
        <div className="absolute left-3 -top-3 rounded-full border border-red-100 bg-white px-2.5 py-0.5 text-[10px] font-black tracking-[0.04em] text-red-600 shadow-[0_10px_22px_rgba(239,68,68,0.10)]">
          {label}
        </div>
      </div>
    </div>
  );
}

function ShowtimeCardBody({
  e,
  resolveUrl,
  dense,
  slotHeight,
}: {
  e: any;
  resolveUrl: (_raw?: string | null) => string;
  dense?: boolean;
  slotHeight?: number;
}) {
  const src = resolveUrl(e.posterUrl ?? null);
  const borderCls = e.conflict ? "border-red-300 ring-1 ring-red-100" : "border-[#ececf2]";

  const h = Number(slotHeight || 0);
  const compact = !dense && h > 0 && h < 120;
  const ultraCompact = !dense && h > 0 && h < 72;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.18 }}
      className={`h-full overflow-hidden rounded-[26px] border ${borderCls} bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)] select-none hover:shadow-[0_24px_48px_rgba(15,23,42,0.11)]`}
    >
      <div className={`h-full ${dense ? "p-4" : compact ? "p-2.5" : "p-4"}`}>
        {ultraCompact ? (
          <div className="flex h-full items-center justify-between gap-3">
            <div className="min-w-0">
              <div className={`truncate font-black tracking-[-0.02em] ${e.conflict ? "text-red-700" : "text-gray-900"}`}>
                {e.text}
              </div>
              <div className={`mt-0.5 text-[11px] font-bold ${e.conflict ? "text-red-600" : "text-gray-600"}`}>
                {hhmmFromISO(e.start)} - {hhmmFromISO(e.end)}
              </div>
            </div>

            <div className="shrink-0">
              <StatusPill status={e.status} conflict={!!e.conflict} />
            </div>
          </div>
        ) : compact ? (
          <div className="flex h-full gap-3">
            <div className="h-full w-14 min-w-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {src ? <img src={src} alt={e.text} className="h-full w-full object-cover" /> : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className={`truncate font-black tracking-[-0.02em] ${e.conflict ? "text-red-700" : "text-gray-900"}`}>
                    {e.text}
                  </div>
                  <div className={`mt-0.5 text-xs font-bold ${e.conflict ? "text-red-600" : "text-gray-600"}`}>
                    {hhmmFromISO(e.start)} - {hhmmFromISO(e.end)}
                  </div>
                </div>
                <StatusPill status={e.status} conflict={!!e.conflict} />
              </div>

              <div className="mt-auto pt-2">
                <div className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-600">
                  <LocalOffer fontSize="inherit" />
                  {Number.isFinite(Number(e.basePrice)) ? `${e.basePrice}` : "—"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex h-full gap-4 ${dense ? "h-[104px]" : ""}`}>
            <div className="h-full w-20 min-w-20 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {src ? <img src={src} alt={e.text} className="h-full w-full object-cover" /> : null}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className={`truncate font-black tracking-[-0.03em] ${e.conflict ? "text-red-700" : "text-gray-900"}`}>
                    {e.text}
                  </div>
                  <div className={`mt-1 text-sm font-bold ${e.conflict ? "text-red-600" : "text-gray-600"}`}>
                    {hhmmFromISO(e.start)} - {hhmmFromISO(e.end)}
                  </div>
                </div>
                <StatusPill status={e.status} conflict={!!e.conflict} />
              </div>

              <div className="mt-auto flex items-center justify-between pt-3 text-sm text-gray-600">
                <div className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 font-black text-red-600">
                  <LocalOffer fontSize="inherit" />
                  {Number.isFinite(Number(e.basePrice)) ? `${e.basePrice}` : "—"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function SchedulerBoard(props: {
  resources: any[];
  events: any[];
  hours: number[];
  timelineHeight: number;
  startMinute: number;
  pxPerMinute: number;
  activeId: number | null;
  activeEvent: any;
  resolveUrl: (_raw?: string | null) => string;
  onDragStart: (_ev: DragStartEvent) => void;
  onDragEnd: (_ev: DragEndEvent) => void;
  openDetailModal: (_id: number, _autoEdit?: boolean) => void;
  dragArmedRef: React.MutableRefObject<boolean>;
  armDrag: () => void;
  disarmDrag: () => void;
}) {
  const {
    resources,
    events,
    hours,
    timelineHeight,
    startMinute,
    pxPerMinute,
    activeId,
    activeEvent,
    resolveUrl,
    onDragStart,
    onDragEnd,
    openDetailModal,
    dragArmedRef,
    armDrag,
    disarmDrag,
  } = props;

  const TIME_COL_WIDTH = 104;
  const ROOM_COL_WIDTH = 320;
  const HEADER_HEIGHT = 62;
  const HOUR_LABEL_OFFSET = 18;

  const boardResources = resources.length
    ? resources
    : [{ id: 0, name: "—", type: null, totalSeats: 0 }];

  function DraggableCard({
    e,
    top,
    height,
  }: {
    e: any;
    top: number;
    height: number;
  }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({
        id: `event:${e.id}`,
        data: { eventId: e.id, roomId: e.resource, startISO: e.start },
      });

    const style = {
      transform: CSS.Translate.toString(transform),
      opacity: isDragging ? 0 : activeId === e.id ? 0 : 1,
      cursor: dragArmedRef.current ? "grabbing" : "pointer",
    } as React.CSSProperties;

    return (
      <div
        ref={setNodeRef}
        className="absolute left-2 right-2 z-[20]"
        style={{ top, height, ...style }}
        onMouseDown={armDrag}
        onMouseUp={disarmDrag}
        onMouseLeave={disarmDrag}
        onTouchStart={armDrag}
        onTouchEnd={disarmDrag}
        {...attributes}
        {...listeners}
        onClick={(ev) => {
          ev.preventDefault();
          if (isDragging) return;
          if (dragArmedRef.current) return;
          openDetailModal(Number(e.id), false);
        }}
      >
        <div className="relative h-full">
          <button
            type="button"
            onPointerDown={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
            }}
            onMouseDown={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
            }}
            onTouchStart={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
            }}
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              openDetailModal(Number(e.id), true);
            }}
            className="absolute right-2 top-2 z-20 flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 shadow-[0_10px_24px_rgba(239,68,68,0.10)] transition hover:bg-red-50"
            aria-label="Edit"
          >
            <EditOutlined fontSize="small" />
          </button>

          <ShowtimeCardBody e={e} resolveUrl={resolveUrl} slotHeight={height} />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#e8ebf0] bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
      <div className="border-b border-[#ececf2] bg-white px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Lưới phòng chiếu
            </div>
            <div className="mt-1 text-[22px] font-black tracking-[-0.03em] text-slate-900">
              Theo dõi suất chiếu theo từng phòng
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-full border border-[#ececf2] bg-white px-3 py-1.5 text-[11px] font-black text-slate-600 shadow-sm">
              {boardResources.length} phòng
            </div>
            <div className="rounded-full border border-[#ececf2] bg-white px-3 py-1.5 text-[11px] font-black text-slate-600 shadow-sm">
              {events.length} suất chiếu
            </div>
            <div className="rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-[11px] font-black text-red-600 shadow-sm">
              Kéo để đổi phòng hoặc giờ
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-white" style={{ height: "calc(100vh - 250px)" }}>
        <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="relative h-full overflow-auto bg-transparent">
            <DayDropZone id="day-prev" />
            <DayDropZone id="day-next" />

            <div
              className="min-w-[1250px]"
              style={{
                display: "grid",
                gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(${boardResources.length}, ${ROOM_COL_WIDTH}px)`,
                gridTemplateRows: `${HEADER_HEIGHT}px ${timelineHeight}px`,
              }}
            >
              <div className="sticky top-0 z-30 border-b border-r border-[#e8ebf0] bg-[#fcfcfd]" />

              {boardResources.map((r: any) => (
                <div
                  key={r.id}
                  className="sticky top-0 z-30 border-b border-r border-[#e8ebf0] bg-[#fcfcfd] px-4 py-3"
                  style={{ height: HEADER_HEIGHT }}
                >
                  <div className="flex h-full items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-black tracking-[-0.02em] text-gray-900">
                        {r.name}
                      </div>
                      <div className="mt-0.5 text-xs font-bold text-gray-500">
                        {r.type ?? "—"} • {r.totalSeats ?? 0} ghế
                      </div>
                    </div>

                    <div className="shrink-0 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-600">
                      {(r.type ?? "2D").toString()}
                    </div>
                  </div>
                </div>
              ))}

              <div
                className="relative border-r border-[#e8ebf0] bg-[#fcfcfd]"
                style={{ height: timelineHeight }}
              >
                {hours.map((hour) => {
                  const top = (hour * 60 - startMinute) * pxPerMinute;

                  return (
                    <React.Fragment key={hour}>
                      <div
                        className="absolute left-0 right-0 bg-[#eef0f3]"
                        style={{ top, height: 1 }}
                      />
                      <div
                        className="absolute left-0 right-0 px-4 text-base font-black tracking-[-0.02em] text-slate-500"
                        style={{ top: top + HOUR_LABEL_OFFSET }}
                      >
                        {pad2(hour)}:00
                      </div>
                    </React.Fragment>
                  );
                })}

                <div
                  className="absolute left-0 right-0 bg-[#eef0f3]"
                  style={{ top: timelineHeight - 1, height: 1 }}
                />
              </div>

              {boardResources.map((r: any) => (
                <DroppableRoomColumn
                  key={`col-${r.id}`}
                  roomId={r.id}
                  height={timelineHeight}
                >
                  {hours.map((hour) => {
                    const top = (hour * 60 - startMinute) * pxPerMinute;

                    return (
                      <div
                        key={hour}
                        className="absolute left-0 right-0 bg-[#f8fafc]"
                        style={{ top, height: 1 }}
                      />
                    );
                  })}

                  <div
                    className="absolute left-0 right-0 bg-[#f8fafc]"
                    style={{ top: timelineHeight - 1, height: 1 }}
                  />

                  {events
                    .filter((e: any) => e.resource === r.id)
                    .map((e: any) => {
                      const startDate = new Date(e.start);
                      const startTotalMinutes =
                        startDate.getHours() * 60 +
                        startDate.getMinutes() +
                        startDate.getSeconds() / 60;

                      const top = (startTotalMinutes - startMinute) * pxPerMinute;
                      const durationMinutes = calcDurationMs(e.start, e.end) / 60000;
                      const height = Math.max(18, durationMinutes * pxPerMinute);

                      return (
                        <React.Fragment key={e.id}>
                          <StartMarker top={top} label={hhmmFromISO(e.start)} />
                          <DraggableCard e={e} top={top} height={height} />
                        </React.Fragment>
                      );
                    })}
                </DroppableRoomColumn>
              ))}
            </div>

            <DragOverlay>
              {activeEvent ? (
                <div className="w-[340px]">
                  <ShowtimeCardBody e={activeEvent} resolveUrl={resolveUrl} dense />
                </div>
              ) : null}
            </DragOverlay>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
