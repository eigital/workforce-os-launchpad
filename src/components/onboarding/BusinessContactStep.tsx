import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Phone, FileText } from 'lucide-react';

interface BusinessContactStepProps {
  onNext: () => void;
}

const businessContactSchema = z.object({
  phoneNumber: z.string().optional(),
  description: z.string().optional(),
});

type BusinessContactForm = z.infer<typeof businessContactSchema>;

export default function BusinessContactStep({ onNext }: BusinessContactStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessContactForm>({
    resolver: zodResolver(businessContactSchema),
  });

  const onSubmit = async (data: BusinessContactForm) => {
    setIsLoading(true);
    try {
      // Get all previous business data from onboarding progress
      const { data: progressData, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('data')
        .eq('user_id', user!.id)
        .in('step_name', ['basic_business_info', 'business_size', 'business_address']);

      if (progressError) throw progressError;

      // Combine all business data
      let combinedData: Record<string, any> = {};
      progressData?.forEach(progress => {
        if (progress.data && typeof progress.data === 'object') {
          combinedData = { ...combinedData, ...(progress.data as Record<string, any>) };
        }
      });

      // Add contact data
      combinedData = { ...combinedData, ...data };

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Create or update company with complete data
      const companyData = {
        name: combinedData.businessName,
        industry: combinedData.industry,
        size_range: combinedData.employeeCount,
        phone_number: combinedData.phoneNumber,
        location_count: parseInt(combinedData.locationCount?.split('-')[0]) || 1,
        timezone: userTimezone,
        address: {
          street: combinedData.address,
          city: combinedData.city,
          state: combinedData.state,
          zipCode: combinedData.zipCode
        },
        settings: {
          business_type: combinedData.businessType,
          description: combinedData.description
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

      // Save final onboarding progress
      const { error: finalProgressError } = await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user!.id,
          step_name: 'business_profile_complete',
          completed: true,
          data: { ...combinedData, company_id: companyId }
        }]);

      if (finalProgressError) throw finalProgressError;

      toast({
        title: 'Business profile completed',
        description: 'Your complete business profile has been saved successfully.',
      });

      onNext();
    } catch (error) {
      console.error('Error saving business contact:', error);
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2">
        <FileText className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold">Contact & Details</h3>
          <p className="text-sm text-muted-foreground">Final details to complete your business profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Phone Number */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              Business Phone Number (Optional)
            </Label>
          </div>
          <Input
            id="phoneNumber"
            placeholder="(555) 123-4567"
            {...register('phoneNumber')}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Business Description (Optional)
          </Label>
          <Textarea
            id="description"
            placeholder="Tell us more about your business, what makes it special, your goals..."
            {...register('description')}
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
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
            {isLoading ? 'Saving...' : 'Complete Setup'}
          </Button>
        </div>
      </form>
    </div>
  );
}