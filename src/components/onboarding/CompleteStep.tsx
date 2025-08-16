import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, Users, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompleteStepProps {
  onComplete: () => void;
}

export default function CompleteStep({ onComplete }: CompleteStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Mark onboarding as completed
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      // Save completion step
      await supabase
        .from('onboarding_progress')
        .insert([{
          step_name: 'completed',
          completed: true,
          data: { completed_at: new Date().toISOString() }
        }]);

      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-center max-w-sm mx-auto">
      <div className="mb-6">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-bold mb-1">Setup Complete!</h2>
        <p className="text-sm text-muted-foreground">
          Your account is ready. Here's what you can do next:
        </p>
      </div>

      <div className="grid gap-3">
        <Card className="py-3">
          <CardContent className="py-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-sm">Schedule Management</p>
                <p className="text-xs text-muted-foreground">Create schedules, manage shifts, and track time.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-3">
          <CardContent className="py-2">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-sm">Team Management</p>
                <p className="text-xs text-muted-foreground">Add employees, assign roles, and manage permissions.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-3">
          <CardContent className="py-2">
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-sm">Business Settings</p>
                <p className="text-xs text-muted-foreground">Configure business rules, notifications, and preferences.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleComplete} disabled={isLoading} className="w-full mt-4">
        {isLoading ? "Setting up..." : "Go to Dashboard"}
      </Button>
    </div>
  );
}