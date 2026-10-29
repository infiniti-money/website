import { db, now } from "./server";
import { companyArticle } from "./company-article";
import { serviceArticle } from "./service-article";
import { regionalArticles } from "./regional-articles";
import { normalizeSearch, postTags } from "./post-meta";
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  cover_image: string;
  body: string;
  category: string;
  author: string;
  tags: string;
  area_key: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
export type PostSummary = Omit<Post, "body">;
const summaryColumns =
  "id,slug,title,excerpt,seo_title,seo_description,cover_image,category,author,tags,area_key,status,published_at,created_at,updated_at";
async function refreshUneditedRegionalArticles() {
  const marker = "regional-copy-cleanup-v2";
  if (await db().prepare("SELECT key FROM settings WHERE key=?").bind(marker).first())
    return;
  const templates = regionalArticles();
  // Only replace untouched seeded articles; preserve any CMS-edited content.
  for (let start = 0; start < templates.length; start += 25)
    await db().batch(
      templates.slice(start, start + 25).map((p) =>
        db().prepare(
          "UPDATE posts SET title=?, excerpt=?, seo_title=?, seo_description=?, body=?, updated_at=? WHERE id=? AND area_key=? AND updated_at=created_at AND body LIKE '%Địa danh được đối chiếu%'",
        ).bind(p.title, p.excerpt, p.seo_title, p.seo_description, p.body, now(), p.id, p.area_key),
      ),
    );
  await db().prepare("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)")
    .bind(marker, now()).run();
}
async function archiveDuplicateRegionalArticles() {
  const marker = "regional-dedup-v3";
  if (await db().prepare("SELECT key FROM settings WHERE key=?").bind(marker).first())
    return;
  const keep = new Set(regionalArticles().map((post) => post.area_key));
  const existing = (await db().prepare("SELECT area_key FROM posts WHERE area_key != ''").all<{ area_key: string }>()).results;
  const duplicates = existing.filter((post) => !keep.has(post.area_key));
  for (let start = 0; start < duplicates.length; start += 25)
    await db().batch(duplicates.slice(start, start + 25).map((post) =>
      db().prepare("UPDATE posts SET status='archived' WHERE area_key=? AND status='published'")
        .bind(post.area_key),
    ));
  await db().prepare("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)").bind(marker, now()).run();
}
export async function seedCompanyArticle() {
  await archiveDuplicateRegionalArticles();
  await refreshUneditedRegionalArticles();
  const marker = "editorial-regions-v1";
  if (
    await db()
      .prepare("SELECT key FROM settings WHERE key=?")
      .bind(marker)
      .first()
  )
    return;
  const date = now();
  const posts = [
    {
      ...companyArticle,
      id: "company-introduction-v1",
      seo_title: "",
      seo_description: "",
      tags: ["Giới thiệu", "Infiniti Seller"],
      area_key: "",
    },
    {
      ...serviceArticle,
      id: "home-technical-services-v1",
      tags: [
        "Sửa máy tính",
        "Sửa laptop",
        "Sửa máy in",
        "Lắp camera",
        "Dịch vụ tại nhà",
      ],
      area_key: "",
    },
    ...regionalArticles(),
  ];
  for (let start = 0; start < posts.length; start += 25)
    await db().batch(
      posts.slice(start, start + 25).map((p) =>
        db()
          .prepare(
            "INSERT OR IGNORE INTO posts (id,slug,title,excerpt,cover_image,body,category,author,status,published_at,created_at,updated_at,seo_title,seo_description,tags,area_key) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          )
          .bind(
            p.id,
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
            p.seo_title,
            p.seo_description,
            JSON.stringify([...new Set(p.tags)]),
            p.area_key,
          ),
      ),
    );
  await db()
    .prepare(
      "UPDATE posts SET tags=? WHERE id='company-introduction-v1' AND tags='[]'",
    )
    .bind(JSON.stringify(["Giới thiệu", "Infiniti Seller"]))
    .run();
  await db()
    .prepare("INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)")
    .bind(marker, date)
    .run();
}
export async function publicPosts(limit = 30, editorialOnly = false) {
  await seedCompanyArticle();
  return (
    await db()
      .prepare(
        `SELECT ${summaryColumns} FROM posts WHERE status='published' ${editorialOnly ? "AND area_key=''" : ""} ORDER BY published_at DESC,id LIMIT ?`,
      )
      .bind(limit)
      .all<PostSummary>()
  ).results;
}
export async function publicPost(slug: string) {
  await seedCompanyArticle();
  return db()
    .prepare("SELECT * FROM posts WHERE slug=? AND status='published'")
    .bind(slug)
    .first<Post>();
}
export async function companyPost() {
  await seedCompanyArticle();
  return db()
    .prepare(
      "SELECT * FROM posts WHERE id='company-introduction-v1' AND status='published'",
    )
    .first<Post>();
}
export async function allPosts() {
  await seedCompanyArticle();
  return (
    await db()
      .prepare(
        `SELECT ${summaryColumns} FROM posts ORDER BY updated_at DESC,id`,
      )
      .all<PostSummary>()
  ).results;
}
export async function publishedSummaries() {
  await seedCompanyArticle();
  return (
    await db()
      .prepare(
        `SELECT ${summaryColumns} FROM posts WHERE status='published' ORDER BY published_at DESC,id`,
      )
      .all<PostSummary>()
  ).results;
}
export async function articleListing(
  input: {
    q?: string;
    tag?: string;
    category?: string;
    group?: string;
    page?: string;
  } = {},
) {
  const all = await publishedSummaries(),
    q = normalizeSearch((input.q || "").trim().slice(0, 150)),
    tag = (input.tag || "").slice(0, 80);
  const filtered = all.filter(
    (p) =>
      (!q ||
        normalizeSearch(p.title + " " + p.excerpt + " " + p.tags).includes(
          q,
        )) &&
      (!tag || postTags(p.tags).includes(tag)) &&
      (!input.category ||
        (input.category === "regional" ? !!p.area_key : !p.area_key)) &&
      (!input.group || p.area_key.startsWith(input.group + "-")),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 12)),
    page = Math.min(
      pages,
      Math.max(1, Number.parseInt(input.page || "1") || 1),
    );
  return {
    posts: filtered.slice((page - 1) * 12, page * 12),
    count: filtered.length,
    page,
    pages,
  };
}
