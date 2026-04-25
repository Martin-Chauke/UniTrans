"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { StudentAuthProvider } from "@/context/StudentAuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    const stored = localStorage.getItem("unitrans_theme");
    if (stored === "dark") {
      document.documentElement.dataset.theme = "dark";
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StudentAuthProvider>{children}</StudentAuthProvider>
    </QueryClientProvider>
  );
}
