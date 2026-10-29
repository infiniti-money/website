import { publishedSummaries } from "@/lib/articles";
import { siteOrigin } from "@/lib/post-meta";
export const dynamic = "force-dynamic";
const escape = (value: string) =>
  value.replace(
    /[<>&'\"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c]!,
  );
export async function GET() {
  const posts = await publishedSummaries();
  const urls = [
    { url: siteOrigin + "/", date: "" },
    { url: siteOrigin + "/bai-viet", date: posts[0]?.updated_at || "" },
    ...posts.map((p) => ({
      url: siteOrigin + "/bai-viet/" + p.slug,
      date: p.updated_at,
    })),
  ];
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urls
      .map(
        (u) =>
          `<url><loc>${escape(u.url)}</loc>${u.date ? `<lastmod>${escape(u.date)}</lastmod>` : ""}</url>`,
      )
      .join("") +
    "</urlset>";
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
