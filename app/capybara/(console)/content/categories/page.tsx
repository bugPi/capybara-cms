import { getCategoriesWithCounts } from "@/lib/queries";
import { CategoryManager } from "@/components/category-manager";

export const metadata = { title: "分类管理" };

export default function CategoriesPage() {
  const items = getCategoriesWithCounts();
  return <CategoryManager items={items} />;
}
