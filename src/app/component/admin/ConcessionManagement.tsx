"use client";
import { useQuery } from "@tanstack/react-query";
import ConcessionTable from "./concessions/ConcessionTable";
import { Combo } from "@/types/data/concession/combo";
import { useMemo, useState } from "react";
import AddConcessionModal from "./concessions/modal/AddConcessionModal";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { Typography } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';


export default function ConcessionManagement() {
    const [openAddConcessionModal, setopenAddConcessionModal] = useState(false);
    const queryParams = useMemo(() => {
        return {
            page: 1,
            size: 10
        }
    }, [])

    const { data, refetch: refetchCombo } = useQuery({ ...Combo.objects.paginateQueryFactory(queryParams) });
    const combo = data?.data || [];
    console.log("combo:", combo);
    const [filterType, setFilterType] = useState<"ALL" | "COMBO" | "SINGLE">("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const filteredProducts = combo.filter((p) => {
        if (filterType === "ALL") return true;
        return p.type === filterType;
    });
    const searchCon = useMemo(() => {
        if (!filteredProducts.length) return [];
        if (searchTerm === "") return filteredProducts;
        return filteredProducts.filter((pro) =>
            pro.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
        );
    }, [filteredProducts, searchTerm]);
    const total = combo.length;
    return <>
        <>
            <div className="flex h-screen w-full overflow-hidden">
                {/* Main Content */}
                <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative">
                    {/* Header Sticky */}
                    <header className="flex-shrink-0 border-b border-border-dark bg-background-dark/95 backdrop-blur z-10">
                        <div className="max-w-[1400px] mx-auto w-full">
                            <div className="flex flex-wrap justify-between items-center gap-4 p-6">
                                <div className="flex flex-col gap-1">
                                    <h1 className=" text-2xl md:text-3xl font-bold tracking-tight">
                                        Quản lý F&amp;B
                                    </h1>
                                    <p className="text-text-secondary text-sm">
                                        Quản lý danh mục đồ ăn, nước uống và các combo khuyến mãi
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setopenAddConcessionModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-red-500 hover:text-white text-sm font-medium rounded-lg shadow-lg shadow-primary/20 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">
                                            <AddIcon></AddIcon>
                                            Thêm Combo
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
                            {/* Stats Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2 rounded-xl p-5 border border-border-dark bg-surface-dark/50">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium">
                                            Tổng sản phẩm
                                        </p>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold">{total}</p>
                                        <p className="text-green-500 text-xs font-medium bg-green-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 rounded-xl p-5 border border-border-dark bg-surface-dark/50">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-medium">
                                            Cảnh báo tồn kho
                                        </p>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold">3</p>
                                        <p className="text-orange-500 text-xs font-medium bg-orange-500/10 px-1.5 py-0.5 rounded">
                                            Cần nhập thêm
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 rounded-xl p-5 border border-border-dark bg-surface-dark/50">
                                    <div className="flex justify-between items-start">
                                        <p className="text-text-secondary text-sm font-medium">
                                            Doanh thu hôm nay
                                        </p>
                                        <span className="material-symbols-outlined text-green-500 bg-green-500/10 p-1.5 rounded-lg">
                                            payments
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold">
                                            5.2M{" "}
                                            <span className="text-sm font-normal">
                                                VND
                                            </span>
                                        </p>
                                        <p className="text-green-500 text-xs font-medium bg-green-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <TrendingUpIcon></TrendingUpIcon>
                                            +12% vs hqua
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Filters & Search */}
                            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-surface-dark p-4 rounded-xl border border-border-dark">
                                {/* Search */}
                                <div className="relative w-full lg:max-w-md">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <button className="material-symbols-outlined">
                                            <SearchIcon></SearchIcon>
                                        </button>
                                    </span>
                                    <input
                                        onChange={e => { setSearchTerm(e.target.value), console.log(searchCon) }}
                                        className="w-full bg-background-dark border text-sm rounded-lg focus:ring-primary focus:border-primary block pl-10 p-2.5 placeholder-text-secondary"
                                        type="text"
                                    />
                                </div>
                                {/* Chips */}
                                <div className="flex gap-2 overflow-x-auto w-full pb-1 lg:pb-0 scrollbar-hide">
                                    <button
                                        onClick={() => setFilterType("ALL")}
                                        className={filterType === "ALL" ? "flex items-center px-4 py-1.5 rounded-full bg-red-500 text-white text-sm font-medium whitespace-nowrap transition-colors" : "flex items-center px-4 py-1.5 rounded-full bg-background-dark border border-border-dark hover:text-red-600 hover:border-red-600  text-sm font-medium whitespace-nowrap transition-colors"}>
                                        Tất cả
                                    </button>
                                    <button
                                        onClick={() => setFilterType("COMBO")}
                                        className={filterType === "COMBO" ? "flex items-center px-4 py-1.5 rounded-full bg-red-500 text-white text-sm font-medium whitespace-nowrap transition-colors" : "flex items-center px-4 py-1.5 rounded-full bg-background-dark border border-border-dark hover:text-red-600 hover:border-red-600 text-sm font-medium whitespace-nowrap transition-colors"}>
                                        Combo
                                    </button>
                                    <button
                                        onClick={() => setFilterType("SINGLE")}
                                        className={filterType === "SINGLE" ? "flex items-center px-4 py-1.5 rounded-full bg-red-500 text-white text-sm font-medium whitespace-nowrap transition-colors" : "flex items-center px-4 py-1.5 rounded-full bg-background-dark border border-border-dark hover:text-red-600 hover:border-red-600 text-sm font-medium whitespace-nowrap transition-colors"}>
                                        Món lẻ
                                    </button>
                                </div>
                            </div>
                            {/* Data Table */}
                            <ConcessionTable
                                combo={searchCon} refetchCombo={refetchCombo} />
                        </div>
                    </div>
                </main>
                <AddConcessionModal open={openAddConcessionModal}
                    onClose={() => setopenAddConcessionModal(false)}
                    refetchCombo={refetchCombo}>
                </AddConcessionModal>
            </div>
        </>

    </>
}