"use client";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Dialog from "./dialog";
import { api } from "@/lib/client";
import { money } from "@/lib/catalog";
import { paymentMethodName } from "@/lib/payment-links";
export default function VerifyPayment({
  order,
  close,
  saved,
}: {
  order: any;
  close: () => void;
  saved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Dialog title="Xác nhận sau đối soát" close={close}>
      <form
        className="shop-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setError("");
          try {
            await api(
              `admin/orders/${order.id}/payment`,
              {
                reference: f.get("reference"),
                confirmed: f.get("confirmed") === "on",
              },
              "PATCH",
            );
            toast.success("Đã xác nhận thanh toán");
            await saved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="form-intro">
          Đơn #{String(order.code).slice(-9)} ·{" "}
          {paymentMethodName(order.method)} · <b>{money(order.total)}</b>
        </p>
        <label>
          Mã giao dịch đã kiểm tra
          <input
            name="reference"
            required
            minLength={3}
            maxLength={120}
            placeholder="Mã giao dịch thực nhận trên tài khoản"
          />
        </label>
        <label className="checkbox-label">
          <input type="checkbox" name="confirmed" required />
          Tôi đã kiểm tra đúng người nhận, số tiền và nội dung giao dịch.
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-blue" disabled={busy}>
          {busy ? "Đang xác nhận..." : "Xác nhận đã thanh toán"}
          <CheckCircle2 size={17} />
        </button>
      </form>
    </Dialog>
  );
}
