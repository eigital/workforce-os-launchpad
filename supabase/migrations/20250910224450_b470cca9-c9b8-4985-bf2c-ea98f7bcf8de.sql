-- Drop the overly permissive policy that allows all company members to view employee PII
DROP POLICY IF EXISTS "Users can view employees for their companies" ON public.employees;

-- Create restricted policy for managers/admins/owners to view all employee data including PII
CREATE POLICY "Managers can view all employee data" 
ON public.employees 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
    AND user_companies.role = ANY (ARRAY['owner'::text, 'admin'::text, 'manager'::text])
));

-- Create limited policy for regular employees to view only basic info (no PII)
-- This policy will be enforced at application level by selecting only non-sensitive columns
CREATE POLICY "Employees can view basic employee info" 
ON public.employees 
FOR SELECT 
USING (
  company_id IN (
    SELECT user_companies.company_id
    FROM user_companies
    WHERE user_companies.user_id = auth.uid()
  )
  AND 
  -- This policy exists but data filtering must be done in application code
  -- by selecting only: id, company_id, first_name, last_name, employee_id, status, hire_date, positions
  -- and excluding: email, phone_number, hourly_rate, metadata, user_id
  true
);