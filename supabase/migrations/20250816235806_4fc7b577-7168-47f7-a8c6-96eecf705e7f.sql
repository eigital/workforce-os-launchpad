-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policies for departments
CREATE POLICY "Users can view departments for their companies" 
ON public.departments 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id 
  FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage departments" 
ON public.departments 
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

-- Create positions table
CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  department_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#F3F4F6',
  hourly_rate DECIMAL(8,2),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

-- Create policies for positions
CREATE POLICY "Users can view positions for their companies" 
ON public.positions 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id 
  FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage positions" 
ON public.positions 
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

-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  user_id UUID, -- Link to profiles table if they have an account
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  employee_id TEXT,
  hire_date DATE,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'terminated'
  positions UUID[] DEFAULT '{}', -- Array of position IDs
  hourly_rate DECIMAL(8,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policies for employees
CREATE POLICY "Users can view employees for their companies" 
ON public.employees 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id 
  FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage employees" 
ON public.employees 
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

-- Create schedules table
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  location_id UUID,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for schedules
CREATE POLICY "Users can view schedules for their companies" 
ON public.schedules 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id 
  FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage schedules" 
ON public.schedules 
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

-- Create shifts table
CREATE TABLE public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL,
  employee_id UUID,
  position_id UUID NOT NULL,
  location_id UUID,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INTEGER DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'open', 'picked_up', 'completed', 'no_show'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Create policies for shifts
CREATE POLICY "Users can view shifts for their companies" 
ON public.shifts 
FOR SELECT 
USING (schedule_id IN (
  SELECT schedules.id 
  FROM schedules 
  JOIN user_companies ON schedules.company_id = user_companies.company_id
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage shifts" 
ON public.shifts 
FOR ALL 
USING (schedule_id IN (
  SELECT schedules.id 
  FROM schedules 
  JOIN user_companies ON schedules.company_id = user_companies.company_id
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role IN ('owner', 'admin', 'manager')
))
WITH CHECK (schedule_id IN (
  SELECT schedules.id 
  FROM schedules 
  JOIN user_companies ON schedules.company_id = user_companies.company_id
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role IN ('owner', 'admin', 'manager')
));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON public.positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
  BEFORE UPDATE ON public.shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default departments and positions for new companies
INSERT INTO public.departments (company_id, name, color, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Back of House', '#374151', 1),
  ('00000000-0000-0000-0000-000000000000', 'Front of House', '#374151', 2);

-- Note: The above is just a template. In practice, these would be created when a company is set up