"use client";

import { SimulationProvider } from "@/lib/SimulationContext";
import { AuthProvider } from "@/lib/AuthContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SimulationProvider>
        {children}
      </SimulationProvider>
    </AuthProvider>
  );
}

