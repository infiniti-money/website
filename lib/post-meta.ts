export function postTags(value: string | string[] | undefined): string[] {
  try {
    const parsed = Array.isArray(value) ? value : JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((t): t is string => typeof t === "string").slice(0, 20)
      : [];
  } catch {
    return [];
  }
}
export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
export const siteOrigin = "https://infiniti-seller.supertulip11.chatgpt.site";
