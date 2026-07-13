import { useAuth } from "./useAuth";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useFetch() {
  const { getAuthHeaders, logout } = useAuth();
  const router = useRouter();

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = {
        ...options.headers,
        ...getAuthHeaders(),
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        logout();
        router.push("/login");
        throw new Error("Unauthorized");
      }

      return response;
    },
    [getAuthHeaders, logout, router],
  );

  return { fetchWithAuth };
}
