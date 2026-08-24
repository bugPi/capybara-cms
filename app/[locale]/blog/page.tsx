import { getPublishedPosts } from "@/lib/blog";
import { BlogList } from "@/components/blog-list";

export const dynamic = "force-dynamic";

export default function BlogPage() {
  const posts = getPublishedPosts();
  return <BlogList posts={posts} />;
}
