import type { Metadata } from "next";
import { articleListing } from "@/lib/articles";
import { ArticleShell, PostCards } from "@/components/shop/article-shell";
type Filters = {
  q?: string;
  tag?: string;
  category?: string;
  group?: string;
  page?: string;
};
type Props = { searchParams: Promise<Filters> };
export const dynamic = "force-dynamic";
function query(filters: Filters, page: number) {
  const p = new URLSearchParams();
  for (const k of ["q", "tag", "category", "group"] as const)
    if (filters[k]) p.set(k, filters[k]!);
  if (page > 1) p.set("page", String(page));
  return "/bai-viet" + (p.size ? "?" + p : "");
}
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const f = await searchParams;
  return {
    title: "Bài viết & Dịch vụ tại Hưng Yên | Infiniti Seller",
    description:
      "Tra cứu bài sửa máy tính, laptop, máy in, lắp camera, mạng và truyền hình theo các xã và huyện tại Hưng Yên.",
    alternates: {
      canonical: query(f, Math.max(1, parseInt(f.page || "1") || 1)),
    },
    robots: { index: !f.q && !f.tag && !f.group, follow: true },
  };
}
export default async function ArticlesPage({ searchParams }: Props) {
  const f = await searchParams,
    { posts, count, page, pages } = await articleListing(f);
  return (
    <ArticleShell>
      <main className="container article-list-page">
        <div className="article-list-hero">
          <div className="eyebrow">KIẾN THỨC · DỊCH VỤ · ĐỊA PHƯƠNG</div>
          <h1>
            Góc chia sẻ
            <br />
            <span>của Infiniti Seller.</span>
          </h1>
          <p>
            Tìm dịch vụ bạn cần và đối chiếu địa chỉ Hưng Yên theo tên xã cũ, xã
            mới sau sáp nhập 2025 hoặc huyện.
          </p>
        </div>
        <form className="article-search-form" action="/bai-viet" method="get">
          <label>
            Tìm bài viết
            <input
              name="q"
              defaultValue={f.q}
              placeholder="Ví dụ: Việt Yên, Yên Mỹ, sửa máy in..."
            />
          </label>
          <label>
            Nhóm bài
            <select name="category" defaultValue={f.category || ""}>
              <option value="">Tất cả bài viết</option>
              <option value="editorial">Giới thiệu & dịch vụ chung</option>
              <option value="regional">Dịch vụ tại Hưng Yên</option>
            </select>
          </label>
          <label>
            Khu vực
            <select name="group" defaultValue={f.group || ""}>
              <option value="">Tất cả khu vực</option>
              <option value="moi">39 xã/phường hiện hành</option>
              <option value="cu">Xã/phường trước sáp nhập 2025</option>
              <option value="truoc-2024">Địa danh xã/phường trước 2024</option>
              <option value="huyen">Huyện/thị xã/thành phố</option>
              <option value="ecopark">Các khu vực Ecopark</option>
            </select>
          </label>
          {f.tag && <input type="hidden" name="tag" value={f.tag} />}
          <button className="btn btn-blue">Tìm kiếm</button>
        </form>
        <div className="article-results">
          <p>
            <b>{count}</b> bài viết
            {f.tag && (
              <>
                {" "}
                · Tag: <b>{f.tag}</b>
              </>
            )}
          </p>
          <a href="/bai-viet">Xóa bộ lọc</a>
        </div>
        {posts.length ? (
          <PostCards posts={posts} />
        ) : (
          <div className="empty-state">
            <h2>Chưa tìm thấy bài phù hợp.</h2>
            <p>Thử tên địa phương hoặc dịch vụ khác.</p>
          </div>
        )}
        {pages > 1 && (
          <nav className="article-pagination" aria-label="Phân trang bài viết">
            {page > 1 && (
              <a className="btn btn-outline small" href={query(f, page - 1)}>
                Trang trước
              </a>
            )}
            <span>
              Trang {page} / {pages}
            </span>
            {page < pages && (
              <a className="btn btn-outline small" href={query(f, page + 1)}>
                Trang tiếp
              </a>
            )}
          </nav>
        )}
      </main>
    </ArticleShell>
  );
}
