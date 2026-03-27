"use client";

import { Backdrop, Fade, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Toaster } from "sonner";
import SingleForm from "./SingleForm";
import ComboForm from "./ComboForm";
import { ICombo } from "@/types/data/concession/combo";
import { IComboItem } from "@/types/data/concession/comboitem";

export default function EditComboModal({
  open,
  onClose,
  refetchCombo,
  combo,
  type,
  comboItem,
}: {
  open: boolean;
  onClose: () => void;
  refetchCombo: () => void;
  combo: ICombo;
  type: "single" | "combo";
  comboItem: IComboItem[];
}) {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        visibleToasts={4}
        toastOptions={{
          duration: 3200,
          className:
            "!rounded-[20px] !border !border-[#ffd9d9] !bg-white !text-[#111827] !shadow-[0_20px_60px_rgba(255,45,47,0.14)]",
          style: {
            padding: "16px",
          },
        }}
      />

      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            className: "bg-black/60 backdrop-blur-sm",
          },
        }}
        className="flex items-center justify-center p-4 overflow-y-auto"
      >
        <Fade in={open}>
          <div className="relative w-full max-w-4xl rounded-[28px] border border-[#ececf2] bg-white flex flex-col max-h-[90vh] overflow-hidden shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
            <div className="flex items-center justify-between border-b border-[#eef0f4] px-6 py-5 shrink-0">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff6b6d]">
                  Quản lý F&amp;B
                </p>
                <h3 className="mt-2 text-[26px] font-extrabold tracking-[-0.03em] text-[#111827]">
                  {type === "single" ? "Chỉnh sửa sản phẩm" : "Chỉnh sửa combo"}
                </h3>
                <p className="mt-1 text-sm font-medium text-[#6b7280]">
                  Cập nhật thông tin và lưu lại thay đổi.
                </p>
              </div>

              <button
                onClick={onClose}
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#ececf2] bg-white text-[#6b7280] transition hover:border-[#ffd8d8] hover:bg-[#fff5f5] hover:text-[#ff2d2f]"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[#fcfcfd] px-6 py-6">
              <div className="rounded-[24px] border border-[#ececf2] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] md:p-6">
                {type === "single" ? (
                  <SingleForm
                    onClose={onClose}
                    refetchCombo={refetchCombo}
                    type="edit"
                    combo={combo}
                  />
                ) : (
                  <ComboForm
                    onClose={onClose}
                    refetchCombo={refetchCombo}
                    type="edit"
                    combo={combo}
                    comboItem={comboItem}
                  />
                )}
              </div>
            </div>
          </div>
        </Fade>
      </Modal>
    </>
  );
}