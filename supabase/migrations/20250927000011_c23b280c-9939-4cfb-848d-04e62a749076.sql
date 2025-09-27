-- Create security definer function to check channel membership without recursion
CREATE OR REPLACE FUNCTION public.is_channel_member(_user_id uuid, _channel_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.channel_members
    WHERE user_id = _user_id 
      AND channel_id = _channel_id
  );
$$;

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view their channel memberships" ON public.channel_members;

-- Create new non-recursive policy using the security definer function
CREATE POLICY "Users can view channel memberships" 
ON public.channel_members 
FOR SELECT 
USING (user_id = auth.uid());