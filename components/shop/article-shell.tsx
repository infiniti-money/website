import {
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import BrandText from "./brand";
import type { Post } from "@/lib/articles";
export type PostSummary = Omit<Post, "body">;
export function ArticleShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="article-site">
      <div className="announcement">
        <div className="container">
          <span>INFINITI SELLER · GÓC CHIA SẺ</span>
          <a href="/#dich-vu">
            Đặt lịch kỹ thuật <ArrowUpRight size={12} />
          </a>
        </div>
      </div>
      <header className="article-header container">
        <a className="brand" href="/">
          <BrandText name="Infiniti Seller" />
        </a>
        <nav>
          <a href="/">Cửa hàng</a>
          <a href="/bai-viet">Bài viết</a>
          <a href="/gioi-thieu">Giới thiệu</a>
        </nav>
        <a className="btn btn-outline small" href="/#dich-vu">
          Liên hệ tư vấn <ArrowUpRight size={14} />
        </a>
      </header>
      {children}
      <footer className="article-footer container">
        <a href="/" className="brand">
          <BrandText name="Infiniti Seller" />
        </a>
        <p>Công nghệ phù hợp. Dịch vụ tận tâm.</p>
        <a href="/bai-viet">
          Khám phá bài viết <ArrowRight size={14} />
        </a>
      </footer>
    </div>
  );
}
export function PostCards({ posts }: { posts: PostSummary[] }) {
  return (
    <div className={`article-grid ${posts.length === 1 ? "single-post" : ""}`}>
      {posts.map((p) => (
        <a className="post-card" href={`/bai-viet/${p.slug}`} key={p.id}>
          {p.cover_image ? (
            <img src={p.cover_image} alt={p.title} loading="lazy" />
          ) : (
            <div className="post-no-image">
              <BookOpen size={43} />
            </div>
          )}
          <div className="post-card-content">
            <span className="pill">{p.category}</span>
            <h2>{p.title}</h2>
            <p>{p.excerpt}</p>
            <div>
              <small>
                <CalendarDays size={12} />
                {p.published_at
                  ? new Date(p.published_at).toLocaleDateString("vi-VN", {
                      timeZone: "Asia/Ho_Chi_Minh",
                    })
                  : ""}
              </small>
              <span>
                Đọc bài viết <ArrowUpRight size={15} />
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
