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
    <div className="space-y-6 text-center">
      <div className="mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Setup Complete!</h2>
        <p className="text-muted-foreground">
          Your account is ready. Here's what you can do next:
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule Management
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Create schedules, manage shifts, and track time for your team.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Team Management
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Add employees, assign roles, and manage permissions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-primary" />
              Business Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Configure your business rules, notifications, and preferences.
            </p>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleComplete} disabled={isLoading} className="w-full" size="lg">
        {isLoading ? "Setting up..." : "Go to Dashboard"}
      </Button>
    </div>
  );
}