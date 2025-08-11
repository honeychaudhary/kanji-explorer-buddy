import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { KanjiListItem } from "@/types/kanji";
import { useEffect, useState } from "react";

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

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-4xl leading-none">{entry.char}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">JLPT N{entry.jlpt}</Badge>
              <div className="text-sm text-muted-foreground truncate max-w-[16rem]">{entry.meanings.join(", ")}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Readings, stroke order, and usage examples for this kanji.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-3">
            <h3 className="font-semibold">Readings</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">On'yomi:</span>{" "}
                <span className="text-muted-foreground">{entry.on.length ? entry.on.join("、") : "—"}</span>
              </div>
              <div>
                <span className="font-medium">Kun'yomi:</span>{" "}
                <span className="text-muted-foreground">{entry.kun.length ? entry.kun.join("、") : "—"}</span>
              </div>
            </div>
            <Separator />
            <h3 className="font-semibold">Examples</h3>
            <ul className="space-y-2 text-sm">
              {examples === null && <li className="text-muted-foreground">Loading examples…</li>}
              {examples && examples.length === 0 && (
                <li className="text-muted-foreground">No examples found.</li>
              )}
              {examples && examples.map((ex, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0">
                    {ex.variants?.[0]?.written || "—"}
                  </Badge>
                  <div>
                    <div className="text-muted-foreground">{ex.variants?.[0]?.pronounced || ""}</div>
                    <div>{ex.meanings?.[0]?.glosses?.[0] || ""}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="space-y-3">
            <h3 className="font-semibold">Stroke order</h3>
            <Card>
              <CardContent className="p-3">
                <img
                  src={strokeUrl}
                  alt={`Stroke order for kanji ${entry.char} (JLPT N${entry.jlpt})`}
                  loading="lazy"
                  className="w-full h-auto"
                />
              </CardContent>
            </Card>
            <a
              href={strokeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline"
              aria-label={`Open stroke order SVG for ${entry.char} in new tab`}
            >
              Open stroke order SVG
            </a>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
