import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmailSummaryDialog({ isOpen, onClose, onSuccess }: EmailSummaryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    summaryType: 'daily',
    recipients: '',
    scheduledTime: '',
    includeMetrics: true,
    includeEntries: true,
    includeFeedback: true,
    customMessage: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.user.id)
        .single();

      if (!userCompanies?.company_id) throw new Error('No company found');

      const recipients = formData.recipients.split(',').map(email => email.trim()).filter(Boolean);

      const contentData = {
        includeMetrics: formData.includeMetrics,
        includeEntries: formData.includeEntries,
        includeFeedback: formData.includeFeedback,
        customMessage: formData.customMessage
      };

      let scheduledFor = null;
      if (formData.scheduledTime) {
        const today = new Date().toISOString().split('T')[0];
        scheduledFor = new Date(`${today}T${formData.scheduledTime}:00`).toISOString();
      }

      await supabase
        .from('email_summaries')
        .insert({
          company_id: userCompanies.company_id,
          summary_type: formData.summaryType,
          recipients,
          content_data: contentData,
          scheduled_for: scheduledFor,
          status: scheduledFor ? 'scheduled' : 'draft',
          created_by: user.user.id
        });

      toast.success(scheduledFor ? 'Email summary scheduled successfully' : 'Email summary saved as draft');
      onSuccess();
      onClose();
      setFormData({
        summaryType: 'daily',
        recipients: '',
        scheduledTime: '',
        includeMetrics: true,
        includeEntries: true,
        includeFeedback: true,
        customMessage: ''
      });
    } catch (error) {
      console.error('Error creating email summary:', error);
      toast.error('Failed to create email summary');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultRecipients = [
    'manager@company.com',
    'supervisor@company.com',
    'owner@company.com'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Create Summary Email
          </DialogTitle>
          <DialogDescription>
            Configure and schedule your daily operations summary email
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="summaryType">Summary Type</Label>
              <Select value={formData.summaryType} onValueChange={(value) => setFormData(prev => ({ ...prev, summaryType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="shift">Shift Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Send Time (Optional)</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Email Recipients</Label>
            <Textarea
              id="recipients"
              placeholder="Enter email addresses separated by commas"
              value={formData.recipients}
              onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
              className="min-h-[80px]"
              required
            />
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-sm text-muted-foreground">Quick add:</span>
              {defaultRecipients.map((email) => (
                <Badge
                  key={email}
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => {
                    const current = formData.recipients;
                    const newValue = current ? `${current}, ${email}` : email;
                    setFormData(prev => ({ ...prev, recipients: newValue }));
                  }}
                >
                  {email}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Include in Summary</Label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.includeMetrics}
                  onChange={(e) => setFormData(prev => ({ ...prev, includeMetrics: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Business Metrics (Sales, Labor, Weather)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.includeEntries}
                  onChange={(e) => setFormData(prev => ({ ...prev, includeEntries: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Log Entries</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.includeFeedback}
                  onChange={(e) => setFormData(prev => ({ ...prev, includeFeedback: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Shift Feedback & Performance</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMessage">Custom Message (Optional)</Label>
            <Textarea
              id="customMessage"
              placeholder="Add a custom message to include in the email"
              value={formData.customMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Email Preview
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Subject:</strong> {formData.summaryType.charAt(0).toUpperCase() + formData.summaryType.slice(1)} Operations Summary - {new Date().toLocaleDateString()}</p>
              <p><strong>Recipients:</strong> {formData.recipients || 'No recipients specified'}</p>
              <p><strong>Scheduled:</strong> {formData.scheduledTime ? `Today at ${formData.scheduledTime}` : 'Send immediately'}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Creating...' : formData.scheduledTime ? 'Schedule Email' : 'Save Draft'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}