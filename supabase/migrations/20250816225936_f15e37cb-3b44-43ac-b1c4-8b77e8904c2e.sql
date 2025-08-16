-- Update the RLS policy for companies to be more permissive during onboarding
-- First drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can insert companies" ON public.companies;

-- Create a more permissive policy that allows inserts when user is authenticated and during onboarding
CREATE POLICY "Users can insert companies during onboarding" 
ON public.companies 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Allow if user doesn't have any companies yet (first time onboarding)
    NOT EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_id = auth.uid()
    )
    OR
    -- Allow if user is a company owner (for additional companies)
    EXISTS (
      SELECT 1 FROM public.user_companies 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
);