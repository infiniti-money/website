import { db } from "./server";
import {
  emptyWalletSettings,
  walletIds,
  validWalletUrl,
  type WalletSettings,
} from "./payment-links";
export async function walletSettings(): Promise<WalletSettings> {
  const row = await db()
    .prepare("SELECT value FROM settings WHERE key='payment_links'")
    .first<{ value: string }>();
  let stored: any = {};
  try {
    stored = row ? JSON.parse(row.value) : {};
  } catch {}
  const defaults = emptyWalletSettings();
  for (const id of walletIds) defaults[id] = { ...defaults[id], ...stored[id] };
  return defaults;
}
export async function walletAvailability() {
  const settings = await walletSettings();
  return Object.fromEntries(
    walletIds.map((id) => [
      id,
      settings[id].enabled && validWalletUrl(id, settings[id].url),
    ]),
  ) as Record<(typeof walletIds)[number], boolean>;
}
