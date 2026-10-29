import type { Metadata } from "next";
import Admin from "@/components/shop/admin";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { admin, seedCatalog } from "@/lib/server";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Quản lý bài viết | Infiniti Seller",
  robots: { index: false, follow: false },
};
export default async function AdminPostsPage() {
  await requireChatGPTUser("/admin/bai-viet");
  try {
    await admin();
    await seedCatalog();
  } catch {
    return (
      <main style={{ padding: 60, fontFamily: "sans-serif" }}>
        <h1>Không có quyền quản trị</h1>
        <p>Trang quản trị dành cho chủ cửa hàng.</p>
        <a href="/">Về cửa hàng</a>
      </main>
    );
  }
  return <Admin initialTab="posts" />;
}
