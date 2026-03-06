"use client";

import CloseIcon from "@mui/icons-material/Close";
import { Backdrop, Fade, Modal } from "@mui/material";
import { useState } from "react";
import SingleForm from "./SingleForm";
import ComboForm from "./ComboForm";

export default function AddConcessionModal({ open, onClose, refetchCombo }: {
    open: boolean, onClose: () => void,
    refetchCombo: () => void
}) {
    const [type, setType] = useState<"single" | "combo">("combo");
    return (
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
                <div className="relative w-full max-w-4xl rounded-xl bg-white border border-zinc-200 flex flex-col max-h-[90vh] font-sans">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-zinc-200 p-6 shrink-0">
                        <h3 className="text-xl font-bold text-zinc-900">Add New Combo</h3>
                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-zinc-900 transition-colors p-1 rounded-full hover:bg-zinc-100"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                    <div className="px-6 pt-4">
                        <div className="flex p-1 rounded-lg border border-border-dark">
                            <button
                                onClick={() => setType("single")}
                                className={`flex-1 py-2 px-4 rounded-md text-sm transition-all
      ${type === "single"
                                        ? "bg-red-500 text-white font-bold shadow-sm"
                                        : "text-black"} `}>
                                Sản phẩm lẻ
                            </button>
                            <button
                                onClick={() => setType("combo")}
                                className={`flex-1 py-2 px-4 rounded-md text-sm transition-all
      ${type === "combo"
                                        ? "bg-red-500 text-white font-bold shadow-sm"
                                        : "text-black"}`}>
                                Combo
                            </button>
                        </div>
                    </div>

                    {/* Form Body */}
                    <div className="bg-white backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div>
                            {
                                type === "single" ? (
                                    <SingleForm onClose={onClose} refetchCombo={refetchCombo} type="create" combo={undefined}></SingleForm>
                                ) : (
                                    <ComboForm onClose={onClose} refetchCombo={refetchCombo} type="create" combo={undefined}></ComboForm>
                                )
                            }

                        </div>
                    </div>
                    <div className="flex h-screen w-full overflow-hidden blur-[4px] pointer-events-none select-none">
                        <aside className="hidden w-64 flex-col bg-background-dark border-r border-border-dark lg:flex shrink-0">
                            <div className="flex h-full flex-col justify-between p-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-3 items-center pb-4 border-b border-border-dark">
                                        <div
                                            className="bg-center bg-no-repeat bg-cover rounded-full size-12 border-2 border-primary"
                                            style={{
                                                backgroundImage:
                                                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDlSCxDP50sM2DnE56TVE5Ka9ysqNGnVRptwX6XPFuWuDoLe7NW_uYA6D-VK8WTFw50MpyrwacRKAoRX3MlpVudwzW8U4G8bFjfy1qfb5dZazsiJT50lLFZIX_1PFXlKzjzXzw-JMEmrnBZJZGF7j8y6YSrmSk3YChbGxemJEAsWuYIk1lTTH36ABFjdf8oBAwEH8XJp1P_CsoIm7cD2nghmus_ahOUeRJFl9EXq0KCo4O6ymb10O3_LNGsDEERTyjm07fRXG5EiLh-")'
                                            }}
                                        />
                                        <div className="flex flex-col">
                                            <h1 className="text-white text-base font-bold">Cinema Admin</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                        <main className="flex-1 flex flex-col h-full bg-background-dark relative">
                            <header className="border-b border-border-dark p-6">
                                <h1 className="text-white text-3xl font-bold">Quản lý F&amp;B</h1>
                            </header>
                        </main>
                    </div>
                </div>
            </Fade>
        </Modal>
    )
}