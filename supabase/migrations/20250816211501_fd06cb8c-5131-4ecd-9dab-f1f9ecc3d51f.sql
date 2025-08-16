-- Fix security issues in database

-- 1. Update function search paths for security
CREATE OR REPLACE FUNCTION public.is_company_owner(_user_id uuid, _company_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_companies
    WHERE user_id = _user_id 
      AND company_id = _company_id 
      AND role = 'owner'
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
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
  RETURN NEW;
END;
$function$;

-- 2. Make user_id non-nullable in onboarding_progress for data integrity
ALTER TABLE public.onboarding_progress 
ALTER COLUMN user_id SET NOT NULL;

-- 3. Add default value for user_id to prevent insertion issues
ALTER TABLE public.onboarding_progress 
ALTER COLUMN user_id SET DEFAULT auth.uid();