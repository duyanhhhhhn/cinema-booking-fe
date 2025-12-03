"use client"

import { useState } from "react";

export default function HomePage() {
    const dangChieu = [];
    const sapChieu = [];
    const render = [];
    const [movies, setMovies] = useState([]);
    const [tab, setTab] = useState("dangChieu");
    function change(key) {
        let movie = [];
        if (key === "dangChieu") {
            movie = dangChieu;
        }
        else if (key === "sapChieu") {
            movie = sapChieu;
        }
        setMovies(movie);
        setTab(key);
    }
    for (let i = 0; i < 6; i++) {
        render.push(
            <div key={i} className="flex flex-col gap-3 pb-3 group">
                <a>
                    <div className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-lg overflow-hidden relative shadow-lg shadow-black/30 transform group-hover:scale-105 transition-transform duration-300">
                        <div className="absolute inset-0 bg-cover bg-center" data-alt="Movie poster 1"
                            style={{
                                backgroundImage:
                                    'url("")'
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                            <button className="w-full text-center bg-primary text-white font-bold py-2 rounded-md text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                Mua Vé
                            </button>
                        </div>
                    </div>
                    <div>
                        <p className="text-white text-base font-medium leading-normal">
                            Tên Phim 1
                        </p>
                        <p className="text-[#E0E0E0]/70 text-sm font-normal leading-normal">
                            Hành động
                        </p>
                    </div>
                </a>
            </div>)
    }
    return (
        <>
            <div className="bg-dark relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: "#121212" }}>
                <div className="layout-container flex h-full grow flex-col">
                    <main className="flex flex-1 justify-center py-5 sm:py-8">
                        <div className="layout-content-container flex flex-col max-w-7xl flex-1 px-4 sm:px-10">
                            <div className="relative w-full aspect-[16/7] rounded-xl overflow-hidden mb-8 shadow-lg shadow-black/20">
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    data-alt="A brightly lit cinema hall with red seats, viewed from the back."
                                    style={{
                                        backgroundImage:
                                            'url("https://wallpapers.com/images/hd/cinema-theater-screen-red-interior-mdii641t9soyox58.jpg")'
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                                <div className="absolute bottom-0 left-0 p-6 md:p-10">
                                    <h1 className="text-white text-3xl md:text-5xl font-bold mb-2">
                                        Phim Bom Tấn Của Tuần
                                    </h1>
                                    <p className="text-[#E0E0E0] md:text-lg max-w-xl mb-4">
                                        Trải nghiệm những thước phim hành động mãn nhãn và kỹ xảo đỉnh
                                        cao trên màn ảnh rộng.
                                    </p>
                                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                                        style={{ backgroundColor: "red" }}>
                                        <span className="truncate">Đặt Vé Ngay</span>
                                    </button>
                                </div>
                                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                    <button className="size-2 rounded-full bg-white" />
                                    <button className="size-2 rounded-full bg-white/50" />
                                    <button className="size-2 rounded-full bg-white/50" />
                                </div>
                            </div>
                            <div className="pb-3 mb-4">
                                <div className="flex border-b border-white/10 gap-8">
                                    <a className={tab === "dangChieu" ? "flex flex-col items-center justify-center border-b-[3px] border-b-primary text-white pb-[13px] pt-4" : "flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#E0E0E0]/70 pb-[13px] pt-4 hover:text-white transition-colors"}
                                        href="#" onClick={() => change("dangChieu")}>
                                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                                            Phim Đang Chiếu
                                        </p>
                                    </a>{" "}
                                    <a
                                        className={tab === "sapChieu" ? "flex flex-col items-center justify-center border-b-[3px] border-b-primary text-white pb-[13px] pt-4" : "flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#E0E0E0]/70 pb-[13px] pt-4 hover:text-white transition-colors"}
                                        href="#"
                                        onClick={() => change("sapChieu")}
                                    >
                                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                                            Phim Sắp Chiếu
                                        </p>
                                    </a>
                                </div>
                            </div>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 sm:gap-6">
                                {render}
                            </div>
                            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-10">
                                Tin Tức &amp; Ưu Đãi
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="flex flex-col gap-4 rounded-lg bg-[#1E1E1E] shadow-lg shadow-black/30 overflow-hidden group">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-video bg-cover"
                                        data-alt="Three friends smiling and eating popcorn in a cinema."
                                        style={{
                                            backgroundImage:
                                                'url("/image/banner/sale1.jpg")'
                                        }}
                                    />
                                    <div className="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
                                        <div>
                                            <span className="inline-block bg-[#FFC107] text-black text-xs font-bold px-2 py-1 rounded-full mb-2">
                                                KHUYẾN MÃI
                                            </span>
                                            <p className="text-white text-lg font-medium leading-normal mb-1 group-hover:text-primary transition-colors">
                                                Thứ Ba Vui Vẻ - Đồng giá vé 2D
                                            </p>
                                            <p className="text-[#E0E0E0]/70 text-sm font-normal leading-normal">
                                                Giảm giá vé đặc biệt chỉ trong hôm nay cho tất cả các suất
                                                chiếu phim 2D.
                                            </p>
                                        </div>
                                        <a
                                            className="text-primary text-sm font-bold hover:underline"
                                            href="#"
                                        >
                                            Xem chi tiết
                                        </a>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 rounded-lg bg-[#1E1E1E] shadow-lg shadow-black/30 overflow-hidden group">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-video bg-cover"
                                        data-alt="A close-up of a film review article on a tablet screen."
                                        style={{
                                            backgroundImage:
                                                'url("/image/banner/news1.jpg")'
                                        }}
                                    />
                                    <div className="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
                                        <div>
                                            <span className="inline-block bg-white/10 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                                                TIN TỨC
                                            </span>
                                            <p className="text-white text-lg font-medium leading-normal mb-1 group-hover:text-primary transition-colors">
                                                Review Phim A: Siêu phẩm không thể bỏ lỡ
                                            </p>
                                            <p className="text-[#E0E0E0]/70 text-sm font-normal leading-normal">
                                                Cùng khám phá những điểm đặc sắc nhất của bộ phim đang làm
                                                mưa làm gió tại các rạp.
                                            </p>
                                        </div>
                                        <a
                                            className="text-primary text-sm font-bold hover:underline"
                                            href="#"
                                        >
                                            Xem chi tiết
                                        </a>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 rounded-lg bg-[#1E1E1E] shadow-lg shadow-black/30 overflow-hidden group">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-video bg-cover"
                                        data-alt="A movie director with a clapperboard."
                                        style={{
                                            backgroundImage:
                                                'url("/image/banner/event1.jpg")'
                                        }}
                                    />
                                    <div className="flex flex-col flex-1 justify-between p-4 pt-0 gap-4">
                                        <div>
                                            <span className="inline-block bg-white/10 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                                                SỰ KIỆN
                                            </span>
                                            <p className="text-white text-lg font-medium leading-normal mb-1 group-hover:text-primary transition-colors">
                                                Giao lưu cùng đoàn làm phim
                                            </p>
                                            <p className="text-[#E0E0E0]/70 text-sm font-normal leading-normal">
                                                Cơ hội gặp gỡ và trò chuyện trực tiếp với các diễn viên và
                                                đạo diễn của bộ phim.
                                            </p>
                                        </div>
                                        <a
                                            className="text-primary text-sm font-bold hover:underline"
                                            href="#"
                                        >
                                            Xem chi tiết
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                    <div className="py-16 sm:py-24 px-4 sm:px-10 w-full">
                        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
                            <h2 className="text-white text-3xl md:text-4xl font-bold text-center">
                                Tại Sao Chọn Cinema?
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 w-full">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="flex items-center justify-center size-16 bg-primary/10 rounded-full text-primary">
                                        <span className="material-symbols-outlined text-3xl">
                                            confirmation_number
                                        </span>
                                    </div>
                                    <h3 className="text-white text-xl font-bold">
                                        Đặt Vé Nhanh Chóng
                                    </h3>
                                    <p className="text-[#E0E0E0]/70">
                                        Chỉ với vài thao tác đơn giản, bạn đã có thể đặt vé xem phim yêu
                                        thích.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="flex items-center justify-center size-16 bg-primary/10 rounded-full text-primary">
                                        <span className="material-symbols-outlined text-3xl">
                                            place
                                        </span>
                                    </div>
                                    <h3 className="text-white text-xl font-bold">Nhiều Rạp Chiếu</h3>
                                    <p className="text-[#E0E0E0]/70">
                                        Hệ thống rạp chiếu phủ khắp toàn quốc với chất lượng hàng đầu.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="flex items-center justify-center size-16 bg-primary/10 rounded-full text-primary">
                                        <span className="material-symbols-outlined text-3xl">
                                            credit_card
                                        </span>
                                    </div>
                                    <h3 className="text-white text-xl font-bold">
                                        Thanh Toán An Toàn
                                    </h3>
                                    <p className="text-[#E0E0E0]/70">
                                        Đa dạng phương thức thanh toán với bảo mật tuyệt đối.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#1E1E1E]">
                        <div className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-10 flex flex-col items-center text-center gap-6">
                            <h2 className="text-white text-3xl md:text-4xl font-bold">
                                Sẵn Sàng Trải Nghiệm?
                            </h2>
                            <p className="text-[#E0E0E0]/70 text-lg">
                                Đăng ký ngay để nhận ưu đãi đặc biệt và điểm thành viên.
                            </p>
                            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em]">
                                <span className="truncate">Đăng Ký Ngay</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}