import { getSitesList } from "@/lib/queries";
import { SiteManager } from "@/components/site-manager";

export const metadata = { title: "站点管理" };

export default function SitesPage() {
  const items = getSitesList();
  return <SiteManager items={items} />;
}
