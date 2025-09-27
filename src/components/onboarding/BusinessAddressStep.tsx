import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { MapPin } from 'lucide-react';
import { countries, getStatesForCountry, validatePostalCode } from '@/lib/addressData';

interface BusinessAddressStepProps {
  onNext: () => void;
}

const businessAddressSchema = z.object({
  addressLine1: z.string().min(1, 'Street address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
}).refine((data) => validatePostalCode(data.postalCode, data.country), {
  message: 'Invalid postal code format for selected country',
  path: ['postalCode'],
});

type BusinessAddressForm = z.infer<typeof businessAddressSchema>;

export default function BusinessAddressStep({ onNext }: BusinessAddressStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BusinessAddressForm>({
    resolver: zodResolver(businessAddressSchema),
    defaultValues: {
      country: 'US',
    },
  });

  // Load existing data on mount
  useEffect(() => {
    const loadExistingData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('onboarding_progress')
          .select('data')
          .eq('user_id', user.id)
          .eq('step_name', 'business_address')
          .maybeSingle();

        if (data?.data && typeof data.data === 'object') {
          const addressData = data.data as BusinessAddressForm;
          reset(addressData);
          setSelectedCountry(addressData.country || 'US');
        }
      } catch (error) {
        console.error('Error loading address data:', error);
      }
    };

    loadExistingData();
  }, [user, reset]);

  const watchedCountry = watch('country');
  const availableStates = getStatesForCountry(watchedCountry || selectedCountry);

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
        }], { onConflict: 'user_id,step_name' });

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
        {/* Country */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Country *
          </Label>
          <Select
            value={watchedCountry || selectedCountry}
            onValueChange={(value) => {
              setValue('country', value);
              setSelectedCountry(value);
              setValue('state', ''); // Reset state when country changes
            }}
          >
            <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-xs text-destructive">{errors.country.message}</p>
          )}
        </div>

        {/* Street Address Line 1 */}
        <div className="space-y-2">
          <Label htmlFor="addressLine1" className="text-sm font-medium">
            Street Address *
          </Label>
          <Input
            id="addressLine1"
            placeholder="123 Main Street"
            {...register('addressLine1')}
            className={errors.addressLine1 ? 'border-destructive' : ''}
          />
          {errors.addressLine1 && (
            <p className="text-xs text-destructive">{errors.addressLine1.message}</p>
          )}
        </div>

        {/* Street Address Line 2 */}
        <div className="space-y-2">
          <Label htmlFor="addressLine2" className="text-sm font-medium">
            Address Line 2
          </Label>
          <Input
            id="addressLine2"
            placeholder="Apt, Suite, Unit (Optional)"
            {...register('addressLine2')}
          />
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

        {/* State and Postal Code */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {watchedCountry === 'US' ? 'State' : watchedCountry === 'CA' ? 'Province' : 'State/Province'} *
            </Label>
            {availableStates.length > 0 ? (
              <Select
                value={watch('state') || ''}
                onValueChange={(value) => setValue('state', value)}
              >
                <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                  <SelectValue placeholder={`Select ${watchedCountry === 'US' ? 'state' : watchedCountry === 'CA' ? 'province' : 'state/province'}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableStates.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="State/Province"
                {...register('state')}
                className={errors.state ? 'border-destructive' : ''}
              />
            )}
            {errors.state && (
              <p className="text-xs text-destructive">{errors.state.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-sm font-medium">
              {watchedCountry === 'US' ? 'ZIP Code' : 'Postal Code'} *
            </Label>
            <Input
              id="postalCode"
              placeholder={watchedCountry === 'US' ? '12345' : watchedCountry === 'CA' ? 'A1A 1A1' : 'Postal Code'}
              {...register('postalCode')}
              className={errors.postalCode ? 'border-destructive' : ''}
            />
            {errors.postalCode && (
              <p className="text-xs text-destructive">{errors.postalCode.message}</p>
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