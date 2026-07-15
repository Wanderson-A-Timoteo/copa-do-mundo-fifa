import NavHeader from "@/components/NavHeader";
import { SkeletonMataMata } from "@/components/Skeleton";

export default function MataMataLoading() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <SkeletonMataMata />
      </main>
    </div>
  );
}
