-- Create locations table for managing multiple restaurant locations
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  address JSONB,
  phone_number TEXT,
  timezone TEXT DEFAULT 'UTC',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policies for locations
CREATE POLICY "Users can view locations for their companies" 
ON public.locations 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id 
  FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company owners/admins can manage locations" 
ON public.locations 
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

-- Create setup_progress table to track onboarding steps
CREATE TABLE public.setup_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  step_key TEXT NOT NULL,
  step_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, step_key)
);

-- Enable RLS
ALTER TABLE public.setup_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for setup_progress
CREATE POLICY "Users can view setup progress for their companies" 
ON public.setup_progress 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id 
  FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company owners/admins can manage setup progress" 
ON public.setup_progress 
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

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  user_id UUID,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_logs
CREATE POLICY "Users can view activity logs for their companies" 
ON public.activity_logs 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id 
  FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Users can insert activity logs for their companies" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (company_id IN (
  SELECT user_companies.company_id 
  FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

-- Create pending_requests table
CREATE TABLE public.pending_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL, -- 'time_off', 'availability_change', 'shift_pickup', etc.
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  metadata JSONB DEFAULT '{}',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pending_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for pending_requests
CREATE POLICY "Users can view pending requests for their companies" 
ON public.pending_requests 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id 
  FROM user_companies 
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Users can create their own requests" 
ON public.pending_requests 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND company_id IN (
    SELECT user_companies.company_id 
    FROM user_companies 
    WHERE user_companies.user_id = auth.uid()
  )
);

CREATE POLICY "Company managers can update requests" 
ON public.pending_requests 
FOR UPDATE 
USING (company_id IN (
  SELECT user_companies.company_id 
  FROM user_companies 
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role IN ('owner', 'admin', 'manager')
));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_setup_progress_updated_at
  BEFORE UPDATE ON public.setup_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pending_requests_updated_at
  BEFORE UPDATE ON public.pending_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();