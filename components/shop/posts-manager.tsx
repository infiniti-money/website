"use client";
import { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  ArrowUpRight,
  FileText,
  Check,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import type { Post, PostSummary } from "@/lib/articles";
import { postTags, normalizeSearch } from "@/lib/post-meta";
import Dialog from "./dialog";
import ArticleContent from "./article-content";
const labels = {
  draft: "Bản nháp",
  published: "Đã đăng",
  archived: "Đã lưu trữ",
};
export default function PostsManager({
  posts,
  assets,
  reload,
}: {
  posts: PostSummary[];
  assets: any[];
  reload: () => Promise<void>;
}) {
  const [edit, setEdit] = useState<Partial<Post> | null>(null),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [page, setPage] = useState(1),
    [opening, setOpening] = useState(false);
  const visible = posts.filter(
    (p) =>
      (filter === "all" || p.status === filter) &&
      normalizeSearch(p.title + p.category + p.excerpt + p.tags).includes(
        normalizeSearch(query),
      ),
  );
  const pages = Math.max(1, Math.ceil(visible.length / 20)),
    currentPage = Math.min(page, pages),
    rows = visible.slice((currentPage - 1) * 20, currentPage * 20);
  async function openPost(id: string) {
    setOpening(true);
    try {
      setEdit((await api(`admin/posts/${id}`)).post);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setOpening(false);
    }
  }
  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input
            aria-label="Tìm bài viết"
            placeholder="Tìm bài viết, chuyên mục..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button
          className="btn btn-blue small"
          onClick={() =>
            setEdit({
              status: "draft",
              author: "Infiniti Seller",
              category: "Chia sẻ công nghệ",
            })
          }
        >
          <Plus size={16} />
          Viết bài mới
        </button>
      </div>
      <div className="post-filter-tabs">
        {["all", "published", "draft", "archived"].map((id) => (
          <button
            key={id}
            className={filter === id ? "active" : ""}
            onClick={() => {
              setFilter(id);
              setPage(1);
            }}
          >
            {id === "all" ? "Tất cả" : labels[id as keyof typeof labels]}{" "}
            <span>
              {id === "all"
                ? posts.length
                : posts.filter((p) => p.status === id).length}
            </span>
          </button>
        ))}
      </div>
      <div className="admin-panel table-wrap">
        <table>
          <thead>
            <tr>
              <th>Bài viết</th>
              <th>Chuyên mục</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="table-product">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt="" />
                    ) : (
                      <FileText size={26} />
                    )}
                    <span>
                      <b>{p.title}</b>
                      <small>/bai-viet/{p.slug}</small>
                    </span>
                  </div>
                </td>
                <td>
                  {p.category}
                  <div className="admin-post-tags">
                    {postTags(p.tags)
                      .slice(0, 3)
                      .map((t) => (
                        <span key={t}>#{t}</span>
                      ))}
                  </div>
                </td>
                <td>
                  <span
                    className={`status ${p.status === "published" ? "completed" : p.status === "draft" ? "pending" : "cancelled"}`}
                  >
                    {labels[p.status]}
                  </span>
                </td>
                <td>{new Date(p.updated_at).toLocaleDateString("vi-VN")}</td>
                <td>
                  <div className="table-row-actions">
                    <button
                      className="icon-button"
                      disabled={opening}
                      onClick={() => openPost(p.id)}
                      aria-label={`Sửa bài ${p.title}`}
                    >
                      <Pencil size={15} />
                    </button>
                    {p.status === "published" && (
                      <a
                        className="icon-button"
                        href={`/bai-viet/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Đọc bài ${p.title}`}
                      >
                        <ArrowUpRight size={16} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && (
          <div className="table-empty">
            <FileText size={30} />
            <b>Chưa có bài viết phù hợp</b>
          </div>
        )}
      </div>
      <nav
        className="article-pagination"
        aria-label="Phân trang quản lý bài viết"
      >
        <button
          className="btn btn-outline small"
          disabled={currentPage === 1}
          onClick={() => setPage(currentPage - 1)}
        >
          Trang trước
        </button>
        <span>
          {visible.length} bài · Trang {currentPage}/{pages}
        </span>
        <button
          className="btn btn-outline small"
          disabled={currentPage === pages}
          onClick={() => setPage(currentPage + 1)}
        >
          Trang tiếp
        </button>
      </nav>
      {edit && (
        <PostEditor
          post={edit}
          assets={assets}
          close={() => setEdit(null)}
          saved={async () => {
            setEdit(null);
            await reload();
          }}
        />
      )}
    </>
  );
}
function slugify(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 140);
}
function PostEditor({
  post,
  assets,
  close,
  saved,
}: {
  post: Partial<Post>;
  assets: any[];
  close: () => void;
  saved: () => Promise<void>;
}) {
  const [value, setValue] = useState({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      tags: postTags(post.tags).join(", "),
      area_key: post.area_key || "",
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
      body: post.body || "",
      cover_image: post.cover_image || "",
      category: post.category || "",
      author: post.author || "Infiniti Seller",
      status: post.status || "draft",
    }),
    [preview, setPreview] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const set = (key: string, text: string) =>
    setValue((v) => ({ ...v, [key]: text }));
  return (
    <Dialog
      title={post.id ? "Chỉnh sửa bài viết" : "Viết bài mới"}
      close={close}
      wide
    >
      <form
        className="shop-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await api(
              post.id ? `admin/posts/${post.id}` : "admin/posts",
              {
                ...value,
                tags: [
                  ...new Set(
                    value.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  ),
                ],
              },
              post.id ? "PATCH" : "POST",
            );
            toast.success(
              value.status === "published"
                ? "Đã đăng bài viết"
                : "Đã lưu bài viết",
            );
            await saved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Tiêu đề
          <input
            value={value.title}
            required
            minLength={5}
            maxLength={180}
            onChange={(e) => set("title", e.target.value)}
          />
        </label>
        <label>
          Đường dẫn bài viết
          <div className="slug-field">
            <input
              value={value.slug}
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              maxLength={140}
              placeholder="gioi-thieu-infiniti-seller"
              onChange={(e) => set("slug", e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline small"
              onClick={() => set("slug", slugify(value.title))}
            >
              Tạo từ tiêu đề
            </button>
          </div>
        </label>
        <label>
          Mô tả ngắn
          <textarea
            value={value.excerpt}
            minLength={20}
            maxLength={400}
            required
            rows={2}
            onChange={(e) => set("excerpt", e.target.value)}
          />
        </label>
        <div className="form-grid">
          <label>
            Chuyên mục
            <input
              value={value.category}
              required
              minLength={2}
              maxLength={60}
              onChange={(e) => set("category", e.target.value)}
            />
          </label>
          <label>
            Tác giả
            <input
              value={value.author}
              required
              minLength={2}
              maxLength={100}
              onChange={(e) => set("author", e.target.value)}
            />
          </label>
        </div>
        <details className="post-seo-fields">
          <summary>Tối ưu tìm kiếm (SEO)</summary>
          <label>
            Meta Title
            <input
              value={value.seo_title}
              maxLength={180}
              placeholder="Để trống để dùng tiêu đề bài viết"
              onChange={(e) => set("seo_title", e.target.value)}
            />
            <small>{value.seo_title.length}/180 ký tự</small>
          </label>
          <label>
            Meta Description
            <textarea
              value={value.seo_description}
              maxLength={400}
              rows={3}
              placeholder="Để trống để dùng mô tả ngắn"
              onChange={(e) => set("seo_description", e.target.value)}
            />
            <small>{value.seo_description.length}/400 ký tự</small>
          </label>
        </details>
        <label>
          Tag bài viết
          <input
            value={value.tags}
            maxLength={1200}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="Sửa máy tính, Yên Mỹ, Hưng Yên cũ"
          />
          <small>
            Phân cách bằng dấu phẩy. Tối đa 20 tag, mỗi tag 80 ký tự.
          </small>
        </label>
        <label>
          Ảnh bìa (URL HTTPS hoặc ảnh thư viện)
          <input
            value={value.cover_image}
            onChange={(e) => set("cover_image", e.target.value)}
          />
        </label>
        {assets.length > 0 && (
          <label>
            Chọn ảnh trong thư viện
            <select
              value=""
              onChange={(e) => set("cover_image", e.target.value)}
            >
              <option value="">Chọn ảnh đã tải lên</option>
              {assets.map((a) => (
                <option value={a.url} key={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="editor-toolbar">
          <b>Nội dung bài viết</b>
          <button
            type="button"
            className="btn btn-outline small"
            onClick={() => setPreview(!preview)}
          >
            <Eye size={14} />
            {preview ? "Tiếp tục soạn" : "Xem trước"}
          </button>
        </div>
        {preview ? (
          <div className="post-preview">
            <h1>{value.title}</h1>
            <ArticleContent body={value.body} />
          </div>
        ) : (
          <label>
            <textarea
              aria-label="Nội dung bài viết"
              className="post-body-editor"
              value={value.body}
              rows={16}
              required
              minLength={100}
              maxLength={60000}
              onChange={(e) => set("body", e.target.value)}
            />
            <small>
              Dùng ## cho tiêu đề, - cho danh sách, **chữ đậm**, [liên
              kết](https://...), ![mô tả ảnh](URL), &gt; cho khung ghi chú và
              bảng Markdown. HTML được hiển thị như văn bản.
            </small>
          </label>
        )}
        <label>
          Trạng thái xuất bản
          <select
            value={value.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="draft">Bản nháp — chỉ quản trị nhìn thấy</option>
            <option value="published">Đã đăng — hiển thị trong Bài viết</option>
            <option value="archived">Lưu trữ — ẩn khỏi website</option>
          </select>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-blue" disabled={busy}>
          {busy ? "Đang lưu..." : "Lưu bài viết"}
          <Check size={16} />
        </button>
      </form>
    </Dialog>
  );
}
