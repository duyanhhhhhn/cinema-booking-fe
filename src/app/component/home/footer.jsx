export default function Footer() {
    return (
        <>
            <footer className="bg-black text-[#E0E0E0]/70 mt-0">
                <div className="max-w-7xl mx-auto py-10 px-4 sm:px-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-bold text-white mb-4">Cinema</h3>
                            <ul>
                                <li className="mb-2">
                                    <a className="hover:text-white transition-colors" href="#">
                                        Về chúng tôi
                                    </a>
                                </li>
                                <li className="mb-2">
                                    <a className="hover:text-white transition-colors" href="#">
                                        Tuyển dụng
                                    </a>
                                </li>
                                <li className="mb-2">
                                    <a className="hover:text-white transition-colors" href="#">
                                        Liên hệ
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-4">Điều khoản</h3>
                            <ul>
                                <li className="mb-2">
                                    <a className="hover:text-white transition-colors" href="#">
                                        Điều khoản sử dụng
                                    </a>
                                </li>
                                <li className="mb-2">
                                    <a className="hover:text-white transition-colors" href="#">
                                        Chính sách bảo mật
                                    </a>
                                </li>
                                <li className="mb-2">
                                    <a className="hover:text-white transition-colors" href="#">
                                        Chính sách vé
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-4">Chăm sóc khách hàng</h3>
                            <p>Hotline: 1900 1234</p>
                            <p>Email: support@cinema.vn</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-4">
                                Kết nối với chúng tôi
                            </h3>
                            <div className="flex gap-4">
                                <a className="hover:text-white transition-colors" href="#">
                                    {" "}
                                    <svg
                                        className="size-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" />
                                    </svg>
                                </a>{" "}
                                <a className="hover:text-white transition-colors" href="#">
                                    {" "}
                                    <svg
                                        className="size-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.14 11.33c.18.02.36.03.53.03 2.43 0 4.4-1.93 4.4-4.32 0-2.39-1.97-4.32-4.4-4.32-2.42 0-4.38 1.93-4.38 4.32 0 .59.12 1.15.33 1.67l-3.3 3.25-.13.13c-.91.89-.91 2.34 0 3.23.9.89 2.35.89 3.24 0l.13-.12 3.3-3.25zM12 10.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                    </svg>
                                </a>{" "}
                                <a className="hover:text-white transition-colors" href="#">
                                    {" "}
                                    <svg
                                        className="size-6"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.33 15.2c-.22 0-.44-.08-.6-.23-.33-.33-.33-.86 0-1.18l2.92-2.92-2.92-2.92c-.33-.33-.33-.86 0-1.18s.86-.33 1.18 0l3.5 3.5c.33.33.33.86 0 1.18l-3.5 3.5c-.16.15-.38.23-.6.23zm-8.66 0c-.22 0-.44-.08-.6-.23l-3.5-3.5c-.33-.33-.33-.86 0-1.18l3.5-3.5c.33-.33.86-.33 1.18 0s.33.86 0 1.18L4.95 12l2.92 2.92c.33.33.33.86 0 1.18-.16.15-.38.23-.6.23z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 mt-8 pt-6 text-center text-sm">
                        <p>© 2024 Cinema. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    )
}