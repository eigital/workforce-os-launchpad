import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileStepProps {
  onNext: () => void;
}

export default function ProfileStep({ onNext }: ProfileStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      // Update onboarding progress
      await supabase
        .from('onboarding_progress')
        .insert([{
          step_name: 'profile_info',
          completed: true,
          data: data
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
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            {...register('first_name')}
            placeholder="Enter your first name"
          />
          {errors.first_name && (
            <p className="text-sm text-destructive mt-1">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            {...register('last_name')}
            placeholder="Enter your last name"
          />
          {errors.last_name && (
            <p className="text-sm text-destructive mt-1">{errors.last_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone_number">Phone Number (Optional)</Label>
          <Input
            id="phone_number"
            {...register('phone_number')}
            placeholder="Enter your phone number"
            type="tel"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Continue"}
      </Button>
    </form>
  );
}