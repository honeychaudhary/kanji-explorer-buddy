import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface KanjiExplanation {
  kanji: string;
  explanation: string;
  timestamp: string;
}

interface AIKanjiExplanationProps {
  kanji: string;
  onExplanationGenerated?: (explanation: string) => void;
}

export const AIKanjiExplanation = ({ kanji, onExplanationGenerated }: AIKanjiExplanationProps) => {
  const [explanation, setExplanation] = useState<KanjiExplanation | null>(null);
  const [loading, setLoading] = useState(false);

  const generateExplanation = async () => {
    if (!kanji) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-kanji-explanation', {
        body: {
          kanji,
          context: 'JLPT study context'
        }
      });

      if (error) throw error;

      setExplanation(data);
      onExplanationGenerated?.(data.explanation);
      toast.success('AI explanation generated!');
    } catch (error: any) {
      console.error('Error generating explanation:', error);
      toast.error('Failed to generate AI explanation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="w-5 h-5 text-primary" />
          AI Explanation
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : explanation ? (
          <div className="space-y-3">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {explanation.explanation}
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                Generated {new Date(explanation.timestamp).toLocaleString()}
              </p>
              <Button variant="outline" size="sm" onClick={generateExplanation}>
                Regenerate
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Get an AI-powered detailed explanation for "{kanji}"
            </p>
            <Button onClick={generateExplanation} className="w-full">
              <Brain className="w-4 h-4 mr-2" />
              Generate AI Explanation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};