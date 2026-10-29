import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, ArrowLeft, ArrowUpRight } from "lucide-react";
import { publicPost } from "@/lib/articles";
import ArticleContent, {
  articleHeadings,
} from "@/components/shop/article-content";
import { ArticleShell } from "@/components/shop/article-shell";
type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await publicPost((await params).slug);
  return p
    ? {
        title: `${p.title} | Infiniti Seller`,
        description: p.excerpt,
        openGraph: {
          title: p.title,
          description: p.excerpt,
          type: "article",
          publishedTime: p.published_at || undefined,
          modifiedTime: p.updated_at,
        },
      }
    : { title: "Không tìm thấy bài viết | Infiniti Seller" };
}
export default async function ArticlePage({ params }: Props) {
  const p = await publicPost((await params).slug);
  if (!p) notFound();
  const headings = articleHeadings(p.body);
  return (
    <ArticleShell>
      <main className="container article-detail-page">
        <a className="back-link" href="/bai-viet">
          <ArrowLeft size={15} />
          Tất cả bài viết
        </a>
        <header className="article-title-block">
          <span className="pill">{p.category}</span>
          <h1>{p.title}</h1>
          <p>{p.excerpt}</p>
          <div className="article-meta">
            <span className="author-avatar">IS</span>
            <b>{p.author}</b>
            <span>
              <CalendarDays size={13} />
              {p.published_at &&
                new Date(p.published_at).toLocaleDateString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })}
            </span>
            <span>
              <Clock size={13} />
              {Math.max(1, Math.ceil(p.body.split(/\s+/).length / 220))} phút
              đọc
            </span>
          </div>
        </header>
        {p.cover_image && (
          <img
            className="article-cover"
            src={p.cover_image}
            alt={p.title}
            fetchPriority="high"
          />
        )}
        <div className="article-reading-layout">
          <article>
            <ArticleContent body={p.body} />
            <div className="article-end-cta">
              <h3>Bạn cần tư vấn sản phẩm hoặc hỗ trợ kỹ thuật?</h3>
              <p>
                Gửi nhu cầu để Infiniti Seller cùng bạn tìm phương án phù hợp.
              </p>
              <a className="btn btn-blue" href="/#dich-vu">
                Kết nối với chúng tôi <ArrowUpRight size={16} />
              </a>
            </div>
          </article>
          <aside className="article-toc">
            <div>
              <span className="eyebrow">TRONG BÀI VIẾT NÀY</span>
              {headings.map((h) => (
                <a key={h.id} href={`#${h.id}`}>
                  {h.title}
                </a>
              ))}
              <a className="toc-store" href="/">
                Khám phá cửa hàng <ArrowUpRight size={14} />
              </a>
            </div>
          </aside>
        </div>
      </main>
    </ArticleShell>
  );
}
