import { useState } from 'react';
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

  const onSubmit = async (data: CompanyForm) => {
    setIsLoading(true);
    try {
      // Get user and auto-detect timezone
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Check if company info was already provided during signup
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
      }

      // Create company with auto-detected timezone
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (companyError) throw companyError;

      // Link user to company as owner
      const { error: linkError } = await supabase
        .from('user_companies')
        .insert([{
          user_id: user.id,
          company_id: company.id,
          role: 'owner'
        }]);

      if (linkError) throw linkError;

      // Update onboarding progress
      await supabase
        .from('onboarding_progress')
        .insert([{
          user_id: user.id,
          step_name: 'company_info',
          completed: true,
          data: companyData
        }]);

      onNext();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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