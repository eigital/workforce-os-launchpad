import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';

interface BusinessSizeStepProps {
  onNext: () => void;
}

const businessSizeSchema = z.object({
  employeeCount: z.string().min(1, 'Employee count is required'),
  locationCount: z.string().min(1, 'Location count is required'),
});

type BusinessSizeForm = z.infer<typeof businessSizeSchema>;

const EMPLOYEE_COUNTS = [
  '1-5',
  '6-15',
  '16-30',
  '31-50',
  '51-100',
  '100+'
];

const LOCATION_COUNTS = [
  '1',
  '2-3',
  '4-5',
  '6-10',
  '11-25',
  '25+'
];

export default function BusinessSizeStep({ onNext }: BusinessSizeStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<BusinessSizeForm>({
    resolver: zodResolver(businessSizeSchema),
  });

  useEffect(() => {
    // Pre-populate from signup metadata if available
    const loadUserData = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser?.user_metadata?.company_size) {
          setValue('employeeCount', currentUser.user_metadata.company_size);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [setValue]);

  const onSubmit = async (data: BusinessSizeForm) => {
    setIsLoading(true);
    try {
      // Save progress data
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user!.id,
          step_name: 'business_size',
          completed: true,
          data: data
        }]);

      if (progressError) throw progressError;

      toast({
        title: 'Business size saved',
        description: 'Your business size information has been saved.',
      });

      onNext();
    } catch (error) {
      console.error('Error saving business size:', error);
      toast({
        title: 'Error',
        description: 'Failed to save business size. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2">
        <Users className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Business Size & Structure</h3>
          <p className="text-sm text-muted-foreground">Help us understand your business scale</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Employee Count */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Number of Employees *</Label>
          <Controller
            name="employeeCount"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={errors.employeeCount ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select employee range" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_COUNTS.map((count) => (
                    <SelectItem key={count} value={count}>
                      {count} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.employeeCount && (
            <p className="text-xs text-destructive">{errors.employeeCount.message}</p>
          )}
        </div>

        {/* Location Count */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Number of Locations *</Label>
          <Controller
            name="locationCount"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={errors.locationCount ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select location count" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_COUNTS.map((count) => (
                    <SelectItem key={count} value={count}>
                      {count} {count === '1' ? 'location' : 'locations'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.locationCount && (
            <p className="text-xs text-destructive">{errors.locationCount.message}</p>
          )}
        </div>

        <div className="pt-4">
          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
}