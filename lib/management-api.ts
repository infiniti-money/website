import { z } from "zod";
import { db, now, jsonBody, HttpError } from "./server";
import { walletIds, validWalletUrl, isWalletId } from "./payment-links";
const image = z
  .string()
  .max(2000)
  .refine(
    (s) =>
      !s ||
      s.startsWith("/api/media/") ||
      s.startsWith("/images/") ||
      /^https:\/\//.test(s),
    "Ảnh cần URL HTTPS hoặc ảnh thư viện.",
  );
const postInput = z.object({
  title: z.string().trim().min(5).max(180),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(140)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Đường dẫn chỉ dùng chữ thường không dấu, số và dấu gạch ngang.",
    ),
  excerpt: z.string().trim().min(20).max(400),
  seo_title: z.string().trim().max(180).default(""),
  seo_description: z.string().trim().max(400).default(""),
  tags: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  area_key: z
    .string()
    .max(180)
    .regex(/^[a-z0-9-]*$/)
    .default(""),
  cover_image: image,
  body: z.string().trim().min(100).max(60000),
  category: z.string().trim().min(2).max(60),
  author: z.string().trim().min(2).max(100),
  status: z.enum(["draft", "published", "archived"]),
});
const wallet = z.object({
  enabled: z.boolean(),
  url: z.string().trim().max(2000),
  recipient: z.string().trim().max(160),
  instructions: z.string().trim().max(800),
});
export async function managementApi(
  req: Request,
  path: string[],
): Promise<Response | null> {
  const p = path.join("/");
  if (req.method === "GET" && path[1] === "posts" && path.length === 3) {
    const post = await db()
      .prepare("SELECT * FROM posts WHERE id=?")
      .bind(path[2])
      .first();
    if (!post) throw new HttpError(404, "Không tìm thấy bài viết.");
    return Response.json({ post });
  }
  if (
    (req.method === "POST" || req.method === "PATCH") &&
    path[1] === "posts"
  ) {
    const b = postInput.parse(await jsonBody(req)),
      date = now(),
      id = req.method === "POST" ? crypto.randomUUID() : path[2];
    if (!id) throw new HttpError(404, "Không tìm thấy bài viết.");
    const duplicate = await db()
      .prepare("SELECT id FROM posts WHERE slug=? AND id!=?")
      .bind(b.slug, id)
      .first();
    if (duplicate)
      throw new HttpError(409, "Đường dẫn đã được dùng cho bài viết khác.");
    if (req.method === "POST")
      await db()
        .prepare(
          "INSERT INTO posts (id,slug,title,excerpt,cover_image,body,category,author,status,published_at,created_at,updated_at,seo_title,seo_description,tags,area_key) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          id,
          b.slug,
          b.title,
          b.excerpt,
          b.cover_image,
          b.body,
          b.category,
          b.author,
          b.status,
          b.status === "published" ? date : null,
          date,
          date,
          b.seo_title,
          b.seo_description,
          JSON.stringify([...new Set(b.tags)]),
          b.area_key,
        )
        .run();
    else {
      const result = await db()
        .prepare(
          "UPDATE posts SET slug=?,title=?,excerpt=?,cover_image=?,body=?,category=?,author=?,status=?,published_at=CASE WHEN ?='published' THEN COALESCE(published_at,?) ELSE published_at END,updated_at=?,seo_title=?,seo_description=?,tags=?,area_key=? WHERE id=?",
        )
        .bind(
          b.slug,
          b.title,
          b.excerpt,
          b.cover_image,
          b.body,
          b.category,
          b.author,
          b.status,
          b.status,
          date,
          date,
          b.seo_title,
          b.seo_description,
          JSON.stringify([...new Set(b.tags)]),
          b.area_key,
          id,
        )
        .run();
      if (!result.meta.changes)
        throw new HttpError(404, "Không tìm thấy bài viết.");
    }
    return Response.json({
      id,
      message:
        b.status === "published" ? "Đã đăng bài viết." : "Đã lưu bài viết.",
    });
  }
  if (req.method === "POST" && p === "admin/payments") {
    const b = z
      .object({ zalopay: wallet, momo: wallet, viettelmoney: wallet })
      .parse(await jsonBody(req));
    for (const id of walletIds) {
      if (b[id].url && !validWalletUrl(id, b[id].url))
        throw new HttpError(
          400,
          `${id}: liên kết cần HTTPS thuộc tên miền chính thức của nhà cung cấp và có đường dẫn nhận tiền.`,
        );
      if (b[id].enabled && (!b[id].url || !b[id].recipient))
        throw new HttpError(
          400,
          "Cần liên kết và tên người/đơn vị nhận tiền trước khi bật.",
        );
    }
    await db()
      .prepare(
        "INSERT INTO settings (key,value) VALUES ('payment_links',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      )
      .bind(JSON.stringify(b))
      .run();
    return Response.json({ message: "Đã lưu cấu hình liên kết thanh toán." });
  }
  if (req.method === "PATCH" && path[1] === "orders" && path[3] === "payment") {
    const b = z
      .object({
        reference: z.string().trim().min(3).max(120),
        confirmed: z.literal(true),
      })
      .parse(await jsonBody(req));
    const order = await db()
      .prepare("SELECT * FROM orders WHERE id=?")
      .bind(path[2])
      .first<any>();
    if (!order) throw new HttpError(404, "Không tìm thấy đơn.");
    if (
      !isWalletId(order.method) ||
      order.status === "cancelled" ||
      order.payment_status === "paid"
    )
      throw new HttpError(
        409,
        "Đơn không ở trạng thái chờ đối soát ví điện tử.",
      );
    const details = {
      ...JSON.parse(order.payment_details || "{}"),
      verificationReference: b.reference,
      verifiedAt: now(),
    };
    const result = await db()
      .prepare(
        "UPDATE orders SET payment_status='paid',payment_details=? WHERE id=? AND payment_status='unpaid' AND status!='cancelled'",
      )
      .bind(JSON.stringify(details), order.id)
      .run();
    if (!result.meta.changes)
      throw new HttpError(
        409,
        "Trạng thái đơn vừa thay đổi. Vui lòng tải lại.",
      );
    return Response.json({ message: "Đã xác nhận thanh toán sau đối soát." });
  }
  return null;
}
