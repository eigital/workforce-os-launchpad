-- Clean up invalid departments and their associated positions
-- First, delete positions associated with invalid departments
DELETE FROM positions 
WHERE department_id IN (
  SELECT id FROM departments 
  WHERE company_id = '00000000-0000-0000-0000-000000000000'
);

-- Then delete the invalid departments
DELETE FROM departments 
WHERE company_id = '00000000-0000-0000-0000-000000000000';

-- Add validation to prevent future invalid company_id insertions
-- Create a function to validate company_id
CREATE OR REPLACE FUNCTION validate_company_id()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Add validation triggers for departments and positions
DROP TRIGGER IF EXISTS validate_department_company_id ON departments;
CREATE TRIGGER validate_department_company_id
  BEFORE INSERT OR UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION validate_company_id();

DROP TRIGGER IF EXISTS validate_position_company_id ON positions;
CREATE TRIGGER validate_position_company_id
  BEFORE INSERT OR UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION validate_company_id();