import { ThemeProvider } from "@myapp/ui/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { SessionProvider } from "@/auth/session-context";
import App from "./App.tsx";
import "./index.css";
import { supabase } from "./lib/supabase";
import { createTRPCClient, trpc } from "./lib/trpc";

function Root() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    createTRPCClient(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    }),
  );

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
