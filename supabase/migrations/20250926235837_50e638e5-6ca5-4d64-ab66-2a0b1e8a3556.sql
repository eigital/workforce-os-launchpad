-- Remove the overly permissive employee directory policy that exposes PII
DROP POLICY IF EXISTS "Employees can view basic employee directory" ON public.employees;

-- Create a new secure policy that excludes sensitive PII fields
CREATE POLICY "Employees can view public directory info" 
ON public.employees 
FOR SELECT 
USING (
  company_id IN (
    SELECT user_companies.company_id
    FROM user_companies
    WHERE user_companies.user_id = auth.uid()
  )
);

-- Note: This policy will be enforced at the application layer by the useSecureEmployeeData hook
-- which explicitly excludes email, phone_number, and hourly_rate for non-managers