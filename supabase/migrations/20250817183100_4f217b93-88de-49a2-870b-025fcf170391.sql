-- Create tables for messaging, notifications, and announcements system

-- Channels table for group chats
CREATE TABLE public.channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  channel_type TEXT NOT NULL DEFAULT 'group', -- 'group', 'location', 'department', 'role'
  company_id UUID NOT NULL,
  location_id UUID,
  department_id UUID,
  created_by UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Channel members table
CREATE TABLE public.channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(channel_id, user_id)
);

-- Direct conversations table
CREATE TABLE public.direct_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID NOT NULL,
  participant_2 UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

-- Messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  sender_id UUID NOT NULL,
  channel_id UUID,
  conversation_id UUID,
  message_type TEXT DEFAULT 'text', -- 'text', 'file', 'image', 'system'
  file_url TEXT,
  file_name TEXT,
  metadata JSONB DEFAULT '{}',
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'system', 'message', 'announcement', 'schedule', 'timeoff'
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notification settings table
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  announcement_notifications BOOLEAN DEFAULT true,
  schedule_notifications BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Announcements table
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  company_id UUID NOT NULL,
  created_by UUID NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  target_audience TEXT DEFAULT 'all', -- 'all', 'location', 'department', 'role'
  target_location_id UUID,
  target_department_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Announcement recipients table
CREATE TABLE public.announcement_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_recipients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for channels
CREATE POLICY "Users can view channels for their companies" 
ON public.channels 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can create channels" 
ON public.channels 
FOR INSERT 
WITH CHECK (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

CREATE POLICY "Channel creators can update their channels" 
ON public.channels 
FOR UPDATE 
USING (created_by = auth.uid());

-- Create RLS policies for channel_members
CREATE POLICY "Users can view their channel memberships" 
ON public.channel_members 
FOR SELECT 
USING (user_id = auth.uid() OR channel_id IN (
  SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can join channels" 
ON public.channel_members 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their channel membership" 
ON public.channel_members 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create RLS policies for direct_conversations
CREATE POLICY "Users can view their conversations" 
ON public.direct_conversations 
FOR SELECT 
USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE POLICY "Users can create conversations" 
ON public.direct_conversations 
FOR INSERT 
WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in their channels/conversations" 
ON public.messages 
FOR SELECT 
USING (
  (channel_id IN (SELECT channel_id FROM channel_members WHERE user_id = auth.uid()))
  OR 
  (conversation_id IN (
    SELECT id FROM direct_conversations 
    WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()
  ))
);

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (sender_id = auth.uid());

-- Create RLS policies for notifications
CREATE POLICY "Users can view their notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create RLS policies for notification_settings
CREATE POLICY "Users can manage their notification settings" 
ON public.notification_settings 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create RLS policies for announcements
CREATE POLICY "Users can view announcements for their companies" 
ON public.announcements 
FOR SELECT 
USING (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid()
));

CREATE POLICY "Company managers can create announcements" 
ON public.announcements 
FOR INSERT 
WITH CHECK (company_id IN (
  SELECT user_companies.company_id
  FROM user_companies
  WHERE user_companies.user_id = auth.uid() 
  AND user_companies.role = ANY(ARRAY['owner', 'admin', 'manager'])
));

CREATE POLICY "Announcement creators can update their announcements" 
ON public.announcements 
FOR UPDATE 
USING (created_by = auth.uid());

-- Create RLS policies for announcement_recipients
CREATE POLICY "Users can view their announcement receipts" 
ON public.announcement_recipients 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can mark announcements as read" 
ON public.announcement_recipients 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their announcement receipts" 
ON public.announcement_recipients 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_channels_updated_at
BEFORE UPDATE ON public.channels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_direct_conversations_updated_at
BEFORE UPDATE ON public.direct_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();