import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SakuraBackground } from "@/components/SakuraBackground";

export default function About() {
  return (
    <div className="min-h-screen bg-background paper-texture">
      <SakuraBackground />
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-japanese-serif font-bold text-primary">
              About JLPT Kanji Explorer
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master Japanese kanji characters with our interactive learning platform designed specifically for JLPT preparation.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-japanese-serif">
                  <span className="text-2xl">📚</span>
                  What is JLPT?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The Japanese Language Proficiency Test (JLPT) is the most widely recognized Japanese language test worldwide. 
                  It evaluates Japanese language proficiency for non-native speakers across five levels.
                </p>
                <div className="space-y-2">
                  {[
                    { level: "N5", description: "Basic level - 800+ kanji", difficulty: "Beginner" },
                    { level: "N4", description: "Elementary level - 1,500+ kanji", difficulty: "Elementary" },
                    { level: "N3", description: "Intermediate level - 3,000+ kanji", difficulty: "Intermediate" },
                    { level: "N2", description: "Upper intermediate - 6,000+ kanji", difficulty: "Advanced" },
                    { level: "N1", description: "Advanced level - 10,000+ kanji", difficulty: "Expert" }
                  ].map((item) => (
                    <div key={item.level} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{item.level}</Badge>
                        <span className="text-sm">{item.description}</span>
                      </div>
                      <Badge variant="secondary">{item.difficulty}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-japanese-serif">
                  <span className="text-2xl">✨</span>
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Interactive Cards:</strong> Click any kanji to explore detailed information including readings, meanings, and examples.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Audio Pronunciation:</strong> Native Japanese pronunciation for kanji readings with built-in text-to-speech.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Stroke Order:</strong> Visual stroke order diagrams to help you learn proper kanji writing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Search & Filter:</strong> Quickly find kanji by meaning, reading, or character with real-time search.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Example Words:</strong> Real-world usage examples with meanings to understand context.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Responsive Design:</strong> Works seamlessly on desktop, tablet, and mobile devices.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-japanese-serif">
                  <span className="text-2xl">🎯</span>
                  How to Use
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">1</Badge>
                    <span>Select your target JLPT level from the dropdown menu in the navigation.</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">2</Badge>
                    <span>Browse through the kanji cards or use the search function to find specific characters.</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">3</Badge>
                    <span>Click on any kanji card to open detailed information including readings and examples.</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">4</Badge>
                    <span>Use the audio buttons to hear correct pronunciation of readings and example words.</span>
                  </li>
                  <li className="flex gap-3">
                    <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center text-xs">5</Badge>
                    <span>Study the stroke order diagrams to learn proper writing technique.</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-japanese-serif">
                  <span className="text-2xl">💡</span>
                  Study Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span><strong>Start with Lower Levels:</strong> Master N5 and N4 kanji before moving to higher levels.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span><strong>Practice Writing:</strong> Use the stroke order diagrams to practice writing kanji by hand.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span><strong>Learn Readings:</strong> Pay attention to both On'yomi (Chinese) and Kun'yomi (Japanese) readings.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span><strong>Context Matters:</strong> Study example words to understand how kanji are used in real situations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary">•</span>
                    <span><strong>Regular Review:</strong> Consistently review previously learned kanji to maintain retention.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="text-center font-japanese-serif">
                <span className="text-3xl block mb-2">頑張って！</span>
                <span className="text-lg font-normal">Good luck with your Japanese studies!</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Remember, mastering kanji takes time and practice. Stay consistent, and you'll see progress!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}