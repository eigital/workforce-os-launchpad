import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Bell, Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import MessagesPanel from './MessagesPanel';
import NotificationsPanel from './NotificationsPanel';
import AnnouncementsPanel from './AnnouncementsPanel';
import ChatInterface from './ChatInterface';

const CommunicationHeader: React.FC = () => {
  const [unreadCounts, setUnreadCounts] = useState({
    messages: 0,
    notifications: 0,
    announcements: 0
  });

  const [activePanel, setActivePanel] = useState<'messages' | 'notifications' | 'announcements' | null>(null);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [activeChatType, setActiveChatType] = useState<'channel' | 'direct'>('channel');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCounts();
    setupRealtimeSubscriptions();
  }, []);

  const fetchUnreadCounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch unread notifications count
      const { count: notificationsCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .is('read_at', null);

      // Fetch unread announcements count
      const { data: unreadAnnouncements } = await supabase
        .from('announcements')
        .select('id');

      const announcementsCount = unreadAnnouncements?.length || 0;

      // TODO: Implement unread messages count logic
      const messagesCount = 0;

      setUnreadCounts({
        messages: messagesCount,
        notifications: notificationsCount || 0,
        announcements: announcementsCount
      });
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const setupRealtimeSubscriptions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Subscribe to notifications changes
    const notificationsChannel = supabase
      .channel('notifications_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchUnreadCounts();
        }
      )
      .subscribe();

    // Subscribe to announcements changes
    const announcementsChannel = supabase
      .channel('announcements_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        () => {
          fetchUnreadCounts();
        }
      )
      .subscribe();

    // Subscribe to messages changes
    const messagesChannel = supabase
      .channel('messages_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchUnreadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(announcementsChannel);
      supabase.removeChannel(messagesChannel);
    };
  };

  const handlePanelToggle = (panel: 'messages' | 'notifications' | 'announcements') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const handleOpenChat = (chatId: string, chatType: 'channel' | 'direct') => {
    setActiveChatId(chatId);
    setActiveChatType(chatType);
    setIsChatOpen(true);
    setActivePanel(null);
  };

  const getTotalUnread = () => {
    return unreadCounts.messages + unreadCounts.notifications + unreadCounts.announcements;
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Messages Button */}
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={() => handlePanelToggle('messages')}
        >
          <MessageCircle className="h-5 w-5" />
          {unreadCounts.messages > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCounts.messages > 99 ? '99+' : unreadCounts.messages}
            </Badge>
          )}
        </Button>

        {/* Notifications Button */}
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={() => handlePanelToggle('notifications')}
        >
          <Bell className="h-5 w-5" />
          {unreadCounts.notifications > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCounts.notifications > 99 ? '99+' : unreadCounts.notifications}
            </Badge>
          )}
        </Button>

        {/* Announcements Button */}
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={() => handlePanelToggle('announcements')}
        >
          <Megaphone className="h-5 w-5" />
          {unreadCounts.announcements > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCounts.announcements > 99 ? '99+' : unreadCounts.announcements}
            </Badge>
          )}
        </Button>
      </div>

      {/* Panels */}
      <MessagesPanel
        isOpen={activePanel === 'messages'}
        onClose={() => setActivePanel(null)}
        onOpenChat={handleOpenChat}
      />

      <NotificationsPanel
        isOpen={activePanel === 'notifications'}
        onClose={() => setActivePanel(null)}
      />

      <AnnouncementsPanel
        isOpen={activePanel === 'announcements'}
        onClose={() => setActivePanel(null)}
      />

      {/* Chat Interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatId={activeChatId}
        chatType={activeChatType}
      />
    </>
  );
};

export default CommunicationHeader;