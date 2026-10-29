import Storefront from "@/components/shop/storefront";
import { catalog, shopSettings, integrations } from "@/lib/server";
import { publicPosts } from "@/lib/articles";
import { walletAvailability } from "@/lib/wallet-server";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [products, settings,posts,wallets] = await Promise.all([catalog(), shopSettings(),publicPosts(3),walletAvailability()]);
  return (
    <Storefront
      products={products}
      settings={settings}
      connected={{...integrations(),...wallets}}
      posts={posts.map(({body,...summary})=>summary)}
    />
  );
}
