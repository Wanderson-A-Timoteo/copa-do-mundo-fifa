import NavHeader from "@/components/NavHeader";
import { SkeletonSelecaoCard } from "@/components/Skeleton";

export default function SelecoesLoading() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-6 text-3xl font-bold">Seleções</h1>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonSelecaoCard key={i} />
          ))}
        </div>
      </main>
    </div>
  );
}
