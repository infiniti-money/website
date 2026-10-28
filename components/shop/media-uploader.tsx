"use client";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  CheckCircle2,
  ImagePlus,
  RotateCcw,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
type Job = {
  id: string;
  file: File;
  progress: number;
  status: string;
  error?: string;
};
async function compress(file: File) {
  const img = await createImageBitmap(file),
    scale = Math.min(1, 1800 / Math.max(img.width, img.height)),
    canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  img.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Không thể tối ưu ảnh."))),
      "image/webp",
      0.82,
    ),
  );
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
    type: "image/webp",
  });
}
export default function MediaUploader({
  assets,
  reload,
}: {
  assets: any[];
  reload: () => Promise<void>;
}) {
  const [jobs, setJobs] = useState<Job[]>([]),
    [busy, setBusy] = useState(false);
  function update(id: string, patch: Partial<Job>) {
    setJobs((all) => all.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }
  async function upload(job: Job) {
    try {
      update(job.id, { status: "Đang tối ưu", progress: 0, error: undefined });
      const file = await compress(job.file);
      update(job.id, { status: "Đang tải" });
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/admin/upload");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            update(job.id, { progress: Math.round((e.loaded / e.total) * 95) });
        };
        xhr.onload = () => {
          let data;
          try {
            data = JSON.parse(xhr.responseText);
          } catch {
            reject(new Error("Phản hồi tải ảnh không hợp lệ."));
            return;
          }
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(data.error || "Tải lên thất bại."));
        };
        xhr.onerror = () => reject(new Error("Mất kết nối mạng."));
        xhr.timeout = 120000;
        xhr.ontimeout = () => reject(new Error("Tải ảnh quá thời gian."));
        const form = new FormData();
        form.set("file", file);
        xhr.send(form);
      });
      update(job.id, { status: "Hoàn tất", progress: 100 });
    } catch (e) {
      update(job.id, { status: "Thất bại", error: (e as Error).message });
    }
  }
  async function run(list: Job[]) {
    setBusy(true);
    let index = 0;
    await Promise.all(
      Array.from({ length: Math.min(3, list.length) }, async () => {
        while (index < list.length) {
          const job = list[index++];
          await upload(job);
        }
      }),
    );
    setBusy(false);
    await reload();
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 15 * 1024 * 1024,
    maxFiles: 300,
    disabled: busy,
    onDropAccepted: (files) => {
      const list = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: "Chờ tải",
      }));
      setJobs(list);
      run(list);
    },
    onDropRejected: (r) =>
      toast.error(
        `${r.length} ảnh không hợp lệ. Chỉ nhận JPG/PNG/WebP, tối đa 15 MB/ảnh và 300 ảnh/lượt.`,
      ),
  });
  return (
    <>
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "dragging" : ""} ${busy ? "uploading" : ""}`}
      >
        <input {...getInputProps()} aria-label="Chọn nhiều ảnh sản phẩm" />
        <UploadCloud size={36} strokeWidth={1.4} />
        <h3>
          {busy
            ? "Đang xử lý thư viện ảnh..."
            : isDragActive
              ? "Thả ảnh vào đây"
              : "Kéo thả ảnh sản phẩm vào đây"}
        </h3>
        <p>Hoặc nhấn để chọn nhiều ảnh · JPG, PNG, WebP</p>
        <span>Tối đa 300 ảnh/lượt · Tự động tối ưu WebP · 3 ảnh đồng thời</span>
      </div>
      {jobs.length > 0 && (
        <div className="upload-list">
          <div className="upload-summary">
            <b>
              {jobs.filter((j) => j.status === "Hoàn tất").length}/{jobs.length}{" "}
              ảnh hoàn tất
            </b>
            <span>{busy ? "Đang xử lý" : "Đã xử lý xong"}</span>
          </div>
          {jobs.map((j) => (
            <div key={j.id} className="upload-job">
              <ImagePlus size={17} />
              <div>
                <b>{j.file.name}</b>
                <small>{j.error || j.status}</small>
                <i>
                  <span style={{ width: `${j.progress}%` }} />
                </i>
              </div>
              <span>{j.progress}%</span>
              {j.status === "Hoàn tất" ? (
                <CheckCircle2 size={17} />
              ) : j.error && !busy ? (
                <button
                  className="icon-button"
                  aria-label={`Thử lại ${j.file.name}`}
                  onClick={() => run([j])}
                >
                  <RotateCcw size={16} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
      <div className="admin-section-heading">
        <h3>Thư viện ảnh ({assets.length})</h3>
        <small>Nhấn sao chép URL để dùng cho sản phẩm.</small>
      </div>
      <div className="media-grid">
        {assets.map((a) => (
          <article key={a.id}>
            <img src={a.url} alt={a.name} loading="lazy" />
            <div>
              <b>{a.name}</b>
              <small>
                {Math.round(a.size / 1024)} KB · {a.storage.toUpperCase()}
              </small>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(a.url);
                    toast.success("Đã sao chép URL ảnh");
                  } catch {
                    toast.error(
                      "Không thể sao chép. Hãy lấy URL từ trường ảnh trong quản trị.",
                    );
                  }
                }}
              >
                <Copy size={13} />
                Sao chép URL
              </button>
            </div>
          </article>
        ))}
      </div>
      {assets.length === 0 && (
        <div className="empty-state">
          <ImagePlus size={35} />
          <h3>Thư viện đang trống</h3>
          <p>Tải ảnh đầu tiên để thêm vào sản phẩm.</p>
        </div>
      )}
    </>
  );
}
