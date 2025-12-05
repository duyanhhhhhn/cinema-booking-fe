export default function NewsInfo() {
    const relateNews = [];
    const CommentSection = [];
    const CommentList = [];
    const ContentArea = [];
    let numC = 0;
    for (let i = 0; i <= 5; i++) {
        CommentList.push(
            <div key={i} className="flex items-start gap-4">
                <img
                    className="size-10 rounded-full object-cover"
                    data-alt="Avatar"
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRadSYabYFU1dIedWCpTwBq8GhfHJsLxTX3-Q&s"
                />
                <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                User
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Ngày
                            </p>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Nội dung bình luận
                        </p>
                    </div>
                </div>
            </div>
        )
    }
    CommentSection.push(
        <div key="comment-section" className="mt-12 pt-8 border-t border-black/10 dark:border-white/10">
            <h2 className="text-2xl font-bold text-white dark:text-white mb-6">
                Bình luận ({numC})
            </h2>
            <div className="space-y-6">
                {/* Comment Form */}
                <div className="flex items-start gap-4">
                    <img
                        className="size-10 rounded-full object-cover"
                        data-alt="avatar"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRadSYabYFU1dIedWCpTwBq8GhfHJsLxTX3-Q&s"
                    />
                    <div className="flex-1">
                        <textarea
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 focus:border-primary focus:ring-primary placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            placeholder="Viết bình luận của bạn..."
                            rows={3}
                            defaultValue={""}
                        />
                        <button className="mt-2 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors" style={{ backgroundColor: "red" }}>
                            <span className="truncate">Gửi bình luận</span>
                        </button>
                    </div>
                </div>
                {/* Comments List */}
                <div className="space-y-8 pt-4">
                    {/* Comment */}
                    {CommentList}
                </div>
            </div>
        </div>
    )
    for (let i = 1; i <= 3; i++) {
        relateNews.push(
            <div key={"a" + i} className="flex flex-col bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                <a href="#">
                    <img
                        className="w-full h-40 object-cover"
                        data-alt=""
                        src="https://heritagevietnamairlines.cdn.vccloud.vn/wp-content/uploads/2025/02/Godzilla_-King-of-the-Monsters-2019-1024x683.png"
                    />
                </a>
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-base leading-snug mb-2 text-gray-900 dark:text-white">
                        <a
                            className="hover:text-primary dark:hover:text-primary"
                            href="#"
                        >
                            Phim 1
                        </a>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        Thông tin 1
                    </p>
                    <div className="mt-auto pt-3">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                            Ngày 1
                        </span>
                    </div>
                </div>
            </div>
        )
    }
    ContentArea.push(
        <div key="content" className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed space-y-6" style={{ color: "white" }}>
            <p>
                Line 1
            </p>
            <p>
                Line 2
            </p>
            <blockquote className="border-l-4 border-primary pl-4 italic text-gray-600 dark:text-gray-400">
                hightlight
            </blockquote>
            <p>
                Line 3
            </p>
            <figure>
                <img
                    alt="text"
                    className="rounded-lg w-full"
                    src="https://tse2.mm.bing.net/th/id/OIP.Z6maLuRYdANn3IbUITwWjgHaLH?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3"
                />
                <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Image
                </figcaption>
            </figure>
            <p>
                Line 4
            </p>
        </div>
    )
    return (
        <>
            <div className="relative flex h-auto min-h-screen w-full flex-col">
                {/* Main Content */}
                <main className="container mx-auto px-4 py-8 md:py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Breadcrumbs */}
                        <div className="flex flex-wrap gap-2 pb-4">
                            <a
                                className="text-sm font-medium leading-normal text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                                href="#"
                            >
                                Trang chủ
                            </a>
                            <span className="text-sm font-medium leading-normal text-gray-500 dark:text-gray-400">
                                /
                            </span>
                            <a
                                className="text-sm font-medium leading-normal text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                                href="#"
                            >
                                Tin tức
                            </a>
                            <span className="text-sm font-medium leading-normal text-gray-500 dark:text-gray-400">
                                /
                            </span>
                            <span className="text-sm font-medium leading-normal text-gray-300 dark:text-gray-200">
                                Review phim
                            </span>
                        </div>
                        {/* HeadlineText */}
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight text-white dark:text-white tracking-tight text-left pb-3 pt-6">
                            Tiêu đề
                        </h1>
                        {/* MetaText */}
                        <p className="text-sm font-normal leading-normal text-gray-500 dark:text-gray-400 pb-6 pt-1">
                            Đăng bởi User vào ngày
                        </p>
                        {/* HeaderImage */}
                        <div
                            className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end rounded-xl min-h-[400px] mb-8"
                            data-alt=""
                            style={{
                                backgroundImage:
                                    'url("https://static2.vieon.vn/vieplay-image/carousel_web_v4_ntc/2021/03/19/hi1x9dmv_1920x1080-godzilla-carousel_1920_1080.jpg")'
                            }}
                        />
                        {/*Content Area */}
                        {ContentArea}
                        {/* Social Share Buttons */}
                        <div className="mt-10 pt-6 border-t border-black/10 dark:border-white/10 flex items-center gap-4">
                            <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                                Chia sẻ bài viết:
                            </h3>
                            <div className="flex items-center gap-2">
                                <a
                                    className="flex items-center justify-center size-9 bg-gray-200 dark:bg-gray-700 hover:bg-primary dark:hover:bg-primary text-gray-700 dark:text-gray-300 hover:text-white rounded-full transition-colors"
                                    data-alt="icon"
                                    href="#"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9.19795 21.5H13.198V13.4901H16.1618L16.6711 9.4901H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H16.5V2.5H13.198C11.0768 2.5 9.19795 4.37893 9.19795 6.5V9.4901H7.19795V13.4901H9.19795V21.5Z" />
                                    </svg>
                                </a>
                                <a
                                    className="flex items-center justify-center size-9 bg-gray-200 hover:text-white rounded-full transition-colors"
                                    data-alt="icon"
                                    href="#"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                                <a
                                    className="flex items-center justify-center size-9 bg-gray-200 hover:text-white rounded-full transition-colors"
                                    data-alt="icon"
                                    href="#"
                                >
                                    <span className="material-symbols-outlined text-xl">link</span>
                                </a>
                            </div>
                        </div>
                        {/* Related Articles Section */}
                        <div className="mt-12 pt-8 border-t border-black/10">
                            <h2 className="text-2xl font-bold text-white">
                                Bài viết liên quan
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {relateNews}
                            </div>
                        </div>
                        {/* Comments Section */}
                        {CommentSection}
                    </div>
                </main>
            </div>
        </>
    )
}