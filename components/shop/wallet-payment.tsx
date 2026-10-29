"use client";
import { ArrowUpRight, Copy, Clock } from "lucide-react";
import { toast } from "sonner";
import { isWalletId, walletProviders } from "@/lib/payment-links";
import { money } from "@/lib/catalog";
export default function WalletPayment({ order }: { order: any }) {
  const method=String(order.method);
  if (
    !isWalletId(method) ||
    !order.payment_url ||
    order.payment_status === "paid" ||
    order.status === "cancelled"
  )
    return null;
  const p = walletProviders[method],
    reference = `IS${order.code}`;
  let details: any = {};
  try {
    details = JSON.parse(order.payment_details || "{}");
  } catch {}
  return (
    <div className="wallet-payment-instructions">
      <div className="wallet-receipt-title">
        <span
          className="wallet-provider-icon small"
          style={{ background: p.color }}
        >
          {p.short}
        </span>
        <b>{p.name}</b>
        <span>
          <Clock size={12} />
          Chờ đối soát
        </span>
      </div>
      <dl>
        <div>
          <dt>Số tiền cần thanh toán</dt>
          <dd>{money(order.total)}</dd>
        </div>
        <div>
          <dt>Người nhận</dt>
          <dd>{details.recipient || "Theo tài khoản trên liên kết"}</dd>
        </div>
        <div>
          <dt>Nội dung chuyển tiền</dt>
          <dd>
            <code>{reference}</code>
            <button
              aria-label="Sao chép nội dung chuyển tiền"
              className="icon-button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(reference);
                  toast.success("Đã sao chép nội dung");
                } catch {
                  toast.error(
                    "Chưa sao chép được. Vui lòng sao chép mã hiển thị.",
                  );
                }
              }}
            >
              <Copy size={13} />
            </button>
          </dd>
        </div>
      </dl>
      {details.instructions && <p>{details.instructions}</p>}
      <p>
        Kiểm tra người nhận, nhập đúng số tiền và nội dung trên. Đơn chỉ được
        xác nhận đã thanh toán sau khi cửa hàng kiểm tra giao dịch.
      </p>
      <a
        className="btn btn-blue small"
        href={order.payment_url}
        target="_blank"
        rel="noreferrer"
      >
        Mở {p.name}
        <ArrowUpRight size={14} />
      </a>
    </div>
  );
}
