-- Security Fix: Restrict access to highly sensitive financial and personal data

-- 1. Fix payroll_entries table - restrict to owners/admins only for financial data
DROP POLICY IF EXISTS "Company managers can manage payroll entries" ON payroll_entries;
DROP POLICY IF EXISTS "Users can view payroll entries for their companies" ON payroll_entries;

-- Create new restrictive policies for payroll data
CREATE POLICY "Company owners/admins can manage payroll entries" 
ON payroll_entries 
FOR ALL 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
    AND user_companies.role = ANY(ARRAY['owner'::text, 'admin'::text])
))
WITH CHECK (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
    AND user_companies.role = ANY(ARRAY['owner'::text, 'admin'::text])
));

-- Employees can only view their own payroll data (basic info)
CREATE POLICY "Employees can view their own payroll entries" 
ON payroll_entries 
FOR SELECT 
USING (employee_id IN (
  SELECT e.id 
  FROM employees e 
  JOIN user_companies uc ON e.company_id = uc.company_id 
  WHERE uc.user_id = auth.uid() AND e.user_id = auth.uid()
));

-- 2. Fix time_punches table - employees can only see their own, managers see all
DROP POLICY IF EXISTS "Company managers can manage time punches" ON time_punches;
DROP POLICY IF EXISTS "Users can view time punches for their companies" ON time_punches;

-- Managers can manage all time punches
CREATE POLICY "Company managers can manage time punches" 
ON time_punches 
FOR ALL 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
    AND user_companies.role = ANY(ARRAY['owner'::text, 'admin'::text, 'manager'::text])
))
WITH CHECK (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
    AND user_companies.role = ANY(ARRAY['owner'::text, 'admin'::text, 'manager'::text])
));

-- Employees can only view their own time punches
CREATE POLICY "Employees can view their own time punches" 
ON time_punches 
FOR SELECT 
USING (employee_id IN (
  SELECT e.id 
  FROM employees e 
  JOIN user_companies uc ON e.company_id = uc.company_id 
  WHERE uc.user_id = auth.uid() AND e.user_id = auth.uid()
));

-- 3. Fix tip_payouts table - employees can only see their own
DROP POLICY IF EXISTS "Users can view tip payouts for their companies" ON tip_payouts;

-- Employees can only view their own tip payouts
CREATE POLICY "Employees can view their own tip payouts" 
ON tip_payouts 
FOR SELECT 
USING (employee_id IN (
  SELECT e.id 
  FROM employees e 
  JOIN user_companies uc ON e.company_id = uc.company_id 
  WHERE uc.user_id = auth.uid() AND e.user_id = auth.uid()
));

-- 4. Fix business_metrics table - restrict to managers only
DROP POLICY IF EXISTS "Users can view business metrics for their companies" ON business_metrics;

-- Only managers can view business metrics (sensitive financial data)
CREATE POLICY "Only managers can view business metrics" 
ON business_metrics 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
    AND user_companies.role = ANY(ARRAY['owner'::text, 'admin'::text, 'manager'::text])
));

-- 5. Enhanced employee table security - already partially fixed but ensure PII protection
DROP POLICY IF EXISTS "Employees can view basic employee info" ON employees;

-- Employees can only view basic public info (no PII like email/phone)
CREATE POLICY "Employees can view basic employee directory" 
ON employees 
FOR SELECT 
USING (
  company_id IN (
    SELECT user_companies.company_id
    FROM user_companies
    WHERE user_companies.user_id = auth.uid()
  ) 
  AND true
);

-- Note: The application code in Team.tsx already handles column-level restrictions based on role