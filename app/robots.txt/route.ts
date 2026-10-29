import { siteOrigin } from "@/lib/post-meta";
export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /signin-with-chatgpt\nDisallow: /signout\n\nSitemap: ${siteOrigin}/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
