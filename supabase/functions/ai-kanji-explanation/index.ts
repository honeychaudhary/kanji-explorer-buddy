import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KanjiRequest {
  kanji: string;
  context?: string;
}

const serve_handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { kanji, context }: KanjiRequest = await req.json();

    if (!kanji) {
      throw new Error('Kanji character is required');
    }

    console.log(`Generating explanation for kanji: ${kanji}`);

    const prompt = `You are a Japanese language expert. Provide a comprehensive explanation of the kanji "${kanji}".

Include:
1. Meaning and translation
2. Reading (hiragana/katakana for kun/on readings)
3. Stroke count
4. Radicals/components
5. Common vocabulary words using this kanji (3-5 examples with readings and meanings)
6. Memory tips or mnemonics
7. JLPT level (if applicable)
${context ? `8. Additional context: ${context}` : ''}

Format your response in clear, educational language suitable for language learners.`;

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
            content: 'You are a Japanese language tutor specializing in kanji education. Provide detailed, accurate, and helpful explanations.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const explanation = data.choices[0]?.message?.content;

    if (!explanation) {
      throw new Error('No explanation generated');
    }

    console.log('Successfully generated kanji explanation');

    return new Response(JSON.stringify({ 
      kanji,
      explanation,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in ai-kanji-explanation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(serve_handler);