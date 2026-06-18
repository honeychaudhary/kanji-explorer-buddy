import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AudioButtonProps {
  text: string;
  language?: 'ja' | 'en';
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  id?: string;
  children?: React.ReactNode;
}

export function AudioButton({ 
  text, 
  language = 'ja', 
  variant = "ghost", 
  size = "sm",
  className = "",
  id,
  children
}: AudioButtonProps) {
  const { speak, isPlaying, isLoading } = useTextToSpeech();
  const { user } = useAuth();
  
  const buttonId = id || text;
  const isCurrentlyPlaying = isPlaying === buttonId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(text, language, buttonId);
    if (user && language === 'ja') {
      supabase.from('audio_plays').insert({ user_id: user.id, kanji: text }).then(() => {});
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`${className} ${isCurrentlyPlaying ? 'text-primary' : ''}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isCurrentlyPlaying ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
      {children && <span className="ml-1">{children}</span>}
    </Button>
  );
}