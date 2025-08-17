-- Create payroll periods table
CREATE TABLE public.payroll_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'cancelled')),
  total_gross_pay NUMERIC DEFAULT 0,
  total_net_pay NUMERIC DEFAULT 0,
  total_taxes NUMERIC DEFAULT 0,
  total_deductions NUMERIC DEFAULT 0,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll entries table
CREATE TABLE public.payroll_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_period_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  regular_hours NUMERIC DEFAULT 0,
  overtime_hours NUMERIC DEFAULT 0,
  double_time_hours NUMERIC DEFAULT 0,
  regular_rate NUMERIC DEFAULT 0,
  overtime_rate NUMERIC DEFAULT 0,
  double_time_rate NUMERIC DEFAULT 0,
  gross_pay NUMERIC DEFAULT 0,
  net_pay NUMERIC DEFAULT 0,
  federal_tax NUMERIC DEFAULT 0,
  state_tax NUMERIC DEFAULT 0,
  social_security NUMERIC DEFAULT 0,
  medicare NUMERIC DEFAULT 0,
  other_deductions NUMERIC DEFAULT 0,
  bonuses NUMERIC DEFAULT 0,
  tips NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'calculated', 'paid')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll tax settings table
CREATE TABLE public.payroll_tax_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  state TEXT NOT NULL,
  federal_tax_rate NUMERIC DEFAULT 0,
  state_tax_rate NUMERIC DEFAULT 0,
  unemployment_rate NUMERIC DEFAULT 0,
  workers_comp_rate NUMERIC DEFAULT 0,
  social_security_rate NUMERIC DEFAULT 0.062,
  medicare_rate NUMERIC DEFAULT 0.0145,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_tax_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payroll_periods
CREATE POLICY "Company managers can manage payroll periods" 
ON public.payroll_periods 
FOR ALL 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role IN ('owner', 'admin', 'manager')
))
WITH CHECK (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role IN ('owner', 'admin', 'manager')
));

CREATE POLICY "Users can view payroll periods for their companies" 
ON public.payroll_periods 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

-- Create RLS policies for payroll_entries
CREATE POLICY "Company managers can manage payroll entries" 
ON public.payroll_entries 
FOR ALL 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role IN ('owner', 'admin', 'manager')
))
WITH CHECK (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role IN ('owner', 'admin', 'manager')
));

CREATE POLICY "Users can view payroll entries for their companies" 
ON public.payroll_entries 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

-- Create RLS policies for payroll_tax_settings
CREATE POLICY "Company owners/admins can manage tax settings" 
ON public.payroll_tax_settings 
FOR ALL 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role IN ('owner', 'admin')
))
WITH CHECK (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role IN ('owner', 'admin')
));

CREATE POLICY "Users can view tax settings for their companies" 
ON public.payroll_tax_settings 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

-- Create updated_at triggers
CREATE TRIGGER update_payroll_periods_updated_at
  BEFORE UPDATE ON public.payroll_periods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_entries_updated_at
  BEFORE UPDATE ON public.payroll_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_tax_settings_updated_at
  BEFORE UPDATE ON public.payroll_tax_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_payroll_periods_company_id ON public.payroll_periods(company_id);
CREATE INDEX idx_payroll_periods_status ON public.payroll_periods(status);
CREATE INDEX idx_payroll_periods_dates ON public.payroll_periods(period_start, period_end);

CREATE INDEX idx_payroll_entries_payroll_period_id ON public.payroll_entries(payroll_period_id);
CREATE INDEX idx_payroll_entries_employee_id ON public.payroll_entries(employee_id);
CREATE INDEX idx_payroll_entries_company_id ON public.payroll_entries(company_id);

CREATE INDEX idx_payroll_tax_settings_company_id ON public.payroll_tax_settings(company_id);