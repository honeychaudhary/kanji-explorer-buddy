import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { KANJI_DATA, KanjiEntry, getKanjiStrokeOrderUrl } from "@/data/kanji";

interface KanjiDetailDialogProps {
  entry: KanjiEntry;
  children: React.ReactNode;
}

export const KanjiDetailDialog = ({ entry, children }: KanjiDetailDialogProps) => {
  const strokeUrl = getKanjiStrokeOrderUrl(entry.char);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-4xl leading-none">{entry.char}</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">JLPT {entry.level}</Badge>
              <div className="text-sm text-muted-foreground">{entry.meanings.join(", ")}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Tap through readings, stroke order, and usage examples for this kanji.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-3">
            <h3 className="font-semibold">Readings</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">On'yomi:</span>{" "}
                <span className="text-muted-foreground">{entry.onyomi.length ? entry.onyomi.join("、") : "—"}</span>
              </div>
              <div>
                <span className="font-medium">Kun'yomi:</span>{" "}
                <span className="text-muted-foreground">{entry.kunyomi.length ? entry.kunyomi.join("、") : "—"}</span>
              </div>
            </div>
            <Separator />
            <h3 className="font-semibold">Examples</h3>
            <ul className="space-y-2 text-sm">
              {entry.examples.map((ex, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0">{ex.word}</Badge>
                  <div>
                    <div className="text-muted-foreground">{ex.reading}</div>
                    <div>{ex.meaning}</div>
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
                  alt={`Stroke order for kanji ${entry.char} (JLPT ${entry.level})`}
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
