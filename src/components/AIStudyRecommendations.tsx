import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface StudyRecommendation {
  recommendations: string;
  progressSummary: {
    totalStudied: number;
    learned: number;
    learning: number;
    struggling: number;
    currentStreak: number;
  };
  jlptLevel: string;
  timestamp: string;
}

export const AIStudyRecommendations = () => {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState<StudyRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user]);

  const generateRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-study-recommendations', {
        body: {
          userId: user.id,
          jlptLevel: 'N5', // Could be fetched from user profile
          studyGoal: 'general'
        }
      });

      if (error) throw error;

      setRecommendation(data);
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate study recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">AI Study Assistant</h3>
          <p className="text-muted-foreground mb-4">
            Sign in to get personalized study recommendations powered by AI.
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Study Recommendations
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateRecommendations}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ) : recommendation ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <Badge variant="secondary">
                {recommendation.jlptLevel} Level
              </Badge>
              <Badge variant="outline">
                {recommendation.progressSummary.currentStreak} day streak
              </Badge>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {recommendation.recommendations}
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {recommendation.progressSummary.learned}
                </div>
                <div className="text-xs text-muted-foreground">Learned</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-500">
                  {recommendation.progressSummary.learning}
                </div>
                <div className="text-xs text-muted-foreground">Learning</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-500">
                  {recommendation.progressSummary.struggling}
                </div>
                <div className="text-xs text-muted-foreground">Review</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-500">
                  {recommendation.progressSummary.totalStudied}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              Generated {new Date(recommendation.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Ready to get personalized study recommendations?
            </p>
            <Button onClick={generateRecommendations}>
              Generate Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};