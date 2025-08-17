-- Create time_punches table for tracking employee clock ins/outs
CREATE TABLE public.time_punches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  location_id UUID,
  punch_type TEXT NOT NULL CHECK (punch_type IN ('clock_in', 'clock_out', 'break_start', 'break_end')),
  punch_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  punch_method TEXT DEFAULT 'manual' CHECK (punch_method IN ('manual', 'mobile', 'kiosk', 'biometric')),
  notes TEXT,
  gps_coordinates JSONB,
  photo_url TEXT,
  ip_address INET,
  device_info JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'edited')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  edited_by UUID,
  edited_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create timesheets table for managing weekly/period timesheets
CREATE TABLE public.timesheets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  location_id UUID,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours DECIMAL(5,2) DEFAULT 0,
  regular_hours DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  break_hours DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'submitted_to_payroll')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.time_punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_punches
CREATE POLICY "Users can view time punches for their companies" 
ON public.time_punches 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage time punches" 
ON public.time_punches 
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

-- RLS Policies for timesheets
CREATE POLICY "Users can view timesheets for their companies" 
ON public.timesheets 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage timesheets" 
ON public.timesheets 
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

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_time_punches_updated_at
  BEFORE UPDATE ON public.time_punches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timesheets_updated_at
  BEFORE UPDATE ON public.timesheets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_time_punches_employee_id ON public.time_punches(employee_id);
CREATE INDEX idx_time_punches_company_id ON public.time_punches(company_id);
CREATE INDEX idx_time_punches_punch_time ON public.time_punches(punch_time);
CREATE INDEX idx_timesheets_employee_id ON public.timesheets(employee_id);
CREATE INDEX idx_timesheets_company_id ON public.timesheets(company_id);
CREATE INDEX idx_timesheets_period ON public.timesheets(period_start, period_end);