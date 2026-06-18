
-- Add admin to role enum if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'admin' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'admin';
  END IF;
END $$;

-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS daily_audio_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_audio_reset_date DATE NOT NULL DEFAULT CURRENT_DATE;

-- Admin can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Audio plays
CREATE TABLE IF NOT EXISTS public.audio_plays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kanji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audio_plays TO authenticated;
GRANT ALL ON public.audio_plays TO service_role;
ALTER TABLE public.audio_plays ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users insert own audio plays" ON public.audio_plays;
CREATE POLICY "Users insert own audio plays" ON public.audio_plays
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users view own audio plays" ON public.audio_plays;
CREATE POLICY "Users view own audio plays" ON public.audio_plays
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins view all audio plays" ON public.audio_plays;
CREATE POLICY "Admins view all audio plays" ON public.audio_plays
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Kanji searches
CREATE TABLE IF NOT EXISTS public.kanji_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  kanji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.kanji_searches TO authenticated;
GRANT INSERT ON public.kanji_searches TO anon;
GRANT ALL ON public.kanji_searches TO service_role;
ALTER TABLE public.kanji_searches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can log searches" ON public.kanji_searches;
CREATE POLICY "Anyone can log searches" ON public.kanji_searches
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Admins view all searches" ON public.kanji_searches;
CREATE POLICY "Admins view all searches" ON public.kanji_searches
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user to also fill email and full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1), 'Learner'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure profiles.user_id has unique constraint for ON CONFLICT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;
