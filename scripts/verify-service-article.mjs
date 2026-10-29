import assert from "node:assert/strict";
const base = process.argv[2] || "http://127.0.0.1:5175";
assert(
  ["127.0.0.1", "localhost"].includes(new URL(base).hostname),
  "Local preview only.",
);
const login = await fetch(base + "/signin-with-chatgpt?return_to=/", {
  redirect: "manual",
});
const cookie = login.headers
  .getSetCookie()
  .map((c) => c.split(";")[0])
  .join("; ");
const headers = { cookie, "Content-Type": "application/json", origin: base };
let checks = 0;
function pass(name) {
  checks++;
  console.log("PASS " + name);
}
async function call(path, body, method = "POST") {
  const response = await fetch(base + "/api/" + path, {
    method,
    headers,
    body: JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}
const slug = "sua-may-tinh-laptop-may-in-lap-mang-camera-tai-nha";
const html = await (
  await fetch(base + "/bai-viet/" + slug, { headers })
).text();
assert.match(html, /<table>/);
for (const price of [
  "150.000–250.000",
  "100.000–200.000",
  "100.000–180.000",
  "150.000–300.000\/mắt",
])
  assert(html.includes(price));
assert.match(html, /href="tel:0867899987"/);
assert.match(html, /href="https:\/\/zalo.me\/0867899987"/);
assert(html.includes("Tân Phú - Việt Yên - Hưng Yên"));
assert(!html.includes("[Số điện thoại]"));
pass("service content, five prices and contact actions are rendered");
assert.match(
  html,
  /<title>Dịch Vụ Sửa Máy Tính, Laptop, Máy In &amp; Lắp Camera Tại Nhà Uy Tín \| Infiniti Seller<\/title>/,
);
assert.match(html, /<meta name="description" content="[^"]*0867899987/);
assert.match(
  html,
  /rel="canonical" href="https:\/\/infiniti-seller.supertulip11.chatgpt.site\/bai-viet\//,
);
assert.match(
  html,
  /property="og:image" content="https:\/\/infiniti-seller.supertulip11.chatgpt.site\/images\//,
);
pass("custom SEO, canonical and absolute share image are present");
for (const name of ["sua-may-tinh-tai-nha.jpg", "lap-dat-mang-tai-nha.jpg"]) {
  const response = await fetch(base + "/images/" + name);
  assert.equal(response.status, 200);
  assert(response.headers.get("content-type").includes("image/"));
}
pass("both local article photos load");
const protectedPage = await fetch(base + "/admin/bai-viet", {
  redirect: "manual",
});
assert.equal(protectedPage.status, 307);
const adminPage = await fetch(base + "/admin/bai-viet", { headers });
assert.equal(adminPage.status, 200);
assert((await adminPage.text()).includes("Quản lý bài viết"));
pass("dedicated article management page requires login");
const fixture = {
  title: "Kiểm thử Markdown và SEO",
  slug: "qa-render-" + crypto.randomUUID().slice(0, 8),
  excerpt: "Bài viết kiểm thử trình bày và thông tin tìm kiếm.",
  seo_title: "SEO được lưu riêng",
  seo_description: "Mô tả SEO khác với mô tả ngắn.",
  cover_image: "/images/lap-dat-mang-tai-nha.jpg",
  category: "Kiểm thử",
  author: "Infiniti Seller",
  status: "published",
  body: "## Nội dung kiểm thử\n\n> **Tư vấn:** [Gọi ngay](tel:0867899987)\n\n| Dịch vụ | Giá |\n| --- | --- |\n| **Kiểm tra** | 100.000 |\n\n![Ảnh an toàn](/images/sua-may-tinh-tai-nha.jpg)\n\n![Ảnh nguy hiểm](javascript:alert)\n\n[Liên kết nguy hiểm](javascript:alert)\n\n![Đầu vào chưa đủ\n\n<script>alert(1)</script>\n\n*Nguồn [Pexels](https://www.pexels.com/).*",
};
let id;
try {
  const result = await call("admin/posts", fixture);
  assert.equal(result.status, 200, JSON.stringify(result));
  id = result.data.id;
  const page = await (
    await fetch(base + "/bai-viet/" + fixture.slug, { headers })
  ).text();
  assert(page.includes("SEO được lưu riêng | Infiniti Seller"));
  assert(page.includes("Mô tả SEO khác với mô tả ngắn."));
  assert.match(page, /<blockquote>/);
  assert.match(page, /<th scope="col">/);
  assert.match(page, /href="https:\/\/www.pexels.com\/"/);
  assert(!page.includes('href="javascript:'));
  assert(!page.includes('src="javascript:'));
  assert(!page.includes("<script>alert(1)</script>"));
  pass(
    "Markdown tables, notes, photos and nested links work while unsafe URLs and HTML are inert",
  );
  assert.equal(
    (
      await call(
        "admin/posts/" + id,
        { ...fixture, status: "archived" },
        "PATCH",
      )
    ).status,
    200,
  );
  assert.equal(
    (await fetch(base + "/bai-viet/" + fixture.slug, { headers })).status,
    404,
  );
  pass("SEO article still respects archive visibility");
} finally {
  if (id)
    await call(
      "admin/posts/" + id,
      { ...fixture, status: "archived" },
      "PATCH",
    );
}
console.log(`${checks} service article checks passed.`);
