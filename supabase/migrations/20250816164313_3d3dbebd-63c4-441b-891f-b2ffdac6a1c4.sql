-- Fix the handle_new_user function to remove app_metadata dependency
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
    ARRAY['email']::TEXT[]  -- Default to email, will be updated later if needed
  );
  RETURN NEW;
END;
$function$;