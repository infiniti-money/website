import assert from "node:assert/strict";
const base = process.argv[2] || "http://127.0.0.1:5175";
assert(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
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
async function get(path) {
  const r = await fetch(base + path, { headers });
  assert.equal(r.status, 200, path);
  return r;
}
const admin = await (await get("/api/admin/data")).json(),
  regional = admin.posts.filter((p) => p.area_key && p.status === "published");
assert(regional.length > 100 && regional.length < 220);
assert.equal(regional.filter((p) => p.area_key.startsWith("huyen-")).length, 10);
const names = regional.map((p) =>
  p.title.replace(/^.*? tại /, "").normalize("NFC").trim().toLocaleLowerCase("vi"),
);
assert.equal(new Set(names).size, names.length, "No duplicate displayed locality names");
assert(!admin.posts.some((p) => "body" in p));
for (const p of regional) {
  assert(JSON.parse(p.tags).length >= 8);
  assert(p.seo_title && p.seo_description);
  assert(p.title.length <= 180);
  assert(p.excerpt.length <= 400);
  assert(!/\\(.*?\\)|\\bcũ\\b/i.test(p.title), "No old-name suffix in titles");
}
pass("distinct locality articles, district coverage, SEO and lightweight summaries");
const list = await (await get("/bai-viet?category=regional")).text();
assert(list.includes(`<b>${regional.length}</b>`));
assert.equal((list.match(/class="post-card"/g) || []).length, 12);
const second = await (await get("/bai-viet?category=regional&page=2")).text();
const cards = (s) =>
  [...s.matchAll(/class="post-card" href="([^"]+)"/g)].map((m) => m[1]);
assert.equal(cards(second).length, 12);
assert(!cards(second).some((s) => cards(list).includes(s)));
pass("public list paginates with non-overlapping pages");
const search = await (
  await get("/bai-viet?q=yen%20my&category=regional")
).text();
assert(search.includes("Yên Mỹ"));
assert.match(search, /<meta name="robots" content="noindex, follow"/);
pass("accent-free search works and search-result duplicates are not indexed");
const partial = regional.find((p) => p.area_key.startsWith("cu-"));
assert(partial);
const page = await (await get("/bai-viet/" + partial.slug)).text();
assert(page.includes(partial.title.replace(/^.*? tại /, "")));
assert(!page.includes("Địa danh được đối chiếu"));
assert(!page.includes("Theo khoản"));
assert(!page.includes("đối chiếu tên cũ và tên sau sáp nhập"));
assert(!page.includes("(cũ,"));
assert(page.includes("Tag bài viết"));
const data = [
  ...page.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  ),
].map((m) => JSON.parse(m[1]));
assert(data.some((d) => d["@graph"].some((n) => n["@type"] === "BlogPosting")));
assert(
  data.some((d) => d["@graph"].some((n) => n["@type"] === "BreadcrumbList")),
);
pass(
  "clean locality copy and Article/Breadcrumb structured data are present",
);
const xml = await (await get("/sitemap.xml")).text();
for (const p of regional) assert(xml.includes("/bai-viet/" + p.slug));
assert(!xml.includes("/admin"));
const robots = await (await get("/robots.txt")).text();
assert(robots.includes("Disallow: /admin"));
assert(
  robots.includes(
    "Sitemap: https://infiniti-seller.supertulip11.chatgpt.site/sitemap.xml",
  ),
);
pass(
  "sitemap covers every published locality and robots excludes administration",
);
assert.equal(
  (await fetch(base + "/api/admin/posts/" + partial.id)).status,
  401,
);
const detail = (await (await get("/api/admin/posts/" + partial.id)).json())
  .post;
assert(detail.body && detail.area_key);
pass("full article body loads separately behind owner authentication");
const original = { ...detail, tags: JSON.parse(detail.tags) };
try {
  const patch = await fetch(base + "/api/admin/posts/" + partial.id, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ ...original, status: "draft" }),
  });
  assert.equal(patch.status, 200);
  assert.equal(
    (await fetch(base + "/bai-viet/" + partial.slug, { headers })).status,
    404,
  );
  assert(
    !(await (await get("/sitemap.xml")).text()).includes(
      "/bai-viet/" + partial.slug,
    ),
  );
  const stored = (await (await get("/api/admin/posts/" + partial.id)).json())
    .post;
  assert.equal(stored.status, "draft");
  assert.equal(stored.tags, detail.tags);
  pass(
    "owner edits survive seeded reads and drafts disappear from sitemap and public routes",
  );
} finally {
  await fetch(base + "/api/admin/posts/" + partial.id, {
    method: "PATCH",
    headers,
    body: JSON.stringify(original),
  });
}
assert.equal(
  (await fetch(base + "/gioi-thieu", { headers, redirect: "manual" })).status,
  307,
);
pass("company introduction redirect still works with hundreds of posts");
console.log(`${checks} regional and SEO checks passed.`);
