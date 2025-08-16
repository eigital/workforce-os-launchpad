import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  size_range: z.string().min(1, 'Company size is required'),
});

type CompanyForm = z.infer<typeof companySchema>;

interface CompanyInfoStepProps {
  onNext: () => void;
}

export default function CompanyInfoStep({ onNext }: CompanyInfoStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
  });

  // Pre-populate form with signup metadata if available
  useEffect(() => {
    const loadUserMetadata = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.company_name) {
        setValue('name', user.user_metadata.company_name);
        setValue('industry', user.user_metadata.company_industry);
        setValue('size_range', user.user_metadata.company_size);
        console.log('Pre-populated form with metadata:', user.user_metadata);
      }
    };
    loadUserMetadata();
  }, [setValue]);

  const onSubmit = async (data: CompanyForm) => {
    setIsLoading(true);
    try {
      console.log('Starting company creation process');
      
      // Get user and auto-detect timezone
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('User authenticated:', user.id);

      // Check if user already has a company
      const { data: existingCompanies } = await supabase
        .from('user_companies')
        .select('company_id, companies(name)')
        .eq('user_id', user.id);

      if (existingCompanies && existingCompanies.length > 0) {
        console.log('User already has a company, skipping creation');
        // Update onboarding progress and continue
        await supabase
          .from('onboarding_progress')
          .upsert([{
            user_id: user.id,
            step_name: 'company_info',
            completed: true,
            data: { skipped: true, reason: 'already_exists' }
          }]);
        onNext();
        return;
      }

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Use metadata from signup if available, otherwise use form data
      let companyData = {
        name: data.name,
        industry: data.industry,
        size_range: data.size_range,
        timezone: userTimezone,
      };

      // If user came from signup with company info, use that instead
      if (user.user_metadata?.company_name) {
        companyData = {
          name: user.user_metadata.company_name,
          industry: user.user_metadata.company_industry,
          size_range: user.user_metadata.company_size,
          timezone: userTimezone,
        };
        console.log('Using company data from signup metadata:', companyData);
      } else {
        console.log('Using company data from form:', companyData);
      }

      // Check if company with this name already exists for this user (extra safety)
      const { data: duplicateCheck } = await supabase
        .from('companies')
        .select('id')
        .eq('name', companyData.name)
        .limit(1);

      if (duplicateCheck && duplicateCheck.length > 0) {
        console.log('Company with this name already exists');
        throw new Error('A company with this name already exists');
      }

      console.log('Creating company with data:', companyData);

      // Create company with auto-detected timezone
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (companyError) {
        console.error('Company creation error:', companyError);
        throw companyError;
      }

      console.log('Company created successfully:', company.id);

      // Link user to company as owner
      const { error: linkError } = await supabase
        .from('user_companies')
        .insert([{
          user_id: user.id,
          company_id: company.id,
          role: 'owner'
        }]);

      if (linkError) {
        console.error('User-company link error:', linkError);
        throw linkError;
      }

      console.log('User linked to company successfully');

      // Update onboarding progress
      await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user.id,
          step_name: 'company_info',
          completed: true,
          data: companyData
        }]);

      console.log('Onboarding progress updated');

      toast({
        title: "Success",
        description: "Company created successfully!",
      });

      onNext();
    } catch (error: any) {
      console.error('Company creation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Company Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Enter your company name"
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          <Select onValueChange={(value) => setValue('industry', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restaurant">Restaurant & Food Service</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="hospitality">Hospitality</SelectItem>
              <SelectItem value="manufacturing">Manufacturing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.industry && (
            <p className="text-sm text-destructive mt-1">{errors.industry.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="size_range">Company Size</Label>
          <Select onValueChange={(value) => setValue('size_range', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="500+">500+ employees</SelectItem>
            </SelectContent>
          </Select>
          {errors.size_range && (
            <p className="text-sm text-destructive mt-1">{errors.size_range.message}</p>
          )}
        </div>

      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Continue"}
      </Button>
    </form>
  );
}