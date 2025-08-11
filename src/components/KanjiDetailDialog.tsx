import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Loader2 } from "lucide-react";
import { KanjiListItem } from "@/types/kanji";
import { AudioButton } from "./AudioButton";
import { Button } from "@/components/ui/button";
import { KanjiStrokeOrder } from "./KanjiStrokeOrder";

const getKanjiStrokeOrderUrl = (kanji: string) => {
  const cp = kanji.codePointAt(0) ?? 0;
  const hex = cp.toString(16).padStart(5, "0");
  return `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
};

interface KanjiDetailDialogProps {
  entry: KanjiListItem;
  children: React.ReactNode;
}

interface APIWordVariant { written: string; pronounced: string }
interface APIWordMeaning { glosses: string[] }
interface APIWordItem { variants: APIWordVariant[]; meanings: APIWordMeaning[] }

export const KanjiDetailDialog = ({ entry, children }: KanjiDetailDialogProps) => {
  const strokeUrl = getKanjiStrokeOrderUrl(entry.char);
  const [examples, setExamples] = useState<APIWordItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setExamples(null);
    fetch(`https://kanjiapi.dev/v1/words/${encodeURIComponent(entry.char)}`)
      .then((r) => (r.ok ? r.json() : Promise.resolve([])))
      .then((list: APIWordItem[]) => {
        if (!cancelled) setExamples(list.slice(0, 6));
      })
      .catch(() => !cancelled && setExamples([]));
    return () => {
      cancelled = true;
    };
  }, [entry.char]);

  const loading = examples === null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-background/95 backdrop-blur-md border-primary/20">
        <DialogHeader>
          <DialogTitle className="sr-only">Kanji Details for {entry.char}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-6 animate-scale-in">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="text-8xl md:text-9xl font-japanese text-primary leading-none">
                {entry.char}
              </div>
              <div className="text-2xl md:text-3xl text-secondary font-medium bg-japanese-cream/30 px-4 py-2 rounded-lg border border-secondary/20">
                {entry.meanings[0]}
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <Badge variant="outline" className="text-lg px-4 py-2 bg-japanese-gold/20 border-japanese-gold/50">
                JLPT N{entry.jlpt}
              </Badge>
              <AudioButton 
                text={entry.char} 
                variant="outline" 
                size="default"
                className="px-4 py-2"
              >
                Play
              </AudioButton>
            </div>
          </div>

          {/* Meanings */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle className="font-japanese-serif text-xl text-primary">English Meanings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {entry.meanings.map((meaning, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-japanese-cream/30 rounded-lg border border-primary/10">
                    <span className="text-lg">📖</span>
                    <span className="text-lg font-medium">{meaning}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Readings with Audio */}
          <div className="grid md:grid-cols-2 gap-6">
            {entry.on.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="font-japanese-serif text-xl text-primary flex items-center gap-2">
                    <span className="text-2xl">音</span>
                    On'yomi (Chinese Reading)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {entry.on.map((reading, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-japanese-sakura/20 rounded-lg border border-primary/10">
                        <span className="text-2xl font-japanese font-bold">{reading}</span>
                        <AudioButton 
                          text={reading} 
                          id={`on-${reading}-${idx}`}
                          className="text-primary hover:text-primary/80"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {entry.kun.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="font-japanese-serif text-xl text-primary flex items-center gap-2">
                    <span className="text-2xl">訓</span>
                    Kun'yomi (Japanese Reading)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {entry.kun.map((reading, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-japanese-gold/20 rounded-lg border border-secondary/30">
                        <span className="text-2xl font-japanese font-bold">{reading}</span>
                        <AudioButton 
                          text={reading} 
                          id={`kun-${reading}-${idx}`}
                          className="text-secondary hover:text-secondary/80"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stroke Order */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle className="font-japanese-serif text-xl text-primary flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-2xl">筆</span>
                  Stroke Order
                </span>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={strokeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Full Size
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <KanjiStrokeOrder kanji={entry.char} strokeUrl={strokeUrl} />
            </CardContent>
          </Card>

          {/* Example Words with Audio */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/10">
            <CardHeader>
              <CardTitle className="font-japanese-serif text-xl text-primary flex items-center gap-2">
                <span className="text-2xl">例</span>
                Example Words
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-lg">Loading examples...</span>
                </div>
              ) : examples && examples.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {examples.slice(0, 6).map((word, idx) => (
                    <div key={idx} className="p-4 bg-japanese-cream/30 rounded-lg border border-primary/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-japanese font-bold text-primary">
                            {word.variants[0]?.written}
                          </div>
                          {word.variants[0]?.pronounced && (
                            <div className="text-lg font-japanese text-muted-foreground">
                              {word.variants[0].pronounced}
                            </div>
                          )}
                        </div>
                        <AudioButton 
                          text={word.variants[0]?.written || ''} 
                          id={`word-${idx}`}
                          className="text-primary hover:text-primary/80"
                        />
                      </div>
                      <Separator className="bg-primary/20" />
                      <div className="text-base text-foreground">
                        {word.meanings[0]?.glosses.slice(0, 2).join("; ")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-lg text-muted-foreground">No example words found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
