import { getMediaList } from "@/lib/queries";
import { MediaManager } from "@/components/media-manager";

export const metadata = { title: "媒体库" };

export default function MediaPage() {
  const items = getMediaList();
  return <MediaManager items={items} />;
}
