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
    <div className={`inline-flex items-center text-xs px-2 py-1 rounded-full border ${cls}`}>
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
      className={`${base} ${isOver ? "bg-blue-100/70 pointer-events-auto" : "pointer-events-none bg-transparent"}`}
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
      className={`relative border-r border-gray-200 bg-white ${isOver ? "bg-blue-50/40" : ""}`}
      style={{ height }}
    >
      {children}
    </div>
  );
}

function StartMarker({ top, label }: { top: number; label: string }) {
  const y = top - 6;

  return (
    <div className="absolute left-0 right-0 z-[6] pointer-events-none" style={{ top: y }}>
      <div className="relative">
        <div className="h-[2px] bg-red-500/90" />
        <div className="absolute left-2 -top-3 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold shadow">
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
  resolveUrl: (raw?: string | null) => string;
  dense?: boolean;
  slotHeight?: number;
}) {
  const src = resolveUrl(e.posterUrl ?? null);
  const borderCls = e.conflict ? "border-red-300 ring-1 ring-red-200" : "border-gray-200";

  const h = Number(slotHeight || 0);
  const compact = !dense && h > 0 && h < 120;
  const ultraCompact = !dense && h > 0 && h < 72;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.18 }}
      className={`h-full rounded-2xl border ${borderCls} bg-white shadow-sm overflow-hidden select-none hover:shadow-md`}
    >
      <div className={`h-full ${dense ? "p-4" : compact ? "p-2.5" : "p-4"}`}>
        {ultraCompact ? (
          <div className="h-full flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className={`font-bold truncate ${e.conflict ? "text-red-700" : "text-gray-900"}`}>
                {e.text}
              </div>
              <div className={`text-[11px] mt-0.5 ${e.conflict ? "text-red-600" : "text-gray-600"}`}>
                {hhmmFromISO(e.start)} - {hhmmFromISO(e.end)}
              </div>
            </div>

            <div className="shrink-0">
              <StatusPill status={e.status} conflict={!!e.conflict} />
            </div>
          </div>
        ) : compact ? (
          <div className="h-full flex gap-3">
            <div className="w-14 min-w-14 h-full rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
              {src ? <img src={src} alt={e.text} className="w-full h-full object-cover" /> : null}
            </div>

            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className={`font-bold truncate ${e.conflict ? "text-red-700" : "text-gray-900"}`}>
                    {e.text}
                  </div>
                  <div className={`text-xs mt-0.5 ${e.conflict ? "text-red-600" : "text-gray-600"}`}>
                    {hhmmFromISO(e.start)} - {hhmmFromISO(e.end)}
                  </div>
                </div>
                <StatusPill status={e.status} conflict={!!e.conflict} />
              </div>

              <div className="mt-auto pt-2">
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-600">
                  <LocalOffer fontSize="inherit" />
                  {Number.isFinite(Number(e.basePrice)) ? `${e.basePrice}` : "—"}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`h-full flex gap-4 ${dense ? "h-[104px]" : ""}`}>
            <div className="w-20 min-w-20 h-full rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
              {src ? <img src={src} alt={e.text} className="w-full h-full object-cover" /> : null}
            </div>

            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className={`font-extrabold truncate ${e.conflict ? "text-red-700" : "text-gray-900"}`}>
                    {e.text}
                  </div>
                  <div className={`text-sm mt-0.5 ${e.conflict ? "text-red-600" : "text-gray-600"}`}>
                    {hhmmFromISO(e.start)} - {hhmmFromISO(e.end)}
                  </div>
                </div>
                <StatusPill status={e.status} conflict={!!e.conflict} />
              </div>

              <div className="mt-auto pt-3 flex items-center justify-between text-sm text-gray-600">
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 bg-gray-50">
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
  resolveUrl: (raw?: string | null) => string;
  onDragStart: (ev: DragStartEvent) => void;
  onDragEnd: (ev: DragEndEvent) => void;
  openDetailModal: (id: number, autoEdit?: boolean) => void;
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
        className="absolute left-3 right-3 z-[10]"
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
            className="absolute top-2 right-2 z-20 h-9 w-9 rounded-xl border border-gray-200 bg-white/95 hover:bg-white flex items-center justify-center text-gray-700 shadow-sm"
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
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="relative" style={{ height: "calc(100vh - 220px)" }}>
        <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="h-full overflow-auto relative bg-white">
            <DayDropZone id="day-prev" />
            <DayDropZone id="day-next" />

            <div
              className="min-w-[1250px]"
              style={{
                display: "grid",
                gridTemplateColumns: `108px repeat(${resources.length || 1}, 320px)`,
              }}
            >
              <div className="sticky top-0 z-20 bg-white border-b border-gray-200" />

              {(resources.length
                ? resources
                : [{ id: 0, name: "—", type: null, totalSeats: 0 }]
              ).map((r: any) => (
                <div
                  key={r.id}
                  className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-extrabold text-gray-900">
                        {r.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {r.type ?? "—"} • {r.totalSeats ?? 0} ghế
                      </div>
                    </div>
                    <div className="text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                      {(r.type ?? "2D").toString()}
                    </div>
                  </div>
                </div>
              ))}

              <div
                className="relative border-r border-gray-200 bg-white"
                style={{ height: timelineHeight }}
              >
                {hours.map((hour) => {
                  const top = (hour * 60 - startMinute) * pxPerMinute;
                  return (
                    <div key={hour} className="absolute left-0 right-0" style={{ top }}>
                      <div className="text-xs text-gray-500 px-3 -translate-y-2">
                        {pad2(hour)}:00
                      </div>
                      <div className="h-px bg-gray-200" />
                    </div>
                  );
                })}
              </div>

              {(resources.length ? resources : [{ id: 0 }]).map((r: any) => (
                <DroppableRoomColumn
                  key={`col-${r.id}`}
                  roomId={r.id}
                  height={timelineHeight}
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 h-px bg-gray-100"
                      style={{ top: (hour * 60 - startMinute) * pxPerMinute }}
                    />
                  ))}

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