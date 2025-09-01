import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecommendationRequest {
  userId: string;
  jlptLevel?: string;
  studyGoal?: string;
}

const serve_handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client with service role for database access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, jlptLevel = 'N5', studyGoal = 'general' }: RecommendationRequest = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log(`Generating study recommendations for user: ${userId}, JLPT level: ${jlptLevel}`);

    // Fetch user's progress from database
    const { data: userProgress, error: progressError } = await supabase
      .from('user_progress')
      .select('kanji, status, times_reviewed, difficulty_score')
      .eq('user_id', userId);

    if (progressError) {
      console.error('Database error:', progressError);
      throw new Error('Failed to fetch user progress');
    }

    // Fetch user profile for additional context
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_streak, total_kanji_learned, preferred_jlpt_level')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.warn('Profile fetch warning:', profileError);
    }

    const progressSummary = {
      totalStudied: userProgress?.length || 0,
      learned: userProgress?.filter(p => p.status === 'learned' || p.status === 'mastered').length || 0,
      learning: userProgress?.filter(p => p.status === 'learning').length || 0,
      struggling: userProgress?.filter(p => p.difficulty_score > 70).length || 0,
      currentStreak: profile?.current_streak || 0,
      totalKanjiLearned: profile?.total_kanji_learned || 0
    };

    const prompt = `As a Japanese language learning AI, analyze this student's progress and provide personalized study recommendations:

Student Profile:
- Target JLPT Level: ${jlptLevel}
- Study Goal: ${studyGoal}
- Current Streak: ${progressSummary.currentStreak} days
- Total Kanji Learned: ${progressSummary.totalKanjiLearned}

Progress Summary:
- Total Studied: ${progressSummary.totalStudied} kanji
- Learned/Mastered: ${progressSummary.learned} kanji
- Currently Learning: ${progressSummary.learning} kanji
- Struggling With: ${progressSummary.struggling} kanji

Provide:
1. 3-5 specific kanji recommendations for today's study
2. Focus areas (e.g., radicals, readings, vocabulary)
3. Study strategy suggestions
4. Motivation and encouragement
5. Estimated study time for today

Format as a helpful, encouraging response.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert Japanese language tutor who provides personalized, encouraging study recommendations.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = data.choices[0]?.message?.content;

    console.log('Successfully generated study recommendations');

    return new Response(JSON.stringify({ 
      recommendations,
      progressSummary,
      jlptLevel,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in ai-study-recommendations function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(serve_handler);