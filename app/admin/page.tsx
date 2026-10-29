import Admin from "@/components/shop/admin";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { admin, seedCatalog } from "@/lib/server";
export const dynamic = "force-dynamic";
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireChatGPTUser("/admin");
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
  return <Admin initialTab={(await searchParams).tab} />;
}
