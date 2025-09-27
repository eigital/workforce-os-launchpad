import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import BasicBusinessInfoStep from '@/components/onboarding/BasicBusinessInfoStep';
import BusinessSizeStep from '@/components/onboarding/BusinessSizeStep';
import BusinessAddressStep from '@/components/onboarding/BusinessAddressStep';
import BusinessContactStep from '@/components/onboarding/BusinessContactStep';
import SchedulingSetupStep from '@/components/onboarding/SchedulingSetupStep';
import DepartmentRoleStep from '@/components/onboarding/DepartmentRoleStep';
import LocationSetupStep from '@/components/onboarding/LocationSetupStep';
import EnhancedTeamSetupStep from '@/components/onboarding/EnhancedTeamSetupStep';
import MobileAppStep from '@/components/onboarding/MobileAppStep';
import TrialFeaturesStep from '@/components/onboarding/TrialFeaturesStep';
import CompleteStep from '@/components/onboarding/CompleteStep';

const STEPS = [
  { id: 1, title: "Welcome", subtitle: "What brings you to WorkforceOS?" },
  { id: 2, title: "Basic Business Info", subtitle: "Tell us about your business" },
  { id: 3, title: "Business Size", subtitle: "How big is your business?" },
  { id: 4, title: "Business Address", subtitle: "Where is your business located?" },
  { id: 5, title: "Contact & Details", subtitle: "Final business details" },
  { id: 6, title: "Scheduling Setup", subtitle: "Configure your scheduling preferences" },
  { id: 7, title: "Departments & Roles", subtitle: "Set up your organization structure" },
  { id: 8, title: "Location Setup", subtitle: "Add your business location" },
  { id: 9, title: "Team Setup", subtitle: "Add your team members" },
  { id: 10, title: "Mobile App", subtitle: "Get the mobile app for your team" },
  { id: 11, title: "Trial Features", subtitle: "Explore your premium trial" },
  { id: 12, title: "All Set!", subtitle: "Your account is ready to use" },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [hasCompany, setHasCompany] = useState(false);
  const [availableSteps, setAvailableSteps] = useState(STEPS);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/signin');
      return;
    }

    if (user) {
      checkOnboardingStatus();
    }
  }, [user, authLoading, navigate]);

  const checkOnboardingStatus = async () => {
    try {
      console.log('Checking onboarding status for user:', user!.id);
      
      // Check if user has a company
      const { data: userCompanies, error: companyError } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user!.id);

      if (companyError) {
        console.error('Error checking user companies:', companyError);
        throw companyError;
      }

      const hasExistingCompany = userCompanies && userCompanies.length > 0;
      setHasCompany(hasExistingCompany);

      // Check if user has company info in metadata (from signup)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const hasCompanyMetadata = currentUser?.user_metadata?.company_name;

      // Auto-create company from metadata if user doesn't have one but has metadata
      if (!hasExistingCompany && hasCompanyMetadata) {
        console.log('Auto-creating company from signup metadata');
        await autoCreateCompanyFromMetadata(currentUser);
        setHasCompany(true);
      }

      // Check current profile data to see if it's complete
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone_number')
        .eq('id', user!.id)
        .single();

      if (profileError) {
        console.error('Error checking profile:', profileError);
      }

      const hasCompleteProfile = profile?.first_name && profile?.last_name;

      // Check onboarding progress
      const { data: progress, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('step_name, completed')
        .eq('user_id', user!.id);

      if (progressError) {
        console.error('Error checking onboarding progress:', progressError);
      }

      const completedSteps = progress?.filter(p => p.completed).map(p => p.step_name) || [];

      // Auto-mark profile step as completed if profile data is complete but step not marked
      if (hasCompleteProfile && !completedSteps.includes('profile_info')) {
        await supabase
          .from('onboarding_progress')
          .upsert([{
            user_id: user!.id,
            step_name: 'profile_info',
            completed: true,
            data: { first_name: profile.first_name, last_name: profile.last_name, phone_number: profile.phone_number }
          }], { onConflict: 'user_id,step_name' });
        completedSteps.push('profile_info');
        console.log('Auto-marked profile step as completed - data already exists');
      }

      // Determine which steps to show
      let steps = [...STEPS];
      
      // If user already has a company OR we just created one from metadata, skip company info step
      if (hasExistingCompany || hasCompanyMetadata) {
        steps = steps.filter(s => s.id !== 1);
        // Re-number the steps
        steps = steps.map((step, index) => ({ ...step, id: index + 1 }));
        console.log('Skipping company info step - already have company data');
      }

      // If profile is completed OR has complete data, skip it
      if (completedSteps.includes('profile_info') || hasCompleteProfile) {
        steps = steps.filter(s => s.title !== "Your Profile");
        steps = steps.map((step, index) => ({ ...step, id: index + 1 }));
        console.log('Skipping profile step - already have profile data');
      }

      setAvailableSteps(steps);
      setLoading(false);
      console.log('Available steps:', steps);

      // If all necessary steps are completed, go to dashboard
      if (steps.length === 1 && steps[0].title === "All Set!") {
        console.log('All steps completed, redirecting to dashboard');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < availableSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const autoCreateCompanyFromMetadata = async (user: any) => {
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      const companyData = {
        name: user.user_metadata.company_name,
        industry: user.user_metadata.company_industry,
        size_range: user.user_metadata.company_size,
        timezone: userTimezone,
      };

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (companyError) {
        console.error('Auto company creation error:', companyError);
        return;
      }

      // Link user to company as owner
      const { error: linkError } = await supabase
        .from('user_companies')
        .insert([{
          user_id: user.id,
          company_id: company.id,
          role: 'owner'
        }]);

      if (linkError) {
        console.error('Auto user-company link error:', linkError);
        return;
      }

      // Mark step as completed
      await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user.id,
          step_name: 'company_info',
          completed: true,
          data: { ...companyData, auto_created: true }
        }], { onConflict: 'user_id,step_name' });

      console.log('Company auto-created successfully from metadata');
    } catch (error) {
      console.error('Failed to auto-create company from metadata:', error);
    }
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (availableSteps.length === 0) {
    navigate('/dashboard');
    return null;
  }

  const currentStepData = availableSteps[currentStep - 1];

  const renderStepContent = () => {
    const stepTitle = currentStepData.title;
    
    switch (stepTitle) {
      case "Welcome":
        return <WelcomeStep onNext={handleNext} />;
      case "Basic Business Info":
        return <BasicBusinessInfoStep onNext={handleNext} />;
      case "Business Size":
        return <BusinessSizeStep onNext={handleNext} />;
      case "Business Address":
        return <BusinessAddressStep onNext={handleNext} />;
      case "Contact & Details":
        return <BusinessContactStep onNext={handleNext} />;
      case "Scheduling Setup":
        return <SchedulingSetupStep onNext={handleNext} />;
      case "Departments & Roles":
        return <DepartmentRoleStep onNext={handleNext} />;
      case "Location Setup":
        return <LocationSetupStep onNext={handleNext} />;
      case "Team Setup":
        return <EnhancedTeamSetupStep onNext={handleNext} />;
      case "Mobile App":
        return <MobileAppStep onNext={handleNext} />;
      case "Trial Features":
        return <TrialFeaturesStep onNext={handleNext} />;
      case "All Set!":
        return <CompleteStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={availableSteps.length}
      title={currentStepData.title}
      subtitle={currentStepData.subtitle}
    >
      {renderStepContent()}
    </OnboardingLayout>
  );
}