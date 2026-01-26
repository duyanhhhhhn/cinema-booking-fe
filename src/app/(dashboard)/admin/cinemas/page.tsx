import CinemaManagement from "@/app/component/admin/CinemaManagement";

export const metadata = {
  title: "Quản lý rạp chiếu - Admin",
  description: "Quản lý danh sách rạp chiếu",
};
export default function AdminCinemasPage() {
  return <CinemaManagement />;
}