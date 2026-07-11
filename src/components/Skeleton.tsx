interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-64 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 sm:h-96" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonSelecaoCard() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
      <Skeleton className="h-10 w-auto rounded-sm" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonSelecaoDetalhe() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex items-center gap-6">
        <Skeleton className="h-20 w-auto rounded-sm" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <Skeleton className="mb-3 h-32 w-20 rounded-lg" />
              <Skeleton className="mb-1 h-3 w-8" />
              <Skeleton className="mb-1 h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonEstadioCard() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
      <Skeleton className="h-40 w-full rounded-t-xl" />
      <div className="space-y-2 p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonTabela() {
  return (
    <div className="animate-pulse space-y-4">
      <Skeleton className="h-10 w-32" />
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="space-y-2 p-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-6" />
              <Skeleton className="h-5 flex-1" />
              {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                <Skeleton key={j} className="h-5 w-8" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonPlacar() {
  return (
    <div className="animate-pulse space-y-4">
      <Skeleton className="h-10 w-32" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-8 rounded-sm" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-8 w-14 rounded-lg" />
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-8 rounded-sm" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-8 w-14 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonMataMata() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <Skeleton className="mb-3 h-5 w-32" />
          <div className="space-y-2">
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-6 rounded-sm" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-8 w-12 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonAlbum() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-lg" />
        ))}
      </div>
      <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <Skeleton className="mb-4 h-6 w-40" />
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="h-20 w-14 rounded" />
              <Skeleton className="mt-1 h-3 w-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonAdmin() {
  return (
    <div className="animate-pulse space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-64" />
      <div className="mt-6 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonPerfil() {
  return (
    <div className="animate-pulse space-y-6">
      <Skeleton className="h-8 w-24" />
      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
