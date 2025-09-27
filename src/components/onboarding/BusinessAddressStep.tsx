import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { MapPin } from 'lucide-react';

interface BusinessAddressStepProps {
  onNext: () => void;
}

const businessAddressSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
});

type BusinessAddressForm = z.infer<typeof businessAddressSchema>;

export default function BusinessAddressStep({ onNext }: BusinessAddressStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessAddressForm>({
    resolver: zodResolver(businessAddressSchema),
  });

  const onSubmit = async (data: BusinessAddressForm) => {
    setIsLoading(true);
    try {
      // Save progress data
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user!.id,
          step_name: 'business_address',
          completed: true,
          data: data
        }]);

      if (progressError) throw progressError;

      toast({
        title: 'Business address saved',
        description: 'Your business address has been saved.',
      });

      onNext();
    } catch (error) {
      console.error('Error saving business address:', error);
      toast({
        title: 'Error',
        description: 'Failed to save business address. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2">
        <MapPin className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Business Address</h3>
          <p className="text-sm text-muted-foreground">Where is your main business location?</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Street Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Street Address *
          </Label>
          <Input
            id="address"
            placeholder="123 Main Street"
            {...register('address')}
            className={errors.address ? 'border-destructive' : ''}
          />
          {errors.address && (
            <p className="text-xs text-destructive">{errors.address.message}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">
            City *
          </Label>
          <Input
            id="city"
            placeholder="City"
            {...register('city')}
            className={errors.city ? 'border-destructive' : ''}
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>

        {/* State and ZIP Code */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium">
              State *
            </Label>
            <Input
              id="state"
              placeholder="State"
              {...register('state')}
              className={errors.state ? 'border-destructive' : ''}
            />
            {errors.state && (
              <p className="text-xs text-destructive">{errors.state.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode" className="text-sm font-medium">
              ZIP Code *
            </Label>
            <Input
              id="zipCode"
              placeholder="12345"
              {...register('zipCode')}
              className={errors.zipCode ? 'border-destructive' : ''}
            />
            {errors.zipCode && (
              <p className="text-xs text-destructive">{errors.zipCode.message}</p>
            )}
          </div>
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