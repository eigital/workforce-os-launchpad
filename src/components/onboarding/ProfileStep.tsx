import { useState, useEffect } from 'react';
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

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  // Load existing profile data and pre-populate form
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone_number')
          .eq('id', user.id)
          .single();

        if (profile) {
          if (profile.first_name) setValue('first_name', profile.first_name);
          if (profile.last_name) setValue('last_name', profile.last_name);
          if (profile.phone_number) setValue('phone_number', profile.phone_number);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadProfileData();
  }, [setValue]);

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
      const { data: userData } = await supabase.auth.getUser();
      await supabase
        .from('onboarding_progress')
        .insert([{
          user_id: userData.user?.id,
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