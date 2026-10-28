import { createHmac, timingSafeEqual } from "node:crypto";
import { runtime, HttpError } from "./server";
export function canonical(data: Record<string, unknown>) {
  return Object.keys(data)
    .sort()
    .map((key) => {
      let v = data[key];
      if (v == null || v === "null" || v === "undefined") v = "";
      if (Array.isArray(v))
        v = JSON.stringify(
          v.map((item) =>
            typeof item === "object" && item !== null
              ? Object.fromEntries(
                  Object.entries(item).sort(([a], [b]) => a.localeCompare(b)),
                )
              : item,
          ),
        );
      return `${key}=${v}`;
    })
    .join("&");
}
export function sign(data: Record<string, unknown>) {
  return createHmac("sha256", runtime().PAYOS_CHECKSUM_KEY)
    .update(canonical(data))
    .digest("hex");
}
export function verify(data: Record<string, unknown>, signature: string) {
  const expected = sign(data);
  return (
    /^[a-f0-9]{64}$/i.test(signature) &&
    timingSafeEqual(Buffer.from(signature.toLowerCase()), Buffer.from(expected))
  );
}
export async function createPayment(
  code: number,
  total: number,
  origin: string,
) {
  const e = runtime(),
    description = `IS ${code}`.slice(0, 25),
    cancelUrl = `${origin}/?order=${code}&cancel=1`,
    returnUrl = `${origin}/?order=${code}`;
  const signed = {
    amount: total,
    cancelUrl,
    description,
    orderCode: code,
    returnUrl,
  };
  const res = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": e.PAYOS_CLIENT_ID,
      "x-api-key": e.PAYOS_API_KEY,
    },
    body: JSON.stringify({ ...signed, signature: sign(signed) }),
  });
  const body = (await res.json()) as {
    code: string;
    data?: { checkoutUrl: string };
  };
  if (!res.ok || body.code !== "00" || !body.data?.checkoutUrl)
    throw new HttpError(
      502,
      "Chưa tạo được liên kết thanh toán payOS. Vui lòng thử lại.",
    );
  const url = new URL(body.data.checkoutUrl);
  if (url.protocol !== "https:")
    throw new HttpError(502, "Liên kết thanh toán không hợp lệ.");
  return url.href;
}
