-- Create log categories table
CREATE TABLE public.log_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'FileText',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false,
  template_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create log entries table  
CREATE TABLE public.log_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  category_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift_time TIME,
  location_id UUID,
  department_id UUID,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'flagged')),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  last_modified_by UUID
);

-- Create shift feedback table
CREATE TABLE public.shift_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  log_entry_id UUID,
  employee_id UUID NOT NULL,
  shift_date DATE NOT NULL,
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  teamwork_rating INTEGER CHECK (teamwork_rating >= 1 AND teamwork_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  feedback_notes TEXT,
  recognition_points INTEGER DEFAULT 0,
  areas_for_improvement TEXT[],
  achievements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create log templates table
CREATE TABLE public.log_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  category_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_content TEXT NOT NULL,
  field_definitions JSONB DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.log_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for log_categories
CREATE POLICY "Users can view log categories for their companies" 
ON public.log_categories FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage log categories" 
ON public.log_categories FOR ALL 
USING (company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
))
WITH CHECK (company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

-- RLS Policies for log_entries
CREATE POLICY "Users can view log entries for their companies" 
ON public.log_entries FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Users can create log entries for their companies" 
ON public.log_entries FOR INSERT 
WITH CHECK (company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
) AND created_by = auth.uid());

CREATE POLICY "Users can update their own log entries" 
ON public.log_entries FOR UPDATE 
USING (created_by = auth.uid() OR company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

CREATE POLICY "Company managers can delete log entries" 
ON public.log_entries FOR DELETE 
USING (company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

-- RLS Policies for shift_feedback
CREATE POLICY "Users can view shift feedback for their companies" 
ON public.shift_feedback FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage shift feedback" 
ON public.shift_feedback FOR ALL 
USING (company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
))
WITH CHECK (company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

-- RLS Policies for log_templates
CREATE POLICY "Users can view log templates for their companies" 
ON public.log_templates FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage log templates" 
ON public.log_templates FOR ALL 
USING (company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
))
WITH CHECK (company_id IN (
  SELECT user_companies.company_id FROM user_companies 
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

-- Create triggers for updated_at
CREATE TRIGGER update_log_categories_updated_at
  BEFORE UPDATE ON public.log_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_log_entries_updated_at
  BEFORE UPDATE ON public.log_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shift_feedback_updated_at
  BEFORE UPDATE ON public.shift_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_log_templates_updated_at
  BEFORE UPDATE ON public.log_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default log categories
INSERT INTO public.log_categories (company_id, name, description, color, icon, created_by) VALUES
(gen_random_uuid(), 'Daily Sales', 'Track daily sales performance and revenue', '#10B981', 'DollarSign', gen_random_uuid()),
(gen_random_uuid(), 'Customer Feedback', 'Record customer complaints and compliments', '#3B82F6', 'MessageSquare', gen_random_uuid()),
(gen_random_uuid(), 'Staff Performance', 'Employee performance and behavior notes', '#8B5CF6', 'Users', gen_random_uuid()),
(gen_random_uuid(), 'Maintenance', 'Equipment and facility maintenance issues', '#F59E0B', 'Wrench', gen_random_uuid()),
(gen_random_uuid(), 'Inventory', 'Stock levels and inventory management', '#EF4444', 'Package', gen_random_uuid()),
(gen_random_uuid(), 'Safety', 'Safety incidents and protocols', '#DC2626', 'Shield', gen_random_uuid());