-- Create security definer function to check if user is company owner
CREATE OR REPLACE FUNCTION public.is_company_owner(_user_id uuid, _company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_companies
    WHERE user_id = _user_id 
      AND company_id = _company_id 
      AND role = 'owner'
  );
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Company owners can manage user relationships" ON public.user_companies;

-- Create new policy using the security definer function
CREATE POLICY "Company owners can manage user relationships" 
ON public.user_companies 
FOR ALL 
TO authenticated
USING (public.is_company_owner(auth.uid(), company_id))
WITH CHECK (public.is_company_owner(auth.uid(), company_id));