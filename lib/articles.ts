import { db, now } from "./server";
import { companyArticle } from "./company-article";
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  body: string;
  category: string;
  author: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
export async function seedCompanyArticle() {
  const p = companyArticle,
    date = now();
  await db()
    .prepare(
      "INSERT OR IGNORE INTO posts (id,slug,title,excerpt,cover_image,body,category,author,status,published_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    )
    .bind(
      "company-introduction-v1",
      p.slug,
      p.title,
      p.excerpt,
      p.cover_image,
      p.body,
      p.category,
      p.author,
      "published",
      date,
      date,
      date,
    )
    .run();
}
export async function publicPosts(limit = 30) {
  await seedCompanyArticle();
  return (
    await db()
      .prepare(
        "SELECT * FROM posts WHERE status='published' ORDER BY published_at DESC LIMIT ?",
      )
      .bind(limit)
      .all<Post>()
  ).results;
}
export async function publicPost(slug: string) {
  await seedCompanyArticle();
  return db()
    .prepare("SELECT * FROM posts WHERE slug=? AND status='published'")
    .bind(slug)
    .first<Post>();
}
export async function allPosts() {
  await seedCompanyArticle();
  return (
    await db()
      .prepare("SELECT * FROM posts ORDER BY updated_at DESC LIMIT 200")
      .all<Post>()
  ).results;
}
