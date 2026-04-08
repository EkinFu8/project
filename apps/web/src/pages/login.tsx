import type { LoginPortal } from "@myapp/types/schemas";
import { LoginLayout } from "@myapp/ui/components/login-layout";
import { TextInput } from "@myapp/ui/components/text-input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/lib/trpc";

function redirectTarget(state: unknown, fallback: string): string {
  if (
    state &&
    typeof state === "object" &&
    "from" in state &&
    typeof (state as { from: unknown }).from === "string"
  ) {
    const from = (state as { from: string }).from;
    if (from.startsWith("/") && !from.startsWith("//")) {
      return from;
    }
  }
  return fallback;
}

/** Login help for developers: Vite dev server only (stripped from production / cloud builds). */
function showLocalLoginHint(): boolean {
  if (!import.meta.env.DEV) return false;
  const host = globalThis.location?.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function LoginFormPage({
  defaultRedirect,
  portal,
  bannerText,
}: {
  defaultRedirect: string;
  portal: LoginPortal;
  bannerText?: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const from = redirectTarget(location.state, defaultRedirect);
  const localHint = showLocalLoginHint();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.login.login.useMutation({
    async onSuccess(session) {
      if (!session) return;
      const { error } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      if (error) {
        console.error("[login] setSession:", error);
        return;
      }
      navigate(from, { replace: true });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({ email, password, portal });
  }

  return (
    <LoginLayout
      title="Sign in"
      subtitle="Employee portal — sign in with your Hanover employee or administrator account."
    >
      <div className="rounded-2xl border border-white/25 bg-card/95 p-8 text-card-foreground shadow-2xl shadow-black/20 backdrop-blur-md dark:border-white/10 dark:shadow-black/35">
        {bannerText ? (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {bannerText}
          </div>
        ) : null}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextInput
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {login.isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {login.error?.message ?? "Sign in failed."}
            </div>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-hanover-green py-3 font-semibold text-white shadow-md shadow-hanover-green/25 transition-colors hover:bg-hanover-green/90 disabled:opacity-60"
          >
            {login.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>
      </div>
      {localHint ? (
        <p className="mt-6 text-center text-xs leading-relaxed text-white/65">
          Local dev:{" "}
          <code className="rounded bg-white/10 px-1 py-0.5 text-white/90">user@hanover.test</code>
          {" / "}
          <code className="rounded bg-white/10 px-1 py-0.5 text-white/90">HanoverTest123!</code>
        </p>
      ) : null}
    </LoginLayout>
  );
}

export default LoginFormPage;
