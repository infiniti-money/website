import assert from "node:assert/strict";
const base = process.argv[2] || "http://127.0.0.1:5175";
assert(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Local preview only.",
);
const login = await fetch(base + "/signin-with-chatgpt?return_to=/", {
    redirect: "manual",
  }),
  cookie = login.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
let checks = 0;
const pass = (name) => {
  checks++;
  console.log("PASS " + name);
};
async function call(path, body, method = "POST", auth = true) {
  const response = await fetch(base + "/api/" + path, {
    method: body ? method : "GET",
    headers: {
      ...(auth ? { cookie } : {}),
      ...(body ? { "Content-Type": "application/json", origin: base } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, data: await response.json() };
}
const initial = await call("admin/data"),
  originalPayments = initial.data.payments;
const empty = () =>
  Object.fromEntries(
    ["zalopay", "momo", "viettelmoney"].map((id) => [
      id,
      { enabled: false, url: "", recipient: "", instructions: "" },
    ]),
  );
const unique = crypto.randomUUID().slice(0, 8),
  post = {
    title: "Bài kiểm thử nội dung " + unique,
    slug: "kiem-thu-" + unique,
    excerpt: "Bài viết kiểm thử cục bộ để xác minh quyền đọc, đăng và lưu trữ.",
    cover_image: "",
    body:
      "## Nội dung kiểm thử\n\n" +
      "Đây là nội dung được kiểm tra tại máy cục bộ. ".repeat(5) +
      '\n\n<script>alert("unsafe")</script>',
    category: "Kiểm thử",
    author: "Infiniti Seller",
    status: "draft",
  };
let postId, productId;
const product = {
  name: "QA wallet fixture " + unique,
  category: "Phụ kiện",
  price: 100000,
  original_price: 100000,
  stock: 2,
  image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
  description: "Local fixture",
  specs: "TEST",
  tag: "QA",
  active: 1,
};
try {
  assert.equal((await call("admin/posts", post, "POST", false)).status, 401);
  pass("article writes require owner authentication");
  const created = await call("admin/posts", post);
  assert.equal(created.status, 200, JSON.stringify(created));
  postId = created.data.id;
  assert(!(await call("posts")).data.posts.some((p) => p.slug === post.slug));
  assert.equal(
    (await fetch(base + "/bai-viet/" + post.slug, { headers: { cookie } }))
      .status,
    404,
  );
  pass("drafts are absent from both list and direct page");
  assert.equal(
    (
      await call(
        "admin/posts/" + postId,
        { ...post, status: "published" },
        "PATCH",
      )
    ).status,
    200,
  );
  assert((await call("posts")).data.posts.some((p) => p.slug === post.slug));
  const page = await fetch(base + "/bai-viet/" + post.slug, {
      headers: { cookie },
    }),
    html = await page.text();
  assert.equal(page.status, 200);
  assert(html.includes("&lt;script&gt;"));
  assert(!html.includes('<script>alert("unsafe")</script>'));
  pass("published article is readable and HTML is escaped");
  assert.equal(
    (await call("admin/posts", { ...post, status: "published" })).status,
    409,
  );
  pass("duplicate article slugs rejected");
  await call("admin/posts/" + postId, { ...post, status: "archived" }, "PATCH");
  assert.equal(
    (await fetch(base + "/bai-viet/" + post.slug, { headers: { cookie } }))
      .status,
    404,
  );
  pass("archived article cannot be opened publicly");
  for (const url of [
    "javascript:alert(1)",
    "https://momo.vn.evil.example/pay",
    "https://momo.vn/",
  ]) {
    const invalid = empty();
    invalid.momo = {
      enabled: true,
      url,
      recipient: "LOCAL QA",
      instructions: "",
    };
    assert.equal((await call("admin/payments", invalid)).status, 400);
  }
  pass("unsafe, lookalike and homepage payment URLs rejected");
  const unconfigured = empty();
  unconfigured.zalopay.enabled = true;
  assert.equal((await call("admin/payments", unconfigured)).status, 400);
  await call("admin/payments", empty());
  pass("unconfigured providers cannot be enabled");
  const createdProduct = await call("admin/products", product);
  productId = createdProduct.data.id;
  const payload = () => ({
    customer: {
      name: "Khách kiểm thử",
      phone: "0900000000",
      address: "Địa chỉ kiểm thử cục bộ",
    },
    items: [{ id: productId, quantity: 1 }],
    method: "momo",
    requestId: crypto.randomUUID(),
    payment_url: "https://attacker.example/pay",
    payment_status: "paid",
  });
  assert.equal((await call("checkout", payload())).status, 503);
  pass("disabled wallet cannot create an order or reserve inventory");
  const config = empty();
  config.momo = {
    enabled: true,
    url: "https://me.momo.vn/0000000000",
    recipient: "LOCAL QA ONLY",
    instructions: "Không dùng cho giao dịch thật.",
  };
  assert.equal((await call("admin/payments", config)).status, 200);
  assert.equal((await call("catalog")).data.wallets.momo, true);
  const orderResponse = await call("checkout", payload());
  assert.equal(orderResponse.status, 201, JSON.stringify(orderResponse));
  const o = orderResponse.data.order;
  assert.equal(o.payment_status, "unpaid");
  assert.equal(o.payment_url, config.momo.url);
  assert.equal(JSON.parse(o.payment_details).recipient, "LOCAL QA ONLY");
  assert.equal(o.total, 130000);
  pass("wallet checkout snapshots server settings and stays unpaid");
  await call("admin/orders/" + o.id, { status: "processing" }, "PATCH");
  assert.equal(
    (await call("admin/orders/" + o.id, { status: "shipped" }, "PATCH")).status,
    409,
  );
  pass("unverified wallet order cannot ship");
  assert.equal(
    (
      await call(
        "admin/orders/" + o.id + "/payment",
        { reference: "QA-TEST", confirmed: false },
        "PATCH",
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await call(
        "admin/orders/" + o.id + "/payment",
        { reference: "QA-TEST", confirmed: true },
        "PATCH",
        false,
      )
    ).status,
    401,
  );
  pass("verification requires owner and explicit confirmation");
  assert.equal(
    (
      await call(
        "admin/orders/" + o.id + "/payment",
        { reference: "QA-TEST", confirmed: true },
        "PATCH",
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await call(
        "admin/orders/" + o.id + "/payment",
        { reference: "QA-TEST", confirmed: true },
        "PATCH",
      )
    ).status,
    409,
  );
  assert.equal(
    (await call("admin/orders/" + o.id, { status: "cancelled" }, "PATCH"))
      .status,
    409,
  );
  assert.equal(
    (await call("admin/orders/" + o.id, { status: "shipped" }, "PATCH")).status,
    200,
  );
  assert.equal(
    (await call("admin/orders/" + o.id, { status: "completed" }, "PATCH"))
      .status,
    200,
  );
  pass("manual reconciliation is one-time and paid cancellation is blocked");
} finally {
  await call("admin/payments", originalPayments);
  if (postId)
    await call(
      "admin/posts/" + postId,
      { ...post, status: "archived" },
      "PATCH",
    );
  if (productId)
    await call(
      "admin/products/" + productId,
      { ...product, active: 0 },
      "PATCH",
    );
}
console.log(`${checks} content and linked-payment checks passed.`);
