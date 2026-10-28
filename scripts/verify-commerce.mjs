import assert from "node:assert/strict";
const base = process.argv[2] || "http://127.0.0.1:5175";
assert(
  ["localhost", "127.0.0.1"].includes(new URL(base).hostname),
  "Checks must target a local preview.",
);
let cookie = "";
let checks = 0;
async function call(path, body, method = "POST", auth = true) {
  const r = await fetch(base + "/api/" + path, {
    method: body ? method : "GET",
    headers: {
      ...(auth ? { cookie } : {}),
      ...(body ? { "Content-Type": "application/json", origin: base } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, data: await r.json() };
}
function pass(name) {
  checks++;
  console.log("PASS " + name);
}
assert.equal((await call("orders", undefined, "GET", false)).status, 401);
pass("anonymous order access rejected");
const login = await fetch(base + "/signin-with-chatgpt?return_to=/", {
  redirect: "manual",
});
cookie = login.headers
  .getSetCookie()
  .map((c) => c.split(";")[0])
  .join("; ");
assert(cookie);
assert.equal((await call("admin/data")).status, 200);
pass("local owner authorization");
const p = {
  name: "QA fixture - not for sale",
  category: "Phụ kiện",
  price: 100000,
  original_price: 100000,
  stock: 1,
  image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
  description: "Local verification fixture",
  specs: "TEST",
  tag: "QA",
  active: 1,
};
const created = await call("admin/products", p);
assert.equal(created.status, 200);
const id = created.data.id;
const customer = {
  name: "Khách kiểm thử",
  phone: "0900000000",
  address: "Địa chỉ kiểm thử cục bộ",
};
const payload = () => ({
  customer,
  items: [{ id, quantity: 1 }],
  method: "cod",
  requestId: crypto.randomUUID(),
  subtotal: 1,
  total: 1,
});
try {
  const body = payload(),
    a = await call("checkout", body);
  assert.equal(a.status, 201, JSON.stringify(a));
  assert.equal(a.data.order.subtotal, 100000);
  assert.equal(a.data.order.total, 130000);
  pass("server pricing and shipping override client totals");
  const again = await call("checkout", body);
  assert.equal(again.data.order.id, a.data.order.id);
  pass("idempotent checkout reserves stock once");
  assert.equal((await call("checkout", payload())).status, 409);
  pass("insufficient stock rejected");
  assert.equal(
    (
      await call(
        "admin/orders/" + a.data.order.id,
        { status: "cancelled" },
        "PATCH",
      )
    ).status,
    200,
  );
  const state = await call("admin/data");
  assert.equal(state.data.products.find((p) => p.id === id).stock, 1);
  pass("cancellation restores inventory");
  assert.equal(
    (
      await call(
        "admin/orders/" + a.data.order.id,
        { status: "cancelled" },
        "PATCH",
      )
    ).status,
    409,
  );
  assert.equal(
    (await call("admin/data")).data.products.find((p) => p.id === id).stock,
    1,
  );
  pass("repeated cancellation cannot inflate stock");
  const race = await Promise.all([
    call("checkout", payload()),
    call("checkout", payload()),
  ]);
  assert.deepEqual(race.map((r) => r.status).sort(), [201, 409]);
  await call(
    "admin/orders/" + race.find((r) => r.status === 201).data.order.id,
    { status: "cancelled" },
    "PATCH",
  );
  pass("concurrent orders cannot oversell the last unit");
  assert.equal(
    (await call("checkout", { ...payload(), method: "payos" })).status,
    503,
  );
  assert.equal(
    (await call("admin/data")).data.products.find((p) => p.id === id).stock,
    1,
  );
  pass("unconfigured payment rejected without reserving inventory");
  const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    booking = await call("bookings", {
      customer,
      service: "network",
      date,
      slot: "08:00–10:00",
      note: "Local QA only",
    });
  assert.equal(booking.status, 201);
  await call(
    "admin/bookings/" + booking.data.id,
    { status: "cancelled" },
    "PATCH",
  );
  pass("service request persists and status updates");
  assert.equal(
    (
      await call("bookings", {
        customer,
        service: "computer",
        date: "2020-01-01",
        slot: "08:00–10:00",
        note: "",
      })
    ).status,
    400,
  );
  pass("past service dates rejected");
  const bytes = Buffer.from(
      "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
      "base64",
    ),
    form = new FormData();
  form.set("file", new File([bytes], "qa.webp", { type: "image/webp" }));
  const upload = await fetch(base + "/api/admin/upload", {
      method: "POST",
      headers: { cookie, origin: base },
      body: form,
    }),
    asset = await upload.json();
  assert.equal(upload.status, 200, JSON.stringify(asset));
  const image = await fetch(base + asset.url, { headers: { cookie } });
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/webp");
  assert.deepEqual(Buffer.from(await image.arrayBuffer()), bytes);
  pass("WebP upload, durable metadata and R2 retrieval");
  const cross = await fetch(base + "/api/checkout", {
    method: "POST",
    headers: {
      cookie,
      "Content-Type": "application/json",
      origin: "https://other.example",
    },
    body: JSON.stringify(payload()),
  });
  assert.equal(cross.status, 403);
  pass("cross-origin write rejected");
} finally {
  await call("admin/products/" + id, { ...p, active: 0 }, "PATCH");
}
console.log(`${checks} meaningful commerce checks passed.`);
