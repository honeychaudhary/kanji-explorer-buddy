import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { SakuraBackground } from "@/components/SakuraBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KanjiDetailDialog } from "@/components/KanjiDetailDialog";
import { useKanjiData } from "@/hooks/useKanjiData";
import { useProgress } from "@/hooks/useProgress";
import { JLPT_LEVELS, JLPTString, KanjiListItem, jlptStringToNumber } from "@/types/kanji";
import { ArrowLeft, BookOpen, Target, Users } from "lucide-react";

const JLPTPage = () => {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const [selectedKanji, setSelectedKanji] = useState<KanjiListItem | null>(null);
  
  const { data: kanjiData, loading } = useKanjiData();
  const { getStatus, all: progress } = useProgress();

  // Validate level parameter
  const currentLevel = (level?.toUpperCase() as JLPTString) || 'N5';
  const isValidLevel = JLPT_LEVELS.includes(currentLevel);

  if (!isValidLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-japanese-cream/20">
        <SakuraBackground />
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Invalid JLPT Level</h1>
          <Button onClick={() => navigate('/learn')}>Return to Learn</Button>
        </div>
      </div>
    );
  }

  const levelKanji = kanjiData?.filter(k => k.jlpt === jlptStringToNumber(currentLevel)) || [];
  const learnedCount = levelKanji.filter(k => getStatus(k.char) === 'learned').length;
  const studyingCount = levelKanji.filter(k => getStatus(k.char) === 'learning').length;
  const progressPercentage = levelKanji.length > 0 ? Math.round((learnedCount / levelKanji.length) * 100) : 0;

  const getLevelInfo = (level: JLPTString) => {
    const info = {
      N5: { 
        title: "Beginner Level", 
        description: "Basic kanji for everyday situations",
        difficulty: "Beginner",
        color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      },
      N4: { 
        title: "Elementary Level", 
        description: "Essential kanji for basic communication",
        difficulty: "Elementary",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      },
      N3: { 
        title: "Intermediate Level", 
        description: "Kanji for general topics and daily conversations",
        difficulty: "Intermediate",
        color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      },
      N2: { 
        title: "Upper Intermediate", 
        description: "Advanced kanji for complex topics",
        difficulty: "Advanced",
        color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      },
      N1: { 
        title: "Advanced Level", 
        description: "Complex kanji for professional and academic contexts",
        difficulty: "Expert",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      }
    };
    return info[level];
  };

  const levelInfo = getLevelInfo(currentLevel);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-japanese-cream/20">
        <SakuraBackground />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading JLPT {currentLevel} kanji...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-japanese-cream/20">
      <SakuraBackground />
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/learn')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Learn
            </Button>
            
            <div className="text-center">
              <h1 className="text-5xl font-japanese-serif font-bold text-primary mb-4">
                JLPT {currentLevel}
              </h1>
              <div className="flex items-center justify-center gap-4 mb-4">
                <Badge className={levelInfo.color}>
                  {levelInfo.difficulty}
                </Badge>
                <Badge variant="outline">
                  {levelKanji.length} Kanji
                </Badge>
                <Badge variant="outline">
                  {progressPercentage}% Complete
                </Badge>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {levelInfo.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {levelInfo.description}
              </p>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-primary mr-2" />
                  <span className="text-2xl font-bold text-primary">{learnedCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">Learned</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-6 w-6 text-accent mr-2" />
                  <span className="text-2xl font-bold text-accent">{studyingCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">Studying</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold text-muted-foreground">
                    {levelKanji.length - learnedCount - studyingCount}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Unexplored</p>
              </CardContent>
            </Card>
          </div>

          {/* Kanji Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {levelKanji.map((kanji) => {
              const status = getStatus(kanji.char);
              const statusColors = {
                learned: 'border-primary bg-primary/10',
                learning: 'border-accent bg-accent/10',
                not_visited: 'border-border hover:border-primary/50'
              };

              return (
                <Card
                  key={kanji.char}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${statusColors[status]}`}
                  onClick={() => setSelectedKanji(kanji)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-japanese-serif font-bold mb-2 text-foreground">
                      {kanji.char}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {kanji.meanings[0]}
                    </div>
                    {status !== 'not_visited' && (
                      <Badge
                        variant={status === 'learned' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {status === 'learned' ? 'Learned' : 'Learning'}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {levelKanji.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No kanji found for JLPT {currentLevel}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedKanji && (
        <KanjiDetailDialog entry={selectedKanji}>
          <div />
        </KanjiDetailDialog>
      )}
    </div>
  );
};

export default JLPTPage;