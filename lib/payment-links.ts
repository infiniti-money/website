export const walletIds = ["zalopay", "momo", "viettelmoney"] as const;
export type WalletId = (typeof walletIds)[number];
export type WalletLink = {
  enabled: boolean;
  url: string;
  recipient: string;
  instructions: string;
};
export type WalletSettings = Record<WalletId, WalletLink>;
export const walletProviders = {
  zalopay: {
    name: "ZaloPay",
    short: "Z",
    color: "#0068ff",
    domains: ["zalopay.vn", "zalopay.com.vn"],
    docs: "https://zalopay.vn/hop-tac-doanh-nghiep",
  },
  momo: {
    name: "MoMo",
    short: "M",
    color: "#ad0868",
    domains: ["momo.vn"],
    docs: "https://business.momo.vn/",
  },
  viettelmoney: {
    name: "Viettel Money (ViettelPay)",
    short: "V",
    color: "#e72f46",
    domains: ["viettelmoney.vn", "viettelpay.vn", "viettel.com.vn"],
    docs: "https://viettelmoney.vn/",
  },
} as const;
export function emptyWalletSettings(): WalletSettings {
  return Object.fromEntries(
    walletIds.map((id) => [
      id,
      { enabled: false, url: "", recipient: "", instructions: "" },
    ]),
  ) as WalletSettings;
}
export function isWalletId(value: string): value is WalletId {
  return (walletIds as readonly string[]).includes(value);
}
export function validWalletUrl(id: WalletId, value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      (!u.port || u.port === "443") &&
      walletProviders[id].domains.some(
        (d) => u.hostname === d || u.hostname.endsWith("." + d),
      ) &&
      (u.pathname !== "/" || !!u.search)
    );
  } catch {
    return false;
  }
}
export function paymentMethodName(method: string) {
  return isWalletId(method)
    ? walletProviders[method].name
    : method === "payos"
      ? "payOS"
      : method === "cod"
        ? "Thanh toán khi nhận hàng"
        : "Thanh toán";
}
