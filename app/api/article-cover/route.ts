import { serviceHash } from "@/lib/service-article-variants";
export const runtime = "edge";
function xml(value: string) { return value.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]!)); }
export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = (url.searchParams.get("key") || "").slice(0, 120);
  const place = (url.searchParams.get("place") || "Hưng Yên").slice(0, 75);
  const focus = (url.searchParams.get("focus") || "kỹ thuật").slice(0, 35);
  const hash = serviceHash(key);
  const hues = [204, 161, 225, 28, 190, 255, 135, 345];
  const hue = hues[hash % hues.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="hsl(${hue},72%,24%)"/><stop offset="1" stop-color="hsl(${(hue+46)%360},72%,35%)"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="${830+hash%200}" cy="${140+hash%110}" r="275" fill="#ffffff" opacity=".06"/>
  <circle cx="1080" cy="620" r="350" fill="#ffffff" opacity=".06"/>
  <rect x="75" y="86" width="180" height="8" rx="4" fill="#9fe9f4"/>
  <text x="75" y="156" font-family="Arial, sans-serif" font-size="35" fill="#b8e8f7">INFINITI SELLER</text>
  <text x="75" y="250" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="white">DỊCH VỤ KỸ THUẬT TẠI</text>
  <text x="75" y="338" font-family="Arial, sans-serif" font-size="62" font-weight="700" fill="white">${xml(place)}</text>
  <text x="75" y="418" font-family="Arial, sans-serif" font-size="32" fill="#c8edf7">Sửa chữa · ${xml(focus)} · Hỗ trợ tại nhà</text>
  <rect x="75" y="480" width="480" height="72" rx="20" fill="#ffffff" opacity=".12"/>
  <text x="103" y="528" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="white">Hotline 0867 899 987</text>
  <rect x="870" y="275" width="230" height="150" rx="24" fill="none" stroke="#c8edf7" stroke-width="13"/>
  <path d="M950 455h68m-34-30v30m-90 8h180" fill="none" stroke="#c8edf7" stroke-width="13" stroke-linecap="round"/>
  </svg>`;
  return new Response(svg, { headers: {"Content-Type":"image/svg+xml; charset=utf-8", "Cache-Control":"public, max-age=86400", "X-Content-Type-Options":"nosniff"} });
}
