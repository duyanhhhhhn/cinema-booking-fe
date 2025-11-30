import AdminLayout from "../component/layout/admin/AdminLayout";

export const metadata = {
  title: "Admin - Cinema Booking",
  description: "Quản trị hệ thống đặt vé xem phim",
};

export default function AdminLayoutWrapper({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}

