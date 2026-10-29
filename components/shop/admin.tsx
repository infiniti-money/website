"use client";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  CalendarDays,
  Images,
  Plug,
  Settings,
  ArrowUpRight,
  Plus,
  Search,
  Pencil,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  Menu,
  BookOpen,
  WalletCards,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { money, categories, services, type Product } from "@/lib/catalog";
import { api, statusLabels } from "@/lib/client";
import Dialog from "./dialog";
import MediaUploader from "./media-uploader";
import PostsManager from "./posts-manager";
import PaymentSettings from "./payment-settings";
import VerifyPayment from "./verify-payment";
import { isWalletId, paymentMethodName } from "@/lib/payment-links";
const tabs = [
  ["overview", "Tổng quan", LayoutDashboard],
  ["products", "Sản phẩm", Package],
  ["orders", "Đơn hàng", ShoppingBag],
  ["bookings", "Lịch kỹ thuật", CalendarDays],
  ["media", "Thư viện ảnh", Images],
  ["posts", "Bài viết", BookOpen],
  ["payments", "Thanh toán", WalletCards],
  ["integrations", "Kết nối dịch vụ", Plug],
  ["settings", "Cài đặt cửa hàng", Settings],
] as const;
const providerInfo: Record<
  string,
  { name: string; description: string; keys: string[]; docs: string }
