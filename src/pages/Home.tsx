import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { SakuraBackground } from "@/components/SakuraBackground";
import { BookOpen, Target, Trophy, Users } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-japanese-cream/20">
      <SakuraBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-japanese-serif font-bold text-primary mb-6 animate-fade-in">
            漢字の旅
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Master Japanese Kanji
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Embark on your journey to learn Japanese kanji with interactive stroke order animations, 
            audio pronunciation, and JLPT-structured lessons.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/learn">Start Learning</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">
            Why Choose Our Kanji Learning Platform?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover-scale">
              <CardContent className="p-6">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Interactive Learning</h4>
                <p className="text-muted-foreground">
                  Learn with animated stroke orders and interactive exercises
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover-scale">
              <CardContent className="p-6">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">JLPT Structured</h4>
                <p className="text-muted-foreground">
                  Organized by JLPT levels from N5 to N1 for systematic learning
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover-scale">
              <CardContent className="p-6">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Track Progress</h4>
                <p className="text-muted-foreground">
                  Monitor your learning journey with detailed progress tracking
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover-scale">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Audio Support</h4>
                <p className="text-muted-foreground">
                  Hear correct pronunciation with built-in audio features
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 text-center wave-pattern">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-4 text-foreground">
            Ready to Begin Your Kanji Journey?
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of learners mastering Japanese kanji step by step
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link to="/learn">Start Learning Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 Kanji Learning Platform. Made with ❤️ for Japanese learners.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;