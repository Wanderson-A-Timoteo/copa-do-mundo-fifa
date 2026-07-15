import NavHeader from "@/components/NavHeader";
import { SkeletonPlacar } from "@/components/Skeleton";

export default function PlacarLoading() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <SkeletonPlacar />
      </main>
    </div>
  );
}
