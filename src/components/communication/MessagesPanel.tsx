import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, MessageCircle, Users, MapPin, Building2, Hash } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MessagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (chatId: string, chatType: 'channel' | 'direct') => void;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  channel_type: string;
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
}

interface DirectConversation {
  id: string;
  participant_name: string;
  participant_avatar?: string;
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
  is_online?: boolean;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({ isOpen, onClose, onOpenChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchChannelsAndConversations();
    }
  }, [isOpen]);

  const fetchChannelsAndConversations = async () => {
    try {
      setLoading(true);
      
      // Fetch channels user is a member of
      const { data: channelData, error: channelError } = await supabase
        .from('channels')
        .select(`
          *,
          channel_members!inner(*)
        `)
        .eq('channel_members.user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('is_active', true);

      if (channelError) throw channelError;

      // Fetch direct conversations
      const { data: conversationData, error: conversationError } = await supabase
        .from('direct_conversations')
        .select('*');

      if (conversationError) throw conversationError;

      setChannels(channelData || []);
      // TODO: Process conversations with user details
      setConversations([]);
      
    } catch (error) {
      console.error('Error fetching messages data:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'department':
        return <Building2 className="h-4 w-4" />;
      case 'role':
        return <Users className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter(conversation =>
    conversation.participant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="w-full mt-3" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Start a chat
          </Button>
        </div>

        <Tabs defaultValue="recents" className="flex-1">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="recents">Recents</TabsTrigger>
            <TabsTrigger value="all">All messages</TabsTrigger>
          </TabsList>

          <TabsContent value="recents" className="m-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4 space-y-1">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading conversations...
                  </div>
                ) : (
                  <>
                    {/* Recent Conversations */}
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => onOpenChat(conversation.id, 'direct')}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.participant_avatar} />
                            <AvatarFallback>
                              {conversation.participant_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.is_online && (
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conversation.participant_name}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.last_message_time)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.last_message || 'No messages yet'}
                          </p>
                        </div>
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <Badge variant="default" className="rounded-full px-2 py-1 text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                    ))}

                    {/* Recent Channels */}
                    {filteredChannels.slice(0, 5).map((channel) => (
                      <div
                        key={channel.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => onOpenChat(channel.id, 'channel')}
                      >
                        <div className="flex h-10 w-10 items-center justify-center bg-muted rounded-lg">
                          {getChannelIcon(channel.channel_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{channel.name}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(channel.last_message_time)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {channel.last_message || 'No messages yet'}
                          </p>
                        </div>
                        {channel.unread_count && channel.unread_count > 0 && (
                          <Badge variant="default" className="rounded-full px-2 py-1 text-xs">
                            {channel.unread_count}
                          </Badge>
                        )}
                      </div>
                    ))}

                    {filteredChannels.length === 0 && filteredConversations.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchQuery ? 'No messages found' : 'No recent conversations'}
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="all" className="m-0">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4">
                <div className="space-y-6">
                  {/* Locations Section */}
                  <div>
                    <h3 className="flex items-center gap-2 font-medium text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      Locations
                    </h3>
                    <div className="space-y-1">
                      {filteredChannels
                        .filter(channel => channel.channel_type === 'location')
                        .map((channel) => (
                          <div
                            key={channel.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => onOpenChat(channel.id, 'channel')}
                          >
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{channel.name}</span>
                            {channel.unread_count && channel.unread_count > 0 && (
                              <Badge variant="secondary" className="ml-auto">
                                {channel.unread_count}
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Departments Section */}
                  <div>
                    <h3 className="flex items-center gap-2 font-medium text-sm text-muted-foreground mb-2">
                      <Building2 className="h-4 w-4" />
                      Departments
                    </h3>
                    <div className="space-y-1">
                      {filteredChannels
                        .filter(channel => channel.channel_type === 'department')
                        .map((channel) => (
                          <div
                            key={channel.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => onOpenChat(channel.id, 'channel')}
                          >
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{channel.name}</span>
                            {channel.unread_count && channel.unread_count > 0 && (
                              <Badge variant="secondary" className="ml-auto">
                                {channel.unread_count}
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Roles Section */}
                  <div>
                    <h3 className="flex items-center gap-2 font-medium text-sm text-muted-foreground mb-2">
                      <Users className="h-4 w-4" />
                      Roles
                    </h3>
                    <div className="space-y-1">
                      {filteredChannels
                        .filter(channel => channel.channel_type === 'role')
                        .map((channel) => (
                          <div
                            key={channel.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                            onClick={() => onOpenChat(channel.id, 'channel')}
                          >
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{channel.name}</span>
                            {channel.unread_count && channel.unread_count > 0 && (
                              <Badge variant="secondary" className="ml-auto">
                                {channel.unread_count}
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default MessagesPanel;