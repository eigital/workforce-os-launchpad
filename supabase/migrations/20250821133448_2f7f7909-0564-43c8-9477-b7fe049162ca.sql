-- Fix the function search path security issue by setting search_path for our validation function
CREATE OR REPLACE FUNCTION validate_company_id()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if company_id is the null UUID pattern
  IF NEW.company_id = '00000000-0000-0000-0000-000000000000' THEN
    RAISE EXCEPTION 'Invalid company_id: cannot use null UUID pattern';
  END IF;
  
  -- Check if company_id exists in companies table (optional but recommended)
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = NEW.company_id) THEN
    RAISE EXCEPTION 'Invalid company_id: company does not exist';
  END IF;
  
  RETURN NEW;
END;
$$;