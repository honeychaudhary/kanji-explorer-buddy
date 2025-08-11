import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSupabaseClientOrNull } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  isGuest: boolean;
  signInMagic: (email: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = getSupabaseClientOrNull();
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoaded(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isGuest: !user,
      async signInMagic(email: string) {
        const sb = getSupabaseClientOrNull();
        if (!sb) return { ok: false, message: "Supabase not configured. Sign-in unavailable." };
        const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
        if (error) return { ok: false, message: error.message };
        return { ok: true, message: "Magic link sent! Check your email." };
      },
      async signOut() {
        const sb = getSupabaseClientOrNull();
        if (!sb) return;
        await sb.auth.signOut();
      },
    }),
    [user]
  );

  if (!loaded) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
