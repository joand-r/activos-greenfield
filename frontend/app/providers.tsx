"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { ToastProvider } from "@/contexts/ToastContext";
import Loading from "@/components/Common/Loading";
import ToastContainer from "@/components/Toast";
import { useLoading } from "@/contexts/LoadingContext";

function LoadingOverlay() {
  const { isLoading } = useLoading();
  return isLoading ? <Loading /> : null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem={false} defaultTheme="dark">
      <AuthProvider>
        <LoadingProvider>
          <ToastProvider>
            <LoadingOverlay />
            <ToastContainer />
            {children}
          </ToastProvider>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
