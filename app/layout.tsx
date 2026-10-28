import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Infiniti Seller — Công nghệ cho bạn. Kỹ thuật tận tâm.",
  description:
    "Laptop, máy tính, camera, máy in và phụ kiện. Đặt lịch sửa chữa máy tính, máy in tại nhà, lắp đặt mạng và camera cùng Infiniti Seller.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
