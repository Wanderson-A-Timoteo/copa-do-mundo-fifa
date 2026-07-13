import NavHeader from "@/components/NavHeader";
import { Skeleton } from "@/components/Skeleton";

export default function RepetidasDetalheLoading() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="flex justify-center">
          <Skeleton className="h-64 w-48 rounded-xl" />
        </div>
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </main>
    </div>
  );
}
