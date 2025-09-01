import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type ProgressStatus = "new" | "learning" | "learned" | "mastered";

interface UserProgress {
  kanji: string;
  status: ProgressStatus;
  times_reviewed: number;
  difficulty_score: number;
  last_reviewed_at?: string;
}

export const useSupabaseProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(false);

  // Load progress from Supabase when user logs in
  useEffect(() => {
    if (user) {
      loadProgressFromSupabase();
    } else {
      setProgress({});
    }
  }, [user]);

  const loadProgressFromSupabase = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap: Record<string, UserProgress> = {};
      data?.forEach((item) => {
        progressMap[item.kanji] = {
          kanji: item.kanji,
          status: item.status as ProgressStatus,
          times_reviewed: item.times_reviewed,
          difficulty_score: item.difficulty_score,
          last_reviewed_at: item.last_reviewed_at,
        };
      });

      setProgress(progressMap);
    } catch (error: any) {
      console.error('Error loading progress:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (kanji: string, status: ProgressStatus, difficultyScore?: number) => {
    if (!user) {
      // For guests, just update local state
      setProgress(prev => ({
        ...prev,
        [kanji]: {
          kanji,
          status,
          times_reviewed: (prev[kanji]?.times_reviewed || 0) + 1,
          difficulty_score: difficultyScore || prev[kanji]?.difficulty_score || 0,
        }
      }));
      return;
    }

    try {
      const currentProgress = progress[kanji];
      const timesReviewed = (currentProgress?.times_reviewed || 0) + 1;
      
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          kanji,
          status,
          times_reviewed: timesReviewed,
          difficulty_score: difficultyScore || currentProgress?.difficulty_score || 0,
          last_reviewed_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Update local state
      setProgress(prev => ({
        ...prev,
        [kanji]: {
          kanji,
          status,
          times_reviewed: timesReviewed,
          difficulty_score: difficultyScore || currentProgress?.difficulty_score || 0,
          last_reviewed_at: new Date().toISOString(),
        }
      }));

      // Update user profile stats
      await updateProfileStats();
      
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast.error('Failed to save progress');
    }
  };

  const updateProfileStats = async () => {
    if (!user) return;

    try {
      const learnedCount = Object.values(progress).filter(
        p => p.status === 'learned' || p.status === 'mastered'
      ).length;

      const { error } = await supabase
        .from('profiles')
        .update({
          total_kanji_learned: learnedCount,
          last_study_date: new Date().toISOString().split('T')[0],
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating profile stats:', error);
    }
  };

  const getStatus = (kanji: string): ProgressStatus => {
    return progress[kanji]?.status || "new";
  };

  const getProgress = (kanji: string) => {
    return progress[kanji];
  };

  const getAllProgress = () => {
    return progress;
  };

  const getStats = () => {
    const progressArray = Object.values(progress);
    return {
      total: progressArray.length,
      new: progressArray.filter(p => p.status === 'new').length,
      learning: progressArray.filter(p => p.status === 'learning').length,
      learned: progressArray.filter(p => p.status === 'learned').length,
      mastered: progressArray.filter(p => p.status === 'mastered').length,
    };
  };

  return {
    progress: getAllProgress(),
    getStatus,
    getProgress,
    updateProgress,
    getStats,
    loading,
    isLoggedIn: !!user,
  };
};