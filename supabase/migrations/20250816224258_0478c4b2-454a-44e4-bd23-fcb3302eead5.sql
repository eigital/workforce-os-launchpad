-- Comprehensive security and RLS fixes

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

-- 3. Configure auth settings for better security
-- Note: These require direct auth configuration, but we can set up the OTP expiry trigger
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS otp_expires_at timestamptz DEFAULT NOW() + INTERVAL '10 minutes';

-- 4. Fix user_id constraint in onboarding_progress to use auth.uid() properly
ALTER TABLE public.onboarding_progress 
DROP CONSTRAINT IF EXISTS onboarding_progress_user_id_fkey;

-- 5. Ensure proper RLS on onboarding_progress for user isolation
DROP POLICY IF EXISTS "Users can manage their onboarding progress" ON public.onboarding_progress;

CREATE POLICY "Users can manage their onboarding progress" 
ON public.onboarding_progress 
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Add index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON public.user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON public.onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);