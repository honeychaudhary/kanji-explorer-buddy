import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import { getSupabaseClientOrNull } from "@/lib/supabaseClient";

export type ProgressStatus = "not_visited" | "learning" | "learned";

interface ProgressMap { [kanji: string]: ProgressStatus }

interface ProgressContextValue {
  getStatus: (kanji: string) => ProgressStatus;
  setStatus: (kanji: string, status: ProgressStatus) => Promise<void>;
  all: ProgressMap;
}

const STORAGE_KEY = "kanji-progress";

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

function loadLocal(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function saveLocal(map: ProgressMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
  }
}

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [map, setMap] = useState<ProgressMap>(() => loadLocal());

  // Fetch from Supabase when user logs in and merge
  useEffect(() => {
    const fetchAndMerge = async () => {
      const sb = getSupabaseClientOrNull();
      if (!sb || !user) return;
      try {
        const { data, error } = await sb.from("user_progress").select("kanji,status");
        if (error) throw error;
        const server: ProgressMap = {};
        for (const row of data as any[]) server[row.kanji] = row.status as ProgressStatus;
        setMap((prev) => {
          const merged: ProgressMap = { ...server, ...prev }; // local overrides
          saveLocal(merged);
          // Upsert merged back to Supabase
          const rows = Object.entries(merged).map(([kanji, status]) => ({ kanji, status }));
          sb.from("user_progress").upsert(rows).then(() => {});
          return merged;
        });
      } catch {
        // ignore, keep local only
      }
    };
    fetchAndMerge();
  }, [user]);

  const getStatus = useCallback((kanji: string): ProgressStatus => map[kanji] ?? "not_visited", [map]);

  const setStatus = useCallback(async (kanji: string, status: ProgressStatus) => {
    setMap((prev) => {
      const next = { ...prev, [kanji]: status };
      saveLocal(next);
      return next;
    });
    const sb = getSupabaseClientOrNull();
    // Sync to Supabase if logged in
    if (sb && user) {
      try {
        await sb.from("user_progress").upsert({ kanji, status });
      } catch {
        // ignore
      }
    }
  }, [user]);

  const value = useMemo(() => ({ getStatus, setStatus, all: map }), [getStatus, setStatus, map]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    // Safe fallback to local-only progress to avoid crash if provider is not mounted yet (e.g. during HMR)
    const local = loadLocal();
    // Return lightweight no-op sync that only uses localStorage
    return {
      getStatus: (kanji: string) => local[kanji] ?? "not_visited",
      setStatus: async (kanji: string, status: ProgressStatus) => {
        const m = loadLocal();
        m[kanji] = status;
        saveLocal(m);
      },
      all: local,
    } as ProgressContextValue;
  }
  return ctx;
};
