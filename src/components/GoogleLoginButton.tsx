"use client";

import { GoogleLogin } from "@react-oauth/google";

export default function GoogleLoginButton({
  texto,
  onSuccess,
}: {
  texto?: string;
  onSuccess: (token: string, user: { id: number; nome: string; email: string }) => void;
}) {
  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          if (!credentialResponse.credential) return;
          try {
            const res = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential: credentialResponse.credential }),
            });
            const data = await res.json();
            if (!res.ok) return;
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            onSuccess(data.token, data.user);
          } catch {
            return;
          }
        }}
        onError={() => {}}
        text={texto === "cadastro" ? "signup_with" : "signin_with"}
        shape="rectangular"
        size="large"
      />
    </div>
  );
}
