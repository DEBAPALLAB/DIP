"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "./supabase";
import { sendToWaitlistWebhook } from "./waitlistWebhook";

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
  joinWaitlist: (email: string, metadata?: any) => Promise<{ error: string | null }>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

/** A user is allowed into the app only once beta-approved. */
function isBetaApproved(supabaseUser: any): boolean {
  const meta = supabaseUser?.user_metadata || {};
  return meta.beta_approved === true || meta.beta_status === "approved";
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

    if (error || !data.session) {
      return { error: error?.message || "Invalid login credentials." };
    }

    // Beta gate: only approved accounts may enter the app.
    if (!isBetaApproved(data.session.user)) {
      await supabase.auth.signOut();
      return {
        error:
          "You're on the beta waitlist. We'll email you the moment your access is approved.",
      };
    }

    syncUser(data.session.user);
    return { error: null };
  };

  /**
   * Waitlist signup — captures interest. Creates NO logged-in session and NO
   * credentials. The person cannot access the app or any paid API until an
   * admin approves them (or they redeem an invite code via `register`).
   */
  const joinWaitlist = async (email: string, metadata: any) => {
    const normalizedEmail = email.toLowerCase().trim();
    const payload = {
      email: normalizedEmail,
      first_name: metadata?.first_name ?? null,
      last_name: metadata?.last_name ?? null,
      company: metadata?.company ?? null,
      role: metadata?.role ?? null,
      use_case: metadata?.use_case ?? null,
      source: metadata?.source ?? "waitlist",
    };

    const { error } = await supabase
      .from("beta_waitlist")
      .insert({ ...payload, status: "pending" });

    // Mirror to the Superforms webhook (best-effort, never blocks).
    void sendToWaitlistWebhook(payload);

    if (error) {
      // 23505 = unique violation (already on the list) — treat as success.
      if ((error as any).code === "23505") return { error: null };
      return { error: error.message || "Could not join the waitlist." };
    }
    return { error: null };
  };

  /**
   * Invite-code registration — for founders/agencies given direct access.
   * Validates the code via the `redeem_invite_code` RPC, which (server-side,
   * SECURITY DEFINER) checks the code is valid/unused and returns the tier to
   * grant. Only on success do we create an approved account.
   */
  const register = async (email: string, pass: string, metadata: any) => {
    const code = (metadata?.invite_code || "").trim().toUpperCase();
    if (!code) {
      return { error: "An invite code is required for direct access." };
    }

    const { data: redeem, error: redeemError } = await supabase.rpc(
      "redeem_invite_code",
      { p_code: code, p_email: email.toLowerCase().trim() }
    );

    if (redeemError || !redeem || redeem.valid !== true) {
      return { error: redeemError?.message || "Invalid or already-used invite code." };
    }

    const grantedTier: SubscriptionTier = (redeem.tier as SubscriptionTier) || "research";

    const finalMetadata = {
      ...metadata,
      invite_code: undefined, // don't persist the raw code in user metadata
      tier: grantedTier,
      beta_approved: true,
      beta_status: "approved",
    };

    const { error, data } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: finalMetadata },
    });

    if (error) {
      return { error: error.message || "Failed to create account." };
    }

    if (data.session && data.user) {
      // Email confirmation disabled → immediate session.
      syncUser(data.user);
    }
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, joinWaitlist, logout, isLoading, refreshUser }}>
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
