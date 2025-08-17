import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip, Smile, MoreVertical, Hash, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  chatType: 'channel' | 'direct';
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message_type: string;
  created_at: string;
  edited_at?: string;
}

interface ChatInfo {
  id: string;
  name: string;
  description?: string;
  member_count?: number;
  is_online?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose, chatId, chatType }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && chatId) {
      initializeChat();
      setupRealtimeSubscription();
    }
    return () => {
      // Cleanup subscription
    };
  }, [isOpen, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      if (chatType === 'channel') {
        await fetchChannelInfo();
        await fetchChannelMessages();
      } else {
        await fetchDirectConversationInfo();
        await fetchDirectMessages();
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelInfo = async () => {
    const { data, error } = await supabase
      .from('channels')
      .select(`
        *,
        channel_members(count)
      `)
      .eq('id', chatId)
      .single();

    if (error) throw error;

    setChatInfo({
      id: data.id,
      name: data.name,
      description: data.description,
      member_count: data.channel_members?.length || 0
    });
  };

  const fetchDirectConversationInfo = async () => {
    const { data, error } = await supabase
      .from('direct_conversations')
      .select('*')
      .eq('id', chatId)
      .single();

    if (error) throw error;

    // TODO: Fetch the other participant's info
    setChatInfo({
      id: data.id,
      name: 'Direct Message',
      is_online: false // TODO: Implement online status
    });
  };

  const fetchChannelMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', chatId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;

    const processedMessages = data?.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender_id: msg.sender_id,
      sender_name: 'User',
      message_type: msg.message_type,
      created_at: msg.created_at,
      edited_at: msg.edited_at
    })) || [];

    setMessages(processedMessages);
  };

  const fetchDirectMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', chatId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;

    const processedMessages = data?.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender_id: msg.sender_id,
      sender_name: 'User',
      message_type: msg.message_type,
      created_at: msg.created_at,
      edited_at: msg.edited_at
    })) || [];

    setMessages(processedMessages);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: chatType === 'channel' ? `channel_id=eq.${chatId}` : `conversation_id=eq.${chatId}`
        },
        (payload) => {
          // TODO: Fetch sender info and add to messages
          console.log('New message received:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        sender_id: currentUserId,
        message_type: 'text',
        ...(chatType === 'channel' ? { channel_id: chatId } : { conversation_id: chatId })
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = new Date(message.created_at).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });

    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {chatType === 'channel' ? (
                <div className="flex h-10 w-10 items-center justify-center bg-muted rounded-lg">
                  <Hash className="h-5 w-5" />
                </div>
              ) : (
                <Avatar className="h-10 w-10">
                  <AvatarFallback>DM</AvatarFallback>
                </Avatar>
              )}
              <div>
                <DialogTitle className="text-lg">{chatInfo?.name}</DialogTitle>
                {chatType === 'channel' ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {chatInfo?.member_count} members
                    {chatInfo?.description && ` • ${chatInfo.description}`}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {chatInfo?.is_online ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Online
                      </Badge>
                    ) : (
                      <span>Offline</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading messages...
            </div>
          ) : Object.keys(groupedMessages).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
                <div key={dateKey}>
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {formatDate(dayMessages[0].created_at)}
                    </div>
                  </div>

                  {/* Messages for this date */}
                  <div className="space-y-4">
                    {dayMessages.map((message, index) => {
                      const isOwnMessage = message.sender_id === currentUserId;
                      const showAvatar = index === 0 || dayMessages[index - 1].sender_id !== message.sender_id;

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwnMessage && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.sender_avatar} />
                              <AvatarFallback>
                                {message.sender_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`max-w-[70%] ${isOwnMessage ? 'order-first' : ''}`}>
                            {showAvatar && !isOwnMessage && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{message.sender_name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(message.created_at)}
                                </span>
                              </div>
                            )}
                            
                            <div
                              className={`rounded-lg px-3 py-2 ${
                                isOwnMessage
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              {isOwnMessage && (
                                <div className="text-xs opacity-70 mt-1">
                                  {formatTime(message.created_at)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${chatType === 'channel' ? `#${chatInfo?.name}` : chatInfo?.name}...`}
                className="resize-none"
              />
            </div>
            <Button variant="ghost" size="sm">
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatInterface;