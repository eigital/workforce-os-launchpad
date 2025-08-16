-- Comprehensive security and RLS fixes (corrected)

-- 1. Fix companies RLS policy to allow authenticated users to create companies
DROP POLICY IF EXISTS "Authenticated users can insert companies" ON public.companies;

CREATE POLICY "Authenticated users can insert companies" 
ON public.companies 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Fix remaining database security issues
-- Update function to have proper search path (this was missed in previous migration)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 3. Ensure proper RLS on onboarding_progress for user isolation
DROP POLICY IF EXISTS "Users can manage their onboarding progress" ON public.onboarding_progress;

CREATE POLICY "Users can manage their onboarding progress" 
ON public.onboarding_progress 
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Add index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON public.user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON public.onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);

-- 5. Add timezone field to profiles table for auto-detection
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';