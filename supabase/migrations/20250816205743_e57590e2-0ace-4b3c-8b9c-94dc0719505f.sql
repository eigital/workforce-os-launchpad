-- Fix companies table RLS policy to be more explicit
DROP POLICY IF EXISTS "Company owners can insert companies" ON public.companies;

CREATE POLICY "Authenticated users can insert companies" 
ON public.companies 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Ensure user_companies table has proper RLS for the current user
DROP POLICY IF EXISTS "Users can insert their company relationships" ON public.user_companies;

CREATE POLICY "Users can insert their company relationships" 
ON public.user_companies 
FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());