"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "./supabase";

export type SubscriptionTier = "explorer" | "research" | "strategic" | "agency";

export interface TierLimits {
  maxAgents: number;
  maxScenarios: number;
  canExportCSV: boolean;
  hasAPI: boolean;
  prioritySupport: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  explorer: {
    maxAgents: 100,
    maxScenarios: 1,
    canExportCSV: false,
    hasAPI: false,
    prioritySupport: false
  },
  research: {
    maxAgents: 500,
    maxScenarios: 3,
    canExportCSV: true,
    hasAPI: false,
    prioritySupport: false
  },
  strategic: {
    maxAgents: 5000,
    maxScenarios: 999, // unlimited
    canExportCSV: true,
    hasAPI: true,
    prioritySupport: true
  },
  agency: {
    maxAgents: 99999, // unlimited
    maxScenarios: 999,
    canExportCSV: true,
    hasAPI: true,
    prioritySupport: true
  }
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: { 
    id: string; 
    email?: string; 
    tier: SubscriptionTier;
    metadata?: any;
  } | null;
  login: (email: string, pass: string) => Promise<{ error: string | null }>;
  register: (email: string, pass: string, metadata?: any) => Promise<{ error: string | null }>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const syncUser = (supabaseUser: any) => {
    if (supabaseUser) {
      setIsAuthenticated(true);
      setUser({ 
        id: supabaseUser.id, 
        email: supabaseUser.email,
        tier: (supabaseUser.user_metadata?.tier as SubscriptionTier) || "explorer",
        metadata: supabaseUser.user_metadata
      });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    syncUser(supabaseUser);
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session?.user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      syncUser(session?.user);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Protect routes
  useEffect(() => {
    if (!isLoading) {
      const protectedRoutes = ["/setup", "/simulate", "/results", "/dashboard"];
      const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
      
      if (isProtected && !isAuthenticated) {
        router.push("/login?redirect=" + pathname);
      }
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const login = async (email: string, pass: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    
    if (!error && data.session) {
      syncUser(data.session.user);
      return { error: null };
    }
    
    return { error: error?.message || "Invalid login credentials." };
  };

  const register = async (email: string, pass: string, metadata: any) => {
    // Default tier is explorer
    const finalMetadata = { ...metadata, tier: "explorer" };
    
    const { error, data } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: finalMetadata
      }
    });

    if (!error) {
      if (data.user) syncUser(data.user);
      return { error: null };
    }
    
    return { error: error?.message || "Failed to register account." };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useEntitlements() {
  const { user } = useAuth();
  const tier = user?.tier || "explorer";
  return {
    tier,
    limits: TIER_LIMITS[tier],
    isAtLeast: (requiredTier: SubscriptionTier) => {
      const tiers: SubscriptionTier[] = ["explorer", "research", "strategic", "agency"];
      return tiers.indexOf(tier) >= tiers.indexOf(requiredTier);
    }
  };
}
