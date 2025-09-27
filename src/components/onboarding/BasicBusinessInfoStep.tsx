import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Building } from 'lucide-react';

interface BasicBusinessInfoStepProps {
  onNext: () => void;
}

const basicBusinessSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  industry: z.string().min(1, 'Industry is required'),
  businessType: z.string().min(1, 'Business type is required'),
});

type BasicBusinessForm = z.infer<typeof basicBusinessSchema>;

const INDUSTRIES = [
  'Restaurant',
  'Retail',
  'Healthcare',
  'Hospitality',
  'Manufacturing',
  'Construction',
  'Professional Services',
  'Education',
  'Non-profit',
  'Other'
];

const BUSINESS_TYPES = [
  'Quick Service Restaurant',
  'Full Service Restaurant',
  'Bar/Pub',
  'Cafe/Coffee Shop',
  'Food Truck',
  'Catering',
  'Retail Store',
  'Grocery Store',
  'Hotel',
  'Other'
];

export default function BasicBusinessInfoStep({ onNext }: BasicBusinessInfoStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<BasicBusinessForm>({
    resolver: zodResolver(basicBusinessSchema),
  });

  useEffect(() => {
    // Pre-populate from signup metadata if available
    const loadUserData = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser?.user_metadata) {
          const metadata = currentUser.user_metadata;
          if (metadata.company_name) setValue('businessName', metadata.company_name);
          if (metadata.industry) setValue('industry', metadata.industry);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [setValue]);

  const onSubmit = async (data: BasicBusinessForm) => {
    setIsLoading(true);
    try {
      // Save progress data
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user!.id,
          step_name: 'basic_business_info',
          completed: true,
          data: data
        }], { onConflict: 'user_id,step_name' });

      if (progressError) throw progressError;

      toast({
        title: 'Basic business info saved',
        description: 'Your business information has been saved.',
      });

      onNext();
    } catch (error) {
      console.error('Error saving basic business info:', error);
      toast({
        title: 'Error',
        description: 'Failed to save basic business info. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2">
        <Building className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Basic Business Information</h3>
          <p className="text-sm text-muted-foreground">Tell us about your business basics</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-sm font-medium">
            Business Name *
          </Label>
          <Input
            id="businessName"
            placeholder="Your Business Name"
            {...register('businessName')}
            className={errors.businessName ? 'border-destructive' : ''}
          />
          {errors.businessName && (
            <p className="text-xs text-destructive">{errors.businessName.message}</p>
          )}
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Industry *</Label>
          <Controller
            name="industry"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={errors.industry ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry.toLowerCase()}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.industry && (
            <p className="text-xs text-destructive">{errors.industry.message}</p>
          )}
        </div>

        {/* Business Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Business Type *</Label>
          <Controller
            name="businessType"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={errors.businessType ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.businessType && (
            <p className="text-xs text-destructive">{errors.businessType.message}</p>
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