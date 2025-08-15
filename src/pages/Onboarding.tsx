import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/signin');
    }
  }, [user, loading, navigate]);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentStepData = STEPS[currentStep - 1];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <CompanyInfoStep onNext={handleNext} />;
      case 2:
        return <ProfileStep onNext={handleNext} />;
      case 3:
        return <TeamSetupStep onNext={handleNext} />;
      case 4:
        return <CompleteStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={STEPS.length}
      title={currentStepData.title}
      subtitle={currentStepData.subtitle}
    >
      {renderStepContent()}
    </OnboardingLayout>
  );
}