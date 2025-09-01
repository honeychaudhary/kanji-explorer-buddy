-- Fix critical security vulnerability: Restrict profile access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure policies that follow the principle of least privilege
-- Allow users to view only their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Keep the existing update and insert policies as they are already secure
-- Users can update their own profile
-- Users can insert their own profile