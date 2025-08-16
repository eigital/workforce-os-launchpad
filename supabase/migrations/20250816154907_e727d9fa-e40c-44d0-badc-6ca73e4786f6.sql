-- Add new fields to profiles table for enhanced authentication
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auth_providers TEXT[] DEFAULT ARRAY['email']::TEXT[],
ADD COLUMN IF NOT EXISTS verification_required BOOLEAN DEFAULT false;

-- Add index for session expiry checks
CREATE INDEX IF NOT EXISTS idx_profiles_session_expires 
ON public.profiles(session_expires_at) 
WHERE session_expires_at IS NOT NULL;

-- Update the handle_new_user function to set session expiry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
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
    CASE 
      WHEN NEW.app_metadata ->> 'provider' = 'google' THEN ARRAY['google']::TEXT[]
      WHEN NEW.app_metadata ->> 'provider' = 'azure' THEN ARRAY['microsoft']::TEXT[]
      WHEN NEW.app_metadata ->> 'provider' = 'apple' THEN ARRAY['apple']::TEXT[]
      ELSE ARRAY['email']::TEXT[]
    END
  );
  RETURN NEW;
END;
$$;