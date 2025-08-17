-- Create tip_pools table for managing tip pooling
CREATE TABLE public.tip_pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  location_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  pool_type TEXT NOT NULL CHECK (pool_type IN ('percentage', 'points', 'hours_worked', 'equal_split')),
  period_type TEXT NOT NULL DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'biweekly', 'monthly')),
  auto_sync_pos BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tip_pool_participants table for pool membership
CREATE TABLE public.tip_pool_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_pool_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  participation_type TEXT NOT NULL CHECK (participation_type IN ('contributor', 'receiver', 'both')),
  allocation_percentage DECIMAL(5,2),
  points_value INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tip_pool_id, employee_id)
);

-- Create tip_distributions table for tracking payouts
CREATE TABLE public.tip_distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_pool_id UUID NOT NULL,
  company_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_tips DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_distributed DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'calculated', 'distributed', 'finalized')),
  calculated_at TIMESTAMP WITH TIME ZONE,
  distributed_at TIMESTAMP WITH TIME ZONE,
  distributed_by UUID,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tip_payouts table for individual employee payouts
CREATE TABLE public.tip_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_distribution_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  amount DECIMAL(8,2) NOT NULL DEFAULT 0,
  calculation_method TEXT,
  hours_worked DECIMAL(5,2),
  points_earned INTEGER,
  percentage_share DECIMAL(5,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'calculated', 'paid', 'adjusted')),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tip_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_pool_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tip_pools
CREATE POLICY "Users can view tip pools for their companies" 
ON public.tip_pools 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage tip pools" 
ON public.tip_pools 
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

-- RLS Policies for tip_pool_participants
CREATE POLICY "Users can view tip pool participants for their companies" 
ON public.tip_pool_participants 
FOR SELECT 
USING (tip_pool_id IN (
  SELECT tp.id FROM tip_pools tp
  JOIN user_companies uc ON tp.company_id = uc.company_id
  WHERE uc.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage tip pool participants" 
ON public.tip_pool_participants 
FOR ALL
USING (tip_pool_id IN (
  SELECT tp.id FROM tip_pools tp
  JOIN user_companies uc ON tp.company_id = uc.company_id
  WHERE uc.user_id = auth.uid() 
  AND uc.role = ANY(ARRAY['owner', 'admin', 'manager'])
))
WITH CHECK (tip_pool_id IN (
  SELECT tp.id FROM tip_pools tp
  JOIN user_companies uc ON tp.company_id = uc.company_id
  WHERE uc.user_id = auth.uid() 
  AND uc.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

-- RLS Policies for tip_distributions
CREATE POLICY "Users can view tip distributions for their companies" 
ON public.tip_distributions 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage tip distributions" 
ON public.tip_distributions 
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

-- RLS Policies for tip_payouts
CREATE POLICY "Users can view tip payouts for their companies" 
ON public.tip_payouts 
FOR SELECT 
USING (tip_distribution_id IN (
  SELECT td.id FROM tip_distributions td
  JOIN user_companies uc ON td.company_id = uc.company_id
  WHERE uc.user_id = auth.uid()
));

CREATE POLICY "Company managers can manage tip payouts" 
ON public.tip_payouts 
FOR ALL
USING (tip_distribution_id IN (
  SELECT td.id FROM tip_distributions td
  JOIN user_companies uc ON td.company_id = uc.company_id
  WHERE uc.user_id = auth.uid() 
  AND uc.role = ANY(ARRAY['owner', 'admin', 'manager'])
))
WITH CHECK (tip_distribution_id IN (
  SELECT td.id FROM tip_distributions td
  JOIN user_companies uc ON td.company_id = uc.company_id
  WHERE uc.user_id = auth.uid() 
  AND uc.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

-- Add triggers for timestamp updates
CREATE TRIGGER update_tip_pools_updated_at
  BEFORE UPDATE ON public.tip_pools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tip_pool_participants_updated_at
  BEFORE UPDATE ON public.tip_pool_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tip_distributions_updated_at
  BEFORE UPDATE ON public.tip_distributions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tip_payouts_updated_at
  BEFORE UPDATE ON public.tip_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_tip_pools_company_id ON public.tip_pools(company_id);
CREATE INDEX idx_tip_pool_participants_pool_id ON public.tip_pool_participants(tip_pool_id);
CREATE INDEX idx_tip_pool_participants_employee_id ON public.tip_pool_participants(employee_id);
CREATE INDEX idx_tip_distributions_pool_id ON public.tip_distributions(tip_pool_id);
CREATE INDEX idx_tip_distributions_period ON public.tip_distributions(period_start, period_end);
CREATE INDEX idx_tip_payouts_distribution_id ON public.tip_payouts(tip_distribution_id);
CREATE INDEX idx_tip_payouts_employee_id ON public.tip_payouts(employee_id);