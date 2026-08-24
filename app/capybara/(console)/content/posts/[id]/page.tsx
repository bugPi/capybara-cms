import { notFound } from "next/navigation";
import {
  getPostDetail,
  getAllCategories,
  getAllTags,
  getPostRevisions,
} from "@/lib/queries";
import {
  PostEditorShell,
  type PostEditorShellPost,
} from "@/components/post-editor-shell";

export const metadata = { title: "编辑文章" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = getPostDetail(Number(id));
  if (!post) notFound();

  const categories = getAllCategories();
  const tags = getAllTags();
  const revisions = getPostRevisions(post.id);

  const shellPost: PostEditorShellPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? null,
    content: post.content ?? "",
    status: post.status,
    featured: post.featured,
    categoryId: post.categoryIds[0] ?? null,
    tagIds: post.tagIds,
    updatedAt: post.updatedAt.getTime(),
  };

  return (
    <PostEditorShell
      key={post.updatedAt.getTime()}
      post={shellPost}
      categories={categories}
      tags={tags}
      revisions={revisions}
    />
  );
}
