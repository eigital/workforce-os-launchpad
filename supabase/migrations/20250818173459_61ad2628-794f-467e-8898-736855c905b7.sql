-- Add enhanced business metrics and shift feedback tables
CREATE TABLE public.business_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sales_amount NUMERIC(10,2) DEFAULT 0,
  labor_cost NUMERIC(10,2) DEFAULT 0,
  labor_percentage NUMERIC(5,2) DEFAULT 0,
  weather_condition TEXT,
  weather_temperature INTEGER,
  avg_shift_score NUMERIC(3,2) DEFAULT 0,
  total_hours_worked NUMERIC(8,2) DEFAULT 0,
  overtime_hours NUMERIC(8,2) DEFAULT 0,
  overtime_risk_level TEXT DEFAULT 'low',
  customer_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for business_metrics
ALTER TABLE public.business_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for business_metrics
CREATE POLICY "Users can view business metrics for their companies" 
ON public.business_metrics 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage business metrics" 
ON public.business_metrics 
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

-- Add shift feedback table enhancements
ALTER TABLE public.shift_feedback ADD COLUMN IF NOT EXISTS shift_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.shift_feedback ADD COLUMN IF NOT EXISTS manager_notes TEXT;
ALTER TABLE public.shift_feedback ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT false;
ALTER TABLE public.shift_feedback ADD COLUMN IF NOT EXISTS performance_category TEXT DEFAULT 'general';

-- Create email summaries table
CREATE TABLE public.email_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  summary_type TEXT NOT NULL DEFAULT 'daily',
  recipients TEXT[] NOT NULL DEFAULT '{}',
  content_data JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_by UUID,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for email_summaries
ALTER TABLE public.email_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for email_summaries
CREATE POLICY "Users can view email summaries for their companies" 
ON public.email_summaries 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage email summaries" 
ON public.email_summaries 
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

-- Add enhanced log entry types
ALTER TABLE public.log_entries ADD COLUMN IF NOT EXISTS entry_type TEXT DEFAULT 'general';
ALTER TABLE public.log_entries ADD COLUMN IF NOT EXISTS business_impact TEXT;
ALTER TABLE public.log_entries ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE public.log_entries ADD COLUMN IF NOT EXISTS assigned_to UUID;

-- Create triggers for updated_at
CREATE TRIGGER update_business_metrics_updated_at
  BEFORE UPDATE ON public.business_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_summaries_updated_at
  BEFORE UPDATE ON public.email_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_business_metrics_company_date ON public.business_metrics(company_id, date);
CREATE INDEX idx_email_summaries_company_date ON public.email_summaries(company_id, date);
CREATE INDEX idx_shift_feedback_shift_date ON public.shift_feedback(shift_date);