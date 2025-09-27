import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Target, Users, Clock, DollarSign, MessageSquare, Calculator } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

const GOALS = [
  {
    id: 'scheduling',
    label: 'Scheduling',
    description: 'Create and manage staff schedules',
    icon: Clock,
    color: 'bg-blue-500'
  },
  {
    id: 'budgeting',
    label: 'Budgeting',
    description: 'Track labor costs and budgets',
    icon: Calculator,
    color: 'bg-green-500'
  },
  {
    id: 'tip_management',
    label: 'Tip Management',
    description: 'Handle tip distribution and tracking',
    icon: DollarSign,
    color: 'bg-yellow-500'
  },
  {
    id: 'communication',
    label: 'Communication',
    description: 'Keep your team connected',
    icon: MessageSquare,
    color: 'bg-purple-500'
  },
  {
    id: 'time_clocking',
    label: 'Time Clocking',
    description: 'Track employee work hours',
    icon: Users,
    color: 'bg-orange-500'
  },
  {
    id: 'payroll',
    label: 'Payroll',
    description: 'Process payroll efficiently',
    icon: Target,
    color: 'bg-red-500'
  }
];

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) {
      toast({
        title: 'Select your goals',
        description: 'Please select at least one goal to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Save goals to onboarding progress
      const { error } = await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user!.id,
          step_name: 'welcome_goals',
          completed: true,
          data: { goals: selectedGoals }
        }], { onConflict: 'user_id,step_name' });

      if (error) {
        console.error('Error saving goals:', error);
        toast({
          title: 'Error',
          description: 'Failed to save your goals. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      onNext();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedGoals.length === GOALS.length) {
      setSelectedGoals([]);
    } else {
      setSelectedGoals(GOALS.map(goal => goal.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">
          {selectedGoals.length} of {GOALS.length} goals selected
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="text-xs"
        >
          {selectedGoals.length === GOALS.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {GOALS.map((goal) => {
          const IconComponent = goal.icon;
          const isSelected = selectedGoals.includes(goal.id);
          
          return (
            <Card 
              key={goal.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
              onClick={() => handleGoalToggle(goal.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleGoalToggle(goal.id)}
                      className="mt-0.5"
                    />
                    <div className={`p-2 rounded-lg ${goal.color} text-white`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="font-medium text-foreground cursor-pointer">
                      {goal.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {goal.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onNext}
          className="flex-1"
        >
          Skip for now
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}