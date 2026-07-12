import NavHeader from "@/components/NavHeader";
import { SkeletonAdmin } from "@/components/Skeleton";

export default function AdminLoading() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <SkeletonAdmin />
      </main>
    </div>
  );
}
