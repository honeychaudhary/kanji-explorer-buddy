import { Navigation } from "@/components/Navigation";
import { SakuraBackground } from "@/components/SakuraBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useKanjiData } from "@/hooks/useKanjiData";
import { useProgress } from "@/hooks/useProgress";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { UserProfile } from "@/components/UserProfile";
import { AIStudyRecommendations } from "@/components/AIStudyRecommendations";
import { JLPT_LEVELS, JLPTString } from "@/types/kanji";
import { BookOpen, Target, Trophy, Clock } from "lucide-react";

const ProgressPage = () => {
  const { data: kanjiData, loading } = useKanjiData();
  const localProgress = useProgress();
  const supabaseProgress = useSupabaseProgress();
  
  // Use Supabase progress if user is logged in, otherwise local progress
  const progress = supabaseProgress.isLoggedIn ? supabaseProgress : localProgress;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-japanese-cream/20">
        <SakuraBackground />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your progress...</div>
        </div>
      </div>
    );
  }

  const progressData = supabaseProgress.isLoggedIn 
    ? supabaseProgress.progress 
    : localProgress.all;
  
  const getStatusFunc = supabaseProgress.isLoggedIn 
    ? supabaseProgress.getStatus 
    : localProgress.getStatus;

  const progressEntries = Object.entries(progressData || {});
  const stats = supabaseProgress.isLoggedIn 
    ? supabaseProgress.getStats() 
    : {
        total: progressEntries.length,
        new: progressEntries.filter(([, status]) => status === 'new').length,
        learning: progressEntries.filter(([, status]) => status === 'learning').length,
        learned: progressEntries.filter(([, status]) => status === 'learned').length,
        mastered: progressEntries.filter(([, status]) => status === 'mastered').length,
      };

  const getProgressStats = () => {
    const levelStats = JLPT_LEVELS.map((level) => {
      const levelNum = parseInt(level.replace('N', ''), 10);
      const levelKanji = kanjiData?.filter(k => k.jlpt === levelNum) || [];
      const learned = levelKanji.filter(k => getStatusFunc(k.char) === 'learned').length;
      const studying = levelKanji.filter(k => getStatusFunc(k.char) === 'learning').length;
      const total = levelKanji.length;
      const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;
      
      return {
        level,
        learned,
        studying,
        unexplored: total - learned - studying,
        total,
        percentage
      };
    });
    return levelStats;
  };

  const progressStats = getProgressStats();
  const totalLearned = progressStats.reduce((sum, stat) => sum + stat.learned, 0);
  const totalStudying = progressStats.reduce((sum, stat) => sum + stat.studying, 0);
  const totalKanji = progressStats.reduce((sum, stat) => sum + stat.total, 0);
  const overallPercentage = totalKanji > 0 ? Math.round((totalLearned / totalKanji) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-japanese-cream/20">
      <SakuraBackground />
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Your Learning Progress</h1>
          <p className="text-muted-foreground">
            Track your kanji learning journey and see your improvements over time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <UserProfile />
            <AIStudyRecommendations />
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{stats.learned}</div>
                    <div className="text-sm text-muted-foreground">Learned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">{stats.learning}</div>
                    <div className="text-sm text-muted-foreground">Learning</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">{stats.mastered}</div>
                    <div className="text-sm text-muted-foreground">Mastered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-muted-foreground">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{overallPercentage}%</span>
                  </div>
                  <Progress value={overallPercentage} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* JLPT Level Progress */}
            <div className="grid md:grid-cols-2 gap-6">
              {progressStats.map((stat) => (
                <Card key={stat.level} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        JLPT {stat.level}
                      </span>
                      <Badge variant="outline">{stat.percentage}%</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-semibold text-primary">{stat.learned}</div>
                          <div className="text-xs text-muted-foreground">Learned</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-blue-500">{stat.studying}</div>
                          <div className="text-xs text-muted-foreground">Studying</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-muted-foreground">{stat.unexplored}</div>
                          <div className="text-xs text-muted-foreground">Unexplored</div>
                        </div>
                      </div>
                      <Progress value={stat.percentage} className="h-2" />
                      <div className="text-sm text-muted-foreground text-center">
                        {stat.learned} of {stat.total} kanji mastered
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Study Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  Study Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Next Steps</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Focus on kanji you're currently studying</li>
                      <li>• Review learned kanji regularly to maintain retention</li>
                      <li>• Explore new kanji from your target JLPT level</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Study Recommendations</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Practice stroke order for better memorization</li>
                      <li>• Use audio pronunciation to improve reading</li>
                      <li>• Study 5-10 new kanji per day for optimal retention</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;