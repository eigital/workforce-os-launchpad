import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { MapPin, Phone, Users, Building } from 'lucide-react';

interface BusinessProfileStepProps {
  onNext: () => void;
}

const businessProfileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  industry: z.string().min(1, 'Industry is required'),
  businessType: z.string().min(1, 'Business type is required'),
  employeeCount: z.string().min(1, 'Employee count is required'),
  locationCount: z.string().min(1, 'Location count is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  phoneNumber: z.string().optional(),
  description: z.string().optional(),
});

type BusinessProfileForm = z.infer<typeof businessProfileSchema>;

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

export default function BusinessProfileStep({ onNext }: BusinessProfileStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<BusinessProfileForm>({
    resolver: zodResolver(businessProfileSchema),
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
          if (metadata.company_size) setValue('employeeCount', metadata.company_size);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [setValue]);

  const onSubmit = async (data: BusinessProfileForm) => {
    setIsLoading(true);
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Create or update company
      const companyData = {
        name: data.businessName,
        industry: data.industry,
        size_range: data.employeeCount,
        phone_number: data.phoneNumber,
        location_count: parseInt(data.locationCount.split('-')[0]) || 1,
        timezone: userTimezone,
        address: {
          street: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode
        },
        settings: {
          business_type: data.businessType,
          description: data.description
        }
      };

      // Check if user already has a company
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user!.id);

      let companyId;

      if (userCompanies && userCompanies.length > 0) {
        // Update existing company
        companyId = userCompanies[0].company_id;
        const { error: updateError } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', companyId);

        if (updateError) throw updateError;
      } else {
        // Create new company
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert([companyData])
          .select()
          .single();

        if (companyError) throw companyError;
        companyId = company.id;

        // Link user to company as owner
        const { error: linkError } = await supabase
          .from('user_companies')
          .insert([{
            user_id: user!.id,
            company_id: companyId,
            role: 'owner'
          }]);

        if (linkError) throw linkError;
      }

      // Create business setup record
      const { error: setupError } = await supabase
        .from('business_setup')
        .upsert([{
          company_id: companyId,
          business_type: data.businessType,
          setup_completed: false
        }]);

      if (setupError) {
        console.error('Error creating business setup:', setupError);
      }

      // Save onboarding progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user!.id,
          step_name: 'business_profile',
          completed: true,
          data: { ...data, company_id: companyId }
        }]);

      if (progressError) throw progressError;

      toast({
        title: 'Business profile saved',
        description: 'Your business information has been saved successfully.',
      });

      onNext();
    } catch (error) {
      console.error('Error saving business profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save business profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Business Name */}
        <div className="space-y-1.5">
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

        {/* Industry and Business Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Industry *</Label>
            <Controller
              name="industry"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className={errors.industry ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select industry" />
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

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Business Type *</Label>
            <Controller
              name="businessType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className={errors.businessType ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select type" />
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
        </div>

        {/* Employee and Location Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Number of Employees *</Label>
            <Controller
              name="employeeCount"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className={errors.employeeCount ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select range" />
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

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Number of Locations *</Label>
            <Controller
              name="locationCount"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className={errors.locationCount ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select count" />
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
        </div>

        {/* Address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Business Address *</Label>
          </div>
          
          <div className="space-y-1.5">
            <Input
              placeholder="Street Address"
              {...register('address')}
              className={errors.address ? 'border-destructive' : ''}
            />
            {errors.address && (
              <p className="text-xs text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <Input
                placeholder="City"
                {...register('city')}
                className={errors.city ? 'border-destructive' : ''}
              />
              {errors.city && (
                <p className="text-xs text-destructive">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="State"
                {...register('state')}
                className={errors.state ? 'border-destructive' : ''}
              />
              {errors.state && (
                <p className="text-xs text-destructive">{errors.state.message}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="ZIP Code"
                {...register('zipCode')}
                className={errors.zipCode ? 'border-destructive' : ''}
              />
              {errors.zipCode && (
                <p className="text-xs text-destructive">{errors.zipCode.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number (Optional)
            </Label>
          </div>
          <Input
            id="phoneNumber"
            placeholder="(555) 123-4567"
            {...register('phoneNumber')}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium">
            Business Description (Optional)
          </Label>
          <Textarea
            id="description"
            placeholder="Tell us more about your business..."
            {...register('description')}
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-3">
          <Button 
            type="button"
            variant="outline" 
            onClick={onNext}
            className="flex-1"
          >
            Skip for now
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
}