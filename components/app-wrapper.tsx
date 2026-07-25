"use client";

import type { ReactNode } from "react";
import { PiAuthProvider, usePiAuth } from "@/contexts/pi-auth-context";
import { AuthLoadingScreen } from "./auth-loading-screen";
// Payment flow temporarily disabled while converting to a plain Pi Sign-In
// app for Pi App Studio — see contexts/pi-auth-context.tsx. Uncomment to
// restore:
// import { initializeGlobalPayment } from "@/lib/pi-payment";

function AppContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, hasError } = usePiAuth();

  // Payment flow temporarily disabled — no global payment initialization.
  // useEffect(() => {
  //   try {
  //     initializeGlobalPayment();
  //     console.log("[v0] Global payment function initialized");
  //   } catch (error) {
  //     console.error("[v0] Failed to initialize payment:", error);
  //   }
  // }, []);

  // Show error state when authentication fails
  if (hasError) {
    return <AuthLoadingScreen />;
  }
  
  // Always render children, even if still loading
  // This allows product browsing while auth initializes
  return <>{children}</>;
}

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      <AppContent>{children}</AppContent>
    </PiAuthProvider>
  );
}
