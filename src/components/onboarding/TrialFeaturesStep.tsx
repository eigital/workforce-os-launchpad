import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  Crown, 
  Clock, 
  Users, 
  BarChart3, 
  DollarSign, 
  Shield, 
  Zap,
  Calendar,
  MessageSquare,
  Target
} from 'lucide-react';

interface TrialFeaturesStepProps {
  onNext: () => void;
}

const TRIAL_FEATURES = [
  {
    icon: Calendar,
    title: 'Advanced Scheduling',
    description: 'AI-powered auto-scheduling, shift templates, and demand forecasting',
    category: 'Premium'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Deep insights into labor costs, productivity, and team performance',
    category: 'Premium'
  },
  {
    icon: DollarSign,
    title: 'Tip Management',
    description: 'Automated tip pooling, distribution, and compliance tracking',
    category: 'Premium'
  },
  {
    icon: Users,
    title: 'Team Communication',
    description: 'Channels, announcements, and direct messaging for your team',
    category: 'Standard'
  },
  {
    icon: Shield,
    title: 'Advanced Permissions',
    description: 'Role-based access control and audit trails',
    category: 'Premium'
  },
  {
    icon: Zap,
    title: 'Integrations',
    description: 'Connect with POS systems, payroll, and other business tools',
    category: 'Premium'
  }
];

const TRIAL_STATS = [
  { label: 'Days remaining', value: '14', icon: Clock },
  { label: 'Team members', value: 'Unlimited', icon: Users },
  { label: 'Locations', value: 'Unlimited', icon: Target },
];

export default function TrialFeaturesStep({ onNext }: TrialFeaturesStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Save progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user!.id,
          step_name: 'trial_features',
          completed: true,
          data: { trial_explored: true }
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

  const handleExploreFeature = (feature: string) => {
    toast({
      title: 'Feature exploration',
      description: `${feature} is ready to explore in your trial!`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-foreground">Your Trial Features</h2>
        </div>
        <p className="text-muted-foreground">
          You have full access to all premium features during your 14-day trial. No credit card required!
        </p>
      </div>

      {/* Trial Status */}
      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {TRIAL_STATS.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="space-y-2">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-lg w-fit mx-auto">
                    <IconComponent className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {stat.value}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Features Available in Your Trial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRIAL_FEATURES.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => handleExploreFeature(feature.title)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{feature.title}</h4>
                        <Badge 
                          variant={feature.category === 'Premium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {feature.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center space-y-4">
          <div className="bg-primary/10 p-3 rounded-full w-fit mx-auto">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Need Help Getting Started?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our team is here to help you make the most of your trial. Schedule a quick demo or reach out with questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" size="sm">
                Schedule Demo
              </Button>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onNext}
          className="flex-1"
        >
          Explore Later
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
}