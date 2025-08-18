-- Create time off types table
CREATE TABLE public.time_off_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  is_paid BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  max_consecutive_days INTEGER,
  advance_notice_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time off policies table
CREATE TABLE public.time_off_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  time_off_type_id UUID NOT NULL,
  accrual_method TEXT DEFAULT 'monthly', -- monthly, yearly, per_hour, unlimited
  accrual_rate NUMERIC DEFAULT 0, -- hours per period
  max_balance NUMERIC, -- maximum hours that can be accrued
  carry_over_limit NUMERIC DEFAULT 0, -- hours that can carry over to next year
  reset_date DATE, -- when balances reset (e.g., Jan 1)
  probation_period_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blocked days table
CREATE TABLE public.blocked_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  location_id UUID,
  department_id UUID,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time off requests table
CREATE TABLE public.time_off_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  time_off_type_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  total_hours NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, denied, cancelled
  reason TEXT,
  notes TEXT,
  attachment_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  review_notes TEXT,
  is_partial_day BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee time off balances table
CREATE TABLE public.employee_time_off_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  time_off_type_id UUID NOT NULL,
  accrued_hours NUMERIC DEFAULT 0,
  used_hours NUMERIC DEFAULT 0,
  pending_hours NUMERIC DEFAULT 0,
  balance_hours NUMERIC DEFAULT 0,
  carry_over_hours NUMERIC DEFAULT 0,
  year INTEGER NOT NULL,
  last_accrual_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, time_off_type_id, year)
);

-- Enable RLS on all tables
ALTER TABLE public.time_off_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_time_off_balances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for time_off_types
CREATE POLICY "Company managers can manage time off types"
ON public.time_off_types
FOR ALL
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
))
WITH CHECK (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

CREATE POLICY "Users can view time off types for their companies"
ON public.time_off_types
FOR SELECT
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

-- Create RLS policies for time_off_policies
CREATE POLICY "Company managers can manage time off policies"
ON public.time_off_policies
FOR ALL
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
))
WITH CHECK (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

CREATE POLICY "Users can view time off policies for their companies"
ON public.time_off_policies
FOR SELECT
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

-- Create RLS policies for blocked_days
CREATE POLICY "Company managers can manage blocked days"
ON public.blocked_days
FOR ALL
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
))
WITH CHECK (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

CREATE POLICY "Users can view blocked days for their companies"
ON public.blocked_days
FOR SELECT
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

-- Create RLS policies for time_off_requests
CREATE POLICY "Users can create their own time off requests"
ON public.time_off_requests
FOR INSERT
WITH CHECK (
  employee_id IN (
    SELECT employees.id
    FROM employees
    WHERE employees.user_id = auth.uid()
  )
  AND company_id IN (
    SELECT user_companies.company_id
    FROM user_companies
    WHERE user_companies.user_id = auth.uid()
  )
);

CREATE POLICY "Company managers can manage time off requests"
ON public.time_off_requests
FOR ALL
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

CREATE POLICY "Users can view time off requests for their companies"
ON public.time_off_requests
FOR SELECT
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

-- Create RLS policies for employee_time_off_balances
CREATE POLICY "Company managers can manage time off balances"
ON public.employee_time_off_balances
FOR ALL
USING (employee_id IN (
  SELECT employees.id
  FROM employees
  JOIN user_companies ON employees.company_id = user_companies.company_id
  WHERE user_companies.user_id = auth.uid()
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
))
WITH CHECK (employee_id IN (
  SELECT employees.id
  FROM employees
  JOIN user_companies ON employees.company_id = user_companies.company_id
  WHERE user_companies.user_id = auth.uid()
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

CREATE POLICY "Users can view time off balances for their companies"
ON public.employee_time_off_balances
FOR SELECT
USING (employee_id IN (
  SELECT employees.id
  FROM employees
  JOIN user_companies ON employees.company_id = user_companies.company_id
  WHERE user_companies.user_id = auth.uid()
));

-- Create updated_at triggers
CREATE TRIGGER update_time_off_types_updated_at
BEFORE UPDATE ON public.time_off_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_off_policies_updated_at
BEFORE UPDATE ON public.time_off_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blocked_days_updated_at
BEFORE UPDATE ON public.blocked_days
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_off_requests_updated_at
BEFORE UPDATE ON public.time_off_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_time_off_balances_updated_at
BEFORE UPDATE ON public.employee_time_off_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();