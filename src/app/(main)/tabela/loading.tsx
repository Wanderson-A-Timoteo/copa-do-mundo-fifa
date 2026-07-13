import NavHeader from "@/components/NavHeader";
import { Skeleton } from "@/components/Skeleton";

export default function TabelaLoading() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="mb-4 h-10 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
              <Skeleton className="mb-3 h-5 w-24" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-6" />
                    <Skeleton className="h-5 flex-1" />
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
                      <Skeleton key={k} className="h-5 w-8" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
