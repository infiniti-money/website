import { publicPosts } from "@/lib/articles";
import { ArticleShell, PostCards } from "@/components/shop/article-shell";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Bài viết & Giới thiệu | Infiniti Seller",
  description:
    "Giới thiệu Infiniti Seller và các bài chia sẻ về máy tính, laptop, camera, máy in, dịch vụ kỹ thuật.",
};
export default async function ArticlesPage() {
  const posts = await publicPosts();
  return (
    <ArticleShell>
      <main className="container article-list-page">
        <div className="article-list-hero">
          <div className="eyebrow">KIẾN THỨC · CÂU CHUYỆN · KẾT NỐI</div>
          <h1>
            Góc chia sẻ
            <br />
            <span>của Infiniti Seller.</span>
          </h1>
          <p>
            Hiểu hơn về chúng tôi, thiết bị bạn sử dụng và những giải pháp công
            nghệ cho cuộc sống hằng ngày.
          </p>
        </div>
        {posts.length ? (
          <PostCards posts={posts} />
        ) : (
          <div className="empty-state">
            <h2>Những câu chuyện mới đang được chuẩn bị.</h2>
            <p>Hãy quay lại để đọc các bài viết từ Infiniti Seller.</p>
          </div>
        )}
      </main>
    </ArticleShell>
  );
}
