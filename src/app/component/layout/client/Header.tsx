/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, MenuItem, Avatar, IconButton } from "@mui/material";
import { Person, Logout, ConfirmationNumber } from "@mui/icons-material";
import { UserRole } from "@/types";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    router.push("/");
  };

  const handleProfile = () => {
    handleUserMenuClose();
    router.push("/profile");
  };

  const handleMyTickets = () => {
    handleUserMenuClose();
    router.push("/my-tickets");
  };

  // Lấy chữ cái đầu của tên để làm avatar
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };
  const urlImage = process.env.NEXT_PUBLIC_IMAGE_URL;

  return (
    <header className="bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center text-black">
              <img
                src="/logo/logo_cinema.png"
                alt="CineMax Logo"
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition text-sm"
            >
              Trang chủ
            </Link>
            <Link
              href="/movies"
              className="text-gray-300 hover:text-white transition text-sm"
            >
              Phim
            </Link>
            <Link
              href="/cinemas"
              className="text-gray-300 hover:text-white transition text-sm"
            >
              Rạp chiếu
            </Link>
            <Link
              href="/news"
              className="text-gray-300 hover:text-white transition text-sm"
            >
              Tin tức
            </Link>
          </nav>

          {/* Desktop Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <IconButton
                  onClick={handleUserMenuOpen}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={anchorEl ? "user-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={anchorEl ? "true" : undefined}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "#dc2626",
                      fontSize: "1rem",
                    }}
                    src={urlImage + user.avatar}
                  >
                    {getInitials(user.fullName || user.email)}
                  </Avatar>
                </IconButton>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium">
                    {user.fullName || user.email}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {user.role === "CLIENT" ? "Khách hàng" : user.role}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 lg:px-5 py-2 bg-transparent text-white border border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-800 transition cursor-pointer"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 lg:px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition cursor-pointer"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* User Menu Dropdown */}
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            sx={{
              mt: 1,
              "& .MuiPaper-root": {
                backgroundColor: "#1a1a1a",
                color: "white",
                border: "1px solid #374151",
                minWidth: 200,
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem
              onClick={handleProfile}
              sx={{
                "&:hover": { backgroundColor: "#374151" },
                gap: 2,
              }}
            >
              <Person fontSize="small" />
              Thông tin cá nhân
            </MenuItem>
            <MenuItem
              onClick={handleMyTickets}
              sx={{
                "&:hover": { backgroundColor: "#374151" },
                gap: 2,
              }}
            >
              <ConfirmationNumber fontSize="small" />
              Vé của tôi
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                "&:hover": { backgroundColor: "#374151" },
                gap: 2,
                color: "#ef4444",
              }}
            >
              <Logout fontSize="small" />
              Đăng xuất
            </MenuItem>
          </Menu>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "max-h-96 opacity-100 mt-4"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <nav className="flex flex-col gap-4 pb-4">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition text-sm py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              href="/movies"
              className="text-gray-300 hover:text-white transition text-sm py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Phim
            </Link>
            <Link
              href="/cinemas"
              className="text-gray-300 hover:text-white transition text-sm py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Rạp chiếu
            </Link>
            <Link
              href="/news"
              className="text-gray-300 hover:text-white transition text-sm py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Tin tức
            </Link>

            {/* Mobile Auth Section */}
            <div className="flex flex-col gap-3 pt-2 border-t border-gray-800">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "#dc2626",
                        fontSize: "0.875rem",
                      }}
                      src={user.avatar}
                    >
                      {getInitials(user.fullName || user.email)}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium">
                        {user.fullName || user.email}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {user.role === UserRole.CLIENT
                          ? "Khách hàng"
                          : user.role}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="w-full px-5 py-2 bg-transparent text-white border border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Thông tin cá nhân
                  </Link>
                  <Link
                    href="/my-tickets"
                    className="w-full px-5 py-2 bg-transparent text-white border border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Vé của tôi
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="w-full px-5 py-2 bg-transparent text-white border border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-800 transition cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="w-full px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
