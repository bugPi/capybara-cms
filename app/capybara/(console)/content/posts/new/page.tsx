import { getAllCategories, getAllTags } from "@/lib/queries";
import { PostEditorShell } from "@/components/post-editor-shell";

export const metadata = { title: "创建文章" };

export default function NewPostPage() {
  const categories = getAllCategories();
  const tags = getAllTags();

  return <PostEditorShell categories={categories} tags={tags} />;
}
