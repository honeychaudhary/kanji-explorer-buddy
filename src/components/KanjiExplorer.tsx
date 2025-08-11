import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JLPT_LEVELS, JLPTString } from "@/types/kanji";
import { useKanjiData } from "@/hooks/useKanjiData";
import { KanjiDetailDialog } from "./KanjiDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";

const matchesSearch = (char: string, meanings: string[], on: string[], kun: string[], q: string) => {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  return (
    char.includes(query) ||
    meanings.join(" ").toLowerCase().includes(query) ||
    on.join(" ").toLowerCase().includes(query) ||
    kun.join(" ").toLowerCase().includes(query)
  );
};

export default function KanjiExplorer() {
  const [level, setLevel] = useState<JLPTString>(JLPT_LEVELS[0]);
  const [search, setSearch] = useState("");
  const { loading, error, getLevelItems } = useKanjiData();

  const items = getLevelItems(level);

  const filtered = useMemo(() => {
    return items.filter((k) => matchesSearch(k.char, k.meanings, k.on, k.kun, search));
  }, [items, search]);

  return (
    <main className="container py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">JLPT Kanji Explorer</h1>
        <p className="mt-2 text-muted-foreground">
          Browse kanji by JLPT level. Click any kanji to see readings, stroke order, and examples.
        </p>
      </header>

      <section aria-label="Filters" className="mb-8">
        <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
          <Select value={level} onValueChange={(v) => setLevel(v as JLPTString)}>
            <SelectTrigger aria-label="Select JLPT Level">
              <SelectValue placeholder="Select JLPT level" />
            </SelectTrigger>
            <SelectContent>
              {JLPT_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  JLPT {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by meaning or reading..."
            aria-label="Search kanji"
          />
        </div>
      </section>

      {error && (
        <p className="text-destructive text-sm mb-6" role="alert">
          Failed to load full kanji list. Showing nothing.
        </p>
      )}

      <section aria-label={`Kanji list for JLPT ${level}`}>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-4 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((entry) => (
              <KanjiDetailDialog key={`${entry.char}-N${entry.jlpt}`} entry={entry}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="text-5xl leading-none">{entry.char}</div>
                      <Badge variant="secondary">N{entry.jlpt}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground truncate">
                      {entry.meanings.join(", ")}
                    </div>
                  </CardContent>
                </Card>
              </KanjiDetailDialog>
            ))}
            {filtered.length === 0 && (
              <p className="text-muted-foreground">No results. Try a different search.</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
