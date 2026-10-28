import Storefront from "@/components/shop/storefront";
import { catalog, shopSettings, integrations } from "@/lib/server";
export const dynamic = "force-dynamic";
export default async function Home() {
  const [products, settings] = await Promise.all([catalog(), shopSettings()]);
  return (
    <Storefront
      products={products}
      settings={settings}
      connected={integrations()}
    />
  );
}
