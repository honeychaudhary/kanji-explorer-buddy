import { useState } from "react";

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const speak = async (text: string, language: 'ja' | 'en' = 'ja', id?: string) => {
    if (isPlaying === id) {
      // Stop current speech
      window.speechSynthesis.cancel();
      setIsPlaying(null);
      return;
    }

    try {
      setIsLoading(true);
      setIsPlaying(id || text);

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ja' ? 'ja-JP' : 'en-US';
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find a Japanese voice for Japanese text
      if (language === 'ja') {
        const voices = window.speechSynthesis.getVoices();
        const japaneseVoice = voices.find(voice => 
          voice.lang.startsWith('ja') || voice.name.includes('Japanese')
        );
        if (japaneseVoice) {
          utterance.voice = japaneseVoice;
        }
      }

      utterance.onend = () => {
        setIsPlaying(null);
        setIsLoading(false);
      };

      utterance.onerror = () => {
        setIsPlaying(null);
        setIsLoading(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsLoading(false);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsPlaying(null);
      setIsLoading(false);
    }
  };

  return {
    speak,
    isPlaying,
    isLoading,
    stop: () => {
      window.speechSynthesis.cancel();
      setIsPlaying(null);
    }
  };
}