import { Banner, IBanner } from "@/types/data/home/banner";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export default function () {
    const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL;
    const dataBanner = useQuery({
        ...Banner.objects.paginateQueryFactory()
    })
    const banners: IBanner[] = dataBanner?.data?.data || [];
    const [index, setIndex] = useState(0)
    const total = banners.length;
    const next = () => setIndex((prev) => (prev + 1) % total);
    const prev = () => setIndex((prev) => (prev - 1 + total) % total);
    return (
        <div key={"slide"} className="relative w-full overflow-hidden">

            {/* SLIDES */}
            <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
            >
                {banners.map((banner, i) => (
                    <div key={i} className="relative w-full flex-shrink-0">
                        <img
                            src={`${urlImage}${banner.imageUrl}`}
                            className="w-full h-[500px] object-cover"
                            alt=""
                        />

                        {/* TEXT */}
                        <div className="absolute bottom-10 left-10 text-white max-w-xl">
                            <h1 className="text-4xl font-bold mb-2">
                                Phim Bom Tấn Của Tuần
                            </h1>
                            <p className="mb-4">
                                Trải nghiệm những thước phim hành động mãn nhãn
                            </p>
                            <a href={`${banner.linkUrl}`} className="bg-red-600 px-6 py-3 rounded-lg font-bold">
                                Đặt Vé Ngay
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* PREV */}
            <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2
                          bg-black/50 p-3 rounded-full text-white z-10
                          hover:bg-black/70 transition"
            >
                ❮
            </button>

            {/* NEXT */}
            <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2
                          bg-black/50 p-3 rounded-full text-white z-10
                          hover:bg-black/70 transition"
            >
                ❯
            </button>

            {/* INDICATORS */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                {banners.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-3 h-3 rounded-full transition
                     ${i === index ? "bg-red-500" : "bg-white/50"}
                   `}
                    />
                ))}
            </div>
        </div>
    )
}