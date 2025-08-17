import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Megaphone, Plus, AlertCircle, Calendar, Clock, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnnouncementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  target_audience: string;
  created_by: string;
  created_at: string;
  expires_at?: string;
  is_read?: boolean;
  creator_name?: string;
}

const AnnouncementsPanel: React.FC<AnnouncementsPanelProps> = ({ isOpen, onClose }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const { toast } = useToast();

  // Form state for creating announcements
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'normal',
    target_audience: 'all',
    expires_at: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchAnnouncements();
      checkUserRole();
    }
  }, [isOpen]);

  const checkUserRole = async () => {
    try {
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      setUserRole(userCompanies?.role || '');
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Process announcements to check read status
      const processedAnnouncements = data?.map(announcement => ({
        ...announcement,
        is_read: false, // TODO: Implement read status check
        creator_name: 'Manager'
      })) || [];

      setAnnouncements(processedAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (announcementId: string) => {
    try {
      const { error } = await supabase
        .from('announcement_recipients')
        .upsert({
          announcement_id: announcementId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          read_at: new Date().toISOString()
        });

      if (error) throw error;

      setAnnouncements(prev =>
        prev.map(announcement =>
          announcement.id === announcementId
            ? { ...announcement, is_read: true }
            : announcement
        )
      );
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const createAnnouncement = async () => {
    try {
      if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userCompanies?.company_id) {
        throw new Error('No company found for user');
      }

      const { error } = await supabase
        .from('announcements')
        .insert({
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          priority: newAnnouncement.priority,
          target_audience: newAnnouncement.target_audience,
          company_id: userCompanies.company_id,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          expires_at: newAnnouncement.expires_at || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      setIsCreateModalOpen(false);
      setNewAnnouncement({
        title: '',
        content: '',
        priority: 'normal',
        target_audience: 'all',
        expires_at: ''
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadAnnouncements = announcements.filter(announcement => !announcement.is_read);
  const canCreateAnnouncements = ['owner', 'admin', 'manager'].includes(userRole);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Announcements
              {unreadAnnouncements.length > 0 && (
                <Badge variant="default" className="rounded-full">
                  {unreadAnnouncements.length}
                </Badge>
              )}
            </SheetTitle>
            {canCreateAnnouncements && (
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Make an Announcement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Announcement title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content">Content *</Label>
                      <Textarea
                        id="content"
                        value={newAnnouncement.content}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write your announcement..."
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={newAnnouncement.priority} onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="audience">Audience</Label>
                        <Select value={newAnnouncement.target_audience} onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, target_audience: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Everyone</SelectItem>
                            <SelectItem value="location">By Location</SelectItem>
                            <SelectItem value="department">By Department</SelectItem>
                            <SelectItem value="role">By Role</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="expires">Expires (Optional)</Label>
                      <Input
                        id="expires"
                        type="datetime-local"
                        value={newAnnouncement.expires_at}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, expires_at: e.target.value }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createAnnouncement} className="flex-1">
                        Create Announcement
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading announcements...
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No announcements yet
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-4 border rounded-lg transition-all ${
                      !announcement.is_read 
                        ? 'border-primary bg-primary/5 hover:bg-primary/10 cursor-pointer' 
                        : 'hover:bg-muted cursor-pointer'
                    }`}
                    onClick={() => !announcement.is_read && markAsRead(announcement.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority}
                        </Badge>
                        {!announcement.is_read && (
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(announcement.created_at)}
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-sm mb-2">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>From {announcement.creator_name}</span>
                      <div className="flex items-center gap-4">
                        {announcement.expires_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires {formatDate(announcement.expires_at)}
                          </div>
                        )}
                        {announcement.is_read && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Eye className="h-3 w-3" />
                            Read
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default AnnouncementsPanel;