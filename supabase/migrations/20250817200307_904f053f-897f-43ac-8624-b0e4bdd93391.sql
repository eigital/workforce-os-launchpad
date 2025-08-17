-- Fix RLS policy for companies table to allow initial company creation
DROP POLICY IF EXISTS "Users can insert companies during onboarding" ON public.companies;

CREATE POLICY "Users can insert companies during onboarding" ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Update handle_new_user function to create company from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_company_id uuid;
BEGIN
  -- Insert into profiles first
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name,
    session_expires_at,
    auth_providers
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NOW() + INTERVAL '6 hours',
    ARRAY['email']::TEXT[]
  );

  -- Create company if company data exists in metadata
  IF NEW.raw_user_meta_data ? 'company_name' THEN
    INSERT INTO public.companies (
      name,
      industry,
      size_range,
      phone_number,
      location_count,
      settings
    )
    VALUES (
      NEW.raw_user_meta_data ->> 'company_name',
      NEW.raw_user_meta_data ->> 'industry',
      NEW.raw_user_meta_data ->> 'company_size',
      NEW.raw_user_meta_data ->> 'phone_number',
      COALESCE((NEW.raw_user_meta_data ->> 'location_count')::integer, 1),
      COALESCE(NEW.raw_user_meta_data::jsonb - 'company_name' - 'industry' - 'company_size' - 'phone_number' - 'location_count', '{}')
    )
    RETURNING id INTO new_company_id;

    -- Link user to company as owner
    INSERT INTO public.user_companies (user_id, company_id, role)
    VALUES (NEW.id, new_company_id, 'owner');
  END IF;

  RETURN NEW;
END;
$function$;

-- Add business setup table for enhanced onboarding
CREATE TABLE IF NOT EXISTS public.business_setup (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  business_goals text[] DEFAULT '{}',
  job_role text,
  business_type text,
  current_tools text[],
  pos_system text,
  payroll_method text,
  scheduling_preferences jsonb DEFAULT '{}',
  ein text,
  setup_completed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.business_setup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can manage business setup" ON public.business_setup
FOR ALL USING (
  company_id IN (
    SELECT company_id FROM user_companies 
    WHERE user_id = auth.uid() AND role = ANY(ARRAY['owner', 'admin'])
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_business_setup_updated_at
  BEFORE UPDATE ON public.business_setup
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();