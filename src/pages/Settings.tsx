import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SakuraBackground } from "@/components/SakuraBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, Settings as SettingsIcon, User, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceCharacter {
  id: string;
  name: string;
  description: string;
  gender: "male" | "female";
  age: "young" | "adult" | "elder";
  personality: string;
  premium?: boolean;
}

const voiceCharacters: VoiceCharacter[] = [
  {
    id: "akira",
    name: "明 (Akira)",
    description: "Young student voice, clear and energetic",
    gender: "male",
    age: "young",
    personality: "Enthusiastic and encouraging"
  },
  {
    id: "yuki",
    name: "雪 (Yuki)",
    description: "Gentle female voice, perfect for learning",
    gender: "female",
    age: "young",
    personality: "Patient and nurturing"
  },
  {
    id: "sensei",
    name: "先生 (Sensei)",
    description: "Experienced teacher voice, authoritative",
    gender: "male",
    age: "adult",
    personality: "Professional and knowledgeable"
  },
  {
    id: "sakura",
    name: "桜 (Sakura)",
    description: "Sweet and melodic voice",
    gender: "female",
    age: "young",
    personality: "Cheerful and motivating"
  },
  {
    id: "takeshi",
    name: "武 (Takeshi)",
    description: "Deep and confident voice",
    gender: "male",
    age: "adult",
    personality: "Strong and determined",
    premium: true
  },
  {
    id: "hanako",
    name: "花子 (Hanako)",
    description: "Traditional and elegant voice",
    gender: "female",
    age: "adult",
    personality: "Graceful and wise",
    premium: true
  }
];

const SettingsPage = () => {
  const [selectedVoice, setSelectedVoice] = useState("yuki");
  const [volume, setVolume] = useState(0.8);
  const { toast } = useToast();

  const handleVoiceSelect = (voiceId: string) => {
    const voice = voiceCharacters.find(v => v.id === voiceId);
    if (voice?.premium) {
      toast({
        title: "Premium Feature",
        description: "This voice character is available for premium users only.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedVoice(voiceId);
    toast({
      title: "Voice Updated",
      description: `Selected voice: ${voice?.name}`,
    });
  };

  const testVoice = (voiceId: string) => {
    const voice = voiceCharacters.find(v => v.id === voiceId);
    toast({
      title: "Testing Voice",
      description: `"こんにちは! ${voice?.name} です。よろしくお願いします！"`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-japanese-cream/20">
      <SakuraBackground />
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
            Voice & Audio Settings
          </h1>

          {/* Audio Settings */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-6 w-6 text-primary" />
                Audio Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Master Volume</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground min-w-[3rem]">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice Characters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Voice Characters
                <Badge variant="outline" className="ml-auto">
                  Japanese Native Speakers
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {voiceCharacters.map((voice) => (
                  <Card 
                    key={voice.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedVoice === voice.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-accent/5'
                    }`}
                    onClick={() => handleVoiceSelect(voice.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            {voice.name}
                            {voice.premium && <Crown className="h-4 w-4 text-japanese-gold" />}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {voice.description}
                          </p>
                        </div>
                        {selectedVoice === voice.id && (
                          <Badge variant="default" className="ml-2">
                            Selected
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {voice.gender}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {voice.age}
                        </Badge>
                        {voice.premium && (
                          <Badge variant="outline" className="text-xs bg-japanese-gold/10 text-japanese-gold border-japanese-gold/20">
                            Premium
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3">
                        Personality: {voice.personality}
                      </p>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          testVoice(voice.id);
                        }}
                        className="w-full"
                      >
                        <Volume2 className="h-3 w-3 mr-1" />
                        Test Voice
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <SettingsIcon className="h-4 w-4" />
                  Voice Features
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Natural Japanese pronunciation with proper pitch accent</li>
                  <li>• Different speaking styles for various learning contexts</li>
                  <li>• Adjustable speaking speed (coming soon)</li>
                  <li>• Regional accent variations (premium feature)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;