// src/app/component/cinemas/CinemaFind.tsx

type TheaterStatus = "active" | "maintenance";

type Theater = {
  id: number;
  name: string;
  code: string;
  city: string;
  address: string;
  status: TheaterStatus;
  image: string;
  features: string[];
};

const theaters: Theater[] = [
  {
    id: 1,
    name: "Cinema Central Park",
    code: "CINE_PARK",
    city: "Quận 1, TP. Hồ Chí Minh",
    address: "208 Nguyễn Hữu Cảnh, P.22, Q. Bình Thạnh",
    status: "active",
    image: "/cinemas/cinema-1.jpg",
    features: ["IMAX", "4DX"],
  },
  {
    id: 2,
    name: "Galaxy Star Cinema",
    code: "GALAXY_STAR",
    city: "Quận 7, TP. Hồ Chí Minh",
    address: "101 Tôn Dật Tiên, Tân Phú, Quận 7",
    status: "maintenance",
    image: "/cinemas/cinema-2.jpg",
    features: ["Ghế đôi"],
  },
  {
    id: 3,
    name: "National Cinema Center",
    code: "NATIONAL_CENTER",
    city: "Quận Ba Đình, Hà Nội",
    address: "87 Láng Hạ, Thành Công, Ba Đình",
    status: "active",
    image: "/cinemas/cinema-3.jpg",
    features: ["Dolby Atmos"],
  },
  {
    id: 4,
    name: "Metiz Cinema",
    code: "METIZ_DA_NANG",
    city: "Quận Hải Châu, Đà Nẵng",
    address: "Tầng 1, Helio Center, đường 2/9, Hải Châu",
    status: "active",
    image: "/cinemas/cinema-4.jpg",
    features: ["IMAX", "Ghế đôi"],
  },
];

export default function CinemaFind() {
  return (
    <section className="w-full bg-[#1a1a1a]">
 <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 text-slate-50 md:px-8 md:py-14">
        {/* HEADER */}
        <header className="space-y-2 rounded-2xl border border-[#3b1c22] bg-gradient-to-r from-[#261117] to-[#160b0f] px-6 py-5 shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
          <h1 className="text-2xl font-semibold md:text-3xl">
            Tìm Rạp Chiếu Phim
          </h1>
          <p className="text-sm text-slate-300 md:text-base">
            Khám phá các rạp chiếu phim gần bạn và xem lịch chiếu mới nhất.
          </p>
        </header>

        {/* Search + Filters */}
        <div className="space-y-4">
          {/* Ô search */}
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              <span className="material-symbols-outlined">search</span>
            </span>
            <input
              type="text"
              placeholder="Tìm rạp theo tên hoặc địa chỉ..."
              className="h-12 w-full rounded-xl border border-[#3b252c] bg-[#201219]/95 pl-11 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 backdrop-blur-sm focus:border-[#fb6c6c] focus:bg-[#26141c]"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-3 text-xs md:text-sm">
            <button className="inline-flex items-center gap-2 rounded-full border border-[#3b252c] bg-[#1c1117]/95 px-4 py-2 text-slate-100 backdrop-blur-sm transition hover:border-[#fb6c6c] hover:bg-[#27141d]">
              <span className="material-symbols-outlined text-base">
                location_on
              </span>
              <span>Thành phố/Quận</span>
              <span className="material-symbols-outlined text-sm">
                expand_more
              </span>
            </button>

            <button className="inline-flex items-center gap-2 rounded-full border border-[#3b252c] bg-[#1c1117]/95 px-4 py-2 text-slate-100 backdrop-blur-sm transition hover:border-[#fb6c6c] hover:bg-[#27141d]">
              <span className="material-symbols-outlined text-base">sort</span>
              <span>Sắp xếp: Gần nhất</span>
              <span className="material-symbols-outlined text-sm">
                expand_more
              </span>
            </button>

            <button className="inline-flex items-center gap-2 rounded-full border border-[#3b252c] bg-[#1c1117]/95 px-4 py-2 text-slate-100 backdrop-blur-sm transition hover:border-[#fb6c6c] hover:bg-[#27141d]">
              <span className="material-symbols-outlined text-base">map</span>
              <span>Xem trên bản đồ</span>
            </button>
          </div>
        </div>

        {/* Danh sách rạp */}
        <div className="grid gap-6 md:grid-cols-2">
          {theaters.map((theater) => (
            <article
              key={theater.id}
              className="overflow-hidden rounded-2xl border border-[#3d2229] bg-gradient-to-b from-[#221119] to-[#12060a] text-slate-50 shadow-[0_20px_45px_rgba(0,0,0,0.75)]"
            >
              {/* Ảnh rạp */}
              <div className="h-48 w-full overflow-hidden bg-black">
                <img
                  src={theater.image}
                  alt={theater.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Nội dung rạp */}
              <div className="space-y-2 px-5 pb-5 pt-4">
                <p className="text-[12px] font-medium text-[#ff8b7c]">
                  {theater.city}
                </p>
                <h3 className="text-lg font-semibold">{theater.name}</h3>
                <p className="text-xs text-slate-300">{theater.address}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {theater.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-[#ff5f5f]/60 bg-[#2b151c] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[#ffd8cf]"
                    >
                      {feature}
                    </span>
                  ))}

                  {theater.status === "maintenance" && (
                    <span className="rounded-full border border-amber-400/60 bg-[#3b2a14] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-amber-200">
                      Tạm dừng
                    </span>
                  )}
                </div>

                <button className="mt-4 inline-flex items-center justify-center rounded-full bg-[#ff4337] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff4337]/60 transition hover:bg-[#ff5b4d]">
                  Xem Lịch Chiếu
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
