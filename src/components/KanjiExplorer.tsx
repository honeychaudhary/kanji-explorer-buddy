import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KANJI_DATA, JLPT_LEVELS, KanjiEntry } from "@/data/kanji";
import { KanjiDetailDialog } from "./KanjiDetailDialog";

const matchesSearch = (entry: KanjiEntry, q: string) => {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  return (
    entry.char.includes(query) ||
    entry.meanings.join(" ").toLowerCase().includes(query) ||
    entry.onyomi.join(" ").toLowerCase().includes(query) ||
    entry.kunyomi.join(" ").toLowerCase().includes(query) ||
    entry.examples.some(
      (e) =>
        e.word.includes(query) ||
        e.reading.toLowerCase().includes(query) ||
        e.meaning.toLowerCase().includes(query)
    )
  );
};

export default function KanjiExplorer() {
  const [level, setLevel] = useState<string>(JLPT_LEVELS[0]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return KANJI_DATA.filter((k) => k.level === level && matchesSearch(k, search));
  }, [level, search]);

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
          <Select value={level} onValueChange={setLevel}>
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
            placeholder="Search by meaning, reading, or example..."
            aria-label="Search kanji"
          />
        </div>
      </section>

      <section aria-label={`Kanji list for JLPT ${level}`}>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((entry) => (
            <KanjiDetailDialog key={`${entry.char}-${entry.level}`} entry={entry}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="text-5xl leading-none">{entry.char}</div>
                    <Badge variant="secondary">{entry.level}</Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
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
      </section>
    </main>
  );
}
