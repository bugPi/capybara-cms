import { getTagsWithCounts } from "@/lib/queries";
import { TagManager } from "@/components/tag-manager";

export const metadata = { title: "标签管理" };

export default function TagsPage() {
  const items = getTagsWithCounts();
  return <TagManager items={items} />;
}
