"use client";
import { useState } from "react";
import { ExternalLink, ShieldCheck, Check, WalletCards } from "lucide-react";
import { toast } from "sonner";
import {
  walletIds,
  walletProviders,
  emptyWalletSettings,
  type WalletSettings,
} from "@/lib/payment-links";
import { api } from "@/lib/client";
export default function PaymentSettings({
  initial,
  reload,
}: {
  initial: WalletSettings;
  reload: () => Promise<void>;
}) {
  const [config, setConfig] = useState<WalletSettings>(
      initial || emptyWalletSettings(),
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <>
      <div className="info-banner">
        <WalletCards size={23} />
        <div>
          <b>Liên kết nhận thanh toán</b>
          <p>
            Nhập liên kết HTTPS nhận tiền từ tài khoản chính thức của từng nhà
            cung cấp. Chỉ những phương thức đã bật và có thông tin hợp lệ mới
            có thể chọn khi đặt hàng.
          </p>
        </div>
      </div>
      <form
        className="wallet-config-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await api("admin/payments", config);
            toast.success("Đã lưu cấu hình thanh toán");
            await reload();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="wallet-config-grid">
          {walletIds.map((id) => {
            const provider = walletProviders[id],
              c = config[id];
            const set = (key: string, value: string | boolean) =>
              setConfig((all) => ({
                ...all,
                [id]: { ...all[id], [key]: value },
              }));
            return (
              <section
                className="admin-panel wallet-config-card shop-form"
                key={id}
              >
                <div className="wallet-card-heading">
                  <span
                    className="wallet-provider-icon"
                    style={{ background: provider.color }}
                  >
                    {provider.short}
                  </span>
                  <div>
                    <h3>{provider.name}</h3>
                    <span
                      className={`status ${c.enabled ? "completed" : "pending"}`}
                    >
                      {c.enabled ? "Đang bật" : "Chưa kích hoạt"}
                    </span>
                  </div>
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={c.enabled}
                    onChange={(e) => set("enabled", e.target.checked)}
                  />
                  Bật trong giỏ hàng
                </label>
                <label>
                  Liên kết nhận thanh toán
                  <input
                    type="url"
                    value={c.url}
                    maxLength={2000}
                    placeholder="Dán URL nhận tiền từ nhà cung cấp"
                    required={c.enabled}
                    onChange={(e) => set("url", e.target.value)}
                  />
                </label>
                <label>
                  Tên người / đơn vị nhận tiền
                  <input
                    value={c.recipient}
                    maxLength={160}
                    required={c.enabled}
                    placeholder="Tên hiển thị trên tài khoản nhận tiền"
                    onChange={(e) => set("recipient", e.target.value)}
                  />
                </label>
                <label>
                  Hướng dẫn bổ sung
                  <textarea
                    rows={3}
                    value={c.instructions}
                    maxLength={800}
                    placeholder="Hướng dẫn riêng của cửa hàng, nếu có"
                    onChange={(e) => set("instructions", e.target.value)}
                  />
                </label>
                <a
                  className="provider-doc-link"
                  href={provider.docs}
                  target="_blank"
                  rel="noreferrer"
                >
                  Trang chính thức <ExternalLink size={13} />
                </a>
              </section>
            );
          })}
        </div>
        <div className="manual-payment-note">
          <ShieldCheck size={19} />
          <p>
            Đây là liên kết thanh toán do cửa hàng cấu hình. Sau khi khách thanh
            toán, chủ cửa hàng cần kiểm tra giao dịch thực nhận và xác nhận tại
            Đơn hàng. Website không tự nhận biết thanh toán thành công từ việc
            mở liên kết.
          </p>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn-blue" disabled={busy}>
          {busy ? "Đang lưu..." : "Lưu cấu hình thanh toán"}
          <Check size={16} />
        </button>
      </form>
    </>
  );
}
