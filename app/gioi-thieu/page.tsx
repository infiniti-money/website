import { redirect, notFound } from "next/navigation";
import { publicPosts } from "@/lib/articles";
export const dynamic = "force-dynamic";
export default async function About() {
  const p = (await publicPosts()).find(
    (p) => p.id === "company-introduction-v1",
  );
  if (!p) notFound();
  redirect(`/bai-viet/${p.slug}`);
}
