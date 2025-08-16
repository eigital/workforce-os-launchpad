import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import CompanyInfoStep from '@/components/onboarding/CompanyInfoStep';
import ProfileStep from '@/components/onboarding/ProfileStep';
import TeamSetupStep from '@/components/onboarding/TeamSetupStep';
import CompleteStep from '@/components/onboarding/CompleteStep';

const STEPS = [
  { id: 1, title: "Company Information", subtitle: "Tell us about your business" },
  { id: 2, title: "Your Profile", subtitle: "Complete your personal information" },
  { id: 3, title: "Team Setup", subtitle: "Invite your team members" },
  { id: 4, title: "All Set!", subtitle: "Your account is ready to use" },
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
      console.log('User has existing company:', hasExistingCompany);

      // Check if user has company info in metadata (from signup)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const hasCompanyMetadata = currentUser?.user_metadata?.company_name;
      console.log('User has company metadata:', hasCompanyMetadata);

      // Check onboarding progress
      const { data: progress, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('step_name, completed')
        .eq('user_id', user!.id);

      if (progressError) {
        console.error('Error checking onboarding progress:', progressError);
      }

      const completedSteps = progress?.filter(p => p.completed).map(p => p.step_name) || [];
      console.log('Completed steps:', completedSteps);

      // Determine which steps to show
      let steps = [...STEPS];
      
      // If user already has a company OR has company metadata AND company creation step is complete, skip company info step
      if (hasExistingCompany || (hasCompanyMetadata && completedSteps.includes('company_info'))) {
        steps = steps.filter(s => s.id !== 1);
        // Re-number the steps
        steps = steps.map((step, index) => ({ ...step, id: index + 1 }));
        console.log('Skipping company info step');
      }

      // If profile is completed, skip it
      if (completedSteps.includes('profile_info')) {
        steps = steps.filter(s => s.title !== "Your Profile");
        steps = steps.map((step, index) => ({ ...step, id: index + 1 }));
        console.log('Skipping profile step');
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
      case "Company Information":
        return <CompanyInfoStep onNext={handleNext} />;
      case "Your Profile":
        return <ProfileStep onNext={handleNext} />;
      case "Team Setup":
        return <TeamSetupStep onNext={handleNext} />;
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