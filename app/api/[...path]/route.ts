import { env } from "cloudflare:workers";
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  admin,
  user,
  db,
  catalog,
  shopSettings,
  integrations,
  jsonBody,
  sameOrigin,
  now,
  runtime,
  HttpError,
} from "@/lib/server";
import { createPayment, verify } from "@/lib/payos";
import { allPosts, publicPosts } from "@/lib/articles";
import { walletSettings, walletAvailability } from "@/lib/wallet-server";
import { isWalletId, validWalletUrl } from "@/lib/payment-links";
import { managementApi } from "@/lib/management-api";
import type { Product } from "@/lib/catalog";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ path: string[] }> };
const customer = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .regex(/^(\+84|0)[0-9]{9,10}$/, "Số điện thoại chưa hợp lệ."),
  address: z.string().trim().min(8).max(400),
});
const productInput = z.object({
  name: z.string().trim().min(2).max(160),
  category: z.enum(["Laptop", "Máy tính PC", "Điện thoại", "Tai nghe", "Máy in", "Máy photocopy", "Linh kiện PC", "Phụ kiện", "Phụ kiện máy in", "Phụ kiện máy photocopy", "Camera", "Thiết bị mạng"]),
  price: z.number().int().min(1000).max(999999999),
  original_price: z.number().int().min(0).max(999999999),
  stock: z.number().int().min(0).max(99999),
  image: z
    .string()
    .refine(
      (s) => s === "/product-placeholder.svg" || s.startsWith("/api/media/") || /^https:\/\//.test(s),
      "Ảnh cần URL HTTPS hoặc ảnh đã tải lên.",
    ),
  description: z.string().max(4000),
  specs: z.string().max(300),
  tag: z.string().max(40),
  active: z.number().int().min(0).max(1),
});
async function handler(req: Request, ctx: Ctx) {
  try {
    const { path } = await ctx.params,
      p = path.join("/"),
      method = req.method;
    if (method !== "GET" && p !== "webhooks/payos") sameOrigin(req);
    if (method === "GET" && p === "posts")
      return Response.json({ posts: await publicPosts() });
    if (method === "GET" && p === "catalog")
      return Response.json({
        products: await catalog(),
        settings: await shopSettings(),
        wallets: await walletAvailability(),
        integrations: integrations(),
      });
    if (method === "GET" && p === "orders") {
      const u = await user();
      return Response.json({
        orders: (
          await db()
            .prepare(
              "SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100",
            )
            .bind(u.userId)
            .all()
        ).results,
      });
    }
    if (method === "GET" && path[0] === "media") {
      const a = await db()
        .prepare("SELECT storage FROM assets WHERE id=?")
        .bind(path[1])
        .first<{ storage: string }>();
      if (!a || a.storage !== "r2")
        throw new HttpError(404, "Không tìm thấy ảnh.");
      const object = await env.BUCKET!.get(path[1]);
      if (!object) throw new HttpError(404, "Không tìm thấy ảnh.");
      return new Response(object.body, {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=86400",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (method === "POST" && p === "checkout") {
      const u = await user();
      const b = z
        .object({
          customer,
          items: z
            .array(
              z.object({
                id: z.string().max(80),
                quantity: z.number().int().min(1).max(99),
              }),
            )
            .min(1)
            .max(50),
          method: z.enum(["cod", "payos", "zalopay", "momo", "viettelmoney"]),
          requestId: z.string().uuid(),
        })
        .parse(await jsonBody(req));
      const requestKey = `${u.userId}:${b.requestId}`,
        existing = await db()
          .prepare("SELECT * FROM orders WHERE request_key=?")
          .bind(requestKey)
          .first();
      if (existing) {
        if (existing.status === "cancelled")
          throw new HttpError(
            409,
            "Đơn trước đã hủy. Hãy mở lại giỏ hàng để thử lại.",
          );
        if (existing.method === "payos" && !existing.payment_url)
          throw new HttpError(
            409,
            "Đơn đang tạo thanh toán. Vui lòng đợi rồi thử lại.",
          );
        return Response.json({ order: existing });
      }
      if (b.method === "payos" && !integrations().payos)
        throw new HttpError(
          503,
          "payOS chưa được cấu hình. Hãy chọn thanh toán khi nhận hàng.",
        );
      const selectedWallet = isWalletId(b.method)
        ? (await walletSettings())[b.method]
        : null;
      if (
        selectedWallet &&
        (!selectedWallet.enabled ||
          !validWalletUrl(b.method as any, selectedWallet.url))
      )
        throw new HttpError(
          503,
          "Phương thức ví điện tử chưa được cửa hàng cấu hình.",
        );
      const ids = [...new Set(b.items.map((i) => i.id))],
        rows = (
          await db()
            .prepare(
              `SELECT * FROM products WHERE id IN (${ids.map(() => "?").join(",")}) AND active=1`,
            )
            .bind(...ids)
            .all<Product>()
        ).results;
      const items = ids.map((id) => {
        const product = rows.find((p) => p.id === id),
          quantity = b.items
            .filter((i) => i.id === id)
            .reduce((n, i) => n + i.quantity, 0);
        if (!product || quantity > 99 || product.stock < quantity)
          throw new HttpError(
            409,
            "Sản phẩm đã thay đổi hoặc không đủ tồn kho.",
          );
        return {
          id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image,
        };
      });
      const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0),
        s = await shopSettings(),
        shipping = subtotal >= s.freeShipping ? 0 : s.shipping,
        total = subtotal + shipping,
        id = crypto.randomUUID(),
        code =
          Date.now() * 1000 +
          (crypto.getRandomValues(new Uint16Array(1))[0] % 1000);
      await db()
        .prepare(
          "INSERT INTO orders (id,user_id,request_key,code,customer,items,subtotal,shipping,total,method,status,payment_status,created_at,payment_url,payment_details) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          id,
          u.userId,
          requestKey,
          code,
          JSON.stringify(b.customer),
          JSON.stringify(items),
          subtotal,
          shipping,
          total,
          b.method,
          "pending",
          "unpaid",
          now(),
          selectedWallet?.url || null,
          JSON.stringify(
            selectedWallet
              ? {
                  provider: b.method,
                  recipient: selectedWallet.recipient,
                  instructions: selectedWallet.instructions,
                }
              : {},
          ),
        )
        .run();
      if (b.method === "payos")
        try {
          const paymentUrl = await createPayment(
            code,
            total,
            new URL(req.url).origin,
          );
          await db()
            .prepare("UPDATE orders SET payment_url=? WHERE id=?")
            .bind(paymentUrl, id)
            .run();
        } catch (e) {
          await db()
            .prepare("UPDATE orders SET status='cancelled' WHERE id=?")
            .bind(id)
            .run();
          throw e;
        }
      return Response.json(
        {
          order: await db()
            .prepare("SELECT * FROM orders WHERE id=?")
            .bind(id)
            .first(),
        },
        { status: 201 },
      );
    }
    if (method === "POST" && p === "bookings") {
      const u = await user(),
        b = z
          .object({
            customer,
            service: z.enum(["computer", "printer", "camera", "network"]),
            date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            slot: z.enum([
              "08:00–10:00",
              "10:00–12:00",
              "13:00–15:00",
              "15:00–17:00",
            ]),
            note: z.string().max(2000),
          })
          .parse(await jsonBody(req));
      const parts = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Ho_Chi_Minh",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).formatToParts(new Date()),
        today = ["year", "month", "day"]
          .map((t) => parts.find((p) => p.type === t)?.value)
          .join("-");
      if (
        !Number.isFinite(Date.parse(b.date)) ||
        b.date < today ||
        b.date > new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10)
      )
        throw new HttpError(400, "Chọn ngày hợp lệ trong 90 ngày tới.");
      const id = crypto.randomUUID();
      await db()
        .prepare(
          "INSERT INTO bookings (id,user_id,customer,service,date,slot,note,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          id,
          u.userId,
          JSON.stringify(b.customer),
          b.service,
          b.date,
          b.slot,
          b.note,
          "new",
          now(),
        )
        .run();
      return Response.json(
        {
          id,
          message:
            "Đã nhận yêu cầu. Cửa hàng sẽ liên hệ xác nhận lịch và báo giá.",
        },
        { status: 201 },
      );
    }
    if (method === "POST" && p === "webhooks/payos") {
      if (!integrations().payos)
        throw new HttpError(503, "Chưa cấu hình payOS.");
      const b = await jsonBody(req);
      if (!b.data || !verify(b.data, b.signature || ""))
        throw new HttpError(401, "Chữ ký không hợp lệ.");
      if (b.success && b.data.code === "00") {
        const order = await db()
          .prepare("SELECT * FROM orders WHERE code=?")
          .bind(b.data.orderCode)
          .first<{
            id: string;
            total: number;
            method: string;
            status: string;
          }>();
        if (
          order &&
          order.method === "payos" &&
          order.total === b.data.amount &&
          b.data.currency === "VND" &&
          order.status !== "cancelled"
        )
          await db()
            .prepare(
              "UPDATE orders SET payment_status='paid' WHERE id=? AND payment_status!='paid'",
            )
            .bind(order.id)
            .run();
      }
      return Response.json({ success: true });
    }
    if (p.startsWith("admin/")) {
      await admin();
      const managed = await managementApi(req, path);
      if (managed) return managed;
      if (method === "GET" && p === "admin/data") {
        const [products, orders, bookings, assets, external] =
          await Promise.all([
            db().prepare("SELECT * FROM products ORDER BY rowid DESC").all(),
            db()
              .prepare(
                "SELECT * FROM orders ORDER BY created_at DESC LIMIT 200",
              )
              .all(),
            db()
              .prepare(
                "SELECT * FROM bookings ORDER BY created_at DESC LIMIT 200",
              )
              .all(),
            db()
              .prepare(
                "SELECT * FROM assets ORDER BY created_at DESC LIMIT 300",
              )
              .all(),
            db()
              .prepare(
                "SELECT * FROM external_orders ORDER BY synced_at DESC LIMIT 100",
              )
              .all(),
          ]);
        // Hồ sơ khách được tổng hợp từ đơn và lịch đã lưu trong D1.
        // Không tạo bản sao PII; chỉ tài khoản quản trị có quyền truy cập.
        const customerMap = new Map<string, {
          id: string; name: string; phone: string; address: string;
          orders: number; bookings: number; total_spent: number; last_activity: string;
        }>();
        for (const [rows, kind] of [
          [orders.results, "order"],
          [bookings.results, "booking"],
        ] as const) for (const row of rows as Array<Record<string, unknown>>) {
          try {
            const c = JSON.parse(String(row.customer ?? "{}")) as {
              name?: string; phone?: string; address?: string;
            };
            if (!c.phone) continue;
            const key = c.phone.replace(/[^0-9+]/g, "").replace(/^\+84/, "0");
            const old = customerMap.get(key);
            const timestamp = String(row.created_at ?? "");
            const customerRow = old ?? {
              id: key, name: c.name || "", phone: c.phone, address: c.address || "",
              orders: 0, bookings: 0, total_spent: 0, last_activity: "",
            };
            if (!old || timestamp >= old.last_activity) {
              customerRow.name = c.name || customerRow.name;
              customerRow.address = c.address || customerRow.address;
              customerRow.last_activity = timestamp;
            }
            if (kind === "order") {
              customerRow.orders++;
              customerRow.total_spent += Number(row.total) || 0;
            } else customerRow.bookings++;
            customerMap.set(key, customerRow);
          } catch { /* Ignore malformed historical entries. */ }
        }
        const customers = [...customerMap.values()].sort(
          (a,b) => b.last_activity.localeCompare(a.last_activity),
        );
        return Response.json({
          customers,
          products: products.results,
          orders: orders.results,
          bookings: bookings.results,
          assets: assets.results,
          externalOrders: external.results,
          posts: await allPosts(),
          payments: await walletSettings(),
          settings: await shopSettings(),
          integrations: integrations(),
        });
      }
      if (method === "POST" && p === "admin/products/import") {
        const payload = z.object({
          products: z.array(productInput).min(1).max(50),
        }).parse(await jsonBody(req));
        const ids = payload.products.map(() => crypto.randomUUID());
        await db().batch(payload.products.map((b, index) =>
          db().prepare("INSERT INTO products (id,name,category,price,original_price,stock,image,description,specs,tag,active) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
            .bind(ids[index],b.name,b.category,b.price,b.original_price,b.stock,b.image,b.description,b.specs,b.tag,b.active)
        ));
        return Response.json({ imported: ids.length, message: `Đã thêm ${ids.length} sản phẩm.` });
      }
      if (method === "POST" && p === "admin/products") {
        const b = productInput.parse(await jsonBody(req)),
          id = crypto.randomUUID();
        await db()
          .prepare(
            "INSERT INTO products (id,name,category,price,original_price,stock,image,description,specs,tag,active) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
          )
          .bind(
            id,
            b.name,
            b.category,
            b.price,
            b.original_price,
            b.stock,
            b.image,
            b.description,
            b.specs,
            b.tag,
            b.active,
          )
          .run();
        return Response.json({ id });
      }
      if (method === "PATCH" && path[1] === "products") {
        const b = productInput.parse(await jsonBody(req));
        await db()
          .prepare(
            "UPDATE products SET name=?,category=?,price=?,original_price=?,stock=?,image=?,description=?,specs=?,tag=?,active=? WHERE id=?",
          )
          .bind(
            b.name,
            b.category,
            b.price,
            b.original_price,
            b.stock,
            b.image,
            b.description,
            b.specs,
            b.tag,
            b.active,
            path[2],
          )
          .run();
        return Response.json({ success: true });
      }
      if (method === "PATCH" && path[1] === "orders") {
        const b = z
            .object({
              status: z.enum([
                "processing",
                "shipped",
                "completed",
                "cancelled",
              ]),
            })
            .parse(await jsonBody(req)),
          current = await db()
            .prepare("SELECT * FROM orders WHERE id=?")
            .bind(path[2])
            .first<{
              status: string;
              payment_status: string;
              method: string;
            }>();
        if (!current) throw new HttpError(404, "Không tìm thấy đơn.");
        const transitions: Record<string, string[]> = {
          pending: ["processing", "cancelled"],
          processing: ["shipped", "cancelled"],
          shipped: ["completed"],
          completed: [],
          cancelled: [],
        };
        if (!transitions[current.status]?.includes(b.status))
          throw new HttpError(409, "Chuyển trạng thái không hợp lệ.");
        if (b.status === "cancelled" && current.payment_status === "paid")
          throw new HttpError(
            409,
            "Đơn đã thanh toán: xử lý hoàn tiền trước khi hủy.",
          );
        if (
          isWalletId(current.method) &&
          ["shipped", "completed"].includes(b.status) &&
          current.payment_status !== "paid"
        )
          throw new HttpError(
            409,
            "Cần đối soát thanh toán ví trước khi giao hoặc hoàn thành đơn.",
          );
        const result = await db()
          .prepare(
            "UPDATE orders SET status=?,payment_status=CASE WHEN method='cod' AND ?='completed' THEN 'paid' ELSE payment_status END WHERE id=? AND status=? AND (?!='cancelled' OR payment_status!='paid')",
          )
          .bind(b.status, b.status, path[2], current.status, b.status)
          .run();
        if (!result.meta.changes)
          throw new HttpError(
            409,
            "Trạng thái đơn vừa thay đổi. Vui lòng tải lại.",
          );
        return Response.json({ success: true });
      }
      if (method === "PATCH" && path[1] === "bookings") {
        const b = z
          .object({ status: z.enum(["confirmed", "completed", "cancelled"]) })
          .parse(await jsonBody(req));
        await db()
          .prepare("UPDATE bookings SET status=? WHERE id=?")
          .bind(b.status, path[2])
          .run();
        return Response.json({ success: true });
      }
      if (method === "POST" && p === "admin/settings") {
        const b = z
          .object({
            brand: z.string().trim().min(2).max(80),
            phone: z.string().max(20),
            address: z.string().max(300),
            serviceArea: z.string().max(300),
            facebookPage: z.string().regex(/^[a-zA-Z0-9.]*$/),
            zaloOa: z.string().regex(/^[0-9]*$/),
            shipping: z.number().int().min(0).max(1000000),
            freeShipping: z.number().int().min(0).max(100000000),
          })
          .parse(await jsonBody(req));
        await db()
          .prepare(
            "INSERT INTO settings (key,value) VALUES ('shop',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
          )
          .bind(JSON.stringify(b))
          .run();
        return Response.json({ success: true });
      }
      if (method === "POST" && p === "admin/upload") {
        const form = await req.formData(),
          file = form.get("file");
        if (
          !(file instanceof File) ||
          file.size > 8 * 1024 * 1024 ||
          file.type !== "image/webp"
        )
          throw new HttpError(400, "Chỉ nhận WebP tối đa 8 MB.");
        const bytes = await file.arrayBuffer(),
          header = new TextDecoder().decode(bytes.slice(0, 12));
        if (!header.startsWith("RIFF") || !header.endsWith("WEBP"))
          throw new HttpError(400, "Tệp ảnh không hợp lệ.");
        const id = crypto.randomUUID();
        let url = `/api/media/${id}`,
          storage = "r2";
        if (integrations().cloudinary) {
          const e = runtime(),
            timestamp = String(Math.floor(Date.now() / 1000)),
            signature = createHash("sha1")
              .update(
                `folder=infiniti-seller&timestamp=${timestamp}${e.CLOUDINARY_API_SECRET}`,
              )
              .digest("hex"),
            data = new FormData();
          data.set("file", file);
          data.set("folder", "infiniti-seller");
          data.set("timestamp", timestamp);
          data.set("api_key", e.CLOUDINARY_API_KEY);
          data.set("signature", signature);
          const r = await fetch(
              `https://api.cloudinary.com/v1_1/${e.CLOUDINARY_CLOUD_NAME}/image/upload`,
              { method: "POST", body: data },
            ),
            result = (await r.json()) as { secure_url?: string };
          if (!r.ok || !result.secure_url)
            throw new HttpError(502, "Cloudinary chưa nhận được ảnh.");
          url = result.secure_url;
          storage = "cloudinary";
        } else {
          if (!env.BUCKET) throw new HttpError(503, "Chưa có kho ảnh.");
          await env.BUCKET.put(id, bytes, {
            httpMetadata: { contentType: "image/webp" },
          });
        }
        await db()
          .prepare(
            "INSERT INTO assets (id,name,url,storage,size,created_at) VALUES (?,?,?,?,?,?)",
          )
          .bind(id, file.name.slice(0, 150), url, storage, file.size, now())
          .run();
        return Response.json({ id, url, size: file.size, storage });
      }
      if (method === "POST" && p === "admin/sync") {
        const token = runtime().HARAVAN_ACCESS_TOKEN;
        if (!token)
          throw new HttpError(503, "Cần cấu hình HARAVAN_ACCESS_TOKEN.");
        const resource = z
          .enum(["products", "orders"])
          .parse((await jsonBody(req)).resource);
        let count = 0;
        for (let page = 1; page <= 20; page++) {
          const r = await fetch(
            `https://apis.haravan.com/com/${resource}.json?limit=50&page=${page}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              signal: AbortSignal.timeout(15000),
            },
          );
          if (!r.ok)
            throw new HttpError(
              502,
              `Haravan trả lỗi ${r.status}. Kiểm tra token và quyền đọc.`,
            );
          const data = (await r.json()) as Record<string, any[]>,
            rows = data[resource] || [];
          for (const row of rows) {
            if (resource === "orders") {
              await db()
                .prepare(
                  "INSERT INTO external_orders (id,data,synced_at) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,synced_at=excluded.synced_at",
                )
                .bind(`hrv-${row.id}`, JSON.stringify(row), now())
                .run();
              count++;
            } else
              for (const v of row.variants || []) {
                const price = Math.round(Number(v.price)),
                  stock = Math.max(0, Number(v.inventory_quantity) || 0);
                if (!Number.isFinite(price) || price < 1000) continue;
                const id = `hrv-${v.id}`,
                  name = `${row.title}${v.title && v.title !== "Default Title" ? ` — ${v.title}` : ""}`;
                await db()
                  .prepare(
                    "INSERT INTO products (id,name,category,price,original_price,stock,image,description,specs,tag,active,external_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,price=excluded.price,stock=excluded.stock,image=excluded.image",
                  )
                  .bind(
                    id,
                    name,
                    "Phụ kiện",
                    price,
                    price,
                    stock,
                    row.images?.[0]?.src || "",
                    row.body_plain || "Sản phẩm từ Haravan",
                    v.sku || "",
                    "Haravan",
                    1,
                    String(v.id),
                  )
                  .run();
                count++;
              }
          }
          if (rows.length < 50) break;
          if (page === 20)
            throw new HttpError(
              409,
              "Đã xử lý 1.000 bản ghi. Cần tác vụ nền cho dữ liệu lớn hơn.",
            );
        }
        return Response.json({
          count,
          message: `Đã đồng bộ ${count} ${resource === "products" ? "sản phẩm / tồn kho" : "đơn hàng"} từ Haravan.`,
        });
      }
    }
    throw new HttpError(404, "Không tìm thấy API.");
  } catch (e) {
    if (e instanceof z.ZodError)
      return Response.json(
        { error: e.issues[0]?.message || "Dữ liệu không hợp lệ." },
        { status: 400 },
      );
    if (e instanceof HttpError)
      return Response.json({ error: e.message }, { status: e.status });
    const m = e instanceof Error ? e.message : "";
    if (m.includes("INSUFFICIENT_STOCK") || m.includes("PRICE_CHANGED"))
      return Response.json(
        { error: "Tồn kho hoặc giá đã thay đổi. Vui lòng tải lại giỏ hàng." },
        { status: 409 },
      );
    console.error("API failure", e);
    return Response.json(
      { error: "Chưa xử lý được yêu cầu. Vui lòng thử lại." },
      { status: 500 },
    );
  }
}
export const GET = handler,
  POST = handler,
  PATCH = handler;
