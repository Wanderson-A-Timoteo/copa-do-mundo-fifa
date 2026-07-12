import NavHeader from "@/components/NavHeader";
import { Skeleton } from "@/components/Skeleton";

export default function TrocasLoading() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-6 h-5 w-64" />
        <div className="mb-6 flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <Skeleton className="mt-1 h-3 w-1/2" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
