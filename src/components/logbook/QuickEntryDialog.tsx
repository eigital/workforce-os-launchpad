import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, DollarSign, Cloud, Users, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuickEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entryType: string;
  onSuccess: () => void;
}

export function QuickEntryDialog({ isOpen, onClose, entryType, onSuccess }: QuickEntryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    salesAmount: '',
    weatherCondition: '',
    weatherTemp: '',
    employeeName: '',
    performanceRating: '',
    taskDescription: '',
    notes: ''
  });

  const getEntryConfig = () => {
    switch (entryType) {
      case 'sales':
        return {
          icon: DollarSign,
          title: 'Daily Sales Entry',
          description: 'Record today\'s sales figures and performance'
        };
      case 'weather':
        return {
          icon: Cloud,
          title: 'Weather Conditions',
          description: 'Log current weather conditions affecting operations'
        };
      case 'performance':
        return {
          icon: Star,
          title: 'Employee Performance',
          description: 'Record employee feedback and performance notes'
        };
      case 'tasks':
        return {
          icon: CheckCircle,
          title: 'Task Summary',
          description: 'Log completed tasks and operational updates'
        };
      default:
        return {
          icon: CheckCircle,
          title: 'Quick Entry',
          description: 'Add a quick log entry'
        };
    }
  };

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

      // Create log entry based on type
      let title = '';
      let content = '';
      let category = 'general';

      switch (entryType) {
        case 'sales':
          title = `Daily Sales - $${formData.salesAmount}`;
          content = `Sales Amount: $${formData.salesAmount}\nNotes: ${formData.notes}`;
          category = 'sales';
          break;
        case 'weather':
          title = `Weather Update - ${formData.weatherCondition}`;
          content = `Condition: ${formData.weatherCondition}\nTemperature: ${formData.weatherTemp}°F\nNotes: ${formData.notes}`;
          category = 'weather';
          break;
        case 'performance':
          title = `Performance Review - ${formData.employeeName}`;
          content = `Employee: ${formData.employeeName}\nRating: ${formData.performanceRating}/5\nNotes: ${formData.notes}`;
          category = 'performance';
          break;
        case 'tasks':
          title = `Task Summary`;
          content = `Tasks: ${formData.taskDescription}\nNotes: ${formData.notes}`;
          category = 'tasks';
          break;
      }

      // Get or create category
      let { data: categoryData } = await supabase
        .from('log_categories')
        .select('id')
        .eq('company_id', userCompanies.company_id)
        .eq('name', category)
        .single();

      if (!categoryData) {
        const { data: newCategory } = await supabase
          .from('log_categories')
          .insert({
            company_id: userCompanies.company_id,
            name: category,
            description: `${category} related entries`,
            created_by: user.user.id
          })
          .select('id')
          .single();
        categoryData = newCategory;
      }

      // Create log entry
      await supabase
        .from('log_entries')
        .insert({
          company_id: userCompanies.company_id,
          category_id: categoryData?.id,
          title,
          content,
          entry_type: entryType,
          priority: 'normal',
          created_by: user.user.id
        });

      // Update business metrics if it's a sales entry
      if (entryType === 'sales' && formData.salesAmount) {
        const today = new Date().toISOString().split('T')[0];
        await supabase
          .from('business_metrics')
          .upsert({
            company_id: userCompanies.company_id,
            date: today,
            sales_amount: parseFloat(formData.salesAmount),
            created_by: user.user.id
          });
      }

      toast.success('Entry created successfully');
      onSuccess();
      onClose();
      setFormData({
        salesAmount: '',
        weatherCondition: '',
        weatherTemp: '',
        employeeName: '',
        performanceRating: '',
        taskDescription: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const config = getEntryConfig();
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {entryType === 'sales' && (
            <div className="space-y-2">
              <Label htmlFor="salesAmount">Sales Amount</Label>
              <Input
                id="salesAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.salesAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, salesAmount: e.target.value }))}
                required
              />
            </div>
          )}

          {entryType === 'weather' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="weatherCondition">Weather Condition</Label>
                <Select value={formData.weatherCondition} onValueChange={(value) => setFormData(prev => ({ ...prev, weatherCondition: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunny">Sunny</SelectItem>
                    <SelectItem value="cloudy">Cloudy</SelectItem>
                    <SelectItem value="rainy">Rainy</SelectItem>
                    <SelectItem value="snowy">Snowy</SelectItem>
                    <SelectItem value="stormy">Stormy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weatherTemp">Temperature (°F)</Label>
                <Input
                  id="weatherTemp"
                  type="number"
                  placeholder="Temperature"
                  value={formData.weatherTemp}
                  onChange={(e) => setFormData(prev => ({ ...prev, weatherTemp: e.target.value }))}
                />
              </div>
            </>
          )}

          {entryType === 'performance' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="employeeName">Employee Name</Label>
                <Input
                  id="employeeName"
                  placeholder="Enter employee name"
                  value={formData.employeeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="performanceRating">Performance Rating</Label>
                <Select value={formData.performanceRating} onValueChange={(value) => setFormData(prev => ({ ...prev, performanceRating: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Below Average</SelectItem>
                    <SelectItem value="3">3 - Average</SelectItem>
                    <SelectItem value="4">4 - Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {entryType === 'tasks' && (
            <div className="space-y-2">
              <Label htmlFor="taskDescription">Task Summary</Label>
              <Textarea
                id="taskDescription"
                placeholder="Describe completed tasks and activities"
                value={formData.taskDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, taskDescription: e.target.value }))}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or observations"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Creating...' : 'Create Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}