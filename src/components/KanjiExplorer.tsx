import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JLPT_LEVELS, JLPTString } from "@/types/kanji";
import { useKanjiData } from "@/hooks/useKanjiData";
import { KanjiDetailDialog } from "./KanjiDetailDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation } from "./Navigation";
import { SakuraBackground } from "./SakuraBackground";
import { Search } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

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
  const { getStatus } = useProgress();

  const filtered = useMemo(() => {
    return items.filter((k) => matchesSearch(k.char, k.meanings, k.on, k.kun, search));
  }, [items, search]);

  return (
    <div className="min-h-screen bg-background paper-texture">
      <SakuraBackground />
      <Navigation 
        currentLevel={level} 
        onLevelChange={setLevel}
        showLevelSelector={true}
      />
      
      <main className="container py-8 relative z-10">
        <header className="mb-8 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-japanese-serif font-bold text-primary mb-4">
            <span className="text-6xl md:text-7xl block mb-2">漢字</span>
            JLPT Kanji Explorer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master Japanese kanji characters through interactive exploration. Click any kanji to discover readings, 
            stroke order, and hear native pronunciation.
          </p>
        </header>

        <section aria-label="Search" className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by meaning, reading, or character..."
              aria-label="Search kanji"
              className="pl-10 text-center bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40"
            />
          </div>
        </section>

        {error && (
          <div className="text-center mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-4 inline-block" role="alert">
              Failed to load kanji data. Please refresh the page to try again.
            </p>
          </div>
        )}

        <section aria-label={`Kanji list for JLPT ${level}`} className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-6">
            <Badge variant="outline" className="text-lg px-4 py-2 bg-primary/10 border-primary/30">
              JLPT {level} • {filtered.length} Kanji
            </Badge>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 15 }).map((_, i) => (
                <Card key={i} className="bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <Skeleton className="h-12 w-12" />
                      <Skeleton className="h-5 w-8" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((entry) => {
                const status = getStatus(entry.char);
                const statusClasses =
                  status === "learned"
                    ? "bg-primary/10 border-primary/40"
                    : status === "learning"
                    ? "bg-secondary/10 border-secondary/40"
                    : "bg-card/80 border-primary/10";
                return (
                  <KanjiDetailDialog key={`${entry.char}-N${entry.jlpt}`} entry={entry}>
                    <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 backdrop-blur-sm hover:border-primary/30 ${statusClasses}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="text-5xl leading-none font-japanese group-hover:text-primary transition-colors">
                            {entry.char}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-japanese-gold/20 text-japanese-black border-japanese-gold/30">
                              N{entry.jlpt}
                            </Badge>
                            {status !== "not_visited" && (
                              <Badge variant="outline" className="text-xs">
                                {status === "learning" ? "Learning" : "Learned"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {entry.meanings.slice(0, 3).join(", ")}
                          {entry.meanings.length > 3 && "..."}
                        </div>
                      </CardContent>
                    </Card>
                  </KanjiDetailDialog>
                );
              })}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg text-muted-foreground mb-2">No kanji found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search terms or selecting a different JLPT level.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
