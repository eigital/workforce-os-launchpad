import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Clock, Calendar, Users, Zap } from 'lucide-react';

interface SchedulingSetupStepProps {
  onNext: () => void;
}

const SCHEDULING_PREFERENCES = {
  scheduleType: [
    { id: 'weekly', label: 'Weekly schedules', description: 'Create schedules week by week' },
    { id: 'biweekly', label: 'Bi-weekly schedules', description: 'Create schedules every two weeks' },
    { id: 'monthly', label: 'Monthly schedules', description: 'Create schedules month by month' }
  ],
  shiftLength: [
    { id: '4_hours', label: '4 hours', description: 'Short shifts' },
    { id: '8_hours', label: '8 hours', description: 'Standard full-day shifts' },
    { id: '12_hours', label: '12 hours', description: 'Extended shifts' },
    { id: 'flexible', label: 'Flexible', description: 'Varies by needs' }
  ],
  features: [
    { id: 'auto_scheduling', label: 'Auto-scheduling', description: 'AI-powered schedule suggestions', icon: Zap },
    { id: 'shift_swapping', label: 'Shift swapping', description: 'Allow employees to swap shifts', icon: Users },
    { id: 'time_off_requests', label: 'Time-off requests', description: 'Built-in time-off management', icon: Calendar },
    { id: 'overtime_alerts', label: 'Overtime alerts', description: 'Get notified about potential overtime', icon: Clock }
  ]
};

export default function SchedulingSetupStep({ onNext }: SchedulingSetupStepProps) {
  const [scheduleType, setScheduleType] = useState<string>('');
  const [shiftLength, setShiftLength] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Get user's company
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user!.id)
        .single();

      if (!userCompanies) {
        toast({
          title: 'Error',
          description: 'No company found. Please complete previous steps.',
          variant: 'destructive',
        });
        return;
      }

      const schedulingData = {
        schedule_type: scheduleType,
        default_shift_length: shiftLength,
        enabled_features: selectedFeatures,
        auto_scheduling: selectedFeatures.includes('auto_scheduling'),
        shift_swapping: selectedFeatures.includes('shift_swapping'),
        time_off_integration: selectedFeatures.includes('time_off_requests'),
        overtime_alerts: selectedFeatures.includes('overtime_alerts')
      };

      // Save scheduling preferences to business_setup
      const { error: setupError } = await supabase
        .from('business_setup')
        .upsert([{
          company_id: userCompanies.company_id,
          scheduling_preferences: schedulingData,
          setup_completed: false
        }]);

      if (setupError) {
        console.error('Error saving scheduling setup:', setupError);
        toast({
          title: 'Error',
          description: 'Failed to save scheduling preferences.',
          variant: 'destructive',
        });
        return;
      }

      // Save progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user!.id,
          step_name: 'scheduling_setup',
          completed: true,
          data: schedulingData
        }]);

      if (progressError) {
        console.error('Error saving progress:', progressError);
      }

      onNext();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Scheduling Preferences</h2>
        <p className="text-muted-foreground">
          Let's set up your scheduling workflow to match your business needs.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={scheduleType} onValueChange={setScheduleType}>
              {SCHEDULING_PREFERENCES.scheduleType.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.id} id={type.id} />
                  <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Default Shift Length
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={shiftLength} onValueChange={setShiftLength}>
              <SelectTrigger>
                <SelectValue placeholder="Select typical shift length" />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULING_PREFERENCES.shiftLength.map((length) => (
                  <SelectItem key={length.id} value={length.id}>
                    <div>
                      <div className="font-medium">{length.label}</div>
                      <div className="text-sm text-muted-foreground">{length.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features to Enable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCHEDULING_PREFERENCES.features.map((feature) => {
                const IconComponent = feature.icon;
                const isSelected = selectedFeatures.includes(feature.id);
                
                return (
                  <div
                    key={feature.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleFeatureToggle(feature.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleFeatureToggle(feature.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <IconComponent className="h-4 w-4" />
                          <Label className="font-medium cursor-pointer">
                            {feature.label}
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
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