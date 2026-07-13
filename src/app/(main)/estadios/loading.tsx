import NavHeader from "@/components/NavHeader";
import { SkeletonEstadioCard } from "@/components/Skeleton";

export default function EstadiosLoading() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-6 text-3xl font-bold">Estádios</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonEstadioCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
