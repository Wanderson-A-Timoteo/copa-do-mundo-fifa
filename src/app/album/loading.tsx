import NavHeader from "@/components/NavHeader";
import { SkeletonAlbum } from "@/components/Skeleton";

export default function AlbumLoading() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <SkeletonAlbum />
      </main>
    </div>
  );
}
