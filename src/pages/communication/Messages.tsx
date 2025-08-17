import React, { useState } from "react";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import MessagesPanel from "@/components/communication/MessagesPanel";
import ChatInterface from "@/components/communication/ChatInterface";

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatType, setActiveChatType] = useState<'channel' | 'direct' | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleOpenChat = (chatId: string, chatType: 'channel' | 'direct') => {
    setActiveChatId(chatId);
    setActiveChatType(chatType);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setActiveChatId(null);
    setActiveChatType(null);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 flex">
          {/* Messages Sidebar */}
          <div className="w-80 border-r border-border bg-card">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-foreground">Messages</h1>
                <Button size="sm" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <MessagesPanel 
              isOpen={true} 
              onClose={() => {}} 
              onOpenChat={handleOpenChat}
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {isChatOpen && activeChatId && activeChatType ? (
              <div className="flex-1">
                <ChatInterface
                  isOpen={true}
                  onClose={handleCloseChat}
                  chatId={activeChatId}
                  chatType={activeChatType}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/30">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No conversation selected</h3>
                  <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Messages;