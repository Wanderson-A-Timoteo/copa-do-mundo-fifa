import NavHeader from "@/components/NavHeader";
import { SkeletonPerfil } from "@/components/Skeleton";

export default function PerfilLoading() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <SkeletonPerfil />
      </main>
    </div>
  );
}
