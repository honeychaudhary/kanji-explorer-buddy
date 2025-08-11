import { useEffect, useMemo, useState } from "react";
import { JLPT_LEVELS, KanjiListItem, RawKanjiRecord, jlptStringToNumber, JLPTString } from "@/types/kanji";

export function useKanjiData() {
  const [data, setData] = useState<KanjiListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/data/kanji.json")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load kanji dataset: ${r.status}`);
        return r.json();
      })
      .then((json: Record<string, RawKanjiRecord>) => {
        if (cancelled) return;
        const items: KanjiListItem[] = Object.entries(json).map(([char, rec]) => ({
          char,
          jlpt: rec.jlpt_new ?? rec.jlpt_old ?? 0,
          meanings: rec.meanings ?? [],
          on: rec.readings_on ?? [],
          kun: rec.readings_kun ?? [],
        }));
        // only keep items that have JLPT level 1..5
        const filtered = items.filter((i) => i.jlpt >= 1 && i.jlpt <= 5);
        setData(filtered);
        setError(null);
      })
      .catch((e: any) => setError(e?.message ?? "Unknown error"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const byLevel = useMemo(() => {
    const map = new Map<number, KanjiListItem[]>();
    if (data) {
      for (const lvl of [1, 2, 3, 4, 5]) map.set(lvl, []);
      for (const item of data) {
        const arr = map.get(item.jlpt);
        if (arr) arr.push(item);
      }
      for (const [lvl, arr] of map) {
        arr.sort((a, b) => a.char.localeCompare(b.char, "ja"));
        map.set(lvl, arr);
      }
    }
    return map;
  }, [data]);

  const getLevelItems = (level: JLPTString) => {
    const lvlNum = jlptStringToNumber(level);
    return byLevel.get(lvlNum) ?? [];
  };

  return { data, loading, error, getLevelItems };
}