> = {
  payos: {
    name: "payOS",
    description:
      "Tạo liên kết thanh toán QR; xác nhận thanh toán qua webhook có chữ ký.",
    keys: ["PAYOS_CLIENT_ID", "PAYOS_API_KEY", "PAYOS_CHECKSUM_KEY"],
    docs: "https://payos.vn/docs/",
  },
  cloudinary: {
    name: "Cloudinary",
    description:
      "Lưu ảnh trên Cloudinary bằng yêu cầu đã ký. Khi chưa cấu hình, ảnh dùng kho R2 của website.",
    keys: [
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ],
    docs: "https://cloudinary.com/documentation/upload_images",
  },
  shopee: {
    name: "Shopee Open Platform",
    description: "Chuẩn bị kết nối gian hàng Shopee, sản phẩm và đơn hàng theo quyền ứng dụng được cấp. Chưa tự đồng bộ.",
    keys: ["SHOPEE_PARTNER_ID", "SHOPEE_PARTNER_KEY", "SHOPEE_SHOP_ID"],
    docs: "https://open.shopee.com/",
  },
  lazada: {
    name: "Lazada Open Platform",
    description: "Kết nối cửa hàng Lazada qua ứng dụng đối tác, cần thông tin API và ủy quyền từ chủ shop.",
    keys: ["LAZADA_APP_KEY", "LAZADA_APP_SECRET"],
    docs: "https://open.lazada.com/",
  },
  tiktokshop: {
    name: "TikTok Shop",
    description: "Kết nối gian hàng TikTok Shop qua API đối tác và cơ chế cấp quyền riêng cho cửa hàng.",
    keys: ["TIKTOK_SHOP_APP_KEY", "TIKTOK_SHOP_APP_SECRET"],
    docs: "https://partner.tiktokshop.com/",
  },
  tiki: {
    name: "Tiki",
    description: "Chuẩn bị tích hợp gian hàng Tiki và quyền API quản lý sản phẩm, đơn hàng từ đối tác.",
    keys: ["TIKI_API_TOKEN"],
    docs: "https://sellercenter.tiki.vn/",
  },
  shopify: {
    name: "Shopify",
    description: "Kết nối cửa hàng Shopify qua Admin API với quyền phù hợp để quản lý hàng hóa và đơn hàng.",
    keys: ["SHOPIFY_SHOP_DOMAIN", "SHOPIFY_ADMIN_ACCESS_TOKEN"],
    docs: "https://shopify.dev/docs/api/admin-graphql",
  },
  woocommerce: {
    name: "WooCommerce",
    description: "Kết nối website bán hàng WooCommerce bằng REST API key và URL website HTTPS.",
    keys: ["WOOCOMMERCE_STORE_URL", "WOOCOMMERCE_CONSUMER_KEY", "WOOCOMMERCE_CONSUMER_SECRET"],
    docs: "https://woocommerce.github.io/woocommerce-rest-api-docs/",
  },
  sapo: {
    name: "Sapo",
    description: "Chuẩn bị tích hợp dữ liệu bán hàng với Sapo khi tài khoản có quyền API tương ứng.",
    keys: ["SAPO_API_KEY", "SAPO_API_SECRET"],
    docs: "https://www.sapo.vn/",
  },
  kiotviet: {
    name: "KiotViet",
    description: "Kết nối phần mềm KiotViet thông qua thông tin API từ tài khoản bán hàng có quyền tích hợp.",
    keys: ["KIOTVIET_CLIENT_ID", "KIOTVIET_CLIENT_SECRET", "KIOTVIET_RETAILER"],
    docs: "https://www.kiotviet.vn/",
  },
  viettelpost: {
    name: "Viettel Post",
    description: "Cấu hình tài khoản Viettel Post để chuẩn bị tích hợp vận đơn và tra cứu giao hàng. Chưa tự động tạo đơn.",
    keys: ["VIETTELPOST_USERNAME", "VIETTELPOST_PASSWORD"],
    docs: "https://viettelpost.com.vn/",
  },
  ghn: {
    name: "Giao Hàng Nhanh (GHN)",
    description: "Chuẩn bị kết nối giao hàng GHN. Cần token và mã cửa hàng hợp lệ; chưa phát sinh đơn vận chuyển.",
    keys: ["GHN_TOKEN", "GHN_SHOP_ID"],
    docs: "https://api.ghn.vn/",
  },
  ghtk: {
    name: "Giao Hàng Tiết Kiệm (GHTK)",
    description: "Chuẩn bị kết nối GHTK bằng token do đối tác cấp; chưa tạo vận đơn tự động.",
    keys: ["GHTK_TOKEN"],
    docs: "https://giaohangtietkiem.vn/",
  },
  jnt: {
    name: "J&T Express",
    description: "Hướng dẫn kết nối J&T Express sau khi được cấp tài khoản đối tác và thông số API.",
    keys: ["JNT_CUSTOMER_CODE", "JNT_API_KEY"],
    docs: "https://jtexpress.vn/",
  },
  haravan: {
    name: "Haravan Omnichannel",
    description:
      "Nhập sản phẩm, tồn kho và đơn hàng từ Haravan. Các sàn cần được kết nối trong tài khoản Haravan của bạn.",
    keys: ["HARAVAN_ACCESS_TOKEN"],
    docs: "https://docs.haravan.com/docs/get-started/overview/",
  },
};
export default function Admin({
  initialTab = "overview",
}: {
  initialTab?: string;
}) {
  const [tab, setTab] = useState(
      tabs.some((t) => t[0] === initialTab) ? initialTab : "overview",
    ),
    [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [edit, setEdit] = useState<Partial<Product> | null>(null),
    [provider, setProvider] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [sidebar, setSidebar] = useState(false);
  const [verifyOrder, setVerifyOrder] = useState<any>(null);
  async function load() {
    try {
      setData(await api("admin/data"));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    load();
    function restoreTab() {
      const selected =
        window.location.pathname === "/admin/bai-viet"
          ? "posts"
          : new URLSearchParams(window.location.search).get("tab") ||
            "overview";
      setTab(tabs.some((t) => t[0] === selected) ? selected : "overview");
      setSidebar(false);
      setQuery("");
    }
    window.addEventListener("popstate", restoreTab);
    return () => window.removeEventListener("popstate", restoreTab);
  }, []);
  async function action(path: string, body: any, method = "POST") {
    setBusy(true);
    try {
      const r = await api(path, body, method);
      toast.success(r.message || "Đã cập nhật");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const title = tabs.find((t) => t[0] === tab)?.[1];
  const paid =
    data?.orders.filter((o: any) => o.payment_status === "paid") || [];
  const revenue = paid.reduce((n: number, o: any) => n + o.total, 0);
  function changeTab(t: string) {
    const path =
      t === "posts"
        ? "/admin/bai-viet"
        : t === "overview"
          ? "/admin"
          : `/admin?tab=${t}`;
    if (window.location.pathname + window.location.search !== path)
      window.history.pushState(null, "", path);
    setTab(t);
    setQuery("");
    setSidebar(false);
  }
  return (
    <div className="admin-shell">
      <Toaster position="bottom-center" richColors />
      <aside className={`admin-sidebar ${sidebar ? "open" : ""}`}>
        <a className="brand" href="/">
          <span className="brand-icon">∞</span>
          <span>
            infiniti
            <span className="brand-second">
              seller<span className="brand-dot">.</span>
            </span>
          </span>
        </a>
        <span className="admin-workspace">KHÔNG GIAN QUẢN TRỊ</span>
        <nav>
          {tabs.map(([id, name, Icon]) => (
            <button
              key={id}
              className={id === tab ? "active" : ""}
              onClick={() => changeTab(id)}
            >
              <Icon size={18} />
              {name}
              {id === "bookings" &&
                data?.bookings.filter((b: any) => b.status === "new").length >
                  0 && (
                  <i>
                    {
                      data.bookings.filter((b: any) => b.status === "new")
                        .length
                    }
                  </i>
                )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-avatar">IS</div>
          <div>
            <b>Infiniti Seller</b>
            <small>Chủ cửa hàng</small>
          </div>
          <a href="/" aria-label="Mở cửa hàng">
            <ArrowUpRight size={18} />
          </a>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <button
            className="icon-button mobile-admin"
            aria-label="Menu quản trị"
            onClick={() => setSidebar(!sidebar)}
          >
            <Menu size={22} />
          </button>
          <span>
            Quản trị <span>/</span> <b>{title}</b>
          </span>
          <a className="btn btn-outline small" href="/">
            Xem cửa hàng <ArrowUpRight size={14} />
          </a>
        </header>
        <main className="admin-content">
          <div className="admin-title">
            <div>
              <div className="eyebrow">INFINITI SELLER · MANAGEMENT</div>
              <h1>
                {tab === "overview" ? "Chào bạn, một ngày hiệu quả!" : title}
              </h1>
              <p>
                {tab === "overview"
                  ? "Mọi hoạt động của cửa hàng, trong một không gian."
                  : "Quản lý và cập nhật cửa hàng của bạn."}
              </p>
            </div>
            <button
              className="icon-button"
              aria-label="Làm mới dữ liệu"
              onClick={load}
            >
              <RefreshCw size={19} />
            </button>
          </div>
          {error ? (
            <div className="form-error">
              <p>{error}</p>
              <a href="/signin-with-chatgpt?return_to=%2Fadmin" target="_top">
                Đăng nhập
              </a>{" "}
              · <button onClick={load}>Thử lại</button>
            </div>
          ) : !data ? (
            <div className="empty-state">Đang tải dữ liệu cửa hàng...</div>
          ) : (
            <>
              {tab === "overview" && (
                <>
                  <div className="metric-grid">
                    {[
                      [
                        ShoppingBag,
                        "Đơn hàng",
                        data.orders.length,
                        "Đơn từ website",
                      ],
                      [
                        Package,
                        "Sản phẩm",
                        data.products.length,
                        `${data.products.filter((p: Product) => p.stock < 5).length} sản phẩm sắp hết`,
                      ],
                      [
                        CalendarDays,
                        "Lịch kỹ thuật",
                        data.bookings.length,
                        `${data.bookings.filter((b: any) => b.status === "new").length} yêu cầu chờ xác nhận`,
                      ],
                      [
                        CheckCircle2,
                        "Đã thu",
                        money(revenue),
                        "Từ các đơn đã thanh toán",
                      ],
                    ].map(([Icon, label, value, note]: any) => (
                      <article key={label}>
                        <div>
                          <span>{label}</span>
                          <Icon size={19} />
                        </div>
                        <strong>{value}</strong>
                        <small>{note}</small>
                      </article>
                    ))}
                  </div>
                  <div className="admin-overview-grid">
                    <section className="admin-panel">
                      <div className="admin-panel-head">
                        <h3>Đơn hàng gần đây</h3>
                        <button onClick={() => changeTab("orders")}>
                          Xem tất cả <ArrowRight size={14} />
                        </button>
                      </div>
                      <OrderTable
                        orders={data.orders.slice(0, 5)}
                        onAction={action}
                        busy={busy}
                        onVerify={setVerifyOrder}
                      />
                    </section>
                    <section className="admin-panel quick-panel">
                      <span className="pill">BẮT ĐẦU TẠI ĐÂY</span>
                      <h3>
                        Cửa hàng sẵn sàng
                        <br />
                        cho bước tiếp theo.
                      </h3>
                      <p>
                        Cập nhật sản phẩm và thông tin liên hệ, sau đó cấu hình
                        các dịch vụ khi bạn đã có tài khoản.
                      </p>
                      <button
                        onClick={() => {
                          changeTab("products");
                          setEdit({
                            category: "Laptop",
                            price: 1000000,
                            original_price: 1000000,
                            stock: 1,
                            active: 1,
                          });
                        }}
                      >
                        <Plus size={17} />
                        Thêm sản phẩm
                        <ArrowUpRight size={15} />
                      </button>
                      <button onClick={() => changeTab("media")}>
                        <Images size={17} />
                        Tải ảnh hàng loạt
                        <ArrowUpRight size={15} />
                      </button>
                      <button onClick={() => changeTab("settings")}>
                        <Settings size={17} />
                        Thông tin cửa hàng
                        <ArrowUpRight size={15} />
                      </button>
                    </section>
                  </div>
                  <div className="admin-panel">
                    <div className="admin-panel-head">
                      <h3>Yêu cầu kỹ thuật mới</h3>
                      <button onClick={() => changeTab("bookings")}>
                        Xem lịch kỹ thuật <ArrowRight size={14} />
                      </button>
                    </div>
                    <BookingTable
                      rows={data.bookings.slice(0, 4)}
                      onAction={action}
                      busy={busy}
                    />
                  </div>
                </>
              )}
              {tab === "products" && (
                <>
                  <div className="admin-toolbar">
                    <div className="admin-search">
                      <Search size={16} />
                      <input
                        placeholder="Tìm sản phẩm, danh mục..."
                        aria-label="Tìm sản phẩm trong quản trị"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                    <button
                      className="btn btn-blue small"
                      onClick={() =>
                        setEdit({
                          category: "Laptop",
                          price: 1000000,
                          original_price: 1000000,
                          stock: 1,
                          active: 1,
                        })
                      }
                    >
                      <Plus size={16} />
                      Thêm sản phẩm
                    </button>
                  </div>
                  <div className="admin-panel table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>Danh mục</th>
                          <th>Giá bán</th>
                          <th>Tồn kho</th>
                          <th>Hiển thị</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {data.products
                          .filter((p: Product) =>
                            (p.name + p.category)
                              .toLowerCase()
                              .includes(query.toLowerCase()),
                          )
                          .map((p: Product) => (
                            <tr key={p.id}>
                              <td>
                                <div className="table-product">
                                  <img
                                    src={p.image || "/product-placeholder.svg"}
                                    alt=""
                                  />
                                  <span>
                                    <b>{p.name}</b>
                                    <small>{p.specs}</small>
                                  </span>
                                </div>
                              </td>
                              <td>{p.category}</td>
                              <td>
                                <b>{money(p.price)}</b>
                              </td>
                              <td>
                                <span
                                  className={`stock-label ${p.stock < 5 ? "low" : ""}`}
                                >
                                  {p.stock} còn lại
                                </span>
                              </td>
                              <td>
                                <span
                                  className={`status ${p.active ? "completed" : "cancelled"}`}
                                >
                                  {p.active ? "Đang bán" : "Đã ẩn"}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="icon-button"
                                  onClick={() => setEdit(p)}
                                  aria-label={`Sửa ${p.name}`}
                                >
                                  <Pencil size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="form-note">
                    Sản phẩm mẫu có thể sửa, thay ảnh hoặc ẩn. Không dùng giá
                    minh họa cho giao dịch thực tế.
                  </p>
                </>
              )}
              {tab === "orders" && (
                <>
                  <div className="admin-panel">
                    <div className="admin-panel-head">
                      <h3>Đơn hàng website ({data.orders.length})</h3>
                      <span>Không tính đơn Haravan</span>
                    </div>
                    <OrderTable
                      orders={data.orders}
                      onAction={action}
                      busy={busy}
                      onVerify={setVerifyOrder}
                    />
                  </div>
                  <div className="admin-panel">
                    <div className="admin-panel-head">
                      <h3>
                        Đơn Haravan đã nhập ({data.externalOrders.length})
                      </h3>
                    </div>
                    {!data.externalOrders.length ? (
                      <div className="table-empty">Chưa có đơn từ Haravan.</div>
                    ) : (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Mã đơn</th>
                              <th>Khách hàng</th>
                              <th>Tổng tiền</th>
                              <th>Đồng bộ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.externalOrders.map((row: any) => {
                              const o = JSON.parse(row.data);
                              return (
                                <tr key={row.id}>
                                  <td>{o.name || o.id}</td>
                                  <td>
                                    {o.billing_address?.name ||
                                      o.email ||
                                      "Khách hàng"}
                                  </td>
                                  <td>{money(Number(o.total_price) || 0)}</td>
                                  <td>
                                    {new Date(row.synced_at).toLocaleString(
                                      "vi-VN",
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
              {tab === "bookings" && (
                <div className="admin-panel">
                  <div className="admin-panel-head">
                    <h3>Lịch sửa chữa & lắp đặt ({data.bookings.length})</h3>
                    <span>Giờ Việt Nam</span>
                  </div>
                  <BookingTable
                    rows={data.bookings}
                    onAction={action}
                    busy={busy}
                  />
                </div>
              )}
              {tab === "media" && (
                <MediaUploader assets={data.assets} reload={load} />
              )}
              {tab === "integrations" && (
                <>
                  <div className="info-banner">
                    <Plug size={21} />
                    <div>
                      <b>Kết nối khi bạn sẵn sàng</b>
                      <p>
                        Chưa có tài khoản dịch vụ? Cửa hàng vẫn dùng COD và kho
                        ảnh tích hợp. Khóa API chỉ được cấu hình ở môi trường
                        máy chủ.
                      </p>
                    </div>
                  </div>
                  <h3 className="integration-section-heading">Thanh toán, hình ảnh và thương mại</h3>
                  <div className="integration-grid">
                    {Object.entries(providerInfo).filter(([key]) => !["viettelpost","ghn","ghtk","jnt","shopee","lazada","tiktokshop","tiki","shopify","woocommerce","sapo","kiotviet"].includes(key)).map(([key, p]) => (
                      <article
                        className="admin-panel integration-card"
                        key={key}
                      >
                        <div>
                          <span className={`provider-logo ${key}`}>
                            {key === "payos"
                              ? "P"
                              : key === "cloudinary"
                                ? "☁"
                                : "H"}
                          </span>
                          <span
                            className={`status ${data.integrations[key] ? "completed" : "pending"}`}
                          >
                            {data.integrations[key]
                              ? "Đã cấu hình"
                              : "Chưa kết nối"}
                          </span>
                        </div>
                        <h3>{p.name}</h3>
                        <p>{p.description}</p>
                        <button
                          className="btn btn-outline full"
                          onClick={() => setProvider(key)}
                        >
                          Hướng dẫn cấu hình <ArrowUpRight size={15} />
                        </button>
                        {key === "haravan" && (
                          <div className="sync-actions">
                            <button
                              disabled={busy || !data.integrations.haravan}
                              onClick={() =>
                                action("admin/sync", { resource: "products" })
                              }
                            >
                              <RefreshCw size={13} />
                              Nhập sản phẩm & tồn kho
                            </button>
                            <button
                              disabled={busy || !data.integrations.haravan}
                              onClick={() =>
                                action("admin/sync", { resource: "orders" })
                              }
                            >
                              <Download size={13} />
                              Nhập đơn hàng
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                  <div className="admin-panel channels-panel">
                    <div>
                      <h3>Bán hàng đa nền tảng</h3>
                      <p>Thiết lập gian hàng trên các sàn thương mại điện tử và hệ thống bán hàng. Các tích hợp dưới đây là hướng dẫn cấu hình, chưa đồng bộ sản phẩm, giá, tồn kho hoặc đơn hàng nếu chưa xây dựng và cấp quyền kết nối API.</p>
                      <div className="shipping-provider-list">
                        {(["shopee","lazada","tiktokshop","tiki","shopify","woocommerce","sapo","kiotviet"] as const).map((key) => (
                          <button key={key} type="button" className="btn btn-outline small" onClick={() => setProvider(key)}>
                            {providerInfo[key].name} · {data.integrations[key] ? "Đã cấu hình biến môi trường" : "Chưa cấu hình"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="admin-panel channels-panel">
                    <div>
                      <h3>Đơn vị vận chuyển</h3>
                      <p>Hỗ trợ hướng dẫn cấu hình Viettel Post, GHN, GHTK và J&T Express. Kết nối API chỉ có hiệu lực khi tài khoản đối tác được cấp quyền và tích hợp gửi đơn được kiểm thử. Hiện chưa tạo vận đơn hoặc gọi tính phí tự động.</p>
                      <div className="shipping-provider-list">
                        {(["viettelpost","ghn","ghtk","jnt"] as const).map((key) => (
                          <button key={key} type="button" className="btn btn-outline small" onClick={() => setProvider(key)}>
                            {providerInfo[key].name} · {data.integrations[key] ? "Đã cấu hình biến môi trường" : "Chưa cấu hình"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="admin-panel channels-panel">
                    <div>
                      <h3>Kênh tư vấn Messenger & Zalo</h3>
                      <p>
                        Thêm Facebook Page ID/username và Zalo OA ID ở phần cài
                        đặt. Nút liên hệ sẽ xuất hiện trên cửa hàng sau khi lưu.
                      </p>
                      <p>
                        Messenger dùng liên kết mở hội thoại. Zalo có liên kết
                        OA và widget khi đã có OA ID.
                      </p>
                    </div>
                    <button
                      className="btn btn-blue small"
                      onClick={() => changeTab("settings")}
                    >
                      Cấu hình kênh chat <ArrowRight size={14} />
                    </button>
                  </div>
                  <p className="form-note">
                    Kết nối sàn trực tiếp và hộp thư chat hợp nhất cần thêm tài
                    khoản đối tác, quyền API và webhook của từng nền tảng.
                    Adapter Haravan hiện nhập dữ liệu theo yêu cầu, chưa tự đồng
                    bộ hai chiều.
                  </p>
                </>
              )}
              {tab === "posts" && (
                <PostsManager
                  posts={data.posts || []}
                  assets={data.assets || []}
                  reload={load}
                />
              )}
              {tab === "payments" && (
                <PaymentSettings initial={data.payments} reload={load} />
              )}
              {tab === "settings" && (
                <SettingsForm
                  settings={data.settings}
                  save={async (body) => {
                    await action("admin/settings", body);
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>
      {edit && (
        <ProductEditor
          product={edit}
          assets={data?.assets || []}
          close={() => setEdit(null)}
          save={async (body) => {
            await api(
              edit.id ? `admin/products/${edit.id}` : "admin/products",
              body,
              edit.id ? "PATCH" : "POST",
            );
            toast.success("Đã lưu sản phẩm");
            setEdit(null);
            await load();
          }}
        />
      )}
      {verifyOrder && (
        <VerifyPayment
          order={verifyOrder}
          close={() => setVerifyOrder(null)}
          saved={async () => {
            setVerifyOrder(null);
            await load();
          }}
        />
      )}
      {provider && (
        <Dialog
          title={`Thiết lập ${providerInfo[provider].name}`}
          close={() => setProvider(null)}
        >
          <div className="provider-setup">
            <p>{providerInfo[provider].description}</p>
            <ol>
              <li>Tạo tài khoản và lấy quyền API tại nhà cung cấp.</li>
              <li>
                Đặt các biến dưới đây trong phần môi trường máy chủ (Sites
                runtime secrets hoặc .dev.vars khi chạy cục bộ).
              </li>
              <li>Triển khai lại và kiểm tra trạng thái kết nối.</li>
            </ol>
            <div className="env-keys">
              {providerInfo[provider].keys.map((k) => (
                <code key={k}>{k}</code>
              ))}
            </div>
            {provider === "payos" && (
              <p>
                Webhook:{" "}
                <code>
                  {typeof location !== "undefined" ? location.origin : ""}
                  /api/webhooks/payos
                </code>
                . Khi thử nghiệm với Site riêng tư, nhà cung cấp chưa thể gọi
                webhook từ Internet; cần cấu hình truy cập phù hợp trước khi
                nhận thanh toán thật.
              </p>
            )}
            <a
              className="btn btn-blue"
              href={providerInfo[provider].docs}
              target="_blank"
              rel="noreferrer"
            >
              Tài liệu chính thức <ExternalLink size={15} />
            </a>
          </div>
        </Dialog>
      )}
    </div>
  );
}
function OrderTable({
  orders,
  onAction,
  busy,
  onVerify,
}: {
  orders: any[];
  onVerify: (order: any) => void;
  onAction: (p: string, b: any, m?: string) => void;
  busy: boolean;
}) {
  if (!orders.length)
    return (
      <div className="table-empty">
        <ShoppingBag size={28} />
        <b>Chưa có đơn hàng</b>
        <span>Đơn đặt từ cửa hàng sẽ xuất hiện tại đây.</span>
      </div>
    );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Đơn hàng / khách</th>
            <th>Sản phẩm</th>
            <th>Tổng tiền</th>
            <th>Thanh toán</th>
            <th>Trạng thái</th>
            <th>Cập nhật</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const c = JSON.parse(o.customer),
              items = JSON.parse(o.items),
              next: Record<string, string[]> = {
                pending: ["processing", "cancelled"],
                processing: ["shipped", "cancelled"],
                shipped: ["completed"],
              };
            return (
              <tr key={o.id}>
                <td>
                  <b>
                    #{String(o.code).slice(-9)} · {c.name}
                  </b>
                  <small>{c.phone}</small>
                  <small>{c.address}</small>
                  <small>
                    {new Date(o.created_at).toLocaleString("vi-VN")}
                  </small>
                </td>
                <td>
                  {items.map((i: any) => (
                    <small key={i.id}>
                      {i.name} × {i.quantity}
                    </small>
                  ))}
                </td>
                <td>
                  <b>{money(o.total)}</b>
                </td>
                <td>
                  <span
                    className={`status ${o.payment_status === "paid" ? "completed" : "pending"}`}
                  >
                    {o.payment_status === "paid"
                      ? "Đã thanh toán"
                      : o.method === "cod"
                        ? "COD"
                        : paymentMethodName(o.method)}
                  </span>
                  {isWalletId(o.method) &&
                    o.payment_status !== "paid" &&
                    o.status !== "cancelled" && (
                      <button
                        className="verify-payment-button"
                        disabled={busy}
                        onClick={() => onVerify(o)}
                      >
                        Xác nhận sau đối soát
                      </button>
                    )}
                </td>
                <td>
                  <span className={`status ${o.status}`}>
                    {statusLabels[o.status]}
                  </span>
                </td>
                <td>
                  {next[o.status]?.length ? (
                    <select
                      aria-label={`Cập nhật đơn ${o.code}`}
                      value=""
                      disabled={busy}
                      onChange={(e) => {
                        if (e.target.value)
                          onAction(
                            `admin/orders/${o.id}`,
                            { status: e.target.value },
                            "PATCH",
                          );
                      }}
                    >
                      <option value="">Chọn thao tác</option>
                      {next[o.status]
                        .filter(
                          (s) =>
                            s !== "cancelled" || o.payment_status !== "paid",
                        )
                        .map((s) => (
                          <option value={s} key={s}>
                            {statusLabels[s]}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <CheckCircle2 size={17} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function BookingTable({
  rows,
  onAction,
  busy,
}: {
  rows: any[];
  onAction: (p: string, b: any, m?: string) => void;
  busy: boolean;
}) {
  if (!rows.length)
    return (
      <div className="table-empty">
        <CalendarDays size={28} />
        <b>Chưa có yêu cầu kỹ thuật</b>
        <span>Khách có thể chọn dịch vụ và gửi lịch từ cửa hàng.</span>
      </div>
    );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Khách hàng</th>
            <th>Dịch vụ</th>
            <th>Lịch mong muốn</th>
            <th>Ghi chú</th>
            <th>Trạng thái</th>
            <th>Cập nhật</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => {
            const c = JSON.parse(b.customer);
            return (
              <tr key={b.id}>
                <td>
                  <b>{c.name}</b>
                  <small>{c.phone}</small>
                  <small>{c.address}</small>
                </td>
                <td>{services.find((s) => s.id === b.service)?.name}</td>
                <td>
                  <b>{b.date}</b>
                  <small>{b.slot}</small>
                </td>
                <td className="note-cell">{b.note || "—"}</td>
                <td>
                  <span className={`status ${b.status}`}>
                    {statusLabels[b.status]}
                  </span>
                </td>
                <td>
                  {!["completed", "cancelled"].includes(b.status) && (
                    <select
                      value=""
                      aria-label={`Cập nhật lịch của ${c.name}`}
                      disabled={busy}
                      onChange={(e) =>
                        e.target.value &&
                        onAction(
                          `admin/bookings/${b.id}`,
                          { status: e.target.value },
                          "PATCH",
                        )
                      }
                    >
                      <option value="">Thao tác</option>
                      {["confirmed", "completed", "cancelled"]
                        .filter((s) => s !== b.status)
                        .map((s) => (
                          <option key={s} value={s}>
                            {statusLabels[s]}
                          </option>
                        ))}
                    </select>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function ProductEditor({
  product,
  assets,
  close,
  save,
}: {
  product: Partial<Product>;
  assets: any[];
  close: () => void;
  save: (body: any) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [image, setImage] = useState(product.image || "");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await save({
        name: f.get("name"),
        category: f.get("category"),
        price: Number(f.get("price")),
        original_price: Number(f.get("original_price")),
        stock: Number(f.get("stock")),
        image,
        description: f.get("description"),
        specs: f.get("specs"),
        tag: f.get("tag"),
        active: f.get("active") === "on" ? 1 : 0,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={product.id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
      close={close}
      wide
    >
      <form className="shop-form" onSubmit={submit}>
        <div className="form-grid">
          <label>
            Tên sản phẩm
            <input name="name" required defaultValue={product.name} />
          </label>
          <label>
            Danh mục
            <select name="category" defaultValue={product.category}>
              {categories.slice(1).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-grid three">
          <label>
            Giá bán (đ)
            <input
              name="price"
              type="number"
              min="1000"
              step="1000"
              required
              defaultValue={product.price}
            />
          </label>
          <label>
            Giá niêm yết (đ)
            <input
              name="original_price"
              type="number"
              min="0"
              defaultValue={product.original_price}
            />
          </label>
          <label>
            Tồn kho
            <input
              name="stock"
              type="number"
              min="0"
              max="99999"
              required
              defaultValue={product.stock}
            />
          </label>
        </div>
        <label>
          URL ảnh
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
            placeholder="https://... hoặc chọn từ thư viện bên dưới"
          />
        </label>
        {assets.length > 0 && (
          <label>
            Chọn từ thư viện
            <select value="" onChange={(e) => setImage(e.target.value)}>
              <option value="">Chọn một ảnh đã tải lên</option>
              {assets.map((a) => (
                <option key={a.id} value={a.url}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="form-grid">
          <label>
            Cấu hình / đặc điểm
            <input name="specs" defaultValue={product.specs || ""} />
          </label>
          <label>
            Nhãn sản phẩm
            <input
              name="tag"
              defaultValue={product.tag || ""}
              placeholder="Mới về, Giá tốt..."
            />
          </label>
        </div>
        <label>
          Mô tả
          <textarea
            name="description"
            rows={4}
            defaultValue={product.description || ""}
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product.active === 1}
          />
          Hiển thị trên cửa hàng
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-blue" disabled={busy}>
          {busy ? "Đang lưu..." : "Lưu sản phẩm"}
          <CheckCircle2 size={16} />
        </button>
      </form>
    </Dialog>
  );
}
function SettingsForm({
  settings,
  save,
}: {
  settings: any;
  save: (body: any) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="shop-form admin-panel settings-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const body = Object.fromEntries(new FormData(e.currentTarget));
        try {
          await save({
            ...body,
            shipping: Number(body.shipping),
            freeShipping: Number(body.freeShipping),
          });
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>Thông tin thương hiệu & liên hệ</h3>
      <div className="form-grid">
        <label>
          Tên cửa hàng
          <input
            name="brand"
            defaultValue={settings.brand}
            required
            minLength={2}
          />
        </label>
        <label>
          Điện thoại
          <input
            name="phone"
            defaultValue={settings.phone}
            placeholder="Số điện thoại thật của cửa hàng"
          />
        </label>
      </div>
      <label>
        Địa chỉ cửa hàng
        <input name="address" defaultValue={settings.address} />
      </label>
      <label>
        Khu vực cung cấp dịch vụ tại nhà
        <input name="serviceArea" defaultValue={settings.serviceArea} />
      </label>
      <h3>Kênh tư vấn</h3>
      <div className="form-grid">
        <label>
          Facebook Page ID hoặc username
          <input
            name="facebookPage"
            defaultValue={settings.facebookPage}
            placeholder="Tên trang, không nhập URL"
          />
        </label>
        <label>
          Zalo OA ID
          <input
            name="zaloOa"
            defaultValue={settings.zaloOa}
            placeholder="Chuỗi số OA ID"
          />
        </label>
      </div>
      <h3>Phí vận chuyển cố định</h3>
      <div className="form-grid">
        <label>
          Phí giao hàng (đ)
          <input
            name="shipping"
            type="number"
            min="0"
            defaultValue={settings.shipping}
          />
        </label>
        <label>
          Miễn phí từ (đ)
          <input
            name="freeShipping"
            type="number"
            min="0"
            defaultValue={settings.freeShipping}
          />
        </label>
      </div>
      <p className="form-note">
        Phí cố định được tính ở máy chủ. Chưa kết nối hãng vận chuyển để báo phí
        theo địa chỉ.
      </p>
      <button className="btn btn-blue" disabled={busy}>
        {busy ? "Đang lưu..." : "Lưu cài đặt"}
        <CheckCircle2 size={16} />
      </button>
    </form>
  );
}
