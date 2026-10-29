"use client";
import { useEffect, useState, useRef, useMemo } from "react";
import { generateDemoProducts } from "@/lib/demo-products";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  ArrowUpRight,
  ArrowRight,
  Monitor,
  Phone,
  Laptop,
  Camera,
  Printer,
  Headphones,
  ShieldCheck,
  Truck,
  Wrench,
  Wifi,
  ChevronDown,
  Check,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  MapPin,
  Menu,
  Package,
  CalendarDays,
  RefreshCw,
  Star,
  SlidersHorizontal,
  Cpu,
  Clock,
  CheckCircle2,
  QrCode,
  Copy,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { useCart } from "@/lib/cart";
import {
  categories,
  services,
  money,
  type Product,
  type ShopSettings,
} from "@/lib/catalog";
import Dialog from "./dialog";
import { api, statusLabels } from "@/lib/client";
import BrandText from "./brand";
import ZaloWidget from "./zalo-widget";
import { PostCards, type PostSummary } from "./article-shell";
import {
  walletIds,
  walletProviders,
  isWalletId,
  paymentMethodName,
} from "@/lib/payment-links";
import WalletPayment from "./wallet-payment";
const categoryIcons = [Monitor, Laptop, Monitor, Phone, Headphones, Printer, Printer, Cpu, Headphones, Printer, Printer, Camera, Wifi];
const serviceIcons = [Laptop, Printer, Camera, Wifi];
export default function Storefront({
  products: initial,
  settings: shop,
  connected,
  posts = [],
}: {
  products: Product[];
  posts?: PostSummary[];
  settings: ShopSettings;
  connected: Record<string, boolean>;
}) {
  const [products, setProducts] = useState(initial),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("Tất cả"),
    [sort, setSort] = useState("featured"),
    [favoritesOnly, setFavoritesOnly] = useState(false),
    [selected, setSelected] = useState<Product | null>(null),
    [cartOpen, setCartOpen] = useState(false),
    [booking, setBooking] = useState<string | null>(null),
    [ordersOpen, setOrdersOpen] = useState(false),
    [chat, setChat] = useState(false),
    [mobile, setMobile] = useState(false),
    [ready, setReady] = useState(false),
    [page, setPage] = useState(1);
  const { items, favorites, add, favorite } = useCart();
  useEffect(() => {
    const shortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>(".search-box input")?.focus();
      }
    };
    document.addEventListener("keydown", shortcut);
    setReady(true);
    const q = new URLSearchParams(location.search);
    if (q.has("order")) {
      setOrdersOpen(true);
      toast.info(
        q.has("cancel")
          ? "Thanh toán chưa hoàn tất. Xem trạng thái tại Đơn của tôi."
          : "Đang chờ xác nhận thanh toán từ cổng thanh toán.",
      );
    }
    return () => document.removeEventListener("keydown", shortcut);
  }, []);
  const count = ready ? items.reduce((n, i) => n + i.quantity, 0) : 0;
  const demonstration = useMemo(() => generateDemoProducts(), []);
  const allCatalog = useMemo(() => [...products, ...demonstration], [products, demonstration]);
  // A QR scan opens the shared product directly, including clearly labeled demos.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("product");
    if (!id) return;
    const found = allCatalog.find((item) => item.id === id);
    if (found) setSelected(found);
  }, [allCatalog]);
  const productLink = (item: Product) =>
    `${typeof window === "undefined" ? "https://infiniti-seller.supertulip11.chatgpt.site" : window.location.origin}/?product=${encodeURIComponent(item.id)}`;

  const filtered = allCatalog
    .filter(
      (p) =>
        (category === "Tất cả" || p.category === category) &&
        `${p.name} ${p.specs}`
          .toLocaleLowerCase("vi")
          .includes(search.toLocaleLowerCase("vi")) &&
        (!favoritesOnly || favorites.includes(p.id)),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : 0,
    );
  function addProduct(p: Product) {
    if (p.stock < 1) return;
    add(p);
    toast.success("Đã thêm vào giỏ hàng", {
      description: p.name,
      action: { label: "Xem giỏ", onClick: () => setCartOpen(true) },
    });
  }
  async function reload() {
    try {
      const data = await api("catalog");
      setProducts(data.products);
    } catch {}
  }
  function choose(c: string) {
    setPage(1);
    setCategory(c);
    setFavoritesOnly(false);
    document.querySelector("#san-pham")?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <>
      <ZaloWidget oaId={shop.zaloOa} />
      <Toaster position="bottom-center" richColors />
      <div className="announcement">
        <div className="container">
          <span>
            <ShieldCheck size={13} /> Công nghệ phù hợp · Dịch vụ tận tâm
          </span>
          <span className="announcement-right">
            Hỗ trợ mua hàng & kỹ thuật{" "}
            <a href="#dich-vu">
              Đặt lịch ngay <ArrowUpRight size={12} />
            </a>
          </span>
        </div>
      </div>
      <header className="shop-header">
        <div className="container header-main">
          <a href="/" className="brand">
            <BrandText name={shop.brand} />
          </a>
          <form
            className="search-box"
            onSubmit={(e) => {
              e.preventDefault();
              document
                .querySelector("#san-pham")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Search size={18} />
            <input
              aria-label="Tìm sản phẩm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Bạn đang tìm sản phẩm gì?"
            />
            <kbd>⌘ K</kbd>
          </form>
          <div className="header-actions">
            <button
              onClick={() => setOrdersOpen(true)}
              className="header-order"
            >
              <Package size={21} />
              <span>
                Đơn hàng
                <br />
                <b>Của bạn</b>
              </span>
            </button>
            <button
              className={`icon-button favorite-header ${favoritesOnly ? "is-active" : ""}`}
              aria-label="Xem sản phẩm yêu thích"
              onClick={() => {
                setFavoritesOnly(!favoritesOnly);
                setCategory("Tất cả");
                document
                  .querySelector("#san-pham")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Heart size={22} />
              {ready && favorites.length > 0 && <i>{favorites.length}</i>}
            </button>
            <button
              className="cart-button"
              aria-label={`Giỏ hàng ${count}`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag size={21} />
              <span>Giỏ hàng</span>
              <b>{count}</b>
            </button>
          </div>
        </div>
        <div className="nav-line">
          <div className="container nav-inner">
            <button
              className="category-menu"
              onClick={() => setMobile(!mobile)}
              aria-expanded={mobile}
            >
              <Menu size={18} />
              Danh mục sản phẩm
              <ChevronDown size={14} />
            </button>
            <nav>
              <a className="active" href="#san-pham">
                Sản phẩm
              </a>
              <a href="#dich-vu">Dịch vụ kỹ thuật</a>
              <button onClick={() => setBooking("computer")}>
                Sửa chữa tại nhà
              </button>
              <a href="/bai-viet">Bài viết</a>
            </nav>
            <a className="admin-link" href="/admin">
              Quản trị cửa hàng <ArrowUpRight size={13} />
            </a>
          </div>
          {mobile && (
            <div className="category-popover">
              {categories.slice(1).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    choose(c);
                    setMobile(false);
                  }}
                >
                  {c}
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      <main>
        <section className="hero-section container">
          <div className="hero-banner">
            <img
              className="hero-image"
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1300&q=90"
              alt="Laptop trên bàn làm việc"
              fetchPriority="high"
            />
            <div className="hero-shade" />
            <motion.div
              className="hero-content"
              initial={{ opacity: 1, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="hero-kicker">
                <span /> CÔNG NGHỆ ĐỒNG HÀNH CÙNG BẠN
              </div>
              <h1>
                Nâng cấp công nghệ.
                <br />
                <em>An tâm mỗi ngày.</em>
              </h1>
              <p>
                Từ chiếc laptop đầu tiên đến hệ thống camera cho tổ ấm.
                <br className="desktop-break" /> Infiniti Seller giúp bạn chọn
                đúng, dùng bền.
              </p>
              <a className="btn btn-white" href="#san-pham">
                Khám phá sản phẩm <ArrowRight size={17} />
              </a>
              <div className="hero-footnote">
                <span className="avatar-stack">
                  <i>IS</i>
                  <i>
                    <Check size={11} />
                  </i>
                </span>
                Tư vấn theo nhu cầu thực tế của bạn
              </div>
            </motion.div>
            <div className="hero-product-tag">
              <Cpu size={17} />
              <div>
                Hiệu năng cho mọi nhu cầu
                <small>Làm việc · Học tập · Sáng tạo</small>
              </div>
            </div>
            <div className="hero-pagination">
              <i className="current" />
            </div>
          </div>
          <aside className="service-teaser">
            <div className="teaser-label">
              <span /> INFINITI CARE
            </div>
            <div className="teaser-icon">
              <Wrench size={35} strokeWidth={1.5} />
              <span>
                <Plus size={13} />
              </span>
            </div>
            <h2>
              Thiết bị gặp sự cố?
              <br />
              <em>Để chúng tôi lo.</em>
            </h2>
            <p>
              Sửa máy tính, máy in tại nhà.
              <br />
              Lắp đặt mạng và camera.
            </p>
            <button
              className="btn btn-blue"
              onClick={() => setBooking("computer")}
            >
              Đặt lịch kỹ thuật <ArrowUpRight size={17} />
            </button>
            <span className="teaser-note">
              <Clock size={13} /> Chủ động chọn ngày & khung giờ
            </span>
          </aside>
        </section>
        <section className="benefits container">
          {[
            [ShieldCheck, "Bảo hành rõ ràng", "Theo chính sách từng sản phẩm"],
            [Truck, "Giao hàng linh hoạt", "Phí hiển thị trước khi đặt"],
            [Wrench, "Kỹ thuật tận tâm", "Tư vấn, lắp đặt & sửa chữa"],
            [MessageCircle, "Hỗ trợ sau bán hàng", "Luôn có người lắng nghe"],
          ].map(([Icon, title, desc]: any) => (
            <div key={title}>
              <span>
                <Icon size={23} strokeWidth={1.6} />
              </span>
              <div>
                <b>{title}</b>
                <small>{desc}</small>
              </div>
            </div>
          ))}
        </section>
        <section className="category-section container">
          <div className="eyebrow">TÌM ĐÚNG THỨ BẠN CẦN</div>
          <div className="section-title">
            <h2>Thế giới công nghệ của bạn</h2>
            <span>Thiết bị tốt. Trải nghiệm tốt hơn.</span>
          </div>
          <div className="category-grid">
            {categories.slice(1).map((c, i) => {
              const Icon = categoryIcons[i + 1];
              return (
                <button
                  key={c}
                  onClick={() => choose(c)}
                  className={category === c ? "chosen" : ""}
                >
                  <div className={`category-icon ci-${i}`}>
                    <Icon size={29} strokeWidth={1.5} />
                  </div>
                  <span>{c}</span>
                  <small>
                    {allCatalog.filter((p) => p.category === c).length} mục
                  </small>
                  <ArrowUpRight size={15} />
                </button>
              );
            })}
          </div>
        </section>
        <section className="products-section container" id="san-pham">
          <div className="eyebrow">
            <span /> ĐƯỢC LỰA CHỌN CHO BẠN
          </div>
          <div className="section-title">
            <h2>
              {favoritesOnly ? "Sản phẩm yêu thích" : "Gợi ý nâng cấp hôm nay"}
              <span className="title-dot">.</span>
            </h2>
            <a href="#dich-vu">
              Cần tư vấn? <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="product-toolbar">
            <div className="product-tabs">
              {categories.map((c) => (
                <button
                  key={c}
                  className={category === c && !favoritesOnly ? "active" : ""}
                  onClick={() => {
                    setPage(1);
                    setCategory(c);
                    setFavoritesOnly(false);
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <label className="sort-select">
              <SlidersHorizontal size={14} />
              <select
                aria-label="Sắp xếp sản phẩm"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
              >
                <option value="featured">Nổi bật nhất</option>
                <option value="low">Giá tăng dần</option>
                <option value="high">Giá giảm dần</option>
              </select>
            </label>
          </div>
          <div className="product-grid">
            {filtered.slice((page - 1) * 24, page * 24).map((p, i) => (
              <motion.article
                className="product-card"
                key={p.id}
                initial={{ opacity: 1, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "80px" }}
                transition={{ duration: 0.3, delay: (i % 4) * 0.04 }}
              >
                <div className="product-visual">
                  <span
                    className={`product-badge ${p.tag === "Giá tốt" ? "sale" : ""}`}
                  >
                    {p.tag || "Sản phẩm"}
                  </span>
                  <button
                    className={`product-heart ${ready && favorites.includes(p.id) ? "saved" : ""}`}
                    onClick={() => favorite(p.id)}
                    aria-label={`Yêu thích ${p.name}`}
                    aria-pressed={ready && favorites.includes(p.id)}
                  >
                    <Heart size={17} />
                  </button>
                  <button
                    className="product-image-button"
                    onClick={() => setSelected(p)}
                    aria-label={`Xem ${p.name}`}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/product-placeholder.svg";
                      }}
                    />
                  </button>
                </div>
                <div className="product-info">
                  <div className="product-category">
                    {p.category}
                    <span>
                      <span
                        className={p.stock ? "stock-dot" : "stock-dot out"}
                      />
                      {p.id.startsWith("demo-") ? "Hàng mẫu" : p.stock ? "Còn hàng" : "Hết hàng"}
                    </span>
                  </div>
                  <button
                    className="product-name"
                    onClick={() => setSelected(p)}
                  >
                    {p.name}
                  </button>
                  <p className="product-specs">{p.specs}</p>
                  <button type="button" className="product-qr-link" onClick={() => setSelected(p)} aria-label={`Xem mã QR của ${p.name}`}>
                    <QrCode size={16} /> Mã QR
                  </button>
                  <div className="price-row">
                    <div>
                      <strong>Liên hệ</strong>
                    </div>
                    <button
                      className="add-button"
                      disabled={!p.stock && !p.id.startsWith("demo-")}
                      onClick={() => p.id.startsWith("demo-") ? setSelected(p) : addProduct(p)}
                      aria-label={p.id.startsWith("demo-") ? `Xem thông tin ${p.name}` : `Thêm ${p.name} vào giỏ`}
                    >
                      <Plus size={19} />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          {filtered.length > 24 && (
            <nav className="catalog-pagination" aria-label="Phân trang sản phẩm">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Trang trước</button>
              <span>Trang {page} / {Math.ceil(filtered.length / 24)} · {filtered.length.toLocaleString("vi-VN")} mục</span>
              <button disabled={page >= Math.ceil(filtered.length / 24)} onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / 24), p + 1))}>Trang sau</button>
            </nav>
          )}
          {filtered.length === 0 && (
            <div className="empty-state">
              <Search size={36} />
              <h3>Chưa tìm thấy sản phẩm</h3>
              <p>Thử từ khóa khác hoặc chọn tất cả danh mục.</p>
              <button
                className="btn btn-blue"
                onClick={() => {
                  setSearch("");
                  setCategory("Tất cả");
                  setFavoritesOnly(false);
                }}
              >
                Xem tất cả
              </button>
            </div>
          )}
          <p className="catalog-note">
            Danh mục sản phẩm hiện có giá theo báo giá trực tiếp. Cửa hàng có thể cập nhật sản
            phẩm thực tế trong phần quản trị.
          </p>
        </section>
        {posts.length > 0 && (
          <section className="container home-posts">
            <div className="eyebrow">KIẾN THỨC & CÂU CHUYỆN</div>
            <div className="section-title">
              <h2>
                Góc chia sẻ của Infiniti Seller
                <span className="title-dot">.</span>
              </h2>
              <a href="/bai-viet">
                Tất cả bài viết <ArrowUpRight size={15} />
              </a>
            </div>
            <PostCards posts={posts} />
          </section>
        )}
        <section className="services-section" id="dich-vu">
          <div className="container">
            <div className="section-title">
              <div>
                <div className="eyebrow">KHÔNG CHỈ BÁN THIẾT BỊ</div>
                <h2>
                  Người bạn kỹ thuật
                  <br />
                  ngay khi bạn cần.
                </h2>
              </div>
              <p>
                Máy chạy chậm, máy in trục trặc hay Wi-Fi chập chờn?
                <br />
                Gửi yêu cầu, Infiniti Seller sẽ tư vấn giải pháp phù hợp.
              </p>
            </div>
            <div className="services-grid">
              {services.map((s, i) => {
                const Icon = serviceIcons[i];
                return (
                  <article key={s.id}>
                    <span className="service-number">0{i + 1}</span>
                    <Icon size={30} strokeWidth={1.5} />
                    <h3>{s.name}</h3>
                    <p>{s.detail}</p>
                    <div>
                      <small>{s.price}</small>
                      <button
                        onClick={() => setBooking(s.id)}
                        aria-label={`Đặt lịch ${s.name}`}
                      >
                        <ArrowUpRight size={20} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <section className="process container" id="quy-trinh">
          <div>
            <div className="eyebrow">ĐƠN GIẢN TỪ BƯỚC ĐẦU</div>
            <h2>
              Đặt lịch dễ dàng.
              <br />
              Kỹ thuật đến tận nơi.
            </h2>
            <p>{shop.serviceArea}</p>
            <button
              className="btn btn-blue"
              onClick={() => setBooking("computer")}
            >
              Đặt lịch dịch vụ <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "Gửi yêu cầu",
                "Chọn dịch vụ, thời gian và mô tả tình trạng thiết bị.",
              ],
              [
                "02",
                "Tư vấn & xác nhận",
                "Kỹ thuật liên hệ, xác nhận lịch và báo giá trước khi làm.",
              ],
              [
                "03",
                "Xử lý & bàn giao",
                "Kiểm tra cùng bạn và hướng dẫn sử dụng sau dịch vụ.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
                <CheckCircle2 size={19} />
              </div>
            ))}
          </div>
        </section>
        <section className="contact-banner container">
          <div className="contact-symbol">∞</div>
          <div>
            <h2>Công nghệ là để cuộc sống dễ dàng hơn.</h2>
            <p>Infiniti Seller đồng hành từ lúc chọn mua đến khi cần hỗ trợ.</p>
          </div>
          <button className="btn btn-white" onClick={() => setChat(true)}>
            Kết nối với chúng tôi <MessageCircle size={17} />
          </button>
        </section>
      </main>
      <footer className="shop-footer container">
        <div className="footer-top">
          <div>
            <a className="brand" href="/">
              <BrandText name={shop.brand} />
            </a>
            <p>
              Công nghệ phù hợp. Dịch vụ tận tâm.
              <br />
              Máy tính · Laptop · Camera · Máy in
            </p>
          </div>
          <div>
            <h4>Khám phá</h4>
            <a href="/bai-viet">Bài viết & kiến thức</a>
            <a href="/gioi-thieu">Giới thiệu Infiniti Seller</a>
            <a href="#san-pham">Tất cả sản phẩm</a>
            <a href="#dich-vu">Dịch vụ kỹ thuật</a>
            <button onClick={() => setOrdersOpen(true)}>
              Đơn hàng của bạn
            </button>
          </div>
          <div>
            <h4>Liên hệ cửa hàng</h4>
            {shop.phone ? (
              <a href={`tel:${shop.phone}`}>
                <Phone size={13} />
                {shop.phone}
              </a>
            ) : (
              <button onClick={() => setBooking("computer")}>
                Gửi yêu cầu tư vấn
              </button>
            )}
            <p>
              <MapPin size={13} />
              {shop.address || "Địa chỉ sẽ được cửa hàng cập nhật"}
            </p>
            <p>{shop.serviceArea}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {shop.brand}. All rights reserved.
          </span>
          <span>
            Thiết kế cho trải nghiệm của bạn <span className="blue">✦</span>
          </span>
          <a href="/admin">
            Quản trị <ArrowUpRight size={12} />
          </a>
        </div>
      </footer>
      <button
        className="chat-fab"
        onClick={() => setChat(!chat)}
        aria-label="Liên hệ tư vấn"
      >
        <MessageCircle size={24} />
        <span>Chat với Infiniti</span>
        <i />
      </button>
      {chat && (
        <div className="chat-pop">
          <div className="chat-pop-title">
            <span>Xin chào, Infiniti Seller đây!</span>
            <button
              className="icon-button"
              aria-label="Đóng chat"
              onClick={() => setChat(false)}
            >
              ×
            </button>
          </div>
          <p>Bạn cần tư vấn thiết bị hay hỗ trợ kỹ thuật?</p>
          {shop.facebookPage && (
            <a
              className="btn btn-blue"
              href={`https://m.me/${shop.facebookPage}`}
              target="_blank"
              rel="noreferrer"
            >
              Nhắn Messenger <ArrowUpRight size={15} />
            </a>
          )}
          {shop.zaloOa && (
            <a
              className="btn btn-outline"
              href={`https://zalo.me/${shop.zaloOa}`}
              target="_blank"
              rel="noreferrer"
            >
              Nhắn Zalo OA <ArrowUpRight size={15} />
            </a>
          )}
          {shop.phone && (
            <a className="btn btn-outline" href={`tel:${shop.phone}`}>
              Gọi {shop.phone}
            </a>
          )}
          <button
            className="btn btn-outline"
            onClick={() => {
              setBooking("computer");
              setChat(false);
            }}
          >
            Gửi yêu cầu kỹ thuật
          </button>
          {!shop.facebookPage && !shop.zaloOa && (
            <small>Cửa hàng chưa thêm kênh Messenger/Zalo.</small>
          )}
        </div>
      )}
      {selected && (
        <Dialog title="Chi tiết sản phẩm" close={() => setSelected(null)} wide>
          <div className="product-detail">
            <img src={selected.image} alt={selected.name} />
            <div>
              <span className="pill">{selected.category}</span>
              <h2>{selected.name}</h2>
              <p>{selected.description}</p>
              <div className="detail-specs">
                <Cpu size={17} />
                {selected.specs}
              </div>
              <strong className="detail-price">Liên hệ để nhận báo giá</strong>
              <div className="product-qr-panel">
                <strong><QrCode size={19} /> Mã QR sản phẩm</strong>
                <img
                  className="product-qr-image"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(productLink(selected))}`}
                  alt={`Mã QR mở chi tiết ${selected.name}`}
                  width={220}
                  height={220}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <p>Quét mã QR để mở sản phẩm trên điện thoại. Mã được tạo bởi dịch vụ QR bên ngoài.</p>
                <button type="button" className="btn btn-outline small" onClick={() => { navigator.clipboard.writeText(productLink(selected)).then(() => toast.success("Đã sao chép liên kết sản phẩm")).catch(() => toast.error("Không thể sao chép liên kết")); }}>
                  <Copy size={15} /> Sao chép liên kết
                </button>
              </div>

              <p>{selected.id.startsWith("demo-") ? "Mục minh họa, chưa xác nhận tồn kho và giá bán." : `Còn ${selected.stock} sản phẩm · Bảo hành theo sản phẩm`}</p>
              <button
                className="btn btn-blue"
                disabled={!selected.stock}
                onClick={() => addProduct(selected)}
              >
                <ShoppingBag size={18} />
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </Dialog>
      )}
      {cartOpen && (
        <CartDialog
          shop={shop}
          connected={connected}
          close={() => setCartOpen(false)}
          onSuccess={() => {
            reload();
            setCartOpen(false);
            setOrdersOpen(true);
          }}
        />
      )}
      {booking && (
        <BookingDialog selected={booking} close={() => setBooking(null)} />
      )}
      {ordersOpen && <OrdersDialog close={() => setOrdersOpen(false)} />}
    </>
  );
}
function CartDialog({
  shop,
  connected,
  close,
  onSuccess,
}: {
  shop: ShopSettings;
  connected: Record<string, boolean>;
  close: () => void;
  onSuccess: () => void;
}) {
  const { items, quantity, clear } = useCart(),
    [step, setStep] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const requestId = useRef(crypto.randomUUID());
  const subtotal = items.reduce((n, i) => n + i.product.price * i.quantity, 0),
    shipping = subtotal >= shop.freeShipping ? 0 : shop.shipping;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const data = await api("checkout", {
        requestId: requestId.current,
        customer: {
          name: f.get("name"),
          phone: f.get("phone"),
          address: f.get("address"),
        },
        items: items.map((i) => ({ id: i.product.id, quantity: i.quantity })),
        method: f.get("method"),
      });
      clear();
      if (data.order.method === "payos" && data.order.payment_url) {
        location.assign(data.order.payment_url);
        return;
      }
      toast.success("Đã tạo đơn hàng. Cửa hàng sẽ liên hệ xác nhận.");
      onSuccess();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={step ? "Thông tin đặt hàng" : "Giỏ hàng của bạn"}
      close={close}
      drawer
    >
      {items.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={44} />
          <h3>Giỏ hàng đang trống</h3>
          <p>Chọn thiết bị phù hợp với bạn nhé.</p>
          <button className="btn btn-blue" onClick={close}>
            Tiếp tục khám phá
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((i) => (
              <div className="cart-item" key={i.product.id}>
                <img src={i.product.image} alt={i.product.name} />
                <div>
                  <b>{i.product.name}</b>
                  <strong>{money(i.product.price)}</strong>
                  <div className="qty">
                    <button
                      aria-label={`Giảm ${i.product.name}`}
                      disabled={busy}
                      onClick={() => quantity(i.product.id, i.quantity - 1)}
                    >
                      <Minus size={13} />
                    </button>
                    <span>{i.quantity}</span>
                    <button
                      aria-label={`Tăng ${i.product.name}`}
                      disabled={busy || i.quantity >= i.product.stock}
                      onClick={() => quantity(i.product.id, i.quantity + 1)}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
                <button
                  className="icon-button"
                  disabled={busy}
                  aria-label={`Xóa ${i.product.name}`}
                  onClick={() => quantity(i.product.id, 0)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="totals">
            <div>
              <span>Tạm tính</span>
              <b>{money(subtotal)}</b>
            </div>
            <div>
              <span>Phí vận chuyển</span>
              <b>{shipping ? money(shipping) : "Miễn phí"}</b>
            </div>
            <div className="grand-total">
              <span>Tổng thanh toán</span>
              <strong>{money(subtotal + shipping)}</strong>
            </div>
          </div>
          {!step ? (
            <>
              <p className="form-note">
                Giá và tồn kho được xác nhận lại khi đặt hàng.
              </p>
              <button
                className="btn btn-blue full"
                onClick={() => setStep(true)}
              >
                Tiến hành đặt hàng <ArrowRight size={17} />
              </button>
            </>
          ) : (
            <form className="shop-form" onSubmit={submit}>
              <label>
                Họ và tên
                <input
                  name="name"
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Nguyễn Văn An"
                />
              </label>
              <label>
                Số điện thoại
                <input
                  name="phone"
                  required
                  pattern="(0|\+84)[0-9]{9,10}"
                  autoComplete="tel"
                  placeholder="09xxxxxxxx"
                />
              </label>
              <label>
                Địa chỉ nhận hàng
                <textarea
                  name="address"
                  required
                  minLength={8}
                  autoComplete="street-address"
                  placeholder="Số nhà, đường, phường/xã, tỉnh/thành"
                />
              </label>
              <fieldset>
                <legend>Phương thức thanh toán</legend>
                <label className="radio-card">
                  <input
                    type="radio"
                    name="method"
                    value="cod"
                    defaultChecked
                  />
                  <span>
                    Thanh toán khi nhận hàng (COD)
                    <small>Cửa hàng liên hệ xác nhận trước khi giao.</small>
                  </span>
                </label>
                <label
                  className={`radio-card ${!connected.payos ? "disabled" : ""}`}
                >
                  <input
                    type="radio"
                    name="method"
                    value="payos"
                    disabled={!connected.payos}
                  />
                  <span>
                    Chuyển khoản QR qua payOS
                    <small>
                      {connected.payos
                        ? "Mở trang thanh toán bảo mật."
                        : "Chưa được cửa hàng kích hoạt."}
                    </small>
                  </span>
                </label>
                {walletIds.map((id) => (
                  <label
                    key={id}
                    className={`radio-card ${!connected[id] ? "disabled" : ""}`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={id}
                      disabled={!connected[id]}
                    />
                    <span>
                      {walletProviders[id].name}
                      <small>
                        {connected[id]
                          ? "Mở liên kết nhận tiền; cửa hàng đối soát và xác nhận."
                          : "Chưa được cửa hàng kích hoạt."}
                      </small>
                    </span>
                  </label>
                ))}
              </fieldset>
              {error && <AuthError error={error} />}
              <button disabled={busy} className="btn btn-blue full">
                {busy ? "Đang tạo đơn..." : "Xác nhận đặt hàng"}
                <Check size={17} />
              </button>
              <button
                type="button"
                className="plain-button full"
                disabled={busy}
                onClick={() => setStep(false)}
              >
                Quay lại giỏ hàng
              </button>
            </form>
          )}
        </>
      )}
    </Dialog>
  );
}
function BookingDialog({
  selected,
  close,
}: {
  selected: string;
  close: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await api("bookings", {
        customer: {
          name: f.get("name"),
          phone: f.get("phone"),
          address: f.get("address"),
        },
        service: f.get("service"),
        date: f.get("date"),
        slot: f.get("slot"),
        note: f.get("note"),
      });
      setSuccess(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog title="Đặt lịch kỹ thuật" close={close}>
      {success ? (
        <div className="empty-state">
          <CheckCircle2 size={48} />
          <h3>Đã nhận yêu cầu của bạn</h3>
          <p>
            Cửa hàng sẽ gọi để xác nhận lịch, khu vực phục vụ và báo giá trước
            khi thực hiện.
          </p>
          <button className="btn btn-blue" onClick={close}>
            Hoàn tất
          </button>
        </div>
      ) : (
        <form className="shop-form" onSubmit={submit}>
          <p className="form-intro">
            Mô tả nhu cầu của bạn. Chúng tôi sẽ liên hệ để tư vấn và xác nhận
            lịch.
          </p>
          <label>
            Dịch vụ
            <select name="service" defaultValue={selected}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label>
              Họ và tên
              <input name="name" required minLength={2} autoComplete="name" />
            </label>
            <label>
              Số điện thoại
              <input
                name="phone"
                required
                pattern="(0|\+84)[0-9]{9,10}"
                autoComplete="tel"
              />
            </label>
          </div>
          <label>
            Địa chỉ cần hỗ trợ
            <input
              name="address"
              required
              minLength={8}
              autoComplete="street-address"
            />
          </label>
          <div className="form-grid">
            <label>
              Ngày mong muốn
              <input
                name="date"
                type="date"
                required
                min={new Date().toLocaleDateString("en-CA")}
              />
            </label>
            <label>
              Khung giờ
              <select name="slot">
                {[
                  "08:00–10:00",
                  "10:00–12:00",
                  "13:00–15:00",
                  "15:00–17:00",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Tình trạng thiết bị / nhu cầu
            <textarea
              name="note"
              rows={3}
              maxLength={2000}
              placeholder="Ví dụ: Laptop không lên nguồn, cần kiểm tra tại nhà..."
            />
          </label>
          {error && <AuthError error={error} />}
          <button className="btn btn-blue full" disabled={busy}>
            {busy ? "Đang gửi..." : "Gửi yêu cầu đặt lịch"}
            <ArrowUpRight size={17} />
          </button>
          <p className="form-note">
            Thời gian bạn chọn là yêu cầu đặt lịch, chưa phải lịch hẹn đã xác
            nhận.
          </p>
        </form>
      )}
    </Dialog>
  );
}
function OrdersDialog({ close }: { close: () => void }) {
  const [orders, setOrders] = useState<any[] | null>(null),
    [error, setError] = useState("");
  async function load() {
    try {
      setOrders((await api("orders")).orders);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <Dialog title="Đơn hàng của bạn" close={close} wide>
      <div className="orders-top">
        <p>Trạng thái thanh toán được cập nhật từ hệ thống.</p>
        <button className="btn btn-outline small" onClick={load}>
          <RefreshCw size={14} />
          Làm mới
        </button>
      </div>
      {error && <AuthError error={error} />}
      {!orders && !error && (
        <div className="empty-state">Đang tải đơn hàng...</div>
      )}
      {orders?.length === 0 && (
        <div className="empty-state">
          <Package size={40} />
          <h3>Bạn chưa có đơn hàng nào</h3>
          <p>Thiết bị mới đang chờ bạn khám phá.</p>
        </div>
      )}
      {orders?.map((o) => (
        <article key={o.id} className="order-card">
          <div>
            <b>#{String(o.code).slice(-9)}</b>
            <span className={`status ${o.status}`}>
              {statusLabels[o.status]}
            </span>
          </div>
          <small>{new Date(o.created_at).toLocaleString("vi-VN")}</small>
          {JSON.parse(o.items).map((i: any) => (
            <p key={i.id}>
              {i.name} × {i.quantity}
              <b>{money(i.price * i.quantity)}</b>
            </p>
          ))}
          <footer>
            <span>
              {o.payment_status === "paid"
                ? "Đã thanh toán"
                : o.method === "cod"
                  ? "Thanh toán khi nhận hàng"
                  : `${paymentMethodName(o.method)} · Chờ đối soát`}
            </span>
            <strong>{money(o.total)}</strong>
          </footer>
          <WalletPayment order={o} />
          {o.method === "payos" &&
            o.payment_url &&
            o.payment_status !== "paid" &&
            o.status !== "cancelled" && (
              <a className="btn btn-blue small" href={o.payment_url}>
                Tiếp tục thanh toán <ArrowUpRight size={13} />
              </a>
            )}
        </article>
      ))}
    </Dialog>
  );
}

function AuthError({ error }: { error: string }) {
  return (
    <div className="form-error" role="alert">
      <p>{error}</p>
      {error.includes("đăng nhập") && (
        <a
          className="btn btn-outline small"
          href="/signin-with-chatgpt?return_to=%2F"
          target="_top"
        >
          Đăng nhập để tiếp tục
        </a>
      )}
    </div>
  );
}
