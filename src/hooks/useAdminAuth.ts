import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";

export function useAdminAuth() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!token || !user) {
      router.push("/login");
      return;
    }

    if (user.role === "ADMIN") {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        const role = d.user?.role ?? null;
        if (role === "ADMIN") {
          setIsAdmin(true);
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, user, authLoading, router]);

  return { isAdmin, loading: authLoading || loading, user, token };
}
