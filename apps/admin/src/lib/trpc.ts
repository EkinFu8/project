import type { AppRouter } from "@myapp/api/routers";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>();

function trpcHttpUrl(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  if (raw) return raw.replace(/\/$/, "");
  if (import.meta.env.DEV) {
    console.warn("[tRPC] VITE_API_URL unset; using http://127.0.0.1:3000");
    return "http://127.0.0.1:3000";
  }
  throw new Error("VITE_API_URL must be set for production builds");
}

export function createTRPCClient(getToken: () => Promise<string | null>) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: trpcHttpUrl(),
        async headers() {
          const token = await getToken();
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}
