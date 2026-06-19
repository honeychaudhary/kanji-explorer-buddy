
-- Lock down user_roles: only admins may insert/delete/update roles
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- kanji_searches: replace permissive insert policy with user-scoped one
DROP POLICY IF EXISTS "Anyone can log searches" ON public.kanji_searches;

CREATE POLICY "Users insert own searches" ON public.kanji_searches
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own searches" ON public.kanji_searches
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
