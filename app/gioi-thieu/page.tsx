import { redirect, notFound } from "next/navigation";
import { companyPost } from "@/lib/articles";
export const dynamic = "force-dynamic";
export default async function About() {
  const p = await companyPost();
  if (!p) notFound();
  redirect(`/bai-viet/${p.slug}`);
}
