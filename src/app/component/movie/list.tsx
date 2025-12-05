"use client"

export default function CinemaList() {
    const cinemaList = [];
    const cinemaDisplay = [];
    const cinemaPaging = [];
    const pagingComp = [];
    let active = 2;
    for (let i = 1; i <= 5; i++) {
        if (i == active) {
            pagingComp.push(
                <li key="pageActive" className="block size-8 rounded border border-gray-600 bg-red-500 text-center text-sm/8 font-medium text-white">
                    2
                </li>
            )
        }
        else {
            pagingComp.push(
                <li key={"page" + i}>
                    <a
                        href="#"
                        className="block size-8 text-white rounded border border-gray-200 text-center text-sm/8 font-medium transition-colors hover:text-red-500 hover:bg-gray-50"
                    >
                        {i}
                    </a>
                </li>
            )
        }
    }
    for (let i = 0; i < 12; i++) {
        cinemaDisplay.push(
            <div key={i} className="flex flex-col gap-3">
                <a>
                    <div
                        className="w-full bg-center bg-no-repeat aspect-[2/3] bg-cover rounded-lg"
                        data-alt="Image"
                        style={{
                            backgroundImage:
                                'url("")'
                        }}
                    />
                    <div>
                        <p className="text-white text-base font-medium leading-normal">
                            Movie1
                        </p>
                        <p className="text-white/60 text-sm font-normal leading-normal">
                            Thể loại | thời lượng
                        </p>
                    </div>
                </a>
            </div>
        )
    }
    cinemaPaging.push(
        <ul key="paging" className="flex justify-center mt-10 gap-1 text-gray-900">
            <li>
                <a
                    href="#"
                    className="grid size-8 text-white hover:text-red-500 place-content-center rounded border border-gray-200 transition-colors hover:bg-gray-50 rtl:rotate-180"
                    aria-label="Previous page"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </a>
            </li>
            {pagingComp}
            <li>
                <a
                    href="#"
                    className="grid size-8 text-white hover:text-red-500 place-content-center rounded border border-gray-200 transition-colors hover:bg-gray-50 rtl:rotate-180"
                    aria-label="Next page"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </a>
            </li>
        </ul>

    )
    return (
        <>
            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: "#102221" }}>
                <div className="layout-container flex h-full grow flex-col">
                    <div className="flex flex-1 justify-center px-4 py-5 sm:px-8 md:px-16 lg:px-24 xl:px-40">
                        <div className="layout-content-container flex w-full max-w-[1200px] flex-1 flex-col">
                            <main className="flex flex-col gap-4 py-6 md:py-8">
                                <div className="flex flex-wrap items-center justify-between gap-4 px-4">
                                    <p className="text-white text-3xl font-black leading-tight tracking-[-0.033em] md:text-4xl">
                                        Danh sách Phim
                                    </p>
                                </div>
                                <div className="flex flex-col gap-4 px-4 md:flex-row md:items-center">
                                    <div className="flex-grow">
                                        <label className="flex flex-col h-12 w-full">
                                            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                                                <div className="text-white/60 flex border-none bg-white/5 items-center justify-center pl-4 rounded-l-lg border-r-0">
                                                    <span className="material-symbols-outlined">search</span>
                                                </div>
                                                <input
                                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-white/5 h-full placeholder:text-white/60 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                                                    placeholder="Tìm kiếm theo tên phim..."
                                                    defaultValue=""
                                                />
                                            </div>
                                        </label>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className="flex h-12 w-full items-center justify-center rounded-lg bg-white/5 p-1 md:h-12 md:w-auto">
                                            <label className="flex h-full cursor-pointer grow items-center justify-center overflow-hidden rounded-[0.375rem] px-4 text-sm font-medium leading-normal text-white/60 transition-colors has-[:checked]:bg-teal-300 has-[:checked]:text-black   md:px-6">
                                                <span className="truncate">Đang chiếu</span>
                                                <input
                                                    className="invisible absolute h-0 w-0"
                                                    name="status-filter"
                                                    type="radio"
                                                    defaultValue="Đang chiếu"
                                                />
                                            </label>
                                            <label className="flex h-full cursor-pointer grow items-center justify-center overflow-hidden rounded-[0.375rem] px-4 text-sm font-medium leading-normal text-white/60 transition-colors has-[:checked]:bg-teal-300 has-[:checked]:text-black   md:px-6">
                                                <span className="truncate">Sắp chiếu</span>
                                                <input
                                                    className="invisible absolute h-0 w-0"
                                                    name="status-filter"
                                                    type="radio"
                                                    defaultValue="Sắp chiếu"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 justify-items-center">
                                    {cinemaDisplay}
                                </div>
                                {cinemaPaging}
                            </main>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
}