import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import {
  defaults,
  sampleProducts,
  type Product,
  type ShopSettings,
} from "./catalog";
export const db = () => {
  if (!env.DB) throw new Error("Cơ sở dữ liệu chưa được kết nối.");
  return env.DB;
};
export const runtime = () => env as unknown as Record<string, string>;
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function user() {
  const u = await getChatGPTUser();
  if (!u) throw new HttpError(401, "Vui lòng đăng nhập để tiếp tục.");
  return u;
}
export async function admin() {
  const u = await user();
  await db()
    .prepare("INSERT OR IGNORE INTO settings (key,value) VALUES ('owner',?)")
    .bind(u.userId)
    .run();
  const owner = await db()
    .prepare("SELECT value FROM settings WHERE key='owner'")
    .first<{ value: string }>();
  if (owner?.value !== u.userId)
    throw new HttpError(403, "Tài khoản không có quyền quản trị.");
  return u;
}
export async function seedCatalog() {
  const count = await db()
    .prepare("SELECT COUNT(*) AS n FROM products")
    .first<{ n: number }>();
  if (count?.n === 0)
    await db().batch(
      sampleProducts.map((p) =>
        db()
          .prepare(
            "INSERT OR IGNORE INTO products (id,name,category,price,original_price,stock,image,description,specs,tag,active) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
          )
          .bind(
            p.id,
            p.name,
            p.category,
            p.price,
            p.original_price,
            p.stock,
            p.image,
            p.description,
            p.specs,
            p.tag,
            p.active,
          ),
      ),
    );
}
export async function shopSettings(): Promise<ShopSettings> {
  const row = await db()
    .prepare("SELECT value FROM settings WHERE key='shop'")
    .first<{ value: string }>();
  return { ...defaults, ...(row ? JSON.parse(row.value) : {}) };
}
export async function catalog() {
  await seedCatalog();
  return (
    await db()
      .prepare("SELECT * FROM products WHERE active=1 ORDER BY rowid")
      .all<Product>()
  ).results;
}
export function integrations() {
  const e = runtime();
  return {
    payos: !!(e.PAYOS_CLIENT_ID && e.PAYOS_API_KEY && e.PAYOS_CHECKSUM_KEY),
    cloudinary: !!(
      e.CLOUDINARY_CLOUD_NAME &&
      e.CLOUDINARY_API_KEY &&
      e.CLOUDINARY_API_SECRET
    ),
    haravan: !!e.HARAVAN_ACCESS_TOKEN,
    r2: !!env.BUCKET,
  };
}
export async function jsonBody(req: Request) {
  if (Number(req.headers.get("content-length") || 0) > 100000)
    throw new HttpError(413, "Dữ liệu quá lớn.");
  return req.json() as Promise<any>;
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin)
    throw new HttpError(403, "Nguồn yêu cầu không hợp lệ.");
}
export const now = () => new Date().toISOString();
